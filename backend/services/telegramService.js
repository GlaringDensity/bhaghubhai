import TelegramBot from "node-telegram-bot-api";
import Issue from "../models/issue.model.js";

let bot = null;

/**
 * Initialize the Telegram bot with polling.
 * Call once at server startup.
 */
export const initTelegramBot = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("[Telegram] ⚠️  TELEGRAM_BOT_TOKEN not set — bot disabled");
    return;
  }

  try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    console.log("[Telegram] ✅ Bot initialized");

    // ── /start ──────────────────────────────────────────────────────────────
    bot.onText(/\/start/, (msg) => {
      const name = msg.from?.first_name || "Citizen";
      bot.sendMessage(
        msg.chat.id,
        `👋 Welcome, *${name}*!\n\n` +
        `I'm the *Project Polis* bot — your civic issue tracker.\n\n` +
        `📋 *Available Commands:*\n` +
        `/issues — List latest 5 open issues\n` +
        `/status <id> — Check an issue's status\n` +
        `/stats — View overall statistics\n` +
        `/help — Show this help message`,
        { parse_mode: "Markdown" }
      );
    });

    // ── /help ───────────────────────────────────────────────────────────────
    bot.onText(/\/help/, (msg) => {
      bot.sendMessage(
        msg.chat.id,
        `🛠️ *Project Polis Bot Help*\n\n` +
        `/start — Welcome message\n` +
        `/issues — Show 5 latest unresolved issues\n` +
        `/status <id> — Get status of a specific issue\n` +
        `/stats — View issue statistics\n`,
        { parse_mode: "Markdown" }
      );
    });

    // ── /issues ─────────────────────────────────────────────────────────────
    bot.onText(/\/issues/, async (msg) => {
      try {
        const issues = await Issue.find({ status: { $ne: "Resolved" } })
          .sort({ createdAt: -1 })
          .limit(5);

        if (issues.length === 0) {
          return bot.sendMessage(msg.chat.id, "✅ No open issues right now! Great job.");
        }

        const lines = issues.map((issue, i) => {
          const loc = [issue.town, issue.city, issue.state].filter(Boolean).join(" › ") || issue.location;
          return `${i + 1}. *${issue.title}*\n   🏷️ ${issue.category} | 📊 ${issue.status}\n   📍 ${loc}\n   🆔 \`${issue._id}\``;
        });

        bot.sendMessage(
          msg.chat.id,
          `📋 *Latest Open Issues (${issues.length})*\n\n${lines.join("\n\n")}`,
          { parse_mode: "Markdown" }
        );
      } catch (err) {
        console.error("[Telegram] /issues error:", err);
        bot.sendMessage(msg.chat.id, "❌ Failed to fetch issues. Please try again.");
      }
    });

    // ── /status <id> ────────────────────────────────────────────────────────
    bot.onText(/\/status (.+)/, async (msg, match) => {
      const issueId = match[1]?.trim();
      try {
        const issue = await Issue.findById(issueId);
        if (!issue) {
          return bot.sendMessage(msg.chat.id, `❓ Issue \`${issueId}\` not found.`, { parse_mode: "Markdown" });
        }
        const loc = [issue.town, issue.city, issue.state].filter(Boolean).join(" › ") || issue.location;
        const statusEmoji = { New: "🆕", "In Progress": "⚡", Resolved: "✅" };
        bot.sendMessage(
          msg.chat.id,
          `${statusEmoji[issue.status] || "📋"} *Issue Status*\n\n` +
          `*Title:* ${issue.title}\n` +
          `*Category:* ${issue.category}\n` +
          `*Status:* ${issue.status}\n` +
          `*Location:* ${loc}\n` +
          `*Votes:* 👍 ${issue.votes}\n` +
          `*Reported:* ${new Date(issue.createdAt).toLocaleDateString("en-IN")}`,
          { parse_mode: "Markdown" }
        );
      } catch (err) {
        console.error("[Telegram] /status error:", err);
        bot.sendMessage(msg.chat.id, "❌ Invalid issue ID or server error.");
      }
    });

    // ── /stats ──────────────────────────────────────────────────────────────
    bot.onText(/\/stats/, async (msg) => {
      try {
        const [total, resolved, inProgress] = await Promise.all([
          Issue.countDocuments(),
          Issue.countDocuments({ status: "Resolved" }),
          Issue.countDocuments({ status: "In Progress" }),
        ]);
        const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
        bot.sendMessage(
          msg.chat.id,
          `📊 *Project Polis — Stats*\n\n` +
          `📋 Total Issues: *${total}*\n` +
          `🆕 New: *${total - resolved - inProgress}*\n` +
          `⚡ In Progress: *${inProgress}*\n` +
          `✅ Resolved: *${resolved}*\n` +
          `📈 Resolution Rate: *${rate}%*`,
          { parse_mode: "Markdown" }
        );
      } catch (err) {
        console.error("[Telegram] /stats error:", err);
        bot.sendMessage(msg.chat.id, "❌ Failed to fetch stats.");
      }
    });

    bot.on("polling_error", (err) => {
      console.error("[Telegram] Polling error:", err.message);
    });

  } catch (err) {
    console.error("[Telegram] Failed to initialize bot:", err);
  }
};

/**
 * Send a text message to a Telegram chat/user
 * @param {string|number} chatId - Telegram chat ID
 * @param {string} text - Message text (supports Markdown)
 */
export const sendTelegramMessage = async (chatId, text) => {
  if (!bot) {
    console.warn("[Telegram] ⚠️  Bot not initialized — skipping");
    return;
  }
  if (!chatId) {
    console.warn("[Telegram] ⚠️  No chatId provided — skipping");
    return;
  }
  try {
    const res = await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
    console.log(`[Telegram] ✅ Message sent to ${chatId} — msgId: ${res.message_id}`);
    return res;
  } catch (err) {
    console.error("[Telegram] ❌ Send failed:", err.message);
    throw err;
  }
};

/**
 * Send a new-issue notification to the admin Telegram chat
 * @param {object} issue - The saved Issue document
 */
export const sendIssueCreatedTelegram = async (issue) => {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    console.warn("[Telegram] ⚠️  TELEGRAM_CHAT_ID not set — skipping notification");
    return;
  }
  const loc = [issue.town, issue.city, issue.state].filter(Boolean).join(" › ") || issue.location;
  const text =
    `🚨 *New Issue — Project Polis*\n\n` +
    `📌 *${issue.title}*\n` +
    `🏷️ ${issue.category}  |  📊 ${issue.status}\n` +
    `📍 ${loc}\n` +
    `🗓️ ${new Date(issue.createdAt).toLocaleString("en-IN")}\n\n` +
    `📝 ${issue.description || "No description"}\n\n` +
    `🆔 \`${issue._id}\`\n` +
    `Use /status ${issue._id} to check later.`;

  return sendTelegramMessage(chatId, text);
};
