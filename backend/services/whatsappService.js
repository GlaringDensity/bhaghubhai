import axios from "axios";

const WHAPI_URL = "https://gate.whapi.cloud/messages/text";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Send a WhatsApp message via Whapi.cloud
 * @param {string} phone - Recipient phone number (international format, e.g. "919876543210")
 * @param {string} message - Text message body
 * @param {number} attempt - Internal retry count
 */
export const sendWhatsAppMessage = async (phone, message, attempt = 1) => {
  if (!process.env.WHAPI_TOKEN) {
    console.warn("[WhatsApp] ⚠️  WHAPI_TOKEN not set — skipping");
    return;
  }
  try {
    const payload = {
      to: phone.startsWith("+") ? phone.replace("+", "") : phone,
      body: message,
    };

    const res = await axios.post(WHAPI_URL, payload, {
      headers: {
        Authorization: `Bearer ${process.env.WHAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    console.log(`[WhatsApp] ✅ Sent to ${phone} — messageId: ${res.data?.sent?.id || "n/a"}`);
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    console.error(`[WhatsApp] ❌ Attempt ${attempt}/${MAX_RETRIES} failed (${status || err.message})`);

    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * attempt);
      return sendWhatsAppMessage(phone, message, attempt + 1);
    }
    console.error("[WhatsApp] 🚨 All retries exhausted");
    throw err;
  }
};

/**
 * Send a WhatsApp notification about a newly created issue
 * @param {object} issue - The saved Issue document
 * @param {string} adminPhone - Admin's WhatsApp number
 */
export const sendIssueCreatedWhatsApp = async (issue, adminPhone) => {
  const location = [issue.town, issue.city, issue.state].filter(Boolean).join(" › ") || issue.location;
  const message =
    `🚨 *New Issue Reported — Project Polis*\n\n` +
    `📌 *Title:* ${issue.title}\n` +
    `🏷️ *Category:* ${issue.category}\n` +
    `📍 *Location:* ${location}\n` +
    `📊 *Status:* ${issue.status}\n` +
    `🗓️ *Reported:* ${new Date(issue.createdAt).toLocaleString("en-IN")}\n\n` +
    `📝 ${issue.description || "No description provided."}`;

  return sendWhatsAppMessage(adminPhone, message);
};
