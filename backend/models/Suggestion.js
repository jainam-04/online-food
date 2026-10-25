const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.Mixed,
    ref: "User",
    required: false,
    default: null
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  desc: { type: String, default: "" },
  image: { type: String, default: "" },
  suggestedBy: { type: String, default: "Guest" },
  status: { type: String, default: "pending" }
}, { timestamps: true });

suggestionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Suggestion", suggestionSchema);
