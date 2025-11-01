'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Mic, MicOff } from 'lucide-react';

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    setIsMounted(true);
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = event.results[0][0].transcript.trim().toLowerCase();
        setTranscript(currentTranscript);
        handleCommand(currentTranscript);
        stopListening();
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
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
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleCommand = (command: string) => {
    console.log('Command received:', command);

    if (command.includes('go to dashboard')) {
      window.location.href = '/';
    } else if (command.includes('go to contacts')) {
      window.location.href = '/contacts';
    }
    
    // Allow time for user to see the command before closing
    setTimeout(() => {
      setTranscript('');
    }, 2000);
  };
  
  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  }
  
  const stopListening = () => {
     if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  // Guard against rendering on the server or if API is not supported
  if (!isMounted || !recognitionRef.current) {
    return null; 
  }

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="h-16 w-16 rounded-full shadow-lg"
        onClick={toggleListening}
      >
        <Mic className="h-8 w-8" />
        <span className="sr-only">Voice Command</span>
      </Button>

      <Dialog open={isListening} onOpenChange={setIsListening}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Listening...</DialogTitle>
            <DialogDescription className="text-center text-lg">
              Please say a command.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 gap-6">
            {isListening ? (
                <Mic className="h-24 w-24 text-primary animate-pulse" />
            ) : (
                <MicOff className="h-24 w-24 text-muted-foreground" />
            )}
            <p className="text-muted-foreground text-center min-h-[50px] text-xl">
              {transcript || '...'}
            </p>
          </div>
           <DialogFooter>
            <Button variant="destructive" onClick={stopListening}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
