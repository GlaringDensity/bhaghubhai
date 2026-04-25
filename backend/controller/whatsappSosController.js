/**
 * whatsappSosController.js
 * 
 * Enhanced WhatsApp bot with:
 * - Whitelist restriction
 * - Command-based menu (Report, Status, View)
 * - Session-based reporting flow
 * - AI-powered incident analysis (Gemma)
 */

import Issue from "../models/issue.model.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";
import { getSession, setSession, deleteSession } from "../utils/session-manager.js";
import { generateIssuePDF } from "../services/pdfService.js";
import { sendIssueCreatedEmail } from "../services/emailService.js";
import { generateAIReport } from "../services/aiService.js";
import dotenv from "dotenv";

dotenv.config();

const WHITELISTED_PHONE = process.env.WHITELISTED_PHONE;
const CATEGORIES = ["Infrastructure", "Sanitation", "Safety", "Greenery"];

// ── Dedup ─────────────────────────────────────────────────────────────────────
const processedIds = new Set();
function trackMessage(id) {
  if (!id || processedIds.has(id)) return false;
  processedIds.add(id);
  if (processedIds.size > 1000) {
    const first = processedIds.values().next().value;
    if (first) processedIds.delete(first);
  }
  return true;
}

// ── Helper: extract phone ─────────────────────────────────────────────────────
const extractPhone = (chatId) => chatId?.match(/(\d{10,15})@/)?.[1] ?? null;

// ── Helper: reply ─────────────────────────────────────────────────────────────
const reply = async (chatId, phone, text) => {
  try {
    await sendWhatsAppMessage(phone, text);
  } catch (err) {
    console.warn("[WA BOT] Reply failed:", err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  WEBHOOK ENTRY
// ═══════════════════════════════════════════════════════════════════════════════
export const handleIncomingWhatsAppMessage = async (req, res) => {
  res.status(200).json({ success: true });
  const { messages } = req.body;
  if (!messages?.length) return;

  for (const msg of messages) {
    try {
      await processMessage(msg);
    } catch (err) {
      console.error(`[WA BOT] ❌ Error:`, err.message);
    }
  }
};

// ── Route message ─────────────────────────────────────────────────────────────
async function processMessage(message) {
  if (message.from_me) return;
  if (!trackMessage(message.id)) return;

  const chatId = message.chat_id || message.from;
  const phone = extractPhone(chatId);
  if (!phone) return;

  // 🔐 WHITELIST RESTRICTION
  if (WHITELISTED_PHONE && phone !== WHITELISTED_PHONE) {
    console.log(`[WA BOT] 🚫 Ignoring non-whitelisted phone: ${phone}`);
    return;
  }

  const type = message.type;
  if (type !== "text") return; // Only process text

  const body = (message.text?.body || "").trim();
  if (!body) return;

  const lower = body.toLowerCase();
  console.log(`[WA BOT] 📱 [${phone}] body="${body}"`);

  // ── MENU / START ────────────────────────────────────────────────────────────
  if (lower === "hi" || lower === "hello" || lower === "menu") {
    await deleteSession(phone);
    return sendMenu(chatId, phone);
  }

  // ── VIEW ISSUES ─────────────────────────────────────────────────────────────
  if (lower === "issues" || lower === "3") {
    return handleViewIssues(chatId, phone);
  }

  // ── CHECK STATUS ────────────────────────────────────────────────────────────
  if (lower.startsWith("status") || lower === "2") {
    const parts = body.split(" ");
    if (parts.length > 1) {
      return handleCheckStatus(chatId, phone, parts[1]);
    }
    // If just "2" or "status", ask for ID
    const session = await getSession(phone);
    if (!session || session.step !== "check_status") {
      await setSession(phone, { step: "check_status" });
      return reply(chatId, phone, "🔍 Please enter the Issue ID or the last 6 characters of the ID.");
    }
  }

  // ── SESSION HANDLING ────────────────────────────────────────────────────────
  const session = await getSession(phone);

  if (!session) {
    if (lower === "1" || lower.includes("report")) {
      return startReportingFlow(chatId, phone);
    }
    return reply(chatId, phone, "👋 Welcome back! Send *hi* or *menu* to see available options.");
  }

  // ── CANCEL ──────────────────────────────────────────────────────────────────
  if (lower === "cancel") {
    await deleteSession(phone);
    return reply(chatId, phone, "❌ Operation cancelled. Send *hi* for menu.");
  }

  // ── FLOW HANDLERS ───────────────────────────────────────────────────────────
  switch (session.step) {
    case "check_status":
      return handleCheckStatus(chatId, phone, body);
    case "report_title":
      return handleReportTitle(chatId, phone, session, body);
    case "report_category":
      return handleReportCategory(chatId, phone, session, body);
    case "report_location":
      return handleReportLocation(chatId, phone, session, body);
    case "report_confirm":
      if (lower === "yes" || lower === "confirm" || lower === "submit") {
        return handleReportSubmit(chatId, phone, session);
      }
      if (lower === "no" || lower === "edit") {
        await deleteSession(phone);
        return reply(chatId, phone, "❌ Report discarded. Send *1* to start over.");
      }
      return reply(chatId, phone, "❓ Please type *YES* to confirm or *NO* to cancel.");
    default:
      return sendMenu(chatId, phone);
  }
}

// ── Menu ──────────────────────────────────────────────────────────────────────
async function sendMenu(chatId, phone) {
  await reply(chatId, phone,
    `👋 *Welcome to Project Polis!* 🏛️\n\n` +
    `What would you like to do today?\n\n` +
    `1️⃣ *Report Issue* (File a new report)\n` +
    `2️⃣ *Check Status* (Track by ID)\n` +
    `3️⃣ *View Issues* (See latest 5)\n\n` +
    `Reply with the *number* or the *command*.`
  );
}

// ── View Latest Issues ────────────────────────────────────────────────────────
async function handleViewIssues(chatId, phone) {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 }).limit(5);
    if (!issues.length) return reply(chatId, phone, "📭 No issues found in the system.");

    let text = `📋 *Latest 5 Issues:*\n\n`;
    issues.forEach((is, i) => {
      const ref = is._id.toString().slice(-6).toUpperCase();
      text += `${i + 1}. *#${ref}* - ${is.title}\n   📍 ${is.city || "Unknown"}\n   🔴 Status: ${is.status}\n\n`;
    });
    text += `Send *status <id>* to see full details of an issue.`;
    await reply(chatId, phone, text);
  } catch (err) {
    await reply(chatId, phone, "❌ Error fetching issues.");
  }
}

