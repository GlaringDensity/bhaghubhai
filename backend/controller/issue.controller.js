import Issue from "../models/issue.model.js";

export const createIssue = async (req, res) => {
  try {
    const { title, description, category, location, coordinates } = req.body;
    const newIssue = new Issue({
      title,
      description,
      category,
      location,
      coordinates,
      userId: req.userId, 
    });
    await newIssue.save();
    res.status(201).json(newIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.status(200).json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

export const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    await Issue.findByIdAndDelete(id);
    res.status(200).json({ message: "Issue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
