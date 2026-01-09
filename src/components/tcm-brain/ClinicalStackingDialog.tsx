import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PROMPT_MAPPINGS, getMappingsByRole, PromptMapping } from '@/data/tcm-prompt-mapping';
import { ClinicalStackBar } from './ClinicalStackBar';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClinicalStackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stackedQueries: PromptMapping[];
  onAddToStack: (mapping: PromptMapping) => void;
  onRemoveFromStack: (id: string) => void;
  onClearStack: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  isInStack: (id: string) => boolean;
}

export const ClinicalStackingDialog: React.FC<ClinicalStackingDialogProps> = ({
  open,
  onOpenChange,
  stackedQueries,
  onAddToStack,
  onRemoveFromStack,
  onClearStack,
  onAnalyze,
  isAnalyzing,
  isInStack
}) => {
  const mappingsByRole = getMappingsByRole();
  const roles = Object.keys(mappingsByRole);

  const handleAnalyze = () => {
    onAnalyze();
    onOpenChange(false);
  };

  const renderMappingCard = (mapping: PromptMapping) => {
    const isSelected = isInStack(mapping.id);
    
    return (
      <button
        key={mapping.id}
        onClick={() => isSelected ? onRemoveFromStack(mapping.id) : onAddToStack(mapping)}
        className={cn(
          "w-full text-right p-3 rounded-lg border transition-all duration-200",
          "hover:scale-[1.02] active:scale-[0.98]",
          isSelected
            ? "bg-violet-500/30 border-violet-400 ring-2 ring-violet-400/50"
            : "bg-card/50 border-border/50 hover:bg-card hover:border-violet-400/50"
        )}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{mapping.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm truncate">
                {mapping.hebrewLabel}
              </span>
              {isSelected ? (
                <Check className="h-4 w-4 text-violet-400 shrink-0" />
              ) : (
                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 text-left">
              {mapping.ragPriorityContext.replace('RAG PRIORITY: ', '')}
            </p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            🧠 בניית שאילתה קלינית מורכבת
            {stackedQueries.length > 0 && (
              <Badge className="bg-violet-500 text-white">
                {stackedQueries.length} נבחרו
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ClinicalStackBar
          stackedQueries={stackedQueries}
          onRemove={onRemoveFromStack}
          onClear={onClearStack}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />

        <Tabs defaultValue={roles[0]} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start overflow-x-auto flex-shrink-0">
            {roles.map(role => (
              <TabsTrigger key={role} value={role} className="text-xs">
                {role}
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {mappingsByRole[role].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {roles.map(role => (
            <TabsContent key={role} value={role} className="flex-1 mt-3">
              <ScrollArea className="h-[350px] pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {mappingsByRole[role].map(renderMappingCard)}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          💡 בחר מספר נושאים ולחץ "Analyze Full Case" לקבלת תשובה משולבת בקריאת API אחת
        </div>
      </DialogContent>
    </Dialog>
  );
};
