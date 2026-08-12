import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    identityKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    photoUrl: {
      type: String,
      required: true,
    },

    stack: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Stack must contain at least 1 technology",
      },
    },

    builderClass: {
      name: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
    },

    social: {
      xHandle: {
        type: String,
        trim: true,
        maxlength: 50,
        default: "",
      },
      github: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "",
      },
      linkedin: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "",
      },
      bio: {
        type: String,
        trim: true,
        maxlength: 280,
        default: "",
      },
    },

    status: {
      type: String,
      enum: ["active"],
      default: "active",
    },

    profileViews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Participant = mongoose.model("Participant", participantSchema);
