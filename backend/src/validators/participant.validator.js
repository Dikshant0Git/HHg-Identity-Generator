import { z } from "zod";

export const createParticipantSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email format" })
    .max(254, { message: "Email cannot exceed 254 characters" }),

  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, { message: "Name cannot be empty" })
    .max(80, { message: "Name cannot exceed 80 characters" }),

  photoUrl: z
    .string()
    .url({ message: "Photo URL must be a valid URL" })
    .max(2000, { message: "Photo URL cannot exceed 2000 characters" })
    .optional(),

  stack: z
    .union([
      z.array(
        z
          .string()
          .trim()
          .min(1, { message: "Stack technology cannot be empty" })
          .max(30, { message: "Stack item cannot exceed 30 characters" })
      ),
      z.string().transform((val) => val.split(",").map((s) => s.trim())),
    ]),

  social: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    },
    z
      .object({
        xHandle: z.string().trim().max(50, { message: "xHandle cannot exceed 50 characters" }).optional(),
        github: z.string().trim().max(150, { message: "GitHub handle cannot exceed 150 characters" }).optional(),
        linkedin: z.string().trim().max(150, { message: "LinkedIn handle cannot exceed 150 characters" }).optional(),
        bio: z.string().trim().max(280, { message: "Bio cannot exceed 280 characters" }).optional(),
      })
      .optional()
  ),
});
