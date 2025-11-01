'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Volume2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { textToSpeech } from '@/ai/flows/text-to-speech';

interface VoiceOption {
  value: string;
  label: string;
  lang: string;
}

const voiceOptions: VoiceOption[] = [
    { value: 'Algenib', label: 'English (US), Algenib (Female)', lang: 'en-US' },
    { value: 'Achernar', label: 'English (UK), Achernar (Male)', lang: 'en-GB' },
    { value: 'Proxima-C', label: 'Spanish (Spain), Proxima C (Female)', lang: 'es-ES' },
    { value: 'Spica', label: 'French (France), Spica (Female)', lang: 'fr-FR' },
    { value: 'Shaula', label: 'German (Germany), Shaula (Female)', lang: 'de-DE' },
    { value: 'en-IN-Wavenet-D', label: 'Hindi (India), Wavenet-D (Female)', lang: 'hi-IN' },
    { value: 'it-IT-Wavenet-A', label: 'Italian (Italy), Wavenet-A (Female)', lang: 'it-IT' },
];

export default function RemindersPage() {
  const [reminderText, setReminderText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(voiceOptions[0]);

  const handleGenerateReminder = async () => {
    if (!reminderText) return;
    setIsLoading(true);
    setAudioSrc(null);
    try {
      const result = await textToSpeech({
        text: reminderText,
        voice: selectedVoice.value,
        languageCode: selectedVoice.lang,
      });
      setAudioSrc(result.audio);
    } catch (error) {
      console.error('Error generating audio:', error);
      // You would typically show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceChange = (value: string) => {
    const voice = voiceOptions.find(opt => opt.value === value);
    if(voice) {
      setSelectedVoice(voice);
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Verbal Reminders
        </h1>
        <p className="text-muted-foreground mt-2">
          Create and listen to verbal reminders in your preferred language and voice.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create a Reminder</CardTitle>
          <CardDescription>
            Type your reminder text below and select a language and voice to generate the
            audio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="language">Language & Voice</Label>
            <Select onValueChange={handleVoiceChange} defaultValue={selectedVoice.value}>
              <SelectTrigger id="language" className="w-[280px]">
                <SelectValue placeholder="Select language & voice" />
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reminder-text">Reminder Text</Label>
            <Textarea
              id="reminder-text"
              placeholder="e.g., 'Remember to take medication at 8 PM.'"
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              className="min-h-[150px] text-lg"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={handleGenerateReminder}
              disabled={isLoading || !reminderText}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Generating Audio...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-6 w-6" />
                  Generate Reminder
                </>
              )}
            </Button>
          </div>
          {audioSrc && !isLoading && (
            <div className="space-y-4 rounded-lg bg-muted p-4">
              <Label className="text-lg">Generated Audio</Label>
              <div className='flex items-center gap-4'>
                <Volume2 className="h-8 w-8 text-primary" />
                <audio controls src={audioSrc} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
