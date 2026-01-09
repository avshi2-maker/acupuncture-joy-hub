import React from 'react';
import { PromptMapping } from '@/data/tcm-prompt-mapping';
import { X, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ClinicalStackBarProps {
  stackedQueries: PromptMapping[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const ClinicalStackBar: React.FC<ClinicalStackBarProps> = ({
  stackedQueries,
  onRemove,
  onClear,
  onAnalyze,
  isAnalyzing
}) => {
  if (stackedQueries.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-violet-950/50 to-purple-950/50 border border-violet-500/30 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium text-violet-200">
            Current Session Stack
          </span>
          <Badge variant="secondary" className="bg-violet-500/20 text-violet-300">
            {stackedQueries.length} queries
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 text-xs text-violet-400 hover:text-violet-200 hover:bg-violet-500/20"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {stackedQueries.map((query, index) => (
          <div
            key={query.id}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full",
              "bg-violet-500/20 border border-violet-400/30",
              "text-sm text-violet-200"
            )}
          >
            <span className="text-base">{query.icon}</span>
            <span className="max-w-[150px] truncate">{query.hebrewLabel}</span>
            <button
              onClick={() => onRemove(query.id)}
              className="ml-1 p-0.5 hover:bg-violet-400/20 rounded-full transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <Button
        onClick={onAnalyze}
        disabled={isAnalyzing || stackedQueries.length === 0}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
      >
        {isAnalyzing ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Analyzing Full Case...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze Full Case ({stackedQueries.length} queries → 1 API call)
          </>
        )}
      </Button>
    </div>
  );
};
