import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowRight, 
  Search, 
  Image as ImageIcon, 
  Loader2,
  ZoomIn,
  Brain,
  Sparkles
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface TongueImage {
  id: string;
  image_url: string;
  image_ref: string;
  image_caption: string | null;
  content: string;
  document_id: string;
}

export default function TongueGallery() {
  const [images, setImages] = useState<TongueImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<TongueImage | null>(null);

  useEffect(() => {
    fetchTongueImages();
  }, []);

  const fetchTongueImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select('id, image_url, image_ref, image_caption, content, document_id')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching tongue images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(img => {
    const query = searchQuery.toLowerCase();
    return (
      (img.image_caption?.toLowerCase().includes(query) || false) ||
      (img.image_ref?.toLowerCase().includes(query) || false) ||
      (img.content?.toLowerCase().includes(query) || false)
    );
  });

  return (
    <>
      <Helmet>
        <title>TCM Tongue Diagnosis Gallery | Visual Reference Library</title>
        <meta name="description" content="Comprehensive visual library of tongue diagnosis patterns in Traditional Chinese Medicine. AI-analyzed tongue images with detailed pattern descriptions." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30" dir="rtl">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">גלריית אבחון לשון</h1>
                <p className="text-sm text-muted-foreground">ספריית התייחסות ויזואלית TCM</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <ImageIcon className="h-3 w-3" />
                {images.length} תמונות
              </Badge>
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link to="/tcm-brain">
                  <Brain className="h-4 w-4" />
                  TCM Brain
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש לפי דפוס, תיאור או תנאי..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-jade" />
            </div>
          ) : filteredImages.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">אין תמונות לשון זמינות</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'לא נמצאו תוצאות לחיפוש שלך' : 'יש להעלות את בסיס הידע הזהב כדי להציג תמונות'}
                </p>
                <Button asChild>
                  <Link to="/knowledge-registry">העלאת בסיס ידע</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <Card 
                  key={image.id} 
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={image.image_url}
                      alt={image.image_caption || image.image_ref || 'Tongue diagnosis image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-3 left-3 right-3">
                        <Button size="sm" variant="secondary" className="w-full gap-2">
                          <ZoomIn className="h-4 w-4" />
                          הגדל תמונה
                        </Button>
                      </div>
                    </div>
                    {image.image_caption && (
                      <Badge className="absolute top-2 left-2 gap-1 bg-jade/90">
                        <Sparkles className="h-3 w-3" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">
                      {image.image_ref || 'Tongue Image'}
                    </p>
                    {image.image_caption && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {image.image_caption}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* Image Preview Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">תצוגת תמונת אבחון לשון</DialogTitle>
            {selectedImage && (
              <div className="grid md:grid-cols-2">
                <div className="bg-black flex items-center justify-center min-h-[300px]">
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.image_caption || 'Tongue diagnosis'}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>
                <ScrollArea className="max-h-[70vh] p-6" dir="rtl">
                  <h3 className="text-lg font-semibold mb-2">
                    {selectedImage.image_ref || 'תמונת אבחון לשון'}
                  </h3>
                  
                  {selectedImage.image_caption && (
                    <div className="mb-4">
                      <Badge className="gap-1 mb-2 bg-jade">
                        <Sparkles className="h-3 w-3" />
                        ניתוח AI
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {selectedImage.image_caption}
                      </p>
                    </div>
                  )}
                  
                  {selectedImage.content && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="text-sm font-medium mb-2">הקשר מתוך הידע</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedImage.content}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6 flex gap-2">
                    <Button asChild className="flex-1 gap-2">
                      <Link to="/tcm-brain">
                        <Brain className="h-4 w-4" />
                        שאל את TCM Brain
                      </Link>
                    </Button>
                  </div>
                </ScrollArea>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
