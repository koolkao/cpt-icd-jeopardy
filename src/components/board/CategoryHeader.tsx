"use client";

import { motion } from "framer-motion";

interface CategoryHeaderProps {
  name: string;
  index: number;
}

export default function CategoryHeader({ name, index }: CategoryHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="category-header min-h-[60px] md:min-h-[80px] text-xs md:text-sm lg:text-base"
    >
      {name}
    </motion.div>
  );
}
