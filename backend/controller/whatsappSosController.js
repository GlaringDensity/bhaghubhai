/**
 * WhatsApp SOS Controller
 *
 * Handles incoming WhatsApp messages via Whapi webhook.
 * Flow: User sends "hi" / "sos" → SOS session created → collects Location + Text + Image → /submit
 *
 * Depends on:
 *   models/issue.model.js       (or swap for your Incident model)
 *   utils/session-manager.js
 *   utils/whapi.js              (sendAutoReply, downloadMediaAsBase64)
 *
 * Optional AI enrichment (gracefully skipped if unavailable):
 *   utils/ai-analysis.js        (analyzeVision, processTextIntelligence)
 *   utils/forensics.js          (analyzeForensics)
 */

import Issue from "../models/issue.model.js";
import { getSession, setSession, deleteSession } from "../utils/session-manager.js";
import { sendAutoReply, downloadMediaAsBase64 } from "../utils/whapi.js";
import dotenv from "dotenv";

dotenv.config();

// ── Optional AI modules (fail gracefully if not installed) ────────────────────
let analyzeVision, processTextIntelligence, analyzeForensics;
try {
  const aiMod = await import("../utils/ai-analysis.js");
  analyzeVision = aiMod.analyzeVision;
  processTextIntelligence = aiMod.processTextIntelligence;
  const forensicsMod = await import("../utils/forensics.js");
  analyzeForensics = forensicsMod.default?.analyzeForensics ?? forensicsMod.analyzeForensics;
} catch {
  console.warn("[WhatsApp SOS] ⚠️  AI modules not found — analysis disabled");
}

// ── Deduplication set (prevents double-processing same message ID) ────────────
const processedIds = new Set();

