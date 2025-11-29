/**
 * @fileOverview Types and schemas for the chatbot flow.
 *
 * - Message - The type for a single message in the chat history.
 * - ChatbotInput - The input type for the chatbotFlow function.
 * - ChatbotOutput - The return type for the chatbotFlow function.
 */

import { z } from 'zod';

export const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ChatbotInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  message: z.string().describe('The latest user message.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

export const ChatbotOutputSchema = z.object({
  response: z.string().describe("The AI model's response."),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;
