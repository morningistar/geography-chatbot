import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  chatMessages: defineTable({
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
    topic: v.optional(v.string()),
    difficulty: v.optional(v.string()),
  }).index("by_user", ["userId"]),
  
  geographyTopics: defineTable({
    name: v.string(),
    description: v.string(),
    difficulty: v.string(),
    sampleQuestions: v.array(v.string()),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
