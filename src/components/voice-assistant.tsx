'use client';

import { useState, useEffect, useRef }from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Mic, MicOff, Waves } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { sendEmergencyAlert } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { contacts } from '@/lib/data';
import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { useLocale } from '@/hooks/use-locale';


const handleCommand = (
  command: string,
  setFeedback: (feedback: string) => void,
  stopListening: () => void,
  firestore: Firestore | null,
  user: User | null,
  toast: (options: any) => void,
  t: (key: string) => string
) => {
  const lowerCaseCommand = command.toLowerCase();
  
  const navItems = [
    { key: 'dashboard', route: '' },
    { key: 'contacts', route: 'contacts' },
    { key: 'journal', route: 'journal' },
    { key: 'location', route: 'location' },
    { key: 'reminders', route: 'reminders' },
    { key: 'caregiver', route: 'caregiver' },
    { key: 'settings', route: 'settings' },
  ];

  const emergencyKeywords = ['help', 'emergency', 'sos', 'ayuda', 'emergencia', 'socorro', 'aide', 'urgence', 'hilfe', 'notfall', 'मदद', 'आपातकाल', 'aiuto', 'emergenza'];
  const callKeywords = ['call', 'llama a', 'llama', 'appelle', 'anrufen', 'बुलाओ', 'chiama'];

  let actionTaken = false;

  const takeAction = (feedbackMsg: string, duration = 2000) => {
    setFeedback(feedbackMsg);
    actionTaken = true;
    setTimeout(() => stopListening(), duration);
  };
  
  // 1. Emergency
  if (emergencyKeywords.some(keyword => lowerCaseCommand.includes(keyword))) {
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

  // 2. Navigation
  for (const navItem of navItems) {
      const translatedPageName = t(`nav.${navItem.key}`).toLowerCase();
      if (lowerCaseCommand.includes(translatedPageName)) {
           window.location.href = `/${navItem.route}`;
           takeAction(`${t('voiceAssistant.navigatingTo')} ${t('nav.'+navItem.key)}...`);
           return;
      }
  }

  // 3. Calling
  if (callKeywords.some(keyword => lowerCaseCommand.startsWith(keyword))) {
      for (const contact of contacts) {
          const translatedContactName = t(contact.name).toLowerCase();
          if (lowerCaseCommand.includes(translatedContactName)) {
              if (contact.phone) {
                  window.location.href = `tel:${contact.phone}`;
                  takeAction(`${t('voiceAssistant.calling')} ${t(contact.name)}...`);
              } else {
                  takeAction(t('voiceAssistant.contactNotFound').replace('{contactName}', translatedContactName));
              }
              return;
          }
      }
  }

  // If no action was taken after a short delay, provide feedback.
  setTimeout(() => {
      if (!actionTaken) {
        setFeedback(t('voiceAssistant.didNotUnderstand'));
      }
  }, 1500);

};

const localeToLang: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    hi: 'hi-IN',
    it: 'it-IT',
};

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { locale, t } = useLocale();
  
  useEffect(() => {
    setIsMounted(true);
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      const lang = localeToLang[locale] || 'en-US';
      recognitionInstance.lang = lang;

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = event.results[0][0].transcript.trim();
        setTranscript(currentTranscript);
        setFeedback(`${t('voiceAssistant.heard')}: "${currentTranscript}"`)
        handleCommand(currentTranscript, setFeedback, stopListening, firestore, user, toast, t);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          toast({
            variant: 'destructive',
            title: 'Microphone Access Denied',
            description: 'Please enable microphone permissions in your browser settings.',
          });
        }
        stopListening();
      };

      recognitionInstance.onend = () => {
        if (recognitionRef.current) {
          setIsListening(false);
        }
      };
      
      recognitionRef.current = recognitionInstance;
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, user, toast, locale, t]); // Add locale and t to deps

  const startListening = () => {
    if (recognitionRef.current) {
      const lang = localeToLang[locale] || 'en-US';
      recognitionRef.current.lang = lang;
      setTranscript('');
      setFeedback('');
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch(e) {
        console.error("Error starting speech recognition: ", e);
        if((e as DOMException).name === 'NotAllowedError') {
             toast({
                variant: 'destructive',
                title: 'Microphone Access Denied',
                description: 'Please enable microphone permissions in your browser settings.',
            });
        }
        setIsListening(false);
      }
    }
  }
  
  const stopListening = () => {
     if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  if (!isMounted) {
    return null; 
  }
  
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

      <Dialog open={isListening} onOpenChange={setIsListening}>
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
            <p className="text-muted-foreground text-center min-h-[2.5rem] text-xl px-4 py-2 rounded-lg bg-muted w-full">
              {feedback || transcript || t('voiceAssistant.placeholder')}
            </p>
          </div>
           <DialogFooter>
            <Button variant="destructive" onClick={stopListening}>
              {t('voiceAssistant.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
