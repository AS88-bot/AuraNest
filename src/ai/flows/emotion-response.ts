'use server';
/**
 * @fileOverview An AI flow to generate a supportive response based on a user's mood.
 *
 * - generateEmotionResponse - A function that takes a mood and returns a comforting message.
 * - EmotionResponseInput - The input type for the function.
 * - EmotionResponseOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EmotionResponseInputSchema = z.object({
  mood: z.string().describe('The emotion the user is feeling (e.g., Happy, Calm, Sad, Anxious, Angry).'),
  language: z.string().describe('The language for the response (e.g., "English", "Spanish").'),
});
export type EmotionResponseInput = z.infer<typeof EmotionResponseInputSchema>;

const EmotionResponseOutputSchema = z.object({
  response: z.string().describe('A short, simple, and reassuring message for the user.'),
});
export type EmotionResponseOutput = z.infer<typeof EmotionResponseOutputSchema>;


export async function generateEmotionResponse(input: EmotionResponseInput): Promise<EmotionResponseOutput> {
  return emotionResponseFlow(input);
}

const prompt = ai.definePrompt({
    name: 'emotionResponsePrompt',
    input: { schema: EmotionResponseInputSchema },
    output: { schema: EmotionResponseOutputSchema },
    prompt: `You are Aura, a friendly and supportive AI assistant for people with memory challenges.
Your responses should be simple, clear, and very reassuring.

The user has indicated they are feeling {{mood}}.

Generate a short, comforting, one-or-two-sentence response in {{language}} that acknowledges this feeling and offers gentle support or encouragement.

Examples:
- If mood is "Happy", response could be: "That's wonderful to hear! It's great that you're feeling happy. I hope you have a lovely day."
- If mood is "Sad", response could be: "I'm sorry you're feeling sad. It's okay to have these feelings. Remember that you are cared for."
- If mood is "Anxious", response could be: "It's alright to feel anxious sometimes. Take a slow, deep breath. You are safe."
`,
});


const emotionResponseFlow = ai.defineFlow(
  {
    name: 'emotionResponseFlow',
    inputSchema: EmotionResponseInputSchema,
    outputSchema: EmotionResponseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
