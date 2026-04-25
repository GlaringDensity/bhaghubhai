"use client";
import React from 'react';
import { motion } from 'framer-motion';

const categoryColors: Record<string, string> = {
  Infrastructure: "#3B82F6",
  Sanitation: "#10B981",
  Safety: "#F43F5E",
  Greenery: "#22C55E",
};

interface PinProps {
  x: number;
  y: number;
  category: string;
  title: string;
  onClick?: () => void;
}

const Pin: React.FC<PinProps> = ({ x, y, category, title, onClick }) => {
  const color = categoryColors[category] || "#3B82F6";

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.3 }}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      {/* Pulse ring */}
      <circle cx={x} cy={y} r={14} fill={color} fillOpacity={0.15} className="animate-ping" />
      {/* Shadow */}
      <ellipse cx={x} cy={y + 20} rx={6} ry={3} fill="black" fillOpacity={0.15} />
      {/* Pin body (teardrop shape) */}
      <path
        d={`M ${x} ${y - 18} 
            C ${x - 10} ${y - 18} ${x - 10} ${y - 5} ${x} ${y + 10} 
            C ${x + 10} ${y - 5} ${x + 10} ${y - 18} ${x} ${y - 18} Z`}
        fill={color}
        stroke="white"
        strokeWidth={1.5}
      />
      {/* Inner dot */}
      <circle cx={x} cy={y - 10} r={4} fill="white" fillOpacity={0.9} />
      <title>{title}</title>
    </motion.g>
  );
};

export default Pin;
