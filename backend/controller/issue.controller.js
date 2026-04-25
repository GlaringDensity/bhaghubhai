import Issue from "../models/issue.model.js";
import { generateIssuePDF } from "../services/pdfService.js";
import { sendIssueCreatedEmail } from "../services/emailService.js";
import { generateAIReport } from "../services/aiService.js";

// ── Helper: fire notifications after issue creation ───────────────────────────
const dispatchNotifications = (issue, pdfBuffer) => {
  setImmediate(async () => {
    console.log(`[Notifications] 🚀 Dispatching for issue ${issue._id}`);

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (!ADMIN_EMAIL) {
      console.warn("[Notifications] ⚠️  ADMIN_EMAIL not set — skipping email");
      return;
    }

    try {
      await sendIssueCreatedEmail(issue, ADMIN_EMAIL, pdfBuffer);
      console.log("[Notifications] ✅ Email sent");
    } catch (e) {
      console.error("[Notifications] ❌ Email failed:", e.message);
    }
  });
};

// ── POST /api/issues ─────────────────────────────────────────────────────────
export const createIssue = async (req, res) => {
  try {
    const {
      title, description, category,
      location, state, city, town,
      pinX, pinY, latlng,
      coordinates, status, votes,
    } = req.body;

    const newIssue = new Issue({
      title,
      description,
      category,
      location: location || state || "Unknown",
      state,
      city,
      town,
      pinX,
      pinY,
      latlng,
      coordinates,
      status: status || "New",
      votes: votes || 0,
      userId: req.userId,
    });

    await newIssue.save();
    console.log(`[Issue] ✅ Created: ${newIssue._id} — "${newIssue.title}"`);

    // Respond immediately
    res.status(201).json(newIssue);

    // Generate PDF + dispatch all notifications asynchronously
    setImmediate(async () => {
      try {
        const aiReport = await generateAIReport(newIssue.toObject());
        const pdfBuffer = generateIssuePDF(newIssue.toObject(), aiReport);
        console.log("[Issue] ✅ AI Report + PDF generated");
        dispatchNotifications(newIssue.toObject(), pdfBuffer);
      } catch (err) {
        console.error("[Issue] ❌ Async processing failed:", err.message);
      }
    });

  } catch (error) {
    console.error("[Issue] ❌ Create error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/issues ──────────────────────────────────────────────────────────
export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/issues/:id ────────────────────────────────────────────────────
export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedIssue = await Issue.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedIssue) return res.status(404).json({ message: "Issue not found" });

    console.log(`[Issue] ✅ Status updated: ${id} → ${status}`);

    // Notify via Telegram on resolution
    if (status === "Resolved") {
      setImmediate(() => {
        const chatId = process.env.TELEGRAM_CHAT_ID;
        if (!chatId) return;
        const { sendTelegramMessage } = require("../services/telegramService.js");
        sendTelegramMessage(chatId,
          `✅ *Issue Resolved!*\n\n` +
          `📌 *${updatedIssue.title}*\n` +
          `🆔 \`${updatedIssue._id}\``
        ).catch(console.error);
      });
    }

    res.status(200).json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/issues/:id/upvote ──────────────────────────────────────────────
export const upvoteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { $inc: { votes: 1 } },
      { new: true }
    );
    res.status(200).json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/issues/:id ───────────────────────────────────────────────────
export const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    await Issue.findByIdAndDelete(id);
    res.status(200).json({ message: "Issue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/issues/:id/pdf ──────────────────────────────────────────────────
export const downloadIssuePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const aiReport = await generateAIReport(issue.toObject());
    const pdfBuffer = generateIssuePDF(issue.toObject(), aiReport);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="report-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("[Issue] ❌ PDF download error:", error);
    res.status(500).json({ message: error.message });
  }
};
