const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emotions: {
      type: [String],
      default: [],
    },
    reflection: {
      type: String,
      default: "",
    },
    journal: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Entry", entrySchema);