// ── Check Status ──────────────────────────────────────────────────────────────
async function handleCheckStatus(chatId, phone, idInput) {
  try {
    const cleanId = idInput.trim().toUpperCase();
    const issue = await Issue.findOne({ _id: { $regex: cleanId, $options: "i" } }).catch(() => null)
      || await Issue.find().then(all => all.find(i => i._id.toString().slice(-6).toUpperCase() === cleanId));

    if (!issue) return reply(chatId, phone, `❌ Issue *${idInput}* not found. Please check the ID.`);

    const ref = issue._id.toString().slice(-6).toUpperCase();
    const loc = [issue.town, issue.city, issue.state].filter(Boolean).join(", ");
    
    await deleteSession(phone);
    await reply(chatId, phone,
      `📊 *Issue Status Report*\n\n` +
      `🆔 ID: #${ref}\n` +
      `📌 Title: ${issue.title}\n` +
      `🏷️ Category: ${issue.category}\n` +
      `📍 Location: ${loc || "N/A"}\n` +
      `🔴 Status: *${issue.status}*\n` +
      `👍 Votes: ${issue.votes}\n\n` +
      `📅 Reported: ${new Date(issue.createdAt).toLocaleDateString("en-IN")}`
    );
  } catch (err) {
    await reply(chatId, phone, "❌ Error checking status.");
  }
}

// ── Reporting Flow: Step 1 ────────────────────────────────────────────────────
async function startReportingFlow(chatId, phone) {
  await setSession(phone, { step: "report_title", data: {} });
  await reply(chatId, phone, "📝 *Step 1/3: Issue Title*\n\nPlease enter a short title for the issue (e.g., Pothole on Main Road).");
}

