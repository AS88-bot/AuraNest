'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Mic, MicOff, Waves, Volume2, Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { sendEmergencyAlert } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { contacts } from '@/lib/data';
import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { useLocale } from '@/hooks/use-locale';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { interpretCommand } from '@/ai/flows/interpret-command';
import { useReminders } from '@/hooks/use-reminders';

const localeToLangCode: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  hi: 'hi-IN',
  it: 'it-IT',
};

const localeToLangName: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    hi: 'Hindi',
    it: 'Italian',
};

const voiceOptions = [
    { value: 'Algenib', label: 'English (US), Algenib (Female)', lang: 'en-US', languageName: 'English' },
    { value: 'Achernar', label: 'English (UK), Achernar (Male)', lang: 'en-GB', languageName: 'English' },
    { value: 'Laomedeia', label: 'Spanish (Spain), Laomedeia (Female)', lang: 'es-ES', languageName: 'Spanish' },
    { value: 'Erinome', label: 'French (France), Erinome (Female)', lang: 'fr-FR', languageName: 'French' },
    { value: 'Schedar', label: 'German (Germany), Schedar (Female)', lang: 'de-DE', languageName: 'German' },
    { value: 'Leda', label: 'Hindi (India), Leda (Female)', lang: 'hi-IN', languageName: 'Hindi' },
    { value: 'Callirrhoe', label: 'Italian (Italy), Callirrhoe (Female)', lang: 'it-IT', languageName: 'Italian' },
];


