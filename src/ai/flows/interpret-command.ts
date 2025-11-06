'use server';
/**
 * @fileOverview An AI flow to interpret natural language voice commands.
 *
 * - interpretCommand - A function that takes a user's spoken command and determines the intent.
 * - InterpretCommandInput - The input type for the interpretCommand function.
 * - InterpretCommandOutput - The return type for the interpretCommand function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const InterpretCommandInputSchema = z.object({
  command: z.string().describe('The natural language command spoken by the user.'),
  language: z.string().describe('The language the command was spoken in (e.g., "English", "Hindi").'),
  contacts: z.array(z.string()).describe('A list of available contact names.'),
  pages: z.array(z.string()).describe('A list of available page/screen names in the app.'),
});
export type InterpretCommandInput = z.infer<typeof InterpretCommandInputSchema>;

const InterpretCommandOutputSchema = z.object({
  action: z.enum(['call', 'remind', 'navigate', 'emergency', 'done', 'unknown']).describe('The identified action the user wants to perform.'),
  target: z.string().optional().describe('The target of the action, such as a contact name or a page name.'),
  full_reminder_text: z.string().optional().describe('The full text of the reminder, if the action is "remind".'),
});
export type InterpretCommandOutput = z.infer<typeof InterpretCommandOutputSchema>;


export async function interpretCommand(input: InterpretCommandInput): Promise<InterpretCommandOutput> {
  return interpretCommandFlow(input);
}

const prompt = ai.definePrompt({
    name: 'interpretCommandPrompt',
    input: { schema: InterpretCommandInputSchema },
    output: { schema: InterpretCommandOutputSchema },
    prompt: `You are an expert at interpreting voice commands for a helpful assistant app. The command was spoken in {{language}}.
Your job is to determine the user's intent and extract relevant information.

The user said: "{{command}}"

Possible actions are:
- 'call': The user wants to call someone. The target should be one of the available contacts.
- 'navigate': The user wants to go to a specific page in the app. The target should be one of the available pages.
- 'remind': The user wants to set a reminder. The 'full_reminder_text' should be the original command.
- 'emergency': The user is in distress and needs help.
- 'done': The user has completed a task.
- 'unknown': The intent cannot be determined from the command.

Available contacts: {{#each contacts}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}.
Available pages: {{#each pages}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}.

Analyze the command and determine the action.
- If the action is 'call', identify which contact from the list they want to call and set it as the 'target'. If the contact is not in the list, set action to 'unknown'.
- If the action is 'navigate', identify which page from the list they want to go to and set it as the 'target'.
- If the action is 'remind', set the 'full_reminder_text' to the original command.
- For 'emergency' or 'done', no target is needed.
- If the command is unclear or doesn't match any intent, set the action to 'unknown'.
`,
});


const interpretCommandFlow = ai.defineFlow(
  {
    name: 'interpretCommandFlow',
    inputSchema: InterpretCommandInputSchema,
    outputSchema: InterpretCommandOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