// ── Reporting Flow: Step 2 ────────────────────────────────────────────────────
async function handleReportTitle(chatId, phone, session, body) {
  if (body.length < 5) return reply(chatId, phone, "⚠️ Title too short. Please provide at least 5 characters.");
  
  session.data.title = body;
  session.step = "report_category";
  await setSession(phone, session);

  await reply(chatId, phone,
    `📂 *Step 2/3: Select Category*\n\n` +
    `1. Infrastructure\n` +
    `2. Sanitation\n` +
    `3. Safety\n` +
    `4. Greenery\n\n` +
    `Reply with the number or name.`
  );
}

// ── Reporting Flow: Step 3 ────────────────────────────────────────────────────
async function handleReportCategory(chatId, phone, session, body) {
  const map = { "1": "Infrastructure", "2": "Sanitation", "3": "Safety", "4": "Greenery" };
  const cat = map[body] || CATEGORIES.find(c => c.toLowerCase() === body.toLowerCase());

  if (!cat) return reply(chatId, phone, "⚠️ Invalid category. Please reply with 1, 2, 3, or 4.");

  session.data.category = cat;
  session.step = "report_location";
  await setSession(phone, session);

  await reply(chatId, phone,
    `📍 *Step 3/3: Location*\n\n` +
    `Please enter the location (Format: State, City, Town).\n` +
    `Example: _Maharashtra, Mumbai, Dadar_`
  );
}

// ── Reporting Flow: Step 4 (Confirm) ──────────────────────────────────────────
async function handleReportLocation(chatId, phone, session, body) {
  const parts = body.split(",").map(p => p.trim());
  if (parts.length < 2) return reply(chatId, phone, "⚠️ Please provide at least State and City (e.g., Maharashtra, Pune).");

  session.data.state = parts[0];
  session.data.city = parts[1];
  session.data.town = parts[2] || "";
  session.step = "report_confirm";
  await setSession(phone, session);

  const summary = 
    `📋 *Confirm Your Report:*\n` +
    `📌 Title: ${session.data.title}\n` +
    `🏷️ Category: ${session.data.category}\n` +
    `📍 Location: ${[session.data.town, session.data.city, session.data.state].filter(Boolean).join(", ")}\n\n` +
    `Is this correct? Type *YES* to submit or *NO* to cancel.`;
  
  await reply(chatId, phone, summary);
}

// ── Reporting Flow: Submit ────────────────────────────────────────────────────
async function handleReportSubmit(chatId, phone, session) {
  await reply(chatId, phone, "⏳ Filing your issue and generating AI analysis...");

  try {
    const d = session.data;
    const issue = new Issue({
      title: d.title,
      category: d.category,
      state: d.state,
      city: d.city,
      town: d.town,
      location: d.state,
      status: "New",
      votes: 0
    });
    await issue.save();

    // 🤖 AI Report
    const aiReport = await generateAIReport(issue);
    // 📄 PDF
    const pdfBuffer = await generateIssuePDF(issue, aiReport);
    
    await deleteSession(phone);

    const ref = issue._id.toString().slice(-6).toUpperCase();
    const baseUrl = process.env.BACKEND_URL || "http://localhost:7979";
    const pdfUrl = `${baseUrl}/api/issues/${issue._id}/pdf`;

    await reply(chatId, phone,
      `✅ *Issue Created Successfully!*\n\n` +
      `🆔 Reference: *#${ref}*\n` +
      `🤖 *AI Analysis Summary:* \n${aiReport.slice(0, 200)}...\n\n` +
      `📄 *Download Full Report:*\n${pdfUrl}\n\n` +
      `🙏 Thank you for helping improve your city!`
    );

    // Email admin
    if (process.env.ADMIN_EMAIL) {
      sendIssueCreatedEmail(issue, process.env.ADMIN_EMAIL, pdfBuffer).catch(console.error);
    }
  } catch (err) {
    console.error("[WA BOT] Submit error:", err);
    await deleteSession(phone);
    await reply(chatId, phone, "❌ Failed to create issue. Please try again later.");
  }
}

export default { handleIncomingWhatsAppMessage };