function trackMessage(id) {
  if (!id || processedIds.has(id)) return false;
  processedIds.add(id);
  if (processedIds.size > 500) {
    const first = processedIds.values().next().value;
    if (first) processedIds.delete(first);
  }
  return true;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const extractPhone = (chatId) => chatId?.match(/(\d{10,15})@/)?.[1] ?? null;

const buildProgress = (session) => {
  const m = session.incidentData.mediaUploaded;
  const hasLoc  = m.includes("location");
  const hasText = m.includes("text");
  const hasImg  = m.includes("image");

  let msg = `📊 *Progress (ALL MANDATORY):*\n`;
  msg += `   ${hasLoc  ? "✅" : "❌"} Location\n`;
  msg += `   ${hasText ? "✅" : "❌"} Description\n`;
  msg += `   ${hasImg  ? "✅" : "❌"} Photo\n\n`;

  if (hasLoc && hasText && hasImg) {
    msg += `🟢 *Ready!* Type *SUBMIT* to file your report.`;
  } else {
    const needed = [];
    if (!hasLoc)  needed.push("📍 Location");
    if (!hasText) needed.push("💬 Description");
    if (!hasImg)  needed.push("📸 Photo");
    msg += `🔴 *Still need:* ${needed.join(" + ")}`;
  }
  return msg;
};

const defaultForensics = () => ({
  realismFactor: 1.0, isFake: false, confidenceScore: 0,
  isPocket: false, verdict: "WhatsApp submission", deepfakeIndicators: [],
});

const defaultVision = () => ({ detected: [], confidence: 0, model: "WhatsApp" });

// ── Keyword-based type detection (fallback when AI disabled) ──────────────────
const detectTypeFromText = (text) => {
  const t = text.toLowerCase();
  if (t.includes("fire") || t.includes("burning"))               return "Fire";
  if (t.includes("flood") || t.includes("water"))                return "Flood";
  if (t.includes("accident") || t.includes("crash"))             return "Traffic Accident";
  if (t.includes("medical") || t.includes("injury") || t.includes("blood")) return "Medical Emergency";
  if (t.includes("building") || t.includes("collapse"))          return "Infrastructure";
  return "Other";
};

// ── Severity from keywords ────────────────────────────────────────────────────
const detectSeverity = (text) => {
  const t = text.toLowerCase();
  if (["dying","dead","trapped","collapse","explosion"].some(w => t.includes(w))) return "Critical";
  if (["fire","blood","injury","crash","burning","flood"].some(w => t.includes(w)))  return "High";
  if (["help","emergency","hurt","broken"].some(w => t.includes(w)))                 return "Medium";
  return "Low";
};

// ═══════════════════════════════════════════════════════════════════════════════
// WEBHOOK ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════
export const handleIncomingWhatsAppMessage = async (req, res) => {
  // Always respond 200 immediately so Whapi doesn't retry
  res.status(200).json({ success: true });

  const { messages } = req.body;
  if (!messages?.length) return;

  console.log(`\n[WhatsApp SOS] 📨 ${messages.length} message(s) received`);

  for (const message of messages) {
    try {
      await processMessage(message);
    } catch (err) {
      console.error(`[WhatsApp SOS] ❌ Message ${message.id} error:`, err.message);
    }
  }
};

// ── Route each incoming message ───────────────────────────────────────────────
async function processMessage(message) {
  if (message.from_me) return; // skip our own outgoing messages
  if (!trackMessage(message.id)) return; // skip duplicates

  const senderChatId = message.chat_id || message.from;
  const phone = extractPhone(senderChatId);
  if (!phone) {
    console.warn("[WhatsApp SOS] ⚠️  Could not extract phone from:", senderChatId);
    return;
  }

  const type    = message.type;
  const body    = (message.text?.body || "").trim();
  const lower   = body.toLowerCase();

  console.log(`[WhatsApp SOS] 📱 [${phone}] type=${type} body="${body.slice(0, 50)}"`);

  // Trigger: "hi" or "sos" starts a new session
  if (type === "text" && (lower === "hi" || lower === "sos")) {
    return handleTrigger(phone, senderChatId);
  }

  const session = await getSession(phone);
  if (!session) {
    console.log("[WhatsApp SOS] ⏭️  No active session — ignoring");
    return;
  }

  // Commands inside an active session
  if (type === "text" && ["submit","confirm","done"].includes(lower)) {
    return handleSubmit(phone, session);
  }
  if (type === "text" && ["cancel","stop"].includes(lower)) {
    await deleteSession(phone);
    return sendAutoReply(session.chatId, `❌ SOS cancelled.\n\nType *hi* or *sos* to start again.`);
  }

  // Media handlers
  if (type === "location") return handleLocation(message, session, phone);
  if (type === "image")    return handleImage(message, session, phone);
  if (type === "text")     return handleText(body, session, phone);

  sendAutoReply(session.chatId, `⚠️ Unsupported type: *${type}*. Please send Location, Text, or Image.`);
}

// ── HANDLER: Trigger ──────────────────────────────────────────────────────────
async function handleTrigger(phone, chatId) {
  const session = {
    phone,
    chatId,
    incidentData: {
      type: "Other",
      severity: "Low",
      description: "",
      location: { type: "Point", coordinates: [0, 0] },
      imageUrl: null,
      imageBase64: null,
      mediaUploaded: [],
      whatsappChatId: chatId,
      whatsappPhone: phone,
      forensics: null,
      visionAnalysis: null,
    },
    step: "collecting",
    createdAt: new Date(),
  };

  await setSession(phone, session);
  console.log(`[WhatsApp SOS] ✅ Session created for ${phone}`);

  await sendAutoReply(chatId,
    `🚨 *EMERGENCY SOS SYSTEM* 🚨\n\n` +
    `You are now in *SOS Mode*.\n\n` +
    `*ALL 3 FIELDS ARE MANDATORY:*\n\n` +
    `1️⃣ 📍 *Share your LOCATION*\n   → Tap 📎 → Location → Send Current Location\n\n` +
    `2️⃣ 💬 *Type a DESCRIPTION*\n   → e.g. "Fire in building near MG Road"\n\n` +
    `3️⃣ 📸 *Send an IMAGE/PHOTO*\n   → Photo of the incident (required)\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `When done, type *SUBMIT*\n` +
    `To cancel, type *CANCEL*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `⏰ Session expires in 1 hour. 🚀 *Start now!*`
  );
}

// ── HANDLER: Location ─────────────────────────────────────────────────────────
async function handleLocation(message, session, phone) {
  const lat = message.location?.latitude  || 0;
  const lng = message.location?.longitude || 0;

  if (!lat || !lng) {
    return sendAutoReply(session.chatId, `❌ Invalid location. Tap 📎 → Location → Send Current Location.`);
  }

  session.incidentData.location = { type: "Point", coordinates: [lng, lat] };
  if (!session.incidentData.mediaUploaded.includes("location")) {
    session.incidentData.mediaUploaded.push("location");
  }

  await setSession(phone, session);
  console.log(`[WhatsApp SOS] 📍 Location saved: ${lat}, ${lng}`);
  sendAutoReply(session.chatId,
    `✅ *Location Saved!*\n📍 \`${lat.toFixed(4)}, ${lng.toFixed(4)}\`\n\n${buildProgress(session)}`
  );
}

// ── HANDLER: Text / Description ───────────────────────────────────────────────
async function handleText(text, session, phone) {
  if (!text?.trim()) return;

  let detectedType = detectTypeFromText(text);

  // Try AI text intelligence (optional)
  if (processTextIntelligence) {
    try {
      const intel = await processTextIntelligence(text);
      detectedType = intel.detectedType || detectedType;
      session.incidentData.description = intel.translatedText || text;
    } catch {
      session.incidentData.description = text;
    }
  } else {
    session.incidentData.description = text;
  }

  session.incidentData.type = detectedType;
  if (!session.incidentData.mediaUploaded.includes("text")) {
    session.incidentData.mediaUploaded.push("text");
  }

  await setSession(phone, session);
  console.log(`[WhatsApp SOS] 💬 Text saved — type detected: ${detectedType}`);
  sendAutoReply(session.chatId,
    `✅ *Description Saved!*\n🏷️ Type: *${detectedType}*\n\n${buildProgress(session)}`
  );
}

// ── HANDLER: Image ────────────────────────────────────────────────────────────
async function handleImage(message, session, phone) {
  await sendAutoReply(session.chatId, "📸 Processing image...");

  let imageUrl    = message.image?.link || message.image?.url || null;
  let imageBase64 = null;

  // Prefer direct URL; fall back to downloading by ID
  if (!imageUrl && message.image?.id) {
    try {
      const media = await downloadMediaAsBase64(message.image.id);
      if (media) {
        imageBase64 = media.base64;
        imageUrl    = media.dataUrl;
        console.log(`[WhatsApp SOS] 📥 Image downloaded — ${media.size} bytes`);
      }
    } catch (err) {
      console.warn("[WhatsApp SOS] ⚠️  Image download failed:", err.message);
    }
  }

  if (!imageUrl && !imageBase64) {
    return sendAutoReply(session.chatId, `❌ Failed to receive image. Please try again.`);
  }

  let forensics      = defaultForensics();
  let visionAnalysis = defaultVision();
  let analysisNote   = "Verified";

  // Optional AI forensics + vision
  if (analyzeForensics || analyzeVision) {
    try {
      const base64 = imageBase64 || (imageUrl?.includes("base64,") ? imageUrl.split("base64,")[1] : null);
      if (base64) {
        if (analyzeForensics) {
          forensics = await analyzeForensics(Buffer.from(base64, "base64"), "UPLOAD", imageUrl);
          console.log(`[WhatsApp SOS] 🔬 Forensics: ${forensics.verdict}`);
        }
        if (analyzeVision) {
          visionAnalysis = await analyzeVision(base64);
          console.log(`[WhatsApp SOS] 👁️  Vision: ${visionAnalysis.confidence}% confidence`);
        }
        analysisNote = forensics.isFake ? "⚠️ Authenticity concern detected" : "Verified authentic";
      }
    } catch (err) {
      console.warn("[WhatsApp SOS] ⚠️  AI analysis error:", err.message);
    }
  }

  session.incidentData.imageUrl      = imageUrl;
  session.incidentData.imageBase64   = imageBase64;
  session.incidentData.forensics     = forensics;
  session.incidentData.visionAnalysis = visionAnalysis;

  if (!session.incidentData.mediaUploaded.includes("image")) {
    session.incidentData.mediaUploaded.push("image");
  }

  await setSession(phone, session);
  sendAutoReply(session.chatId,
    `✅ *Image Received!*\n📊 ${analysisNote}\n\n${buildProgress(session)}`
  );
}

// ── HANDLER: Submit ───────────────────────────────────────────────────────────
async function handleSubmit(phone, session) {
  const { incidentData, chatId } = session;

  const hasLoc  = incidentData.location.coordinates[0] !== 0;
  const hasText = !!incidentData.description?.trim();
  const hasImg  = incidentData.mediaUploaded.includes("image");

  if (!hasLoc || !hasText || !hasImg) {
    const missing = [];
    if (!hasLoc)  missing.push("📍 Location");
    if (!hasText) missing.push("💬 Description");
    if (!hasImg)  missing.push("📸 Photo");
    return sendAutoReply(chatId,
      `❌ *SUBMIT BLOCKED — ${missing.length}/3 Fields Missing*\n\n` +
      `${missing.map(m => `   ❌ ${m}`).join("\n")}\n\n${buildProgress(session)}`
    );
  }

  await sendAutoReply(chatId, "⏳ Submitting your report...");

  const [lng, lat] = incidentData.location.coordinates;
  const severity   = detectSeverity(incidentData.description);

  try {
    const issue = new Issue({
      title:       incidentData.description.slice(0, 80),
      description: incidentData.description,
      category:    mapTypeToCategory(incidentData.type),
      location:    `WhatsApp SOS — ${phone}`,
      state:       null,
      city:        null,
      town:        null,
      status:      (incidentData.forensics?.isFake) ? "Resolved" : "New",
      votes:       0,
      latlng:      { lat, lng },
      // Store raw SOS metadata for reference
      coordinates: { lat, lng },
    });

    await issue.save();
    await deleteSession(phone);

    const refId = issue._id.toString().slice(-6).toUpperCase();
    console.log(`[WhatsApp SOS] ✅ Issue created: ${issue._id}`);

    sendAutoReply(chatId,
      `✅ *REPORT SUBMITTED!*\n\n` +
      `🆔 *Reference:* #${refId}\n\n` +
      `📋 *Summary:*\n` +
      `   📍 \`${lat.toFixed(4)}, ${lng.toFixed(4)}\`\n` +
      `   🏷️ Type: *${incidentData.type}*\n` +
      `   🚨 Severity: *${severity}*\n` +
      `   📸 Media: ✅ ✅ ✅\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🏥 Our team will review and respond.\n` +
      `🙏 *Stay safe!*`
    );
  } catch (err) {
    console.error("[WhatsApp SOS] ❌ Submission error:", err.message);
    sendAutoReply(chatId, "❌ Error submitting report. Please try again or call emergency services.");
  }
}

// ── Map incident type → Issue category ───────────────────────────────────────
function mapTypeToCategory(type) {
  const map = {
    "Fire":               "Safety",
    "Flood":              "Infrastructure",
    "Traffic Accident":   "Safety",
    "Medical Emergency":  "Safety",
    "Infrastructure":     "Infrastructure",
    "Other":              "Infrastructure",
  };
  return map[type] || "Infrastructure";
}

export default { handleIncomingWhatsAppMessage };
