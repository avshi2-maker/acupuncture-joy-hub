import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Database, FileText, Search, Filter, CheckCircle2, Lock } from 'lucide-react';

interface SourceUsed {
  fileName: string;
  pillar: string;
  chunkIndex: number;
  category?: string;
}

interface SourceAuditFooterProps {
  sourceAudit?: {
    totalIndexedAssets: number;
    totalChunksInIndex: number;
    candidatesScanned: number;
    filteredToTop: number;
    sourcesUsedForAnswer: SourceUsed[];
    searchScope: string;
    closedLoop: boolean;
  };
  pillarBreakdown?: {
    clinical: number;
    pharmacopeia: number;
    nutrition: number;
    lifestyle: number;
    ageSpecific: number;
    cafStudies: number;
    clinicalTrials: number;
  };
}

const PILLAR_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  clinical: { label: 'Clinical', emoji: '📍', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  pharmacopeia: { label: 'Pharmacopeia', emoji: '🌿', color: 'bg-green-500/10 text-green-600 border-green-500/30' },
  nutrition: { label: 'Nutrition', emoji: '🍎', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  lifestyle: { label: 'Lifestyle', emoji: '🏃', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
};

export function SourceAuditFooter({ sourceAudit, pillarBreakdown }: SourceAuditFooterProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sourceAudit) return null;

  const { 
    totalIndexedAssets, 
    totalChunksInIndex,
    candidatesScanned, 
    filteredToTop, 
    sourcesUsedForAnswer, 
    searchScope,
    closedLoop 
  } = sourceAudit;

  // Group sources by pillar
  const sourcesByPillar = sourcesUsedForAnswer.reduce((acc, source) => {
    const pillar = source.pillar || 'clinical';
    if (!acc[pillar]) acc[pillar] = [];
    acc[pillar].push(source);
    return acc;
  }, {} as Record<string, SourceUsed[]>);

  // Get unique file names
  const uniqueFiles = [...new Set(sourcesUsedForAnswer.map(s => s.fileName))];

  return (
    <div className="mt-4 border-t border-border pt-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">🔍 SYSTEM AUDIT</span>
            {closedLoop && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                <Lock className="w-3 h-3 mr-1" />
                Closed Loop
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {uniqueFiles.length} sources used
            </Badge>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2">
          <div className="bg-muted/30 rounded-lg p-3 space-y-3 text-sm font-mono">
            {/* Search Scope */}
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-muted-foreground">Search Scope:</span>
              <span className="font-medium">{searchScope}</span>
            </div>

            {/* Candidates Scanned */}
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-500" />
              <span className="text-muted-foreground">Scanned Candidates:</span>
              <span className="font-medium">{candidatesScanned} chunks</span>
              <span className="text-muted-foreground text-xs">(from {totalChunksInIndex.toLocaleString()} total)</span>
            </div>

            {/* Filtered to Top */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">Filtered to Top:</span>
              <span className="font-medium">{filteredToTop} relevant chunks per pillar</span>
            </div>

            {/* Pillar Breakdown */}
            {pillarBreakdown && (
              <div className="flex items-start gap-2 pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Pillar Hits:</span>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600">
                    📍 Clinical: {pillarBreakdown.clinical}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                    🌿 Pharma: {pillarBreakdown.pharmacopeia}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600">
                    🍎 Nutrition: {pillarBreakdown.nutrition}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600">
                    🏃 Lifestyle: {pillarBreakdown.lifestyle}
                  </Badge>
                </div>
              </div>
            )}

            {/* Sources Used */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">SOURCES USED FOR THIS ANSWER:</span>
              </div>
              
              {sourcesUsedForAnswer.length === 0 ? (
                <div className="text-amber-600 text-xs pl-6">
                  Sources Used: None - No matching protocols found in clinic assets.
                </div>
              ) : (
                <div className="space-y-1 pl-6">
                  {Object.entries(sourcesByPillar).map(([pillar, sources]) => {
                    const pillarInfo = PILLAR_LABELS[pillar] || { label: pillar, emoji: '📄', color: 'bg-gray-500/10' };
                    return (
                      <div key={pillar} className="space-y-0.5">
                        <span className="text-xs text-muted-foreground">{pillarInfo.emoji} {pillarInfo.label}:</span>
                        {sources.slice(0, 5).map((source, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-xs">
                            <FileText className="w-3 h-3 text-muted-foreground" />
                            <span className="text-foreground">[{source.fileName}]</span>
                            <span className="text-muted-foreground">Entry #{source.chunkIndex}</span>
                          </div>
                        ))}
                        {sources.length > 5 && (
                          <span className="text-xs text-muted-foreground">... and {sources.length - 5} more</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Closed Loop Confirmation */}
            {closedLoop && (
              <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-green-600">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-medium">
                  ✓ CLOSED LOOP: Response generated exclusively from clinic assets. No external AI or internet sources used.
                </span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
