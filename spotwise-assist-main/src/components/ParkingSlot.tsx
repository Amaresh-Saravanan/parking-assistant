import { cn } from "@/lib/utils";

interface ParkingSlotProps {
  slotNumber: string;
  status: "vacant" | "occupied";
  x: number;
  y: number;
  width: number;
  height: number;
  onClick?: () => void;
}

const ParkingSlot = ({ slotNumber, status, x, y, width, height, onClick }: ParkingSlotProps) => {
  const isVacant = status === "vacant";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("ParkingSlot component clicked:", slotNumber, status);
    if (onClick) {
      onClick();
    }
  };

  return (
    <g
      className={cn(
        "cursor-pointer transition-all duration-300",
        isVacant && "hover:opacity-80"
      )}
      onClick={handleClick}
      style={{ pointerEvents: 'all' }}
    >
      {/* Larger clickable area */}
      <rect
        x={x - 5}
        y={y - 5}
        width={width + 10}
        height={height + 10}
        className="fill-transparent stroke-transparent"
        style={{ pointerEvents: 'all' }}
      />
      
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        className={cn(
          "transition-all duration-300",
          isVacant
            ? "fill-accent/20 stroke-accent stroke-2 hover:fill-accent/30"
            : "fill-destructive/20 stroke-destructive stroke-2"
        )}
        rx="4"
        style={{ pointerEvents: 'all' }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className={cn(
          "text-sm font-bold pointer-events-none select-none",
          isVacant ? "fill-accent" : "fill-destructive"
        )}
      >
        {slotNumber}
      </text>
      {isVacant && (
        <>
          <circle
            cx={x + width - 10}
            cy={y + 10}
            r="4"
            className="fill-accent animate-pulse-glow"
          />
          {/* Click indicator */}
          <text
            x={x + width / 2}
            y={y + height + 15}
            textAnchor="middle"
            className="text-xs fill-accent/70 pointer-events-none select-none"
          >
            Click for directions
          </text>
        </>
      )}
    </g>
  );
};

export default ParkingSlot;
