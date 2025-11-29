'use server';
/**
 * @fileOverview A conversational AI flow for the chatbot assistant.
 *
 * - chatbotFlow - A function that handles a single turn of conversation.
 */

import { ai } from '@/ai/genkit';
import { 
  ChatbotInputSchema, 
  ChatbotOutputSchema, 
  type ChatbotInput, 
  type ChatbotOutput 
} from './chatbot-types';


export async function chatbotFlow(input: ChatbotInput): Promise<ChatbotOutput> {
  return flow(input);
}

const prompt = ai.definePrompt(
  {
    name: 'chatbotPrompt',
    input: { schema: ChatbotInputSchema },
    output: { schema: ChatbotOutputSchema },
    prompt: `You are Aura, a friendly and helpful AI assistant for the AuraNest application.
AuraNest is designed to support people with dementia or memory problems.
Your responses should be simple, clear, and reassuring. Avoid complex sentences or jargon.

Here is the conversation history:
{{#each history}}
  {{#if (eq role 'user')}}User: {{content}}{{/if}}
  {{#if (eq role 'model')}}Aura: {{content}}{{/if}}
{{/each}}

The user's latest message is:
User: {{{message}}}

Provide a helpful and kind response.
Aura:
`,
    // Register Handlebars helper for equality check
    // This is needed for the prompt template to work
    template: {
      helpers: {
        eq: (a: any, b: any) => a === b,
      },
    }
  },
);


const flow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
