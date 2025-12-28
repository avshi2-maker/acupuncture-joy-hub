import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "he", label: "עברית", flag: "🇮🇱" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

interface LanguageSwitcherProps {
  variant?: "default" | "ghost" | "outline";
  isScrolled?: boolean;
}

export function LanguageSwitcher({ variant = "ghost", isScrolled = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  
  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size="sm" 
          className={`gap-2 ${!isScrolled ? 'text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10' : 'text-foreground hover:bg-muted'}`}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang?.flag}</span>
          <span className="hidden md:inline text-xs">{currentLang?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-card border-border z-[100] min-w-[140px]"
        sideOffset={8}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code);
              console.log('Language changed to:', lang.code);
            }}
            className={`cursor-pointer gap-2 ${language === lang.code ? 'bg-jade/10 text-jade font-medium' : 'hover:bg-muted'}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {language === lang.code && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
