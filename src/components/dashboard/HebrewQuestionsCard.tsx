import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Languages } from 'lucide-react';
import hebrewQuestionsBg from '@/assets/hebrew-questions-bg.png';

interface HebrewQuestionsCardProps {
  animationDelay?: number;
}

export function HebrewQuestionsCard({ animationDelay = 0 }: HebrewQuestionsCardProps) {
  return (
    <Link to="/hebrew-questions-report" className="block h-full">
      <Card 
        className="h-full overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
        style={{
          animationDelay: `${animationDelay}ms`,
          animationFillMode: 'forwards',
        }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${hebrewQuestionsBg})`,
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/70 group-hover:via-black/30 transition-all duration-300" />
        
        {/* Content */}
        <CardContent className="relative z-10 p-4 h-full flex flex-col justify-between min-h-[180px]">
          <div className="flex items-start justify-between">
            <Badge className="bg-amber-600/90 text-white gap-1">
              <Languages className="h-3 w-3" />
              Hebrew Content
            </Badge>
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="mt-auto">
            <h3 className="text-lg font-bold text-white mb-1">דוח שאלות בעברית</h3>
            <p className="text-sm text-white/80">
              206 שאלות ב-12 שאלונים קליניים
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
