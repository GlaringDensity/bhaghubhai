import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMMA_URL = process.env.GEMMA_URL || "http://localhost:11434/api/generate";
const GEMMA_MODEL = process.env.GEMMA_MODEL || "gemma4:31b-cloud";

/**
 * Generate a professional civic issue analysis report using Gemma.
 * @param {object} issue - The issue object
 * @returns {Promise<string>} - The generated report text
 */
export const generateAIReport = async (issue) => {
  const prompt = `You are a professional civic infrastructure analyst for Project Polis. 
Generate a structured, formal incident analysis report for the following reported issue:

- Title: ${issue.title}
- Category: ${issue.category}
- Description: ${issue.description}
- Location: ${[issue.town, issue.city, issue.state].filter(Boolean).join(", ") || issue.location}
- Status: ${issue.status}
- Reported On: ${new Date(issue.createdAt || Date.now()).toLocaleString("en-IN")}

Your report MUST include these sections:
1. EXECUTIVE SUMMARY (Brief overview)
2. IMPACT ANALYSIS (Who is affected and how)
3. ROOT CAUSE ASSESSMENT (Likely reasons for this issue)
4. RECOMMENDED REMEDIATION (Actionable steps for authorities)
5. PRIORITY LEVEL (Justification for urgency)

Keep the tone professional, objective, and constructive.`;

  try {
    console.log(`[AI Service] 🤖 Requesting report from ${GEMMA_MODEL}...`);
    const res = await axios.post(GEMMA_URL, {
      model: GEMMA_MODEL,
      prompt,
      stream: false,
    }, { timeout: 60000 });

    return res.data?.response || "AI analysis completed but no response body was returned.";
  } catch (err) {
    console.error(`[AI Service] ❌ Gemma failed: ${err.message}`);
    
    // Return a structured fallback report if AI fails
    return `CIVIC ISSUE ANALYSIS REPORT (AUTOMATED TEMPLATE)

1. EXECUTIVE SUMMARY
A ${issue.category.toLowerCase()} issue has been reported at ${issue.location}. Immediate inspection is advised.

2. IMPACT ANALYSIS
Local residents and commuters in ${issue.city || "the area"} are directly impacted by this ${issue.category} concern.

3. ROOT CAUSE ASSESSMENT
Likely infrastructure wear, maintenance gaps, or unforeseen environmental factors.

4. RECOMMENDED REMEDIATION
- Site inspection within 24 hours
- Departmental escalation
- Remediation timeline establishment

5. PRIORITY LEVEL: ${issue.category === "Safety" ? "CRITICAL" : "HIGH"}
Justified by reported category and description.`;
  }
};
