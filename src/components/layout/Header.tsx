import { useState, useEffect } from "react";
import { Menu, X, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || !isHomePage
          ? "bg-background/95 backdrop-blur-md shadow-soft py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className={`p-2 rounded-full transition-all duration-300 flex-shrink-0 ${isScrolled || !isHomePage ? 'bg-jade/10' : 'bg-primary-foreground/10'}`}>
            <Leaf className={`w-6 h-6 transition-colors duration-300 ${isScrolled || !isHomePage ? 'text-jade' : 'text-primary-foreground'}`} />
          </div>
          <div className={`font-display tracking-wide transition-colors duration-300 ${isScrolled || !isHomePage ? 'text-foreground' : 'text-primary-foreground'} hidden sm:flex flex-col leading-tight`}>
            <span className="text-sm lg:text-base font-bold">Dr Roni Sapir</span>
            <span className="text-xs lg:text-sm font-semibold opacity-90">Complementary Medicine</span>
            <span className="text-[10px] lg:text-xs font-normal opacity-70 italic">Healing Through Balance with AI</span>
          </div>
        </Link>

        {/* Desktop Navigation - Only Therapist Login */}
        <nav className="hidden lg:flex items-center gap-6">
          {/* Language Switcher */}
          <LanguageSwitcher isScrolled={isScrolled || !isHomePage} />
          
          <Button asChild variant={isScrolled || !isHomePage ? "hero" : "heroOutline"} size="lg">
            <Link to="/gate">{t("therapistLogin")}</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher isScrolled={isScrolled || !isHomePage} />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 transition-colors ${isScrolled || !isHomePage ? 'text-foreground' : 'text-primary-foreground'}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-lg shadow-elevated transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
          <Button asChild variant="hero" size="lg" className="w-full">
            <Link to="/gate" onClick={() => setIsMobileMenuOpen(false)}>
              {t("therapistLogin")}
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
