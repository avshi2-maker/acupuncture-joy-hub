import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedBackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'floating';
}

export function AnimatedBackButton({ 
  to = '/dashboard', 
  label = 'Dashboard',
  className,
  variant = 'default'
}: AnimatedBackButtonProps) {
  if (variant === 'floating') {
    return (
      <Link
        to={to}
        className={cn(
          "fixed top-4 left-4 z-50 group",
          "flex items-center gap-2 px-3 py-2 rounded-full",
          "bg-gradient-to-r from-jade-600 to-jade-500",
          "text-white font-medium text-sm",
          "shadow-lg shadow-jade-500/30",
          "hover:shadow-xl hover:shadow-jade-500/40",
          "transition-all duration-300 ease-out",
          "hover:scale-105 hover:-translate-x-1",
          "animate-pulse-subtle",
          className
        )}
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <Home className="h-4 w-4 animate-bounce-subtle" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={to}
        className={cn(
          "group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg",
          "bg-jade-100 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300",
          "hover:bg-jade-200 dark:hover:bg-jade-800/50",
          "transition-all duration-300",
          "hover:-translate-x-1",
          className
        )}
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 animate-pulse-arrow" />
        <span className="text-sm font-medium">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        "group inline-flex items-center gap-3 px-4 py-2 rounded-xl",
        "bg-gradient-to-r from-jade-600 to-jade-500",
        "text-white font-medium",
        "shadow-md shadow-jade-500/20",
        "hover:shadow-lg hover:shadow-jade-500/30",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:-translate-x-2",
        className
      )}
    >
      <div className="relative">
        <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
        <div className="absolute inset-0 animate-ping-slow opacity-50">
          <ArrowLeft className="h-5 w-5" />
        </div>
      </div>
      <Home className="h-4 w-4 animate-bounce-subtle" />
      <span>{label}</span>
    </Link>
  );
}
