"use client";

import { motion } from "framer-motion";

interface BuzzButtonProps {
  onBuzz: () => void;
}

export default function BuzzButton({ onBuzz }: BuzzButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onBuzz}
      className="relative w-44 h-44 md:w-52 md:h-52 rounded-full bg-buzz-red text-white font-bold text-3xl md:text-4xl buzz-glow active:shadow-none select-none touch-manipulation"
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-buzz-red"
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            "0 0 20px rgba(255,0,0,0.3)",
            "0 0 50px rgba(255,0,0,0.6)",
            "0 0 20px rgba(255,0,0,0.3)",
          ],
        }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
      <span className="relative z-10 drop-shadow-lg">BUZZ!</span>
    </motion.button>
  );
}
