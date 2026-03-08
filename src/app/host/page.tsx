"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { motion } from "framer-motion";

export default function HostPage() {
  const [creating, setCreating] = useState(false);
  const [controlCode, setControlCode] = useState("");
  const router = useRouter();

  const handleCreate = () => {
    setCreating(true);
    if (!socket.connected) socket.connect();

    socket.emit("host:create-game", (res: { gameId: string }) => {
      router.push(`/host/${res.gameId}`);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-display font-bold gold-text mb-2">
          CPT & ICD-10
        </h1>
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white">
          JEOPARDY!
        </h2>
        <p className="text-blue-200 mt-3 text-lg">
          Pain Management Edition — Host Setup
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-12 py-6 rounded-xl bg-jeopardy-gold text-jeopardy-navy font-bold text-2xl hover:bg-jeopardy-gold-light hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? "Creating Game..." : "CREATE NEW GAME"}
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-blue-200/70 text-sm max-w-md text-center"
      >
        Create a game, then share the code with players.
        Display this screen on a projector for the best experience.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 pt-6 border-t border-white/10"
      >
        <p className="text-blue-200/50 text-xs uppercase tracking-wider mb-2 text-center">
          Join existing game as co-host
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (controlCode.trim()) {
              window.open(`/host/${controlCode.trim()}/control`, "_blank");
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={controlCode}
            onChange={(e) => setControlCode(e.target.value.toUpperCase())}
            placeholder="Game code"
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm font-mono w-32 focus:outline-none focus:border-jeopardy-gold/50"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-blue-200 text-sm hover:bg-white/20 transition-colors"
          >
            Open Host Control
          </button>
        </form>
      </motion.div>
    </div>
  );
}
