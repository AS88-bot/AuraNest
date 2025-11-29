'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateMemoryJournalSummary } from '@/ai/flows/memory-journal-summary';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Wand2, Mic, Image as ImageIcon, MicOff, Waves } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Input } from '../ui/input';

const formSchema = z.object({
  journalEntry: z.string().min(1, {
    message: 'Please record an entry or type a few words.',
  }),
});

const localeToLang: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    hi: 'hi-IN',
    it: 'it-IT',
};

export default function JournalForm() {
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { t, locale } = useLocale();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      journalEntry: '',
    },
  });

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const instance = new SpeechRecognitionAPI();
      instance.continuous = true;
      instance.interimResults = true;
      instance.lang = localeToLang[locale] || 'en-US';

      instance.onresult = (event) => {
        let final_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          }
        }
        if (final_transcript) {
            form.setValue('journalEntry', form.getValues('journalEntry') + final_transcript + '. ');
        }
      };
      
      instance.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast({
            variant: "destructive",
            title: "Voice Error",
            description: `Could not start voice recording: ${event.error}`,
        });
        setIsRecording(false);
      }

      instance.onend = () => {
        setIsRecording(false);
      }

      recognitionRef.current = instance;
    } else {
        console.warn('Speech Recognition API not supported.');
    }

    return () => {
        recognitionRef.current?.stop();
    }
  }, [locale, form, toast]);
  
  const toggleRecording = () => {
      if (!recognitionRef.current) {
          toast({ variant: 'destructive', title: 'Voice Not Supported', description: 'Your browser does not support voice recording.' });
          return;
      }
      if (isRecording) {
          recognitionRef.current.stop();
          setIsRecording(false);
      } else {
          try {
            recognitionRef.current.lang = localeToLang[locale] || 'en-US';
            recognitionRef.current.start();
            setIsRecording(true);
          } catch (e) {
            console.error("Error starting recognition", e);
             toast({
                variant: 'destructive',
                title: 'Could not start recording',
                description: 'Please ensure microphone permissions are allowed.',
            });
          }
      }
  }

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoSelect = () => photoInputRef.current?.click();


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    setSummary('');
    try {
      const result = await generateMemoryJournalSummary({
        journalEntries: values.journalEntry,
      });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
          variant: 'destructive',
          title: 'Summary Failed',
          description: 'Could not generate the journal summary.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{t('journal.formTitle')}</CardTitle>
          <CardDescription>{t('journal.voiceDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-lg bg-muted min-h-[200px]">
                <Button type="button" size="lg" onClick={toggleRecording} className={`h-24 w-24 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}>
                    {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                </Button>
                <p className="text-lg font-medium text-center">
                    {isRecording ? t('journal.stopRecording') : t('journal.startRecording')}
                </p>
                {isRecording && <Waves className="h-8 w-8 text-primary animate-pulse" />}
              </div>
              
              <FormField
                control={form.control}
                name="journalEntry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-lg">{t('journal.entryLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('journal.entryPlaceholder')}
                        className="min-h-[150px] text-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {photo && (
                <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-primary/20">
                  <Image src={photo} alt="Journal entry photo" fill style={{ objectFit: 'cover' }} />
                </div>
              )}

              <Input type="file" accept="image/*" ref={photoInputRef} onChange={handlePhotoSelect} className="hidden" />

              <div className="flex flex-col sm:flex-row gap-4">
                 <Button type="button" size="lg" variant="outline" className="flex-1" onClick={triggerPhotoSelect}><ImageIcon className="mr-2" /> {t('journal.addPhoto')}</Button>
                 <Button type="submit" size="lg" disabled={isGenerating || !form.formState.isValid} className="flex-1">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      {t('journal.generating')}
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-6 w-6" />
                      {t('journal.generateSummary')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{t('journal.summaryTitle')}</CardTitle>
           <CardDescription>{t('journal.summaryDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="text-lg text-foreground space-y-4 min-h-[400px]">
          {isGenerating && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          {summary && !isGenerating && (
             <p className="whitespace-pre-wrap leading-relaxed">{summary}</p>
          )}
           {!summary && !isGenerating && (
            <div className="flex items-center justify-center h-full text-center">
                <p className="text-muted-foreground">{t('journal.summaryPlaceholder')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
