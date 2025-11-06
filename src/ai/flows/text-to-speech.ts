'use server';
/**
 * @fileOverview A text-to-speech flow that can translate text before synthesizing it.
 *
 * - textToSpeech - A function that converts text to audio, with optional translation.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
import { googleAI } from '@genkit-ai/google-genai';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech. This may include time information like "at 8pm".'),
  voice: z.string().optional().describe('The voice to use for the speech.'),
  languageCode: z.string().optional().describe('The BCP-47 language code for the target audio (e.g., "en-US", "es-ES").'),
  languageName: z.string().optional().describe('The full name of the target language (e.g., "Spanish").'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audio: z.string().describe("The base64 encoded WAV audio data URI."),
  reminderText: z.string().describe("The core text of the reminder, with any time information removed."),
  time: z.string().optional().describe("The extracted time for the reminder in HH:mm (24-hour) format, if present."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const extractTimePrompt = ai.definePrompt({
  name: 'extractTimePrompt',
  input: { schema: z.object({ text: z.string(), languageName: z.string().optional() }) },
  output: {
    schema: z.object({
      reminderText: z.string().describe("The core text of the reminder, with all time-related phrases (like 'at 8pm' or 'in 10 minutes') removed."),
      time: z.string().optional().describe("The absolute time for the reminder in HH:mm (24-hour) format. If no time is specified, this field should be omitted."),
    })
  },
  prompt: `From the following text, which is in {{languageName}}, extract the core reminder message and the specific time. The current time is ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}.

Text: "{{text}}"

- If the text contains a specific time (e.g., "at 5:30 PM", "a las 10am"), convert it to HH:mm 24-hour format.
- If the text contains a relative time (e.g., "in 10 minutes", "in an hour"), calculate the absolute time in HH:mm format based on the current time.
- If no time is mentioned, omit the 'time' field in the output.
- The 'reminderText' field should contain the original message with the time part removed. For example, for "remind me to call mom at 5pm", the reminderText would be "call mom".
`,
});

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: { schema: z.object({ text: z.string(), targetLanguage: z.string() }) },
  output: { schema: z.object({ translatedText: z.string() }) },
  prompt: `Translate the following text to {{targetLanguage}}:

"{{text}}"

Return only the translated text.`,
});


const translateAndSpeakFlow = ai.defineFlow(
  {
    name: 'translateAndSpeakFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    // Step 1: Extract time and the core reminder text.
    const { output: timeExtractionResult } = await extractTimePrompt({
      text: input.text,
      languageName: input.languageName,
    });

    if (!timeExtractionResult) {
      throw new Error("Failed to extract time from reminder.");
    }
    const { reminderText, time } = timeExtractionResult;

    let textToSpeak = reminderText;

    // Step 2: Translate if a target language is specified and it's not English.
    if (input.languageName && input.languageName !== 'English') {
      console.log(`Translating "${reminderText}" to ${input.languageName}`);
      const { output: translationResult } = await translatePrompt({
        text: reminderText,
        targetLanguage: input.languageName,
      });
      if (translationResult?.translatedText) {
        textToSpeak = translationResult.translatedText;
      }
    }


    // Step 3: Generate speech from the text.
    console.log(`Generating speech for: "${textToSpeak}" with voice ${input.voice}`);
    const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { 
                voiceName: input.voice || 'Algenib',
              },
            },
          },
        },
        prompt: textToSpeak,
      });

      if (!media) {
        throw new Error('No audio media was generated.');
      }
      
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      
      const wavBase64 = await toWav(audioBuffer);
      
      return {
        audio: 'data:audio/wav;base64,' + wavBase64,
        reminderText: reminderText,
        time: time,
      };
  }
);


export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    return translateAndSpeakFlow(input);
}
