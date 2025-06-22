import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const askGeographyQuestion = action({
  args: {
    question: v.string(),
    topic: v.optional(v.string()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to ask questions");
    }

    const systemPrompt = `You are a knowledgeable geography teacher and expert. Your role is to:
    
1. Answer geography questions accurately and comprehensively
2. Provide educational explanations that help students learn
3. Include interesting facts and context when relevant
4. Use clear, engaging language appropriate for students
5. If asked about locations, include details about climate, culture, economy, or physical features
6. For map-related questions, describe locations relative to other known places
7. Always be encouraging and supportive of learning

Keep responses informative but concise (2-4 paragraphs max). Focus on being educational and helpful.`;

    const userPrompt = args.topic 
      ? `Topic: ${args.topic}\nDifficulty: ${args.difficulty || 'medium'}\nQuestion: ${args.question}`
      : args.question;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0].message.content || "I couldn't generate a response. Please try again.";

      // Save the conversation
      await ctx.runMutation(internal.geography.saveChatMessage, {
        userId,
        message: args.question,
        response,
        topic: args.topic,
        difficulty: args.difficulty,
      });

      return response;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to get AI response. Please try again.");
    }
  },
});

export const getChatHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const getGeographyTopics = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("geographyTopics").collect();
  },
});

export const initializeTopics = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if topics already exist
    const existingTopics = await ctx.db.query("geographyTopics").first();
    if (existingTopics) {
      return "Topics already initialized";
    }

    const topics = [
      {
        name: "World Capitals",
        description: "Learn about capital cities around the world",
        difficulty: "easy",
        sampleQuestions: [
          "What is the capital of Australia?",
          "Which city is the capital of Canada?",
          "What is the capital of Brazil?"
        ]
      },
      {
        name: "Physical Geography",
        description: "Mountains, rivers, deserts, and natural features",
        difficulty: "medium",
        sampleQuestions: [
          "What is the longest river in the world?",
          "Which mountain range separates Europe from Asia?",
          "Where is the Sahara Desert located?"
        ]
      },
      {
        name: "Countries & Continents",
        description: "Learn about countries, their locations, and continents",
        difficulty: "easy",
        sampleQuestions: [
          "Which continent is Egypt located in?",
          "What countries border France?",
          "Which is the largest country in South America?"
        ]
      },
      {
        name: "Climate & Weather",
        description: "Weather patterns, climate zones, and atmospheric phenomena",
        difficulty: "hard",
        sampleQuestions: [
          "What causes monsoons in South Asia?",
          "Why is the Amazon rainforest important for global climate?",
          "What is the difference between weather and climate?"
        ]
      },
      {
        name: "Oceans & Seas",
        description: "Bodies of water, marine geography, and coastal features",
        difficulty: "medium",
        sampleQuestions: [
          "What are the five major oceans?",
          "Which sea is between Europe and Africa?",
          "What is the deepest point in the ocean?"
        ]
      }
    ];

    for (const topic of topics) {
      await ctx.db.insert("geographyTopics", topic);
    }

    return "Topics initialized successfully";
  },
});

export const saveChatMessage = internalMutation({
  args: {
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
    topic: v.optional(v.string()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", args);
  },
});
