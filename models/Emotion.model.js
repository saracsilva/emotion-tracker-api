const { Schema, model } = require("mongoose");

const emotionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    emoji: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

emotionSchema.index({ user: 1, name: 1 }, { unique: true });

emotionSchema.pre("validate", function (next) {
  if (this.isDefault && this.user) {
    return next(new Error("Default emotions cannot belong to a user"));
  }

  if (!this.isDefault && !this.user) {
    return next(new Error("Custom emotions must belong to a user"));
  }

  next();
});

module.exports = model("Emotion", emotionSchema);
