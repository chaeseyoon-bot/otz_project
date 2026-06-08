interface ScrollGaugeProps {
  progress: number
  thumbRatio?: number
  className?: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function ScrollGauge({ progress, thumbRatio = 0.2, className = '' }: ScrollGaugeProps) {
  const safeProgress = clamp(progress, 0, 1)
  const safeThumbRatio = clamp(thumbRatio, 0.08, 1)
  const maxTravelPercent = (1 - safeThumbRatio) * 100
  const leftPercent = safeProgress * maxTravelPercent

  return (
    <div className={`pointer-events-none h-[2px] w-full bg-[rgba(0,0,0,0.12)] ${className}`} aria-hidden>
      <div
        className="h-full bg-[rgba(0,0,0,0.65)] transition-[transform] duration-100 ease-out"
        style={{
          width: `${safeThumbRatio * 100}%`,
          transform: `translateX(${leftPercent}%)`,
        }}
      />
    </div>
  )
}
