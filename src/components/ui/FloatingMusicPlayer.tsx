import { useState } from 'react';
import { Music, X, Volume2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MusicSource {
  name: string;
  nameHe: string;
  url: string;
  description: string;
}

const musicSources: MusicSource[] = [
  {
    name: 'Lofi.cafe',
    nameHe: 'לופי קפה',
    url: 'https://lofi.cafe/',
    description: 'מוזיקת לופי מרגיעה',
  },
  {
    name: 'Rainymood',
    nameHe: 'צלילי גשם',
    url: 'https://rainymood.com/',
    description: 'צלילי גשם מרגיעים',
  },
  {
    name: 'Calm Radio',
    nameHe: 'רדיו רגוע',
    url: 'https://calmradio.com/meditation',
    description: 'מוזיקת מדיטציה',
  },
  {
    name: 'Nature Sounds',
    nameHe: 'צלילי טבע',
    url: 'https://asoftmurmur.com/',
    description: 'צלילי טבע מותאמים אישית',
  },
  {
    name: 'Focus Music',
    nameHe: 'מוזיקת ריכוז',
    url: 'https://www.noisli.com/',
    description: 'צלילי רקע לריכוז',
  },
];

export function FloatingMusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);

  const openMusicSource = (url: string) => {
    window.open(url, 'music_player', 'width=400,height=600,left=100,top=100');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 left-4 z-50 h-12 w-12 rounded-full shadow-lg bg-jade hover:bg-jade/90 text-white transition-all duration-300 hover:scale-110"
          aria-label="פתח נגן מוזיקה"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Music className="h-5 w-5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="start" 
        className="w-72 p-0 bg-background border border-border shadow-xl"
        sideOffset={8}
      >
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-jade" />
            <h3 className="font-medium text-foreground">מוזיקה מרגיעה לטיפול</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">בחר מקור מוזיקה לפתיחה בחלון נפרד</p>
        </div>
        <div className="p-2 max-h-64 overflow-y-auto">
          {musicSources.map((source) => (
            <button
              key={source.name}
              onClick={() => openMusicSource(source.url)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/80 transition-colors text-right group"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex-1 mr-2">
                <div className="font-medium text-foreground text-sm">{source.nameHe}</div>
                <div className="text-xs text-muted-foreground">{source.description}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            🎵 כל המקורות חינמיים ללא פרסומות
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
