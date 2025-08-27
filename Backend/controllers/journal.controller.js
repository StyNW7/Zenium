import Journal from "../models/journal.model.js";

export const getUserJournals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sortBy = "createdAt", sortOrder = "desc", limit = 10, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    
    const journals = await Journal.find({ userId })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Journal.countDocuments({ userId });
    
    res.status(200).json({
      success: true,
      data: journals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching journals:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a specific journal entry
export const getJournalById = async (req, res) => {
  try {
    const userId = req.user.id;
    const journalId = req.params.id;
    
    const journal = await Journal.findOne({ _id: journalId, userId });
    
    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found" });
    }
    
    res.status(200).json({ success: true, data: journal });
  } catch (error) {
    console.error("Error fetching journal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new journal entry
export const createJournal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, mood, moodRating, tags, location, privacy } = req.body;
    
    const newJournal = new Journal({
      userId,
      title,
      content,
      mood,
      moodRating,
      tags,
      location,
      privacy
    });
    
    const savedJournal = await newJournal.save();
    
    res.status(201).json({ success: true, data: savedJournal });
  } catch (error) {
    console.error("Error creating journal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a journal entry
export const updateJournal = async (req, res) => {
  try {
    const userId = req.user.id;
    const journalId = req.params.id;
    const { title, content, mood, moodRating, tags, location, privacy } = req.body;
    
    const journal = await Journal.findOne({ _id: journalId, userId });
    
    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found" });
    }
    
    journal.title = title || journal.title;
    journal.content = content || journal.content;
    journal.mood = mood || journal.mood;
    journal.moodRating = moodRating || journal.moodRating;
    journal.tags = tags || journal.tags;
    journal.location = location || journal.location;
    journal.privacy = privacy || journal.privacy;
    
    const updatedJournal = await journal.save();
    
    res.status(200).json({ success: true, data: updatedJournal });
  } catch (error) {
    console.error("Error updating journal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a journal entry
export const deleteJournal = async (req, res) => {
  try {
    const userId = req.user.id;
    const journalId = req.params.id;
    
    const journal = await Journal.findOneAndDelete({ _id: journalId, userId });
    
    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found" });
    }
    
    res.status(200).json({ success: true, message: "Journal deleted successfully" });
  } catch (error) {
    console.error("Error deleting journal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};