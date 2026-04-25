import { jsPDF } from "jspdf";

const categoryColors = {
  Infrastructure: [59, 130, 246],   // blue
  Sanitation:     [16, 185, 129],   // emerald
  Safety:         [244, 63, 94],    // rose
  Greenery:       [34, 197, 94],    // green
};

const statusColors = {
  New:           [245, 158, 11],
  "In Progress": [59, 130, 246],
  Resolved:      [16, 185, 129],
};

/**
 * Generate a PDF report for a civic issue
 * @param {object} issue - The Issue document from MongoDB
 * @returns {Buffer} PDF as Node.js Buffer
 */
export const generateIssuePDF = (issue) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const [catR, catG, catB] = categoryColors[issue.category] || [99, 102, 241];
  const location = [issue.town, issue.city, issue.state].filter(Boolean).join(" › ") || issue.location;

  // ── Background ────────────────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.rect(0, 0, pageW, pageH, "F");

  // ── Header gradient block ─────────────────────────────────────────────────
  doc.setFillColor(30, 58, 95);    // deep navy
  doc.roundedRect(0, 0, pageW, 48, 0, 0, "F");

  // Accent strip
  doc.setFillColor(catR, catG, catB);
  doc.rect(0, 44, pageW, 4, "F");

  // Title: Project Polis
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Project Polis", 14, 22);

  // Sub-heading
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Civic Issue Management System  ·  PS-03", 14, 32);

  // Report label (right-aligned)
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text("ISSUE REPORT", pageW - 14, 22, { align: "right" });
  doc.setFontSize(8);
  doc.text(new Date(issue.createdAt).toLocaleDateString("en-IN"), pageW - 14, 30, { align: "right" });

  // ── Category badge ────────────────────────────────────────────────────────
  const badgeY = 58;
  doc.setFillColor(catR, catG, catB);
  doc.roundedRect(14, badgeY, 42, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(issue.category.toUpperCase(), 35, badgeY + 5.5, { align: "center" });

  // Status badge
  const [stR, stG, stB] = statusColors[issue.status] || [107, 114, 128];
  doc.setFillColor(stR, stG, stB);
  doc.roundedRect(60, badgeY, 36, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(issue.status.toUpperCase(), 78, badgeY + 5.5, { align: "center" });

  // ── Issue title ───────────────────────────────────────────────────────────
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(issue.title, pageW - 28);
  doc.text(titleLines, 14, 78);

  let y = 78 + titleLines.length * 8;

  // ── Divider ───────────────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageW - 14, y);
  y += 8;

  // ── Info grid (2 columns) ─────────────────────────────────────────────────
  const drawInfoCell = (label, value, x, cellY, w = 85) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cellY, w, 22, 3, 3, "FD");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text(label.toUpperCase(), x + 5, cellY + 7);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    const valLines = doc.splitTextToSize(String(value), w - 10);
    doc.text(valLines[0], x + 5, cellY + 16);
  };

  drawInfoCell("Category",    issue.category,   14,        y);
  drawInfoCell("Status",      issue.status,      14 + 90,  y);
  y += 28;
  drawInfoCell("Votes",       `👍 ${issue.votes}`, 14,      y);
  drawInfoCell("Reported On", new Date(issue.createdAt).toLocaleDateString("en-IN"), 14 + 90, y);
  y += 28;

  // Full-width location cell
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(14, y, pageW - 28, 22, 3, 3, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184);
  doc.text("LOCATION", 19, y + 7);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text(location, 19, y + 16);
  y += 28;

  // ── Description ───────────────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(catR, catG, catB);
  doc.setLineWidth(0.8);

  const descText = issue.description || "No description provided.";
  const descLines = doc.splitTextToSize(descText, pageW - 44);
  const descH = Math.max(30, descLines.length * 5.5 + 20);

  doc.roundedRect(14, y, pageW - 28, descH, 3, 3, "F");
  doc.line(14, y, 14, y + descH); // left accent

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184);
  doc.text("DESCRIPTION", 20, y + 9);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(descLines, 20, y + 17);
  y += descH + 10;

  // ── Issue ID ──────────────────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(`Issue ID: ${issue._id}`, 14, y);

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageH - 16, pageW, 16, "F");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Project Polis · PS-03 · Civic Issue Management", pageW / 2, pageH - 7, { align: "center" });

  // ── Return as Buffer ──────────────────────────────────────────────────────
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
};
