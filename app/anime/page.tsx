"use client";

import { useState } from "react";
import Lottie from "lottie-react";
import { motion } from "framer-motion";

// Emoji data with animation URLs
const emojis = [
  {
    id: 1,
    static: "😊",
    animation: "https://assets5.lottiefiles.com/packages/lf20_Xy2wRL.json",
  },
  {
    id: 2,
    static: "❤️",
    animation: "https://assets5.lottiefiles.com/packages/lf20_NGHGeR.json",
  },
  {
    id: 3,
    static: "🎉",
    animation: "https://assets5.lottiefiles.com/packages/lf20_u4jjb9bd.json",
  },
];

export default function EmojiHover() {
  const [hoveredEmoji, setHoveredEmoji] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="grid grid-cols-3 gap-8">
        {/* Lottie Animations */}
        <div className="space-y-8">
          <h3 className="text-white text-center mb-4">Lottie Animations</h3>
          {emojis.map((emoji) => (
            <div
              key={emoji.id}
              className="w-16 h-16 relative cursor-pointer"
              onMouseEnter={() => setHoveredEmoji(emoji.id)}
              onMouseLeave={() => setHoveredEmoji(null)}
            >
              {hoveredEmoji === emoji.id ? (
                <Lottie
                  animationData={emoji.animation}
                  loop={true}
                  className="absolute inset-0"
                />
              ) : (
                <div className="text-4xl flex items-center justify-center h-full">
                  {emoji.static}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CSS Animations */}
        <div className="space-y-8">
          <h3 className="text-white text-center mb-4">CSS Animations</h3>
          <motion.div
            className="w-16 h-16 bg-yellow-400 rounded-full cursor-pointer"
            whileHover={{
              scale: 1.2,
              rotate: 360,
              transition: { duration: 0.3 },
            }}
          />
          <motion.div
            className="w-16 h-16 bg-red-500 rounded-full cursor-pointer"
            whileHover={{
              scale: [1, 1.4, 1.2],
              transition: { duration: 0.3 },
            }}
          />
          <motion.div
            className="w-16 h-16 bg-blue-500 rounded-full cursor-pointer"
            whileHover={{
              y: [0, -8, 0],
              transition: {
                duration: 0.5,
                repeat: Infinity,
              },
            }}
          />
        </div>

        {/* SVG Animations */}
        <div className="space-y-8">
          <h3 className="text-white text-center mb-4">SVG Animations</h3>
          <svg viewBox="0 0 100 100" className="w-16 h-16 cursor-pointer group">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="fill-yellow-400 group-hover:animate-ping"
            />
            <path
              d="M30 40 Q50 60 70 40"
              className="stroke-black stroke-2 fill-none group-hover:animate-bounce"
            />
          </svg>

          <svg viewBox="0 0 100 100" className="w-16 h-16 cursor-pointer group">
            <path
              d="M50 20 L20 80 L80 80 Z"
              className="fill-green-500 group-hover:animate-spin origin-center"
            />
          </svg>

          <svg viewBox="0 0 100 100" className="w-16 h-16 cursor-pointer group">
            <rect
              x="25"
              y="25"
              width="50"
              height="50"
              className="fill-purple-500 group-hover:animate-pulse"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
