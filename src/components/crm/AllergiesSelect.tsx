import { useState, useMemo, memo } from 'react';
import { Check, ChevronDown, Search, X, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { allergiesData, getAllergenDetails, getSeverityColor } from '@/data/allergies-data';

interface AllergiesSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export const AllergiesSelect = memo(function AllergiesSelect({
  value = [],
  onChange,
  className,
}: AllergiesSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return allergiesData;
    
    const q = searchQuery.toLowerCase();
    return allergiesData
      .map(cat => ({
        ...cat,
        allergens: cat.allergens.filter(a =>
          a.name.toLowerCase().includes(q) ||
          a.symptoms.toLowerCase().includes(q) ||
          a.tcmPerspective.toLowerCase().includes(q)
        )
      }))
      .filter(cat => cat.allergens.length > 0);
  }, [searchQuery]);

  const toggleOption = (option: string) => {
    const currentValue = value || [];
    onChange(
      currentValue.includes(option)
        ? currentValue.filter((v) => v !== option)
        : [...currentValue, option],
    );
  };

  const removeOption = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal min-h-[40px]"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {value.length === 0
                ? 'Select known allergies...'
                : `${value.length} allerg${value.length > 1 ? 'ies' : 'y'} selected`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 z-50 bg-popover" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search allergies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <ScrollArea className="h-[300px]">
            <Accordion type="multiple" defaultValue={filteredData.map(c => c.category)} className="w-full">
              {filteredData.map((category) => (
                <AccordionItem key={category.category} value={category.category} className="border-b-0">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-accent/50 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{category.category}</span>
                      <Badge variant="secondary" className="text-xs ml-2">
                        {category.allergens.length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="space-y-0.5 px-1">
                      {category.allergens.map((allergen) => {
                        const isSelected = value.includes(allergen.name);
                        const isLifeThreatening = allergen.severity.toLowerCase().includes('life-threatening');
                        
                        return (
                          <button
                            key={allergen.name}
                            type="button"
                            onClick={() => toggleOption(allergen.name)}
                            className={cn(
                              "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors text-sm",
                              "hover:bg-accent hover:text-accent-foreground",
                              isSelected && "bg-primary/10 border border-primary/30"
                            )}
                            title={`Western: ${allergen.westernView}\nTCM: ${allergen.tcmPerspective}\nSymptoms: ${allergen.symptoms}\nSeverity: ${allergen.severity}`}
                          >
                            <div className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                            )}>
                              {isSelected && <Check className="h-2.5 w-2.5" />}
                            </div>
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <span className="font-medium">{allergen.name}</span>
                              {isLifeThreatening && (
                                <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                              )}
                            </div>
                            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredData.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No allergies found matching "{searchQuery}"
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected items display */}
      {value.length > 0 && (
        <div className="border rounded-lg p-3 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              Selected Allergies ({value.length})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {value.map((item) => {
              const details = getAllergenDetails(item);
              const severityColor = details ? getSeverityColor(details.severity) : 'secondary';
              const isLifeThreatening = details?.severity.toLowerCase().includes('life-threatening');

              return (
                <Badge
                  key={item}
                  variant={severityColor as any}
                  className="text-xs pr-1 gap-1"
                  title={details ? `Symptoms: ${details.symptoms}\nTCM: ${details.tcmPerspective}\nSeverity: ${details.severity}` : undefined}
                >
                  {isLifeThreatening && (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {item.length > 25 ? item.substring(0, 25) + '...' : item}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(item);
                    }}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                    aria-label={`Remove allergy ${item}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
