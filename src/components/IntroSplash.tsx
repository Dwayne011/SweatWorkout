/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dumbbell, Sparkles } from "lucide-react";
import FlexingArm from "./FlexingArm";

interface IntroSplashProps {
  onComplete: () => void;
}

export default function IntroSplash({ onComplete }: IntroSplashProps) {
  const [startFadeOut, setStartFadeOut] = useState(false);

  useEffect(() => {
    // Show splash for 2.3 seconds, then start fading out. Call onComplete shortly after.
    const delayTimer = setTimeout(() => {
      setStartFadeOut(true);
    }, 2100);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2600);

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Letters of "SW3AT" for letter stagger animation
  const word1 = ["S", "W", "3", "A", "T"];
  const word2 = ["W", "O", "R", "K", "O", "U", "T", "S"];

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const letterVariants = {
    initial: { y: 25, opacity: 0, scale: 0.8 },
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 12,
      },
    },
  };

  return (
    <AnimatePresence>
      {!startFadeOut && (
        <motion.div
          id="intro-splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100000] bg-white dark:bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Glowing ambient elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 0.9, 1.1, 1],
              opacity: [0.3, 0.5, 0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1.1, 0.9, 1.2, 1, 1.1],
              opacity: [0.2, 0.4, 0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute w-[250px] h-[250px] rounded-full bg-purple-500/10 blur-[90px] pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center space-y-6 text-center max-w-lg px-4">
            {/* Animated Logo Shield */}
            <motion.div
              initial={{ scale: 0.2, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 15,
                delay: 0.1,
              }}
              className="relative p-5 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white rounded-3xl shadow-[0_0_35px_rgba(99,102,241,0.4)] border border-gray-200 dark:border-white/10 flex items-center justify-center mb-2"
            >
              <FlexingArm className="w-10 h-10 text-gray-900 dark:text-gray-100 animate-pulse" />
              {/* Decorative extra spark */}
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-bounce" />
            </motion.div>

            {/* Staggered text assembly */}
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="flex flex-col items-center space-y-2"
            >
              {/* SW3AT */}
              <div className="flex items-center space-x-1">
                {word1.map((letter, i) => (
                  <motion.span
                    key={`w1-${i}`}
                    variants={letterVariants}
                    className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-widest font-sans selection:bg-indigo-500"
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              {/* WORKOUTS with Sparkle Accent */}
              <div className="flex items-center space-x-1 pl-1">
                {word2.map((letter, i) => (
                  <motion.span
                    key={`w2-${i}`}
                    variants={letterVariants}
                    className="text-2xl md:text-3xl font-extrabold text-[#818cf8] tracking-widest uppercase font-mono brightness-110"
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Neural Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="text-[10px] md:text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-[0.25em] leading-none"
            >
              Neural Hypertrophy Engine
            </motion.p>

            {/* Loading Indicator */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "120px", opacity: 0.8 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="h-0.5 bg-gradient-to-r from-indigo-500 via-[#818cf8] to-purple-500 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.7)] mt-4"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
