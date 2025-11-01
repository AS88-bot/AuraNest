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

export default function RemindersPage() {
  const [reminderText, setReminderText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [voice, setVoice] = useState('Algenib');

  const handleGenerateReminder = async () => {
    if (!reminderText) return;
    setIsLoading(true);
    setAudioSrc(null);
    try {
      const result = await textToSpeech({ text: reminderText, voice: voice });
      setAudioSrc(result.audio);
    } catch (error) {
      console.error('Error generating audio:', error);
      // You would typically show an error toast here
    } finally {
      setIsLoading(false);
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
            <Select onValueChange={setVoice} defaultValue={voice}>
              <SelectTrigger id="language" className="w-[280px]">
                <SelectValue placeholder="Select language & voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Algenib">English (US), Algenib (Female)</SelectItem>
                <SelectItem value="Achernar">English (UK), Achernar (Male)</SelectItem>
                <SelectItem value="Proxima-C">Spanish, Proxima C (Female)</SelectItem>
                <SelectItem value="Spica">French, Spica (Female)</SelectItem>
                <SelectItem value="Shaula">German, Shaula (Female)</SelectItem>
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
