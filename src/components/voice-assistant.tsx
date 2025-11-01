'use client';

import { useState, useEffect } from 'react';
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
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [SpeechRecognition, setSpeechRecognition] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const recognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechRecognition(() => recognitionApi);
  }, []);

  useEffect(() => {
    if (!SpeechRecognition) {
      if(isMounted) console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-US';
    rec.interimResults = false;

    rec.onresult = (event: any) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript);
      handleCommand(currentTranscript);
      setIsListening(false);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    rec.onend = () => {
        if (isListening) {
            // This check is to prevent it from stopping and starting if the user clicks the button to stop.
        }
        setIsListening(false);
    };
    
    setRecognition(rec);

    return () => {
        if (rec) {
            rec.stop();
        }
    };
  }, [isListening, SpeechRecognition, isMounted]);

  const handleCommand = (command: string) => {
    // In the future, this will process commands.
    console.log('Command received:', command);
    // For now, we just close the dialog.
    setTimeout(() => setTranscript(''), 2000);
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  };

  if (!isMounted || !SpeechRecognition) {
    return null; // Don't render the button if the API is not supported or on the server.
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
        <DialogContent className="sm:max-w-[425px]">
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
            <Button variant="destructive" onClick={() => {
                if (recognition) recognition.stop();
                setIsListening(false);
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
