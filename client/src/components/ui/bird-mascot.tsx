import { cn } from "@/lib/utils";

type BirdType = "blue" | "green";
type BirdSize = "sm" | "md" | "lg" | "xl";
type BirdPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

interface BirdMascotProps {
  type: BirdType;
  size?: BirdSize;
  position?: BirdPosition;
  flipped?: boolean;
  className?: string;
}

export function BirdMascot({
  type,
  size = "md",
  position = "center",
  flipped = false,
  className,
}: BirdMascotProps) {
  const birdColors = {
    blue: "text-blue-400",
    green: "text-green-400",
  };

  const birdSizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
    xl: "text-8xl",
  };

  const positionClasses = {
    "top-left": "top-10 left-10",
    "top-right": "top-10 right-10",
    "bottom-left": "bottom-10 left-10",
    "bottom-right": "bottom-10 right-10",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  return (
    <div
      className={cn(
        "absolute animate-[birdBounce_2s_ease-in-out_infinite]",
        birdColors[type],
        birdSizes[size],
        positionClasses[position],
        flipped && "scale-x-[-1]",
        className
      )}
    >
      <BirdSVG />
    </div>
  );
}

function BirdSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      className="w-full h-full"
    >
      <path d="M85.3,30.7c-2.3-8.5-7.9-16.1-15.4-21.2c-7.5-5.1-16.7-7.2-25.7-6.2c-9,1-17.4,4.9-24.1,11.2
        c-6.7,6.3-11.2,14.5-12.8,23.4c-1.6,8.9-0.2,18.3,4,26.2c4.2,7.9,11,14,19.3,17.2c8.3,3.2,17.7,3.2,26,0.1
        c8.3-3.1,15.2-9.1,19.5-16.9c2.2-3.9,3.6-8.1,4.2-12.6C81.8,42.8,87.6,39.3,85.3,30.7z M75.7,51.5c-3.4,2.8-6.3,6-8.7,9.6
        c-2.4,3.6-4.1,7.6-5.1,11.8c-0.5,2.1-0.8,4.2-0.8,6.3c-0.1,2.1,0,4.3,0.2,6.4c-12.6,5.9-28.1,3.3-37.9-6.5
        c-9.8-9.8-12.4-25.2-6.5-37.9c5.9-12.6,19.5-20.2,33.4-18.8c13.9,1.4,25.9,11.1,29.8,24.3C79.9,46.7,76,43.6,75.7,51.5z"/>
      <ellipse cx="36.7" cy="35.5" rx="6.5" ry="6.5"/>
      <path d="M65.1,38.5c-2.7,0-5.2-1.6-6.3-4c-0.6-1.2-0.5-2.7,0.2-3.8c0.7-1.1,1.9-1.9,3.2-2c2.7-0.3,5.3,1.7,5.9,4.4
        c0.2,0.9,0,1.8-0.4,2.6c-0.4,0.8-1.1,1.5-1.9,1.9C65.6,38.4,65.3,38.5,65.1,38.5z"/>
      <path d="M50.5,51.5c-0.5,0-1-0.1-1.5-0.4c-1.2-0.6-1.9-1.8-1.9-3.1c0-1.3,0.7-2.5,1.9-3.1c3-1.5,6.7-0.3,8.2,2.8
        c0.6,1.2,0.5,2.7-0.2,3.8c-0.7,1.1-1.9,1.9-3.2,2C52.6,51.4,51.5,51.5,50.5,51.5z"/>
    </svg>
  );
}
