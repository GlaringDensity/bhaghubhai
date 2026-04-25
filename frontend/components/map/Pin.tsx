"use client";
import React from 'react';
import { motion } from 'framer-motion';

const categoryFlags: Record<string, string> = {
  Infrastructure: "/yellowflag.png",
  Sanitation: "/greenflag.png",
  Safety: "/redflag.png",
  Greenery: "/greenflag.png",
};

interface PinProps {
  x: number;
  y: number;
  category: string;
  status: string;
  title: string;
  onClick?: () => void;
}

const Pin: React.FC<PinProps> = ({ x, y, category, status, title, onClick }) => {
  const flagUrl = categoryFlags[category] || "/redflag.png";

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.2 }}
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent placing a new pin when clicking an existing one
        onClick?.();
      }}
    >
      {/* Visual Shadow */}
      <ellipse cx={x} cy={y + 16} rx={10} ry={4} fill="black" fillOpacity={0.15} />
      
      {/* Flag Image */}
      <image
        href={flagUrl}
        x={x - 16}
        y={y - 32} // Offset to center base at x,y
        width="32"
        height="42"
        className="drop-shadow-xl"
      />
      
      {/* Tooltip */}
      <title>{title} | {category} | {status}</title>
    </motion.g>
  );
};

export default Pin;
