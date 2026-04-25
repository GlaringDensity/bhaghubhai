import nodemailer from "nodemailer";

let transporter = null;

/**
 * Lazy-initialise the Nodemailer transporter once.
 * Validates SMTP env vars before creating.
 */
const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[Email] ⚠️  SMTP env vars missing — email disabled");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  console.log("[Email] ✅ Transporter initialised");
  return transporter;
};

/**
 * Build a premium HTML email body for a new issue
 * @param {object} issue
 * @returns {string} HTML string
 */
const buildIssueEmailHTML = (issue) => {
  const location = [issue.town, issue.city, issue.state].filter(Boolean).join(" › ") || issue.location;
  const categoryColors = {
    Infrastructure: "#3B82F6",
    Sanitation: "#10B981",
    Safety: "#F43F5E",
    Greenery: "#22C55E",
  };
  const statusColors = { New: "#F59E0B", "In Progress": "#3B82F6", Resolved: "#10B981" };
  const catColor = categoryColors[issue.category] || "#6366F1";
  const statusColor = statusColors[issue.status] || "#6B7280";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Issue — Project Polis</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1E3A5F,#2563EB);padding:28px 32px;">
            <h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
              🗺️ Project Polis
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
              Civic Issue Management System — PS-03
            </p>
          </td>
        </tr>

        <!-- Alert badge -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="display:inline-block;background:#FEF3C7;border:1px solid #FDE68A;color:#92400E;font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px;letter-spacing:0.5px;">
              🚨 NEW ISSUE REPORTED
            </div>
          </td>
        </tr>

        <!-- Title -->
        <tr>
          <td style="padding:20px 32px 8px;">
            <h2 style="margin:0;font-size:20px;font-weight:800;color:#0F172A;line-height:1.3;">
              ${issue.title}
            </h2>
          </td>
        </tr>

        <!-- Meta grid -->
        <tr>
          <td style="padding:8px 32px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:50%;padding:8px 8px 8px 0;vertical-align:top;">
                  <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px;">
                    <p style="margin:0 0 4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;">Category</p>
                    <p style="margin:0;font-size:14px;font-weight:800;color:${catColor};">${issue.category}</p>
                  </div>
                </td>
                <td style="width:50%;padding:8px 0 8px 8px;vertical-align:top;">
                  <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px;">
                    <p style="margin:0 0 4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;">Status</p>
                    <p style="margin:0;font-size:14px;font-weight:800;color:${statusColor};">${issue.status}</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding:8px 0 0;">
                  <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:14px;">
                    <p style="margin:0 0 4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;">📍 Location</p>
                    <p style="margin:0;font-size:14px;font-weight:700;color:#1E40AF;">${location}</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Description -->
        <tr>
          <td style="padding:0 32px 20px;">
            <div style="background:#F8FAFC;border-left:4px solid ${catColor};border-radius:0 12px 12px 0;padding:16px;">
              <p style="margin:0 0 6px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;">Description</p>
              <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">
                ${issue.description || "No description provided."}
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer meta -->
        <tr>
          <td style="padding:0 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px;color:#94A3B8;">
                  🗓️ <b>${new Date(issue.createdAt).toLocaleString("en-IN")}</b>
                </td>
                <td align="right" style="font-size:12px;color:#94A3B8;">
                  ID: <code style="background:#F1F5F9;padding:2px 6px;border-radius:4px;font-size:11px;">${issue._id}</code>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0F172A;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#64748B;">
              Project Polis — PS-03 · Civic Issue Management
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

/**
 * Send an email with optional PDF attachment
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body (use buildIssueEmailHTML for issues)
 * @param {Buffer|null} pdfBuffer - Optional PDF attachment buffer
 * @param {string} pdfName - Attachment filename
 */
export const sendEmail = async (to, subject, html, pdfBuffer = null, pdfName = "issue-report.pdf") => {
  const t = getTransporter();
  if (!t) return;

  const attachments = [];
  if (pdfBuffer) {
    attachments.push({
      filename: pdfName,
      content: pdfBuffer,
      contentType: "application/pdf",
    });
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    attachments,
  };

  try {
    const info = await t.sendMail(mailOptions);
    console.log(`[Email] ✅ Sent to ${to} — msgId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[Email] ❌ Failed to send to ${to}:`, err.message);
    throw err;
  }
};

/**
 * High-level helper: send issue created notification email
 * @param {object} issue - Saved Issue document
 * @param {string} recipientEmail - Admin email
 * @param {Buffer|null} pdfBuffer - Optional PDF attachment
 */
export const sendIssueCreatedEmail = async (issue, recipientEmail, pdfBuffer = null) => {
  const subject = `🚨 New Issue: ${issue.title} — Project Polis`;
  const html = buildIssueEmailHTML(issue);
  const pdfName = `issue-${issue._id}.pdf`;
  return sendEmail(recipientEmail, subject, html, pdfBuffer, pdfName);
};
