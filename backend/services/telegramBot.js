import { Telegraf } from "telegraf";
import Issue from "../models/issue.model.js";
import dotenv from "dotenv";

dotenv.config();

// ==================== SINGLETON GUARD ====================
// Prevents multiple instances during nodemon hot-reloads
let bot = null;
let isBotRunning = false;

const getBot = () => {
  if (!bot) {
    bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    console.log("🤖 Telegraf bot instance created (singleton)");
    registerHandlers(bot);
  }
  return bot;
};

// ==================== HELPERS ====================
const buildProgressBar = (count, max = 10) => {
  const filled = Math.min(Math.round((count / max) * 10), 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
};

const statusEmoji = { New: "🆕", "In Progress": "⚡", Resolved: "✅" };
const categoryEmoji = {
  Infrastructure: "🏗️",
  Sanitation: "♻️",
  Safety: "🚨",
  Greenery: "🌿",
};

const formatIssue = (issue, index) => {
  const loc =
    [issue.town, issue.city, issue.state].filter(Boolean).join(" › ") ||
    issue.location;
  const emoji = categoryEmoji[issue.category] || "📌";
  const sEmoji = statusEmoji[issue.status] || "📋";
  return (
    `${index + 1}. ${emoji} *${issue.title}*\n` +
    `   ${sEmoji} ${issue.status}  |  🏷️ ${issue.category}\n` +
    `   📍 ${loc}\n` +
    `   🆔 \`${issue._id}\``
  );
};

// ==================== REGISTER HANDLERS ====================
function registerHandlers(botInstance) {
  console.log("🔧 Registering Telegram bot handlers...");

  // ── /start ────────────────────────────────────────────────────────────────
  botInstance.command(["start", "help"], (ctx) => {
    const name = ctx.from?.first_name || "Citizen";
    ctx.replyWithMarkdown(
      `👋 Welcome, *${name}*!\n\n` +
        `I'm the *Project Polis* bot — your civic issue tracker.\n\n` +
        `📋 *Available Commands:*\n` +
        `/issues — Latest 5 open issues\n` +
        `/status <id> — Check a specific issue\n` +
        `/stats — View overall statistics\n` +
        `/recent — 5 most recently created issues\n` +
        `/help — Show this message`
    );
  });

  // ── /issues ───────────────────────────────────────────────────────────────
  botInstance.command("issues", async (ctx) => {
    try {
      const issues = await Issue.find({ status: { $ne: "Resolved" } })
        .sort({ createdAt: -1 })
        .limit(5);

      if (issues.length === 0) {
        return ctx.reply("✅ No open issues right now — great job!");
      }

      const lines = issues.map(formatIssue);
      ctx.replyWithMarkdown(
        `📋 *Open Issues (${issues.length})*\n\n${lines.join("\n\n")}`
      );
    } catch (err) {
      console.error("[Telegram] /issues error:", err.message);
      ctx.reply("❌ Failed to fetch issues. Please try again.");
    }
  });

  // ── /recent ───────────────────────────────────────────────────────────────
  botInstance.command("recent", async (ctx) => {
    try {
      const issues = await Issue.find().sort({ createdAt: -1 }).limit(5);

      if (issues.length === 0) {
        return ctx.reply("📭 No issues reported yet.");
      }

      const lines = issues.map(formatIssue);
      ctx.replyWithMarkdown(
        `🕐 *Recently Reported (${issues.length})*\n\n${lines.join("\n\n")}`
      );
    } catch (err) {
      console.error("[Telegram] /recent error:", err.message);
      ctx.reply("❌ Failed to fetch issues.");
    }
  });

  // ── /status <id> ──────────────────────────────────────────────────────────
  botInstance.command("status", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    const issueId = args[0]?.trim();

    if (!issueId) {
      return ctx.replyWithMarkdown(
        "⚠️ Usage: `/status <issue_id>`\nGet an ID from `/issues`."
      );
    }

    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        return ctx.replyWithMarkdown(
          `❓ Issue \`${issueId}\` not found.`,
          { parse_mode: "Markdown" }
        );
      }

      const loc =
        [issue.town, issue.city, issue.state].filter(Boolean).join(" › ") ||
        issue.location;
      const sEmoji = statusEmoji[issue.status] || "📋";
      const cEmoji = categoryEmoji[issue.category] || "📌";

      ctx.replyWithMarkdown(
        `${sEmoji} *Issue Status Report*\n\n` +
          `📌 *Title:* ${issue.title}\n` +
          `${cEmoji} *Category:* ${issue.category}\n` +
          `${sEmoji} *Status:* ${issue.status}\n` +
          `📍 *Location:* ${loc}\n` +
          `👍 *Votes:* ${issue.votes}\n` +
          `🗓️ *Reported:* ${new Date(issue.createdAt).toLocaleDateString("en-IN")}\n\n` +
          `📝 ${issue.description || "_No description_"}\n\n` +
          `🆔 \`${issue._id}\``
      );
    } catch (err) {
      console.error("[Telegram] /status error:", err.message);
      ctx.reply("❌ Invalid issue ID or server error.");
    }
  });

  // ── /stats ────────────────────────────────────────────────────────────────
  botInstance.command("stats", async (ctx) => {
    try {
      const [total, resolved, inProgress, newCount] = await Promise.all([
        Issue.countDocuments(),
        Issue.countDocuments({ status: "Resolved" }),
        Issue.countDocuments({ status: "In Progress" }),
        Issue.countDocuments({ status: "New" }),
      ]);

      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      const bar = buildProgressBar(rate, 100);

      ctx.replyWithMarkdown(
        `📊 *Project Polis — Dashboard*\n\n` +
          `📋 Total Issues: *${total}*\n` +
          `🆕 New: *${newCount}*\n` +
          `⚡ In Progress: *${inProgress}*\n` +
          `✅ Resolved: *${resolved}*\n\n` +
          `📈 Resolution Rate: *${rate}%*\n` +
          `\`${bar}\``
      );
    } catch (err) {
      console.error("[Telegram] /stats error:", err.message);
      ctx.reply("❌ Failed to fetch statistics.");
    }
  });

  // ── Polling error handler ─────────────────────────────────────────────────
  botInstance.catch((err, ctx) => {
    console.error(`[Telegram] Update error for ${ctx.updateType}:`, err.message);
  });

  console.log("✅ Telegram bot handlers registered");
}

