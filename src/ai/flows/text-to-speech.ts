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
  text: z.string().describe('The text to convert to speech.'),
  voice: z.string().optional().describe('The voice to use for the speech.'),
  languageCode: z.string().optional().describe('The BCP-47 language code for the target audio (e.g., "en-US", "es-ES").'),
  languageName: z.string().optional().describe('The full name of the target language (e.g., "Spanish").'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audio: z.string().describe("The base64 encoded WAV audio data URI."),
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

const translateAndSpeakFlow = ai.defineFlow(
  {
    name: 'translateAndSpeakFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    let textToSpeak = input.text;

    // Step 1: Translate the text if a non-English language is selected.
    if (input.languageName && input.languageCode && !input.languageCode.startsWith('en')) {
      console.log(`Translating to ${input.languageName}`);
      const translationResponse = await ai.generate({
        prompt: `Translate the following English text to ${input.languageName}: "${input.text}"`,
        model: 'googleai/gemini-2.5-flash',
        config: { temperature: 0.1 },
      });
      const translatedText = translationResponse.text;

      if (translatedText) {
        textToSpeak = translatedText;
        console.log(`Translated text: ${textToSpeak}`);
      } else {
        console.error('Translation failed, using original text.');
      }
    }

    // Step 2: Generate speech from the (potentially translated) text.
    console.log(`Generating speech for: "${textToSpeak}"`);
    const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { 
                // The voice name determines the language for some voices.
                // The TTS model will also infer language from the text content.
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
      };
  }
);


export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    return translateAndSpeakFlow(input);
}
