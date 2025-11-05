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
import { useLocale } from '@/hooks/use-locale';

interface VoiceOption {
    value: string;
    label: string;
    lang: string;
    languageName: string;
  }
  
const voiceOptions: VoiceOption[] = [
    { value: 'Algenib', label: 'English (US), Algenib (Female)', lang: 'en-US', languageName: 'English' },
    { value: 'Achernar', label: 'English (UK), Achernar (Male)', lang: 'en-GB', languageName: 'English' },
    { value: 'Laomedeia', label: 'Spanish (Spain), Laomedeia (Female)', lang: 'es-ES', languageName: 'Spanish' },
    { value: 'Erinome', label: 'French (France), Erinome (Female)', lang: 'fr-FR', languageName: 'French' },
    { value: 'Schedar', label: 'German (Germany), Schedar (Female)', lang: 'de-DE', languageName: 'German' },
    { value: 'Leda', label: 'Hindi (India), Leda (Female)', lang: 'hi-IN', languageName: 'Hindi' },
    { value: 'Callirrhoe', label: 'Italian (Italy), Callirrhoe (Female)', lang: 'it-IT', languageName: 'Italian' },
];

export default function RemindersPage() {
  const [reminderText, setReminderText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(voiceOptions[0]);
  const { t } = useLocale();

  const handleGenerateReminder = async () => {
    if (!reminderText) return;
    setIsLoading(true);
    setAudioSrc(null);
    try {
      const result = await textToSpeech({
        text: reminderText,
        voice: selectedVoice.value,
        languageCode: selectedVoice.lang,
        languageName: selectedVoice.languageName,
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
          {t('reminders.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('reminders.description')}
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{t('reminders.createTitle')}</CardTitle>
          <CardDescription>
            {t('reminders.createDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="language">{t('reminders.languageLabel')}</Label>
            <Select onValueChange={handleVoiceChange} defaultValue={selectedVoice.value}>
              <SelectTrigger id="language" className="w-[280px]">
                <SelectValue placeholder={t('reminders.selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reminder-text">{t('reminders.textLabel')}</Label>
            <Textarea
              id="reminder-text"
              placeholder={t('reminders.textPlaceholder')}
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
                  {t('reminders.generating')}
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-6 w-6" />
                  {t('reminders.generate')}
                </>
              )}
            </Button>
          </div>
          {audioSrc && !isLoading && (
            <div className="space-y-4 rounded-lg bg-muted p-4">
              <Label className="text-lg">{t('reminders.generatedAudio')}</Label>
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
