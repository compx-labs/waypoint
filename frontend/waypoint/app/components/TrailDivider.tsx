interface TrailDividerProps {
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  opacity?: number;
}

export default function TrailDivider({ 
  className = "",
  width = 1200,
  height = 30,
  strokeWidth = 4.5,
  opacity = 1
}: TrailDividerProps) {
  return (
    <div className={`w-full  bg-transparent ${className}`}>
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width} ${height}`} 
        className={`opacity-${Math.round(opacity * 100)} w-full`}
      >
        <path 
          d={`M10 ${height/2} Q${width*0.15} ${height*0.25}, ${width*0.3} ${height/2} T${width*0.6} ${height/2} Q${width*0.75} ${height*0.75}, ${width*0.9} ${height/2} T${width-10} ${height/2}`}
          stroke="#035F5A" 
          strokeWidth={strokeWidth}
          fill="none" 
          strokeDasharray="8,4" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