const handleCommand = async (
  command: string,
  setFeedback: (feedback: string) => void,
  setAudioSrc: (src: string | null) => void,
  setIsGeneratingAudio: (isGenerating: boolean) => void,
  stopListener: () => void,
  firestore: Firestore | null,
  user: User | null,
  toast: (options: any) => void,
  t: (key: string, specificLocale?: string) => string,
  addReminder: (reminder: any) => void,
  activeReminder: any,
  completeActiveReminder: () => void,
  locale: string
) => {
  setFeedback(t('voiceAssistant.thinking'));
  
  const navItems = ['dashboard', 'contacts', 'journal', 'location', 'reminders', 'caregiver', 'settings'];
  const availablePages = navItems.map(item => t(`nav.${item}`, 'en').toLowerCase());
  const availableContacts = contacts.map(c => t(c.name, 'en').toLowerCase());

  try {
    const interpretation = await interpretCommand({
      command: command,
      language: localeToLangName[locale] || 'English',
      contacts: availableContacts,
      pages: availablePages
    });

    let actionTaken = false;
    const takeAction = (feedbackMsg: string, duration = 3000) => {
      setFeedback(feedbackMsg);
      actionTaken = true;
      setTimeout(() => stopListener(), duration);
    };

    switch (interpretation.action) {
      case 'emergency':
        if (firestore && user) {
          sendEmergencyAlert(firestore, user);
          toast({
            title: t('sosButton.sentTitle'),
            description: t('sosButton.sentDescription'),
            variant: 'destructive',
          });
          takeAction(t('voiceAssistant.sendingAlert'));
        }
        break;

      case 'done':
         if (activeReminder) {
            completeActiveReminder();
            takeAction(t('voiceAssistant.taskCompleted'));
         }
        break;

      case 'navigate':
        const pageTarget = interpretation.target?.toLowerCase();
        const navItem = navItems.find(item => t(`nav.${item}`, 'en').toLowerCase() === pageTarget);
        if (navItem) {
          const route = navItem === 'dashboard' ? '' : navItem;
          window.location.href = `/${route}`;
          takeAction(`${t('voiceAssistant.navigatingTo')} ${t('nav.'+navItem)}...`);
        }
        break;

      case 'call':
        const contactTarget = interpretation.target?.toLowerCase();
        const contact = contacts.find(c => t(c.name, 'en').toLowerCase() === contactTarget);
        if (contact && contact.phone) {
          window.location.href = `tel:${contact.phone}`;
          takeAction(`${t('voiceAssistant.calling')} ${t(contact.name)}...`);
        } else if (contact) {
            takeAction(t('voiceAssistant.contactNotFound').replace('{contactName}', t(contact.name)));
        }
        break;

      case 'remind':
        if (interpretation.full_reminder_text) {
          setFeedback(t('voiceAssistant.creatingReminder'));
          setIsGeneratingAudio(true);
          actionTaken = true;

          const currentLangCode = localeToLangCode[locale] || 'en-US';
          const voiceForReminder = voiceOptions.find(opt => opt.lang === currentLangCode) || voiceOptions[0];

          try {
            const result = await textToSpeech({
              text: interpretation.full_reminder_text,
              voice: voiceForReminder.value,
              languageCode: voiceForReminder.lang,
              languageName: voiceForReminder.languageName,
            });

            if (result.time && result.reminderText) {
              addReminder({
                id: `reminder-${new Date().toISOString()}`,
                time: result.time,
                text: result.reminderText,
                audioSrc: result.audio,
              });
              setFeedback(`${t('voiceAssistant.reminderSetFor')} ${result.time}.`);
            } else {
              setFeedback(t('voiceAssistant.reminderCreatedNoTime'));
              setAudioSrc(result.audio);
            }
          } catch (e) {
            console.error(e);
            setFeedback(t('voiceAssistant.reminderError'));
          } finally {
            setIsGeneratingAudio(false);
            setTimeout(() => stopListener(), 4000);
          }
        }
        break;

      default: // 'unknown'
        // Let the timeout handle the 'did not understand' message
        break;
    }

    setTimeout(() => {
        if (!actionTaken) {
            takeAction(t('voiceAssistant.didNotUnderstand'));
        }
    }, 1000);


  } catch (error) {
    console.error("Error interpreting command:", error);
    setFeedback(t('voiceAssistant.didNotUnderstand'));
    setTimeout(() => stopListener(), 2000);
  }
};

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { t, locale } = useLocale();
  const { addReminder, activeReminder, completeActiveReminder } = useReminders();
  
  const stopListener = useCallback(() => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const startListener = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast({ variant: 'destructive', title: t('voiceAssistant.notSupported') });
      return;
    }
    
    setFeedback(activeReminder ? t('voiceAssistant.reminderActivePlaceholder') : t('voiceAssistant.placeholder'));
    setAudioSrc(null);
    setIsGeneratingAudio(false);

    if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = localeToLangCode[locale] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.trim();
      setFeedback(`${t('voiceAssistant.heard')}: "${command}"`);
      handleCommand(
        command,
        setFeedback,
        setAudioSrc,
        setIsGeneratingAudio,
        stopListener,
        firestore,
        user,
        toast,
        t,
        addReminder,
        activeReminder,
        completeActiveReminder,
        locale
      );
    };
    
    recognition.onerror = (event) => {
      console.error(`Speech recognition error:`, event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setFeedback(t('voiceAssistant.didNotUnderstand'));
      }
      // Ensure listening state is turned off.
       setTimeout(() => {
          if (isListening) {
            setIsListening(false);
          }
      }, 1000);
    };

    recognition.onend = () => {
       // Check if it should stop listening
       if (isListening) {
        //  setIsListening(false);
       }
    };
    
    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.error("Error starting speech recognition:", e);
      if((e as DOMException).name === 'NotAllowedError') {
           toast({
              variant: 'destructive',
              title: 'Microphone Access Denied',
              description: 'Please enable microphone permissions in your browser settings.',
          });
      }
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListener();
    } else {
      startListener();
    }
  };

  useEffect(() => {
    setIsMounted(true);
    return () => {
        stopListener();
    };
  }, [stopListener]);
  
  if (!isMounted) return null;
  
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
     return (
      <Button variant="outline" size="lg" className="h-16 w-16 rounded-full shadow-lg" disabled title={t('voiceAssistant.notSupported')}>
        <MicOff className="h-8 w-8" />
        <span className="sr-only">{t('voiceAssistant.notSupported')}</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="h-16 w-16 rounded-full shadow-lg"
        onClick={toggleListening}
        aria-label={t('voiceAssistant.ariaLabel')}
      >
        {isListening ? <MicOff className="h-8 w-8 text-red-500" /> : <Mic className="h-8 w-8" />}
      </Button>

      <Dialog open={isListening} onOpenChange={(open) => !open && stopListener()}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">{t('voiceAssistant.listeningTitle')}</DialogTitle>
            <DialogDescription className="text-center text-lg">
              {t('voiceAssistant.listeningDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 gap-6 min-h-[250px]">
            <div className="relative">
                <Waves className="h-24 w-24 text-primary opacity-50" />
                <Mic className="h-12 w-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            {isGeneratingAudio && (
                <div className="flex items-center gap-4 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>{t('voiceAssistant.creatingReminder')}</span>
                </div>
            )}

            {audioSrc && !isGeneratingAudio && (
                <div className="space-y-4 rounded-lg bg-muted p-4 w-full">
                <p className="text-muted-foreground text-center">{feedback}</p>
                <div className='flex items-center gap-4'>
                    <Volume2 className="h-8 w-8 text-primary" />
                    <audio controls autoPlay src={audioSrc} className="w-full">
                    Your browser does not support the audio element.
                    </audio>
                </div>
                </div>
            )}

            {!audioSrc && !isGeneratingAudio && (
                <p className="text-muted-foreground text-center min-h-[2.5rem] text-xl px-4 py-2 rounded-lg bg-muted w-full">
                 {feedback || (activeReminder ? t('voiceAssistant.reminderActivePlaceholder') : t('voiceAssistant.placeholder'))}
                </p>
            )}

          </div>
           <DialogFooter>
            <Button variant="destructive" onClick={stopListener}>
              {t('voiceAssistant.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
