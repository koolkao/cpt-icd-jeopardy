"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { motion } from "framer-motion";

function JoinForm() {
  const searchParams = useSearchParams();
  const [gameCode, setGameCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) setGameCode(code.toUpperCase());
  }, [searchParams]);

  const handleJoin = () => {
    if (!gameCode.trim() || !name.trim()) {
      setError("Please enter both a game code and your name.");
      return;
    }
    setError("");
    setJoining(true);

    if (!socket.connected) socket.connect();

    socket.emit(
      "player:join",
      { gameId: gameCode.toUpperCase().trim(), name: name.trim() },
      (res: { success: boolean; error?: string; playerId?: string }) => {
        if (res.success) {
          router.push(`/play/${gameCode.toUpperCase().trim()}?name=${encodeURIComponent(name.trim())}`);
        } else {
          setError(res.error || "Could not join game.");
          setJoining(false);
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold gold-text mb-2">
          CPT & ICD-10
        </h1>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-white">
          JEOPARDY!
        </h2>
        <p className="text-blue-200 mt-2 text-sm md:text-base">
          Pain Management Edition
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-sm bg-white/10 backdrop-blur rounded-xl p-6 shadow-2xl border border-white/20"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">
              Game Code
            </label>
            <input
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              maxLength={6}
              autoCapitalize="characters"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white text-center text-2xl font-mono tracking-widest placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-jeopardy-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white text-lg placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-jeopardy-gold"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-300 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-4 rounded-lg bg-jeopardy-gold text-jeopardy-navy font-bold text-xl hover:bg-jeopardy-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joining ? "Joining..." : "JOIN GAME"}
          </button>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-blue-300/60 text-xs"
      >
        Ask the host for the game code displayed on screen
      </motion.p>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}
