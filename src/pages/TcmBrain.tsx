import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTier } from '@/hooks/useTier';
import { TierBadge } from '@/components/layout/TierBadge';
import { toast } from 'sonner';
import { 
  Brain, 
  Send, 
  Loader2, 
  Leaf, 
  MapPin, 
  Stethoscope,
  ArrowRight,
  Sparkles,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tcm-chat`;

const quickQuestions = [
  { icon: Leaf, text: 'מהם העשבים הטובים לחיזוק הטחול?', textEn: 'Best herbs for Spleen Qi deficiency?' },
  { icon: MapPin, text: 'נקודות לכאבי ראש מסוג שאו יאנג', textEn: 'Points for Shao Yang headache?' },
  { icon: Stethoscope, text: 'דפוסי TCM לנדודי שינה', textEn: 'TCM patterns for insomnia?' },
];

export default function TcmBrain() {
  const navigate = useNavigate();
  const { tier, hasFeature } = useTier();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tier) {
      navigate('/gate');
    }
  }, [tier, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem('therapist_tier');
    localStorage.removeItem('therapist_expires_at');
    navigate('/');
  };

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('יותר מדי בקשות. נסו שוב בעוד דקה.');
        } else if (response.status === 402) {
          toast.error('נגמרו הקרדיטים. יש להוסיף קרדיטים.');
        } else {
          toast.error('שגיאה בשירות AI');
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
                return newMessages;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('שגיאה בצ׳אט');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    streamChat(message);
  };

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    streamChat(question);
  };

  if (!tier || !hasFeature('tcm_brain')) return null;

  return (
    <>
      <Helmet>
        <title>TCM Brain | TCM Clinic</title>
        <meta name="description" content="מאגר ידע מקיף ברפואה סינית עם AI" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col" dir="rtl">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">חזרה</span>
              </Link>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-jade-light rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-jade" />
                </div>
                <span className="font-display text-lg">TCM Brain</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TierBadge />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="chat" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  שאל את ה-AI
                </TabsTrigger>
                <TabsTrigger value="herbs" className="gap-2">
                  <Leaf className="h-4 w-4" />
                  עשבים
                </TabsTrigger>
                <TabsTrigger value="points" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  נקודות
                </TabsTrigger>
                <TabsTrigger value="conditions" className="gap-2">
                  <Stethoscope className="h-4 w-4" />
                  מצבים
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col p-4 pt-2">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                <div className="space-y-4 pb-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-jade-light rounded-full flex items-center justify-center mx-auto mb-6">
                        <Brain className="h-10 w-10 text-jade" />
                      </div>
                      <h2 className="font-display text-2xl mb-2">ברוכים הבאים ל-TCM Brain</h2>
                      <p className="text-muted-foreground mb-8">
                        שאלו כל שאלה ברפואה סינית - עשבים, נקודות דיקור, אבחון ועוד
                      </p>
                      
                      {/* Quick Questions */}
                      <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                        {quickQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickQuestion(q.text)}
                            className="p-4 bg-card border border-border rounded-lg text-right hover:border-jade hover:shadow-soft transition-all group"
                          >
                            <q.icon className="h-5 w-5 text-jade mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm">{q.text}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <Card className={`max-w-[85%] ${msg.role === 'user' ? 'bg-jade text-primary-foreground' : 'bg-card'}`}>
                        <CardContent className="p-3">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-end">
                      <Card className="bg-card">
                        <CardContent className="p-3">
                          <Loader2 className="h-5 w-5 animate-spin text-jade" />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-border">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="שאלו שאלה ברפואה סינית..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="herbs" className="flex-1 p-4">
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 text-jade mx-auto mb-4" />
                <h3 className="font-display text-xl mb-2">מאגר עשבים סיניים</h3>
                <p className="text-muted-foreground">מאגר העשבים נמצא בבנייה. בינתיים, שאלו את ה-AI!</p>
              </div>
            </TabsContent>

            <TabsContent value="points" className="flex-1 p-4">
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-jade mx-auto mb-4" />
                <h3 className="font-display text-xl mb-2">מאגר נקודות דיקור</h3>
                <p className="text-muted-foreground">מאגר הנקודות נמצא בבנייה. בינתיים, שאלו את ה-AI!</p>
              </div>
            </TabsContent>

            <TabsContent value="conditions" className="flex-1 p-4">
              <div className="text-center py-12">
                <Stethoscope className="h-12 w-12 text-jade mx-auto mb-4" />
                <h3 className="font-display text-xl mb-2">מאגר מצבים ודפוסים</h3>
                <p className="text-muted-foreground">מאגר המצבים נמצא בבנייה. בינתיים, שאלו את ה-AI!</p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
