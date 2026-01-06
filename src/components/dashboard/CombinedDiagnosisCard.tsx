import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity, Eye, Sparkles, ArrowRight } from 'lucide-react';
import tongueBackground from '@/assets/tongue-diagnosis-bg.png';

interface CombinedDiagnosisCardProps {
  animationDelay?: number;
}

export function CombinedDiagnosisCard({ animationDelay = 0 }: CombinedDiagnosisCardProps) {
  return (
    <Link to="/combined-diagnosis" className="block group">
      <Card
        className="relative overflow-hidden h-[200px] border-0 shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {/* Gradient background with dual overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ 
            backgroundImage: `url(${tongueBackground})`,
            filter: 'hue-rotate(270deg) saturate(0.8)'
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-800/85 to-blue-900/80 group-hover:from-purple-800/85 group-hover:via-indigo-700/80 group-hover:to-blue-800/75 transition-all duration-500" />
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
            <Eye className="h-4 w-4 text-rose-300" />
          </div>
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
            <Activity className="h-4 w-4 text-blue-300" />
          </div>
        </div>

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-end text-white">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm gap-1">
              <Sparkles className="h-3 w-3" />
              AI Pattern Correlation
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-6 w-6" />
            <h3 className="text-xl font-bold">אבחון משולב</h3>
          </div>
          
          <p className="text-sm text-white/80 mb-3">
            שילוב לשון ודופק לזיהוי דפוסי TCM
          </p>

          <div className="flex items-center text-sm text-white/70 group-hover:text-white transition-colors">
            <span>התחל אבחון</span>
            <ArrowRight className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>
      </Card>
    </Link>
  );
}
