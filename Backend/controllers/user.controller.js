import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...(username !== undefined ? { username } : {}), ...(email !== undefined ? { email } : {}) },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    // Find user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the file path
    const profilePhotoPath = req.file.path;

    // Update user profile with photo path
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: profilePhotoPath },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile photo uploaded successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).json({ message: "Server error" });
  }
};