// ==================== SEND HELPERS ====================

/**
 * Send a text message to a Telegram chat
 * @param {string|number} chatId
 * @param {string} text  (Markdown supported)
 */
export const sendTelegramMessage = async (chatId, text) => {
  if (!chatId) {
    console.warn("[Telegram] ⚠️  No chatId — skipping");
    return;
  }
  try {
    const botInstance = getBot();
    const res = await botInstance.telegram.sendMessage(chatId, text, {
      parse_mode: "Markdown",
    });
    console.log(`[Telegram] ✅ Sent to ${chatId} — msgId: ${res.message_id}`);
    return res;
  } catch (err) {
    console.error("[Telegram] ❌ Send failed:", err.message);
    throw err;
  }
};

/**
 * Send a new-issue notification to the admin Telegram chat
 * @param {object} issue - Saved Issue document
 */
export const sendIssueCreatedTelegram = async (issue) => {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    console.warn("[Telegram] ⚠️  TELEGRAM_CHAT_ID not set — skipping");
    return;
  }

  const loc =
    [issue.town, issue.city, issue.state].filter(Boolean).join(" › ") ||
    issue.location;
  const cEmoji = categoryEmoji[issue.category] || "📌";

  const text =
    `🚨 *New Issue Reported — Project Polis*\n\n` +
    `${cEmoji} *${issue.title}*\n` +
    `🏷️ ${issue.category}  |  🆕 ${issue.status}\n` +
    `📍 ${loc}\n` +
    `🗓️ ${new Date(issue.createdAt).toLocaleString("en-IN")}\n\n` +
    `📝 ${issue.description || "No description"}\n\n` +
    `🆔 \`${issue._id}\`\n` +
    `Use /status ${issue._id} to check later.`;

  return sendTelegramMessage(chatId, text);
};

// ==================== START BOT (POLLING with 409 guard) ====================
export const startBot = async () => {
  if (isBotRunning) {
    console.log("⚠️ Telegram bot already running — skipping re-launch");
    return;
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("[Telegram] ⚠️  TELEGRAM_BOT_TOKEN not set — bot disabled");
    return;
  }

  const botInstance = getBot();

  try {
    // Step 1: Clear any stale webhook that blocks polling
    await botInstance.telegram.deleteWebhook({ drop_pending_updates: false });
    console.log("[Telegram] 🔧 Stale webhook cleared");

    // Step 2: Brief delay so Telegram releases previous getUpdates session
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3: Launch polling
    await botInstance.launch({
      allowedUpdates: ["message", "callback_query"],
    });

    isBotRunning = true;
    console.log("[Telegram] 🤖 Bot started via polling ✅");

    // Step 4: Graceful shutdown
    process.once("SIGINT", () => {
      console.log("[Telegram] 🛑 SIGINT — stopping bot...");
      botInstance.stop("SIGINT");
      isBotRunning = false;
    });
    process.once("SIGTERM", () => {
      console.log("[Telegram] 🛑 SIGTERM — stopping bot...");
      botInstance.stop("SIGTERM");
      isBotRunning = false;
    });
  } catch (err) {
    isBotRunning = false;
    if (err.message?.includes("409")) {
      console.warn(
        "[Telegram] ⚠️  409 Conflict — another session active. Retrying in 5s..."
      );
      setTimeout(() => startBot(), 5000);
    } else {
      console.error("[Telegram] ❌ Bot failed to start:", err.message);
    }
  }
};

// ==================== WEBHOOK HANDLER (alternative to polling) ====================
export const handleTelegramWebhook = async (req, res) => {
  try {
    await getBot().handleUpdate(req.body);
    res.status(200).send("OK");
  } catch (err) {
    console.error("[Telegram] ❌ Webhook error:", err.message);
    res.status(500).send("Error");
  }
};

export default { startBot, handleTelegramWebhook, sendTelegramMessage, sendIssueCreatedTelegram };
