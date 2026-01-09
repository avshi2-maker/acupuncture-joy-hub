import React from 'react';
import { SessionMetrics } from '@/hooks/useClinicalSession';
import { PromptMapping } from '@/data/tcm-prompt-mapping';
import { Activity, Zap, Clock, DollarSign } from 'lucide-react';

interface EconomyMonitorProps {
  metrics: SessionMetrics;
  stackedQueries: PromptMapping[];
  isVisible: boolean;
}

export const EconomyMonitor: React.FC<EconomyMonitorProps> = ({
  metrics,
  stackedQueries,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div 
      id="economy-monitor"
      className="fixed bottom-4 right-4 bg-black/90 text-green-400 p-3 rounded-lg font-mono text-xs z-50 border border-green-900/50 shadow-lg min-w-[200px]"
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-900/30">
        <Activity className="h-3 w-3 animate-pulse" />
        <span className="text-green-300 font-semibold">STACKED SESSION</span>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-green-500">
            <Zap className="h-3 w-3" />
            QUERIES:
          </span>
          <span>{stackedQueries.length}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-green-500">
            <Clock className="h-3 w-3" />
            TIME:
          </span>
          <span>{metrics.timeMs}ms</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-green-500">
            <Activity className="h-3 w-3" />
            TOKENS:
          </span>
          <span>{metrics.tokensUsed}</span>
        </div>
        
        <div className="flex items-center justify-between pt-1 border-t border-green-900/30">
          <span className="flex items-center gap-1.5 text-green-300">
            <DollarSign className="h-3 w-3" />
            TOTAL COST:
          </span>
          <span className="text-green-300 font-semibold">
            ${metrics.totalCost.toFixed(5)}
          </span>
        </div>
      </div>

      {stackedQueries.length > 0 && (
        <div className="mt-2 pt-2 border-t border-green-900/30">
          <div className="flex flex-wrap gap-1">
            {stackedQueries.map(q => (
              <span key={q.id} className="text-base" title={q.hebrewLabel}>
                {q.icon}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
