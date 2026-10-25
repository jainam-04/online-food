const Suggestion = require("../models/Suggestion");
const Food = require("../models/Food");
const { getIO } = require("../utils/socket");

exports.submitSuggestion = async (req, res) => {
  try {
    const { name, price, desc, image, suggestedBy } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const suggestion = new Suggestion({
      user: req.user?._id || req.user?.id || null,
      name: String(name).trim(),
      price: Number(price) || 0,
      desc: desc || "",
      image: image || "",
      suggestedBy: suggestedBy || req.user?.name || "Guest",
      status: "pending"
    });

    await suggestion.save();

    try {
      const payload = suggestion.toJSON ? suggestion.toJSON() : suggestion;
      getIO().to("admins").emit("suggestion:new", payload);
      if (suggestion.user) {
        getIO().to(`user_${suggestion.user}`).emit("suggestion:new", payload);
      }
    } catch (socketErr) {
      console.warn("Socket emit skipped (suggestion:new):", socketErr.message);
    }

    res.status(201).json({ message: "Suggestion submitted successfully", suggestion });
  } catch (error) {
    console.error("Error submitting suggestion:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find().sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    console.error("Error getting suggestions:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMySuggestions = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const userName = req.user?.name;
    const conditions = [];

    if (userId) conditions.push({ user: userId });
    if (userName) conditions.push({ suggestedBy: userName });

    const query = conditions.length > 0 ? { $or: conditions } : {};
    const suggestions = await Suggestion.find(query).sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    console.error("Error getting my suggestions:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.approveSuggestion = async (req, res) => {
  try {
    const suggestionId = req.params.id;
    if (!suggestionId) {
      return res.status(400).json({ message: "Suggestion ID is required" });
    }

    const suggestion = await Suggestion.findById(suggestionId);
    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    const currentStatus = String(suggestion.status || "pending").toLowerCase();
    if (currentStatus === "approved") {
      return res.status(400).json({ message: "Suggestion is already approved" });
    }

    // Atomically update suggestion status to approved without schema validation failure on legacy fields
    const updatedSuggestion = await Suggestion.findByIdAndUpdate(
      suggestionId,
      { $set: { status: "approved" } },
      { new: true, runValidators: false }
    );

    // Broadcast realtime event
    try {
      const payload = updatedSuggestion.toJSON ? updatedSuggestion.toJSON() : updatedSuggestion;
      getIO().to("admins").emit("suggestion:updated", payload);
      if (updatedSuggestion.user) {
        getIO().to(`user_${updatedSuggestion.user}`).emit("suggestion:updated", payload);
      }
    } catch (socketErr) {
      console.warn("Socket emit skipped (suggestion:updated):", socketErr.message);
    }

    // Add or update in Food menu
    try {
      const foodName = (updatedSuggestion.name || "Suggested Item").trim();
      let food = await Food.findOne({ name: foodName });
      if (food) {
        food.price = Number(updatedSuggestion.price) || food.price;
        food.description = updatedSuggestion.desc || food.description;
        food.details = updatedSuggestion.desc || food.details;
        food.image = updatedSuggestion.image || food.image;
        food.category = food.category || "Suggested";
        food.isAvailable = true;
        await food.save();
      } else {
        food = new Food({
          name: foodName,
          price: Number(updatedSuggestion.price) || 0,
          description: updatedSuggestion.desc || "",
          details: updatedSuggestion.desc || "",
          image: updatedSuggestion.image || "",
          category: "Suggested",
          quantity: 100,
          isAvailable: true
        });
        await food.save();
      }
    } catch (foodErr) {
      console.warn("Warning: Could not automatically sync suggestion to Food menu:", foodErr.message);
    }

    return res.json({
      message: "Suggestion approved and added to menu",
      suggestion: updatedSuggestion
    });
  } catch (error) {
    console.error("Error approving suggestion:", error);
    return res.status(500).json({ message: error.message || "Failed to approve suggestion" });
  }
};

exports.rejectSuggestion = async (req, res) => {
  try {
    const suggestionId = req.params.id;
    if (!suggestionId) {
      return res.status(400).json({ message: "Suggestion ID is required" });
    }

    const suggestion = await Suggestion.findById(suggestionId);
    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    const updatedSuggestion = await Suggestion.findByIdAndUpdate(
      suggestionId,
      { $set: { status: "rejected" } },
      { new: true, runValidators: false }
    );

    try {
      const payload = updatedSuggestion.toJSON ? updatedSuggestion.toJSON() : updatedSuggestion;
      getIO().to("admins").emit("suggestion:updated", payload);
      if (updatedSuggestion.user) {
        getIO().to(`user_${updatedSuggestion.user}`).emit("suggestion:updated", payload);
      }
    } catch (socketErr) {
      console.warn("Socket emit skipped (suggestion:updated):", socketErr.message);
    }

    return res.json({ message: "Suggestion rejected", suggestion: updatedSuggestion });
  } catch (error) {
    console.error("Error rejecting suggestion:", error);
    return res.status(500).json({ message: error.message || "Failed to reject suggestion" });
  }
};
