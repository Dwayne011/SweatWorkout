/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, Trash2, Dumbbell, History, BookOpen, AlertCircle, Mic, MicOff, CheckCircle2 } from "lucide-react";
import { ChatMessage, AIResponse } from "../types";
import { robustFetch } from "../utils/network";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/Button";

interface AIAssistantProps {
  workoutState: any;
  initialPrompt?: string | null;
  evaluationOnly?: boolean;
}

const PRESET_CHIPS = [
  { label: "Log 3 sets of Squats at 120kg", prompt: "I just finished Squats. Log 3 sets of 120kg for 5 reps as a completed workout." },
  { label: "Plan a Push Day routine", prompt: "Create a workout template named 'Elite Chest & Shoulders' with Barbell Bench Press and Shoulder Press." },
  { label: "Start bicep workout right now", prompt: "Start an active bicep session with 3 sets of Dumbbell Bicep Curls." },
  { label: "How is my deadlift progress?", prompt: "Analyse my history and summarise my deadlift performance." }
];

export default function AIAssistant({ workoutState, initialPrompt, evaluationOnly = false }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  // Voice speech command states
  const [isListening, setIsListening] = useState(false);
  const [voiceHUDFeedback, setVoiceHUDFeedback] = useState<string | null>(null);
  const [lastExecutedVoiceCommand, setLastExecutedVoiceCommand] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const hasTriggeredInitialRef = useRef<string | null>(null);

  // Auto-scroll chat to latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-send initial prompt if provided and not yet processed
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && hasTriggeredInitialRef.current !== initialPrompt) {
      hasTriggeredInitialRef.current = initialPrompt;
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      if (evaluationOnly) {
        setMessages([
          {
            id: "welcome-evaluation",
            sender: "gemini",
            text: "Hello. I am compiling your custom **Gemini Athletic Evaluation**.\n\nPlease hold on whilst I parse your performance log records, analyze biomechanical markers, and generate progress overload indices.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      } else {
        setMessages([
          {
            id: "welcome",
            sender: "gemini",
            text: "Hey! I'm your **Gemini Workout Partner**.\n\nYou can chat with me about sports science or **tell me to change things in the app directly**! For example:\n\n* *'Start a leg session with 3 sets of Barbell Squats at 100kg'* \n* *'Log a bench press workout from yesterday for 4 sets of 80kg'* \n* *'Create a template named Push Day with 4x10 Shoulder Press'*",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }
    }
  }, [messages, evaluationOnly]);

  // Speech Recognition Controller Setup (Google expressive HUD)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setVoiceHUDFeedback("Listening... Say a workout command!");
      };

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");
        setInputValue(transcript);
        setVoiceHUDFeedback(`Heard: "${transcript}"`);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setVoiceHUDFeedback(null);
        if (event.error === "not-allowed") {
          alert("Microphone permission was denied. Please allow microphone access in your browser settings to log workouts by voice.");
        } else {
          alert(`Speech recognition issue: ${event.error}. You can also type commands like 'Log 3 sets of Bench Press' to try.`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        setVoiceHUDFeedback(null);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleVoiceListenToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert("Web Speech API is not supported in this browser frame. You can type manual commands in the input bar below instead.");
        return;
      }
      try {
        setInputValue("");
        recognitionRef.current.start();
      } catch (err) {
        console.error("Voice start trace failed:", err);
      }
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorText(null);
    const userMessage: ChatMessage = {
      id: "u-" + Math.random().toString(36).substring(7),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Snapshot current state to send to back-end
    const currentStateSnapshot = {
      activeWorkout: workoutState.activeWorkout,
      exercises: workoutState.exercises,
      templates: workoutState.templates,
      history: workoutState.history,
    };

    const requestHistory = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const response = await robustFetch("/api/ai/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          currentState: currentStateSnapshot,
          chatHistory: requestHistory,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to contact Gemini server.");
      }

      const data: AIResponse = await response.json();

      const aiMessage: ChatMessage = {
        id: "ai-" + Math.random().toString(36).substring(7),
        sender: "gemini",
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Apply structural state updates sequentially if provided!
      if (data.actions && data.actions.length > 0) {
        await workoutState.handleAIActions(data.actions);
        setLastExecutedVoiceCommand(`Command executed successfully: Gemini dispatched [${data.actions.map(a => a.type).join(", ")}] directly in-app!`);
        setTimeout(() => setLastExecutedVoiceCommand(null), 7500);
      }
    } catch (err: any) {
      console.error("Chat failure:", err);
      setErrorText(err.message || "An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage(inputValue);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-gray-900 dark:text-[#f1f1f5]">
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-lg break-words overflow-hidden ${
                  msg.sender === "user"
                    ? "bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white rounded-tr-none ring-1 ring-black/5 dark:ring-white/10"
                    : "bg-white dark:bg-black border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-100 rounded-tl-none whitespace-pre-line shadow-sm"
                }`}
              >
                {msg.sender === "gemini" && (
                  <div className="flex items-center space-x-1.5 mb-2 text-xs font-bold text-indigo-400">
                    <Bot className="w-3.5 h-3.5" />
                    <span className="tracking-wide">Gemini Brain</span>
                  </div>
                )}
                <div className="prose prose-sm dark:prose-invert">
                  {/* Basic parsing of bold markings for crisp visualization */}
                  {msg.text.split("\n").map((line, idx) => {
                    const lineWithBolds = line.split("**").map((text, subIdx) => {
                      if (subIdx % 2 === 1) {
                        return <strong key={subIdx} className="font-extrabold text-indigo-600 dark:text-indigo-300">{text}</strong>;
                      }
                      return text;
                    });
                    return <p key={idx} className="mb-1 text-gray-800 dark:text-slate-200">{lineWithBolds}</p>;
                  })}
                </div>
                <div
                  className={`text-[10px] mt-2 text-right ${
                    msg.sender === "user" ? "text-indigo-200 dark:text-indigo-200/80" : "text-gray-500"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 my-4 space-y-4 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-inner">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin" />
              <div className="absolute inset-1.5 rounded-full border-4 border-purple-500/10 border-b-purple-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1s" }} />
              <div className="absolute inset-3 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-gray-800 dark:text-slate-100 font-mono animate-pulse uppercase tracking-wider">Neural Coach Analysing Biometrics...</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">Comparing progressive overload stats & biomechanical stress thresholds</p>
            </div>
          </div>
        )}

        {errorText && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 rounded-xl p-3 flex space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-700 dark:text-rose-200">Gemini Error</p>
              <p className="mt-0.5 text-rose-600 dark:text-rose-300/90">{errorText}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Command Suggestions */}
      {!evaluationOnly && messages.length <= 1 && (
        <div className="px-3.5 py-2 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-black shrink-0">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            {PRESET_CHIPS.map((chip, i) => (
              <Button
                variant="none"
                key={i}
                onClick={() => handleSendMessage(chip.prompt)}
                className="whitespace-nowrap flex-none text-[10px] md:text-xs bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-white dark:bg-black text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 transition-all flex items-center space-x-1.5 hover:border-indigo-500/30 shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>{chip.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 4. REAL-TIME SPEECH TRANSCRIPTION OVERLAY & TOAST NOTIFICATIONS */}
      <AnimatePresence>
        {voiceHUDFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="px-4 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-between shadow-2xl border-t border-gray-200 dark:border-white/10"
          >
            <div className="flex items-center space-x-2.5 w-full text-xs font-semibold">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="font-mono truncate font-bold text-white tracking-wider">{voiceHUDFeedback}</span>
            </div>
          </motion.div>
        )}

        {lastExecutedVoiceCommand && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="p-3.5 mx-3 my-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-start space-x-2.5 shadow-2xl"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block text-emerald-700 dark:text-emerald-200 leading-none mb-1">Voice Command Registered</span>
              <p className="font-medium text-emerald-600 dark:text-emerald-300/90 leading-snug">{lastExecutedVoiceCommand}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input Controls */}
      {!evaluationOnly && (
        <div className="p-2.5 bg-white dark:bg-black border-t border-gray-200 dark:border-white/10 flex items-center space-x-2 shrink-0 shadow-2xl">
          {/* Compact Clean Inline Trash button to clear chat records */}
          {messages.length > 1 && (
            <Button
              variant="icon"
              onClick={clearChat}
              title="Clear Chat History"
              className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-rose-400 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-rose-500/10 rounded-full border border-gray-200 dark:border-white/5 transition-all shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          {/* Voice Trigger Clicker with Google design ripples */}
          <Button
            variant="icon"
            onClick={handleVoiceListenToggle}
            title={isListening ? "Stop listening" : "Say workout command"}
            className={`p-2.5 rounded-full transition-all shrink-0 ${
              isListening
                ? "bg-rose-500 shadow-lg shadow-rose-500/30 text-gray-900 dark:text-gray-100 animate-pulse"
                : "bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-white/10 text-indigo-400 border border-gray-200 dark:border-white/5"
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </Button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isListening ? "Listening... Speak training command!" : "Ask or command: 'Log 3 sets of Bench Press'..."}
            disabled={isLoading}
            className="flex-1 text-sm bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-full py-2.5 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-normal shadow-inner"
          />

          <Button
            variant="primary"
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full transition-all disabled:opacity-30 shrink-0 ring-1 ring-white/10 shadow-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
