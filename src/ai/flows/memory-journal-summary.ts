'use server';

/**
 * @fileOverview Memory Journal Summary flow to generate a 'Today in My Life' summary from journal entries.
 *
 * - generateMemoryJournalSummary - A function that generates a summary of the user's memory journal entries.
 * - MemoryJournalSummaryInput - The input type for the generateMemoryJournalSummary function.
 * - MemoryJournalSummaryOutput - The return type for the generateMemoryJournalSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MemoryJournalSummaryInputSchema = z.object({
  journalEntries: z.string().describe('The user\u2019s journal entries (text, photos, or voice notes).'),
});
export type MemoryJournalSummaryInput = z.infer<typeof MemoryJournalSummaryInputSchema>;

const MemoryJournalSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the user\u2019s journal entries.'),
});
export type MemoryJournalSummaryOutput = z.infer<typeof MemoryJournalSummaryOutputSchema>;

export async function generateMemoryJournalSummary(
  input: MemoryJournalSummaryInput
): Promise<MemoryJournalSummaryOutput> {
  return memoryJournalSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'memoryJournalSummaryPrompt',
  input: {schema: MemoryJournalSummaryInputSchema},
  output: {schema: MemoryJournalSummaryOutputSchema},
  prompt: `You are an AI assistant designed to help people with dementia or memory problems reinforce their daily routine and trigger memories.

  Generate a \"Today in My Life\" summary from the following journal entries:

  {{journalEntries}}

  Focus on key events, feelings, and routines mentioned in the entries. The summary should be concise and easy to understand.
  `,
});

const memoryJournalSummaryFlow = ai.defineFlow(
  {
    name: 'memoryJournalSummaryFlow',
    inputSchema: MemoryJournalSummaryInputSchema,
    outputSchema: MemoryJournalSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
