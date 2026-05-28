import React, { useState, useEffect, useRef } from "react";
import { Wind, Play, Square, Volume2, VolumeX, Sparkles, Smile } from "lucide-react";

type BreathPhase = "idle" | "inhale" | "holdIn" | "exhale" | "holdOut";

const PHASE_CONFIG = {
  inhale: { text: "Nafas oling", color: "text-indigo-600 bg-indigo-50 border-indigo-200", size: "scale-140 bg-indigo-500/20" },
  holdIn: { text: "Nafasni ushlab turing", color: "text-amber-600 bg-amber-50 border-amber-200", size: "scale-140 bg-amber-500/20" },
  exhale: { text: "Nafas chiqaring", color: "text-emerald-600 bg-emerald-50 border-emerald-200", size: "scale-100 bg-emerald-500/20" },
  holdOut: { text: "Nafasni ushlab turing", color: "text-rose-600 bg-rose-50 border-rose-200", size: "scale-100 bg-rose-500/20" }
};

export default function BreathCompanion() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [timer, setTimer] = useState<number>(4);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [duration, setDuration] = useState<number>(4); // default 4s for box breathing
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("yordamchi_breath_count");
    if (saved) {
      setTotalSessions(Number(saved));
    }
    return () => {
      stopSession();
    };
  }, []);

  const playBreathSound = (type: "inhale" | "hold" | "exhale" | "stop") => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === "inhale") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 3.8);
        gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3.8);
      } else if (type === "exhale") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 3.8);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.8);
      } else if (type === "hold") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4 note
        gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.8);
      }

      osc.start();
      osc.stop(ctx.currentTime + 3.8);
    } catch (e) {
      console.error("Audio Context failed to start:", e);
    }
  };

  const startSession = () => {
    setIsActive(true);
    setPhase("inhale");
    setTimer(duration);
    playBreathSound("inhale");
  };

  const stopSession = () => {
    setIsActive(false);
    setPhase("idle");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Transition to next breathing stage
          let nextPhase: BreathPhase = "idle";
          if (phase === "inhale") {
            nextPhase = "holdIn";
            playBreathSound("hold");
          } else if (phase === "holdIn") {
            nextPhase = "exhale";
            playBreathSound("exhale");
          } else if (phase === "exhale") {
            nextPhase = "holdOut";
            playBreathSound("hold");
          } else if (phase === "holdOut") {
            nextPhase = "inhale";
            playBreathSound("inhale");
            // Increment total counts
            setTotalSessions((c) => {
              const res = c + 1;
              localStorage.setItem("yordamchi_breath_count", res.toString());
              return res;
            });
          }
          setPhase(nextPhase);
          return duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, phase, duration]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs max-w-2xl mx-auto flex flex-col items-center">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Wind className="w-5 h-5 text-indigo-500 animate-pulse" />
          Kvadrat Nafas Mashqi (Stressni Yo'qotish)
        </h2>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          Ushbu ilmiy tasdiqlangan uslub miyani tezda tinchlantirish, yuqori yurak urishini tushirish va fikrni jamlashga yordam beradi.
        </p>
      </div>

      {/* Circle Animation Container */}
      <div className="my-8 md:my-12 relative flex items-center justify-center w-64 h-64">
        {/* Pulsing ring outline */}
        <div className="absolute inset-0 rounded-full border border-gray-100 scale-100 pointer-events-none"></div>
        <div className="absolute inset-4 rounded-full border border-gray-100 pointer-events-none"></div>
        <div className="absolute inset-10 rounded-full border-2 border-indigo-50 pointer-events-none"></div>

        {/* Dynamic Breathing Circle */}
        <div
          className={`absolute rounded-full transition-all duration-[3900ms] ease-in-out flex items-center justify-center shrink-0 ${
            phase !== "idle" ? PHASE_CONFIG[phase].size : "w-28 h-28 bg-indigo-50 text-indigo-500 scale-100"
          } w-32 h-32 text-center`}
        >
          {isActive ? (
            <div className="flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-indigo-900 leading-none">{timer}</span>
              <span className="text-[10px] uppercase font-bold text-indigo-500 mt-2 tracking-wider">soniya</span>
            </div>
          ) : (
            <Wind className="w-10 h-10 text-indigo-400 animate-bounce duration-3000" />
          )}
        </div>
      </div>

      {/* Guide message */}
      <div className="w-full max-w-sm mb-6 text-center">
        {isActive && phase !== "idle" ? (
          <div className={`p-3 rounded-2xl border text-sm font-semibold transition-all duration-300 ${PHASE_CONFIG[phase].color}`}>
            {PHASE_CONFIG[phase].text}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 border border-gray-100 text-gray-600 rounded-2xl text-xs font-semibold">
            Boshlash uchun pastdagi start tugmasini bosing
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-center items-center gap-4 w-full">
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
            soundEnabled 
              ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" 
              : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
          }`}
          title={soundEnabled ? "Tovush yoqilgan" : "Tovush o'chirilgan"}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Start/Stop Button */}
        {isActive ? (
          <button
            onClick={stopSession}
            className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl transition-all cursor-pointer shadow-md shadow-rose-100"
          >
            <Square className="w-4 h-4 fill-white" />
            Mashqni yakunlash
          </button>
        ) : (
          <button
            onClick={startSession}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all cursor-pointer shadow-md shadow-indigo-200"
          >
            <Play className="w-4 h-4 fill-white" />
            Mashqni boshlash
          </button>
        )}
      </div>

      {/* Stats and instructions */}
      <div className="mt-8 pt-6 border-t border-gray-100 w-full grid grid-cols-2 gap-4 text-center">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Bugungi tsikl</span>
          <p className="text-xl font-black text-gray-800 mt-1 flex items-center justify-center gap-1.5">
            <Smile className="w-5 h-5 text-indigo-500" />
            {totalSessions} marta
          </p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Mashq turi</span>
          <p className="text-sm font-bold text-gray-700 mt-1 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Box Breathing 4s
          </p>
        </div>
      </div>
    </div>
  );
}
