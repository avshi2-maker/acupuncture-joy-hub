import micAnimated from "@/assets/mic-animated.gif";

interface AnimatedMicProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function AnimatedMic({ className = "", size = "md" }: AnimatedMicProps) {
  return (
    <img 
      src={micAnimated} 
      alt="Microphone" 
      className={`${sizeMap[size]} object-contain ${className}`}
    />
  );
}
