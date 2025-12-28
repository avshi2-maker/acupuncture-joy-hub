import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Mic, MicOff, Play, Pause, Trash2, Loader2, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VoiceNote } from './VoiceNoteRecorder';

interface MobileVoiceNotesDrawerProps {
  voiceNotes: VoiceNote[];
  onAddNote: (note: VoiceNote) => void;
  onDeleteNote: (id: string) => void;
  disabled?: boolean;
}

export const MobileVoiceNotesDrawer: React.FC<MobileVoiceNotesDrawerProps> = ({
  voiceNotes,
  onAddNote,
  onDeleteNote,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio },
            });
            
            const transcription = error ? 'Transcription failed' : (data?.text || 'No transcription available');
            
            const note: VoiceNote = {
              id: `vn-${Date.now()}`,
              audioBlob,
              audioUrl,
              transcription,
              duration: recordingDuration,
              timestamp: new Date().toISOString()
            };
            
            onAddNote(note);
            toast.success('Voice note saved');
            setIsTranscribing(false);
          };
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Transcription error:', error);
          
          const note: VoiceNote = {
            id: `vn-${Date.now()}`,
            audioBlob,
            audioUrl,
            transcription: 'Transcription failed',
            duration: recordingDuration,
            timestamp: new Date().toISOString()
          };
          
          onAddNote(note);
          toast.warning('Voice note saved (transcription failed)');
          setIsTranscribing(false);
        }
        
        setRecordingDuration(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Cannot access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const togglePlayback = (note: VoiceNote) => {
    if (playingNoteId === note.id) {
      audioElementRef.current?.pause();
      setPlayingNoteId(null);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      
      audioElementRef.current = new Audio(note.audioUrl);
      audioElementRef.current.onended = () => setPlayingNoteId(null);
      audioElementRef.current.play();
      setPlayingNoteId(note.id);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden gap-2 relative"
          disabled={disabled}
        >
          <Mic className="h-4 w-4" />
          Voice
          {voiceNotes.length > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {voiceNotes.length}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-jade" />
            Voice Notes
            {voiceNotes.length > 0 && (
              <Badge variant="secondary">{voiceNotes.length}</Badge>
            )}
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-6 space-y-4">
          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-4 py-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled || isTranscribing}
              className="gap-3 h-14 px-8 text-lg"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-6 w-6" />
                  Stop Recording ({formatDuration(recordingDuration)})
                </>
              ) : isTranscribing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Mic className="h-6 w-6" />
                  Start Recording
                </>
              )}
            </Button>
            
            {isRecording && (
              <div className="flex items-center gap-2">
                <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-muted-foreground">Recording in progress...</span>
              </div>
            )}
          </div>

          {/* Voice Notes List */}
          {voiceNotes.length > 0 && (
            <ScrollArea className="h-[40vh]">
              <div className="space-y-3">
                {voiceNotes.map((note, index) => (
                  <div 
                    key={note.id} 
                    className="bg-muted/50 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Note {index + 1}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(note.duration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => togglePlayback(note)}
                        >
                          {playingNoteId === note.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">
                      {note.transcription}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {voiceNotes.length === 0 && !isRecording && !isTranscribing && (
            <div className="text-center py-8 text-muted-foreground">
              <Mic className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No voice notes yet</p>
              <p className="text-sm">Tap the button above to start recording</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
