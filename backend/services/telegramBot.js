import { Telegraf } from "telegraf";
import Issue from "../models/issue.model.js";
import { getSession, setSession, deleteSession } from "../utils/session-manager.js";
import { generateIssuePDF } from "./pdfService.js";
import { sendIssueCreatedEmail } from "./emailService.js";
import { generateAIReport } from "./aiService.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ==================== SINGLETON GUARD ====================
let bot = null;
let isBotRunning = false;

const CATEGORIES = ["Infrastructure", "Sanitation", "Safety", "Greenery"];
const GEMMA_URL = process.env.GEMMA_URL || "http://localhost:11434/api/generate";
const GEMMA_MODEL = process.env.GEMMA_MODEL || "gemma4:31b-cloud";

const getBot = () => {
  if (!bot) {
    bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    console.log("🤖 Telegraf bot instance created (singleton)");
    registerHandlers(bot);
  }
  return bot;
};

// ==================== HELPERS ====================
const buildProgressBar = (count, max = 100) => {
  const filled = Math.min(Math.round((count / max) * 10), 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
};

const FLAG_EMOJI = {
  'New': '🚩',
  'In Progress': '🏳️',
  'Resolved': '🏁',
};

const categoryEmoji = {
  Infrastructure: "🏗️",
  Sanitation: "♻️",
  Safety: "🚨",
  Greenery: "🌿",
};


const formatIssue = (issue, index) => {
  const loc = [issue.town, issue.city, issue.state].filter(Boolean).join(" › ") || issue.location;
  const emoji = categoryEmoji[issue.category] || "📌";
  const flag = FLAG_EMOJI[issue.status] || '📍';
  return (
    `${index + 1}. ${flag} ${emoji} *${issue.title}*\n` +
    `   Status: ${issue.status}  |  🏷️ ${issue.category}\n` +
    `   📍 ${loc}\n` +
    `   🆔 \`${issue._id}\``
  );
};

// ==================== REGISTER HANDLERS ====================
function registerHandlers(botInstance) {
  console.log("🔧 Registering Telegram bot handlers...");

  botInstance.command(["start", "help"], (ctx) => {
    ctx.replyWithMarkdown(
      `👋 Welcome to *Project Polis*!\n\n` +
      `📋 *Commands:*\n` +
      `/report — Start filing a new civic issue\n` +
      `/issues — List open issues\n` +
      `/stats — View system stats\n` +
      `/status <id> — Check specific issue\n` +
      `/cancel — Stop current report`
    );
  });

  botInstance.command("report", async (ctx) => {
    const chatId = ctx.chat.id;
    await setSession(chatId, { step: "category", data: {} });
    ctx.replyWithMarkdown(
      `🏛️ *Step 1/4: Select Category*\n\n` +
      `1. Infrastructure\n` +
      `2. Sanitation\n` +
      `3. Safety\n` +
      `4. Greenery\n\n` +
      `Reply with the number.`
    );
  });

  botInstance.command("issues", async (ctx) => {
    try {
      const issues = await Issue.find({ status: { $ne: "Resolved" } }).sort({ createdAt: -1 }).limit(5);
      if (issues.length === 0) return ctx.reply("✅ No open issues!");
      ctx.replyWithMarkdown(`📋 *Latest Open Issues*\n\n${issues.map(formatIssue).join("\n\n")}`);
    } catch (err) { ctx.reply("❌ Error fetching issues."); }
  });

  botInstance.command("stats", async (ctx) => {
    try {
      const [total, resolved] = await Promise.all([Issue.countDocuments(), Issue.countDocuments({ status: "Resolved" })]);
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      ctx.replyWithMarkdown(`📊 *Stats*\nTotal: ${total}\nResolved: ${resolved}\nRate: ${rate}%\n\`${buildProgressBar(rate)}\``);
    } catch (err) { ctx.reply("❌ Error."); }
  });

  botInstance.command("cancel", async (ctx) => {
    await deleteSession(ctx.chat.id);
    ctx.reply("❌ Report cancelled.");
  });

  botInstance.on("text", async (ctx) => {
    const chatId = ctx.chat.id;
    const session = await getSession(chatId);
    if (!session) return;

    const text = ctx.message.text.trim();
    if (text.startsWith("/")) return;

    switch (session.step) {
      case "category":
        const cat = CATEGORIES[parseInt(text) - 1];
        if (!cat) return ctx.reply("⚠️ Send 1, 2, 3, or 4.");
        session.data.category = cat;
        session.step = "title";
        await setSession(chatId, session);
        ctx.reply(`✅ Category: ${cat}\n\n*Step 2/4: Title*\nSend a short title.`);
        break;

      case "title":
        if (text.length < 5) return ctx.reply("⚠️ Title too short (min 5).");
        session.data.title = text;
        session.step = "description";
        await setSession(chatId, session);
        ctx.reply(`✅ Title: ${text}\n\n*Step 3/4: Description*\nDescribe the issue.`);
        break;

      case "description":
        if (text.length < 10) return ctx.reply("⚠️ Description too short.");
        session.data.description = text;
        session.step = "location";
        await setSession(chatId, session);
        ctx.reply(`✅ Description saved.\n\n*Step 4/4: Location*\nFormat: State, City, Town\nEx: Maharashtra, Pune, Kothrud`);
        break;

      case "location":
        const parts = text.split(",").map(p => p.trim());
        if (parts.length < 2) return ctx.reply("⚠️ Need State and City.");
        session.data.state = parts[0];
        session.data.city = parts[1];
        session.data.town = parts[2] || "";
        
        await ctx.reply("⏳ Filing issue and generating AI report...");
        
        try {
          const issue = new Issue({
            ...session.data,
            location: session.data.state,
            status: "New"
          });
          await issue.save();
          
          const aiReport = await generateAIReport(issue);
          const pdfBuffer = await generateIssuePDF(issue, aiReport);
          
          await deleteSession(chatId);
          
          const baseUrl = process.env.BACKEND_URL || "http://localhost:7979";
          const pdfUrl = `${baseUrl}/api/issues/${issue._id}/pdf`;
          
          ctx.replyWithMarkdown(
            `✅ *Issue Created!* #${issue._id.toString().slice(-6).toUpperCase()}\n\n` +
            `🤖 *AI Analysis:* \n${aiReport.slice(0, 500)}...\n\n` +
            `📄 *Download Report:* [Click here](${pdfUrl})`
          );

          if (process.env.ADMIN_EMAIL) {
            sendIssueCreatedEmail(issue, process.env.ADMIN_EMAIL, pdfBuffer);
          }
        } catch (err) {
          ctx.reply("❌ Failed to save issue.");
        }
        break;
    }
  });

  botInstance.catch((err) => console.error("Telegram error:", err));
}

export const startBot = async () => {
  if (isBotRunning || !process.env.TELEGRAM_BOT_TOKEN) return;
  const botInstance = getBot();
  try {
    await botInstance.telegram.deleteWebhook({ drop_pending_updates: true });
    await botInstance.launch();
    isBotRunning = true;
    console.log("🤖 Telegram Bot started ✅");
  } catch (err) { console.error("Bot start failed:", err.message); }
};

export default { startBot };
