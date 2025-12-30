import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SimpleSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * A simple select component using Popover pattern instead of Radix Select.
 * This avoids the "Maximum update depth exceeded" crash that can occur
 * with Radix Select when value switches between undefined and a string.
 */
export function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  className,
  disabled = false,
}: SimpleSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selectedOption && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-1 z-50 bg-popover" align="start">
        <div className="space-y-0.5">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-left text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                value === option.value && "bg-accent"
              )}
            >
              <div className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                value === option.value 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : "border-transparent"
              )}>
                {value === option.value && <Check className="h-3 w-3" />}
              </div>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
