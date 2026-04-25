import express from "express";
import {
  createIssue,
  getAllIssues,
  updateIssueStatus,
  upvoteIssue,
  deleteIssue,
  downloadIssuePDF,
} from "../controller/issue.controller.js";
import isAuth from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllIssues);
router.post("/", isAuth, createIssue);
router.patch("/:id", isAuth, updateIssueStatus);
router.post("/:id/upvote", upvoteIssue); // Upvoting might be public or protected, usually public with rate limiting but let's keep it simple
router.delete("/:id", isAuth, deleteIssue);
router.get("/:id/pdf", downloadIssuePDF);  // Download PDF report

export default router;
