'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { generateEmotionResponse } from '@/ai/flows/emotion-response';
import { cn } from '@/lib/utils';

type Mood = {
  name: string;
  emoji: string;
  key: string;
};

const moods: Mood[] = [
  { name: 'Happy', emoji: '😊', key: 'moods.happy' },
  { name: 'Calm', emoji: '😌', key: 'moods.calm' },
  { name: 'Sad', emoji: '😢', key: 'moods.sad' },
  { name: 'Anxious', emoji: '😟', key: 'moods.anxious' },
  { name: 'Angry', emoji: '😠', key: 'moods.angry' },
  { name: 'Content', emoji: '😊', key: 'moods.content' },
];

const localeToLangName: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    hi: 'Hindi',
    it: 'Italian',
};

export default function MoodTracker() {
  const { t, locale } = useLocale();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);
    setAiResponse('');
    setIsLoading(true);
    try {
      const result = await generateEmotionResponse({
        mood: mood.name,
        language: localeToLangName[locale] || 'English',
      });
      setAiResponse(result.response);
    } catch (error) {
      console.error('Error generating emotion response:', error);
      setAiResponse(t('mood.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{t('mood.selectionTitle')}</CardTitle>
          <CardDescription>{t('mood.selectionDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {moods.map((mood) => (
            <Button
              key={mood.name}
              variant="outline"
              className={cn(
                'h-28 flex-col gap-2 text-lg border-4',
                selectedMood?.name === mood.name
                  ? 'border-primary bg-primary/10'
                  : 'border-border'
              )}
              onClick={() => handleMoodSelect(mood)}
            >
              <span className="text-5xl">{mood.emoji}</span>
              <span>{t(mood.key)}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
      <Card
        className={cn(
          'shadow-lg transition-all',
          !selectedMood && 'flex items-center justify-center bg-muted/50 min-h-[300px]'
        )}
      >
        {!selectedMood ? (
          <p className="text-center text-muted-foreground p-8">
            {t('mood.responsePlaceholder')}
          </p>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                 <Sparkles className="h-8 w-8 text-primary" />
                {t('mood.responseTitle')}
              </CardTitle>
              <CardDescription>{t('mood.responseDescription', { mood: t(selectedMood.key) })}</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[150px] flex items-center justify-center p-6">
              {isLoading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ) : (
                <p className="text-xl text-center leading-relaxed">
                  {aiResponse}
                </p>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
