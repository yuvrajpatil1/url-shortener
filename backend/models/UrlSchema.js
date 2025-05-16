const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema(
  {
    longUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      unique: true,
      sparse: true, // allows shortUrl to be optional initially
    },
    customUrl: {
      type: String,
      unique: true,
      sparse: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("Url", UrlSchema);
