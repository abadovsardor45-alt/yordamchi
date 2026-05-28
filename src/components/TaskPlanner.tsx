import React, { useState, useEffect, useRef } from "react";
import { CheckSquare, Square, Trash2, Plus, Clock, Play, Pause, RotateCcw, AlertCircle, Sparkles, CheckCircle } from "lucide-react";
import { Task } from "../types";

export default function TaskPlanner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Task["category"]>("personal");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Pomodoro states
  const [pomodoroMinutes, setPomodoroMinutes] = useState<number>(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load state on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("yordamchi_tasks");
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error(e);
      }
    }
    const savedSessions = localStorage.getItem("yordamchi_pomodoro_session");
    if (savedSessions) {
      setSessionCount(Number(savedSessions));
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update tasks persistence
  useEffect(() => {
    localStorage.setItem("yordamchi_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      category,
      createdAt: Date.now()
    };

    setTasks(prev => [newTask, ...prev]);
    setTitle("");
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Sound play on complete
  const playCompletedBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error(e);
    }
  };

  // Pomodoro Tick Handler
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        if (pomodoroSeconds === 0) {
          if (pomodoroMinutes === 0) {
            // Timer Finished
            playCompletedBeep();
            if (!isBreak) {
              // Work Session finished, go to 5 min break
              setIsBreak(true);
              setPomodoroMinutes(5);
              setPomodoroSeconds(0);
              setSessionCount(prev => {
                const updated = prev + 1;
                localStorage.setItem("yordamchi_pomodoro_session", updated.toString());
                return updated;
              });
            } else {
              // Break finished, go to 25 min work
              setIsBreak(false);
              setPomodoroMinutes(25);
              setPomodoroSeconds(0);
            }
          } else {
            setPomodoroMinutes(prev => prev - 1);
            setPomodoroSeconds(59);
          }
        } else {
          setPomodoroSeconds(prev => prev - 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, pomodoroMinutes, pomodoroSeconds, isBreak]);

  const handleTimerToggle = () => {
    setTimerActive(!timerActive);
    // Initialize Web Audio
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const handleTimerReset = () => {
    setTimerActive(false);
    setIsBreak(false);
    setPomodoroMinutes(25);
    setPomodoroSeconds(0);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === "completed") return t.completed;
    if (filter === "active") return !t.completed;
    return true;
  });

  const categoryLabels = {
    personal: { label: "Shaxsiy", color: "bg-blue-50 text-blue-600 border-blue-100" },
    study: { label: "O'qish", color: "bg-purple-50 text-purple-600 border-purple-100" },
    health: { label: "Salomatlik", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    financial: { label: "Moliya", color: "bg-amber-50 text-amber-600 border-amber-100" },
    work: { label: "Ish", color: "bg-slate-100 text-slate-700 border-slate-200" }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 animate-fade-in">
      
      {/* SECTION 1: Task Planner To-Do */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
            <CheckSquare className="w-5 h-5 text-indigo-500" />
            Vazifalar & Kundalik Rejalar
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Rejalashtirilgan vazifalarni tizimli ravishda yakunlab, samaradorligingizni oshiring.
          </p>

          <form onSubmit={addTask} className="flex gap-2 mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Yangi muhim vazifa..."
              className="flex-1 bg-gray-50 text-gray-800 text-sm px-3.5 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:border-indigo-500"
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Task["category"])}
              className="bg-gray-50 text-gray-800 text-xs px-2 py-2 rounded-xl border border-gray-100 focus:outline-none"
            >
              <option value="personal">Shaxsiy</option>
              <option value="study">Ta'lim</option>
              <option value="health">Salomatlik</option>
              <option value="financial">Moliya</option>
              <option value="work">Ish</option>
            </select>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Qo'shish
            </button>
          </form>

          {/* Filter Bar */}
          <div className="flex gap-2 border-b border-gray-50 pb-3 mb-4 overflow-x-auto scrollbar-none">
            {[
              { id: "all", label: "Hammasi" },
              { id: "active", label: "Bajarilmoqda" },
              { id: "completed", label: "Bajarilgan" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === f.id ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle className="w-8 h-8 text-indigo-200 mx-auto mb-2" />
              <p className="text-xs">Ushbu kunda hech qanday vazifa topilmadi.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
              {filteredTasks.map(t => {
                const style = categoryLabels[t.category];
                return (
                  <div
                    key={t.id}
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 border border-gray-100/60 p-3 rounded-2xl transition-all"
                  >
                    <button
                      onClick={() => toggleTask(t.id)}
                      className="flex items-start gap-3 flex-1 text-left"
                    >
                      <span className="shrink-0 mt-0.5 text-indigo-500">
                        {t.completed ? (
                          <CheckSquare className="w-4.5 h-4.5" />
                        ) : (
                          <Square className="w-4.5 h-4.5" />
                        )}
                      </span>
                      <div>
                        <p className={`text-xs font-bold ${t.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                          {t.title}
                        </p>
                        <span className={`text-[9px] font-bold border rounded-md px-1.5 py-0.5 mt-1 inline-block ${style.color}`}>
                          {style.label}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => removeTask(t.id)}
                      className="text-gray-400 hover:text-rose-500 cursor-pointer ml-3 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic score */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">Bajarilganlik ko'rsatgichi:</span>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">
            {tasks.length > 0 ? `${Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%` : "0%"}
          </span>
        </div>
      </div>

      {/* SECTION 2: Pomodoro Focus Timer */}
      <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-3xl flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm tracking-wide text-gray-200 flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-indigo-400" />
              Fokus Pomodoro Taymeri
            </h3>
            {isBreak ? (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Tanaffus
              </span>
            ) : (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                Diqqat
              </span>
            )}
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
            Diqqatni bir maqsadga qaratish siri: 25 daqiqa tinimsiz mehnat va 5 daqiqa miya dam olishi.
          </p>

          <div className="flex flex-col items-center justify-center my-6">
            {/* Circle timer representation */}
            <div className="relative w-40 h-40 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold tracking-wider leading-none">
                {String(pomodoroMinutes).padStart(2, "0")}:{String(pomodoroSeconds).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-2">
                {isBreak ? "dam olish" : "diqqat vaqti"}
              </span>
            </div>
          </div>
        </div>

        <div>
          {/* Controls */}
          <div className="flex justify-center items-center gap-3 mb-6">
            <button
              onClick={handleTimerToggle}
              className={`px-6 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all shadow-xs ${
                timerActive 
                  ? "bg-amber-600 hover:bg-amber-700 text-white" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {timerActive ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              {timerActive ? "To'xtatish" : "Ishga tushirish"}
            </button>
            <button
              onClick={handleTimerReset}
              className="p-2 bg-slate-850 hover:bg-slate-800 active:scale-95 text-gray-300 rounded-xl border border-slate-800 cursor-pointer"
              title="Qayta boshlash"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Pomodoro Tip Information Box */}
          <div className="p-3 bg-slate-850 border border-slate-800 rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[10px] leading-relaxed text-slate-300">
              <strong>BU BUGUNGI REJANGIZ KUCHI:</strong> Bugun jami <strong>{sessionCount} marta</strong> Pomodoro yukini bajardingiz! Mutaxassislar kuniga 4-5 seansni yakunlashni tavsiya qilishadi.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
