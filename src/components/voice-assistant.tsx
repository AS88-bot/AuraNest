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
import { useReminders } from '@/hooks/use-reminders';
import { getVoiceCommands, CommandType } from '@/lib/voice-commands';

interface LanguageConfig {
  code: string;
  name: string;
}

const supportedLanguages: LanguageConfig[] = [
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'it-IT', name: 'Italian' },
];

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
  detectedLanguage: LanguageConfig,
  setFeedback: (feedback: string) => void,
  setAudioSrc: (src: string | null) => void,
  setIsGeneratingAudio: (isGenerating: boolean) => void,
  stopAllListeners: () => void,
  firestore: Firestore | null,
  user: User | null,
  toast: (options: any) => void,
  t: (key: string) => string,
  addReminder: (reminder: any) => void,
  activeReminder: any,
  completeActiveReminder: () => void
) => {
  const lowerCaseCommand = command.toLowerCase();
  const allCommands = getVoiceCommands(t);
  let actionTaken = false;

  const takeAction = (feedbackMsg: string, duration = 3000, shouldStop = true) => {
    setFeedback(feedbackMsg);
    actionTaken = true;
    if (shouldStop) {
      setTimeout(() => stopAllListeners(), duration);
    }
  };

  const checkCommand = (type: CommandType): boolean => {
    return allCommands[type].some(keyword => lowerCaseCommand.includes(keyword));
  };

  // 1. Mark as Done
  if (activeReminder && checkCommand('done')) {
    completeActiveReminder();
    takeAction(t('voiceAssistant.taskCompleted'));
    return;
  }

  // 2. Emergency
  if (checkCommand('emergency')) {
    if (firestore && user) {
      sendEmergencyAlert(firestore, user);
      toast({
        title: t('sosButton.sentTitle'),
        description: t('sosButton.sentDescription'),
        variant: 'destructive',
      });
      takeAction(t('voiceAssistant.sendingAlert'));
    } else {
      toast({
        title: t('sosButton.errorTitle'),
        description: t('sosButton.errorDescription'),
        variant: 'destructive',
      });
      takeAction(t('voiceAssistant.didNotUnderstand'));
    }
    return;
  }

  // 3. Reminder
  if (checkCommand('remind')) {
    takeAction(t('voiceAssistant.creatingReminder'), 0, false);
    setIsGeneratingAudio(true);
    const voiceForReminder = voiceOptions.find(opt => opt.lang === detectedLanguage.code) || voiceOptions[0];

    try {
      const result = await textToSpeech({
        text: command,
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
      setTimeout(() => stopAllListeners(), 4000);
    }
    return;
  }

  // 4. Navigation
  if (checkCommand('goTo')) {
    const navItems = ['dashboard', 'contacts', 'journal', 'location', 'reminders', 'caregiver', 'settings'];
    for (const navItem of navItems) {
        // We need to check the spoken command against the nav item name in all languages
        const allNames = supportedLanguages.map(l => t(`nav.${navItem}`, l.code.split('-')[0])).map(n => n.toLowerCase());
        if (allNames.some(name => lowerCaseCommand.includes(name))) {
            const route = navItem === 'dashboard' ? '' : navItem;
            window.location.href = `/${route}`;
            takeAction(`${t('voiceAssistant.navigatingTo')} ${t('nav.'+navItem)}...`);
            return;
        }
    }
  }

  // 5. Calling
  if (checkCommand('call')) {
    for (const contact of contacts) {
        const allNames = supportedLanguages.map(l => t(contact.name, l.code.split('-')[0])).map(n => n.toLowerCase());
        if (allNames.some(name => lowerCaseCommand.includes(name))) {
            if (contact.phone) {
                window.location.href = `tel:${contact.phone}`;
                takeAction(`${t('voiceAssistant.calling')} ${t(contact.name)}...`);
            } else {
                takeAction(t('voiceAssistant.contactNotFound').replace('{contactName}', t(contact.name)));
            }
            return;
        }
    }
  }

  setTimeout(() => {
    if (!actionTaken) {
      setFeedback(t('voiceAssistant.didNotUnderstand'));
    }
  }, 2500);
};

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const recognitionInstances = useRef<SpeechRecognition[]>([]);
  const hasHandledCommand = useRef(false);

  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { t } = useLocale();
  const { addReminder, activeReminder, completeActiveReminder } = useReminders();
  
  const stopAllListeners = useCallback(() => {
    recognitionInstances.current.forEach(instance => instance.stop());
    recognitionInstances.current = [];
    setIsListening(false);
  }, []);

  const commandHandler = useCallback((command: string, detectedLanguage: LanguageConfig) => {
    if (hasHandledCommand.current) return;
    hasHandledCommand.current = true;

    setTranscript(command);
    setFeedback(`${t('voiceAssistant.heard')}: "${command}"`);
    handleCommand(
      command,
      detectedLanguage,
      setFeedback,
      setAudioSrc,
      setIsGeneratingAudio,
      stopAllListeners,
      firestore,
      user,
      toast,
      t,
      addReminder,
      activeReminder,
      completeActiveReminder
    );
  }, [t, stopAllListeners, firestore, user, toast, addReminder, activeReminder, completeActiveReminder]);

  const startListening = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast({ variant: 'destructive', title: t('voiceAssistant.notSupported') });
      return;
    }
    
    setTranscript('');
    setFeedback(activeReminder ? t('voiceAssistant.reminderActivePlaceholder') : t('voiceAssistant.placeholder'));
    setAudioSrc(null);
    setIsGeneratingAudio(false);
    hasHandledCommand.current = false;
    
    recognitionInstances.current = supportedLanguages.map(lang => {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = lang.code;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript.trim();
        console.log(`Recognized in ${lang.name}: ${result}`);
        commandHandler(result, lang);
      };
      
      recognition.onerror = (event) => {
        // We can ignore 'no-speech' errors as other listeners might be active
        if (event.error !== 'no-speech') {
            console.error(`Speech recognition error for ${lang.name}:`, event.error);
        }
      };

      return recognition;
    });

    try {
      recognitionInstances.current.forEach(instance => instance.start());
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
      stopAllListeners();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    setIsMounted(true);
    // Cleanup on unmount
    return () => {
        stopAllListeners();
    };
  }, [stopAllListeners]);
  
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

      <Dialog open={isListening} onOpenChange={(open) => !open && stopAllListeners()}>
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
            <Button variant="destructive" onClick={stopAllListeners}>
              {t('voiceAssistant.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
