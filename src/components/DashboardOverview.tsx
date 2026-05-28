import React, { useState, useEffect } from "react";
import { Sparkles, Activity, Clock, Droplet, CheckSquare, DollarSign, ArrowRight, Lightbulb, Heart, BookOpen, Quote } from "lucide-react";

interface DashboardOverviewProps {
  onNavigate: (tab: "ai" | "health" | "budget" | "tasks" | "breath") => void;
}

const LIFE_TIPS = [
  { text: "Muvaffaqiyat - bu har kuni takrorlanadigan kichik g'alabalar yig'indisidir. Kichik qadamlar tashlashdan to'xtamang.", author: "Lao Szi", category: "Ruhlantirish" },
  { text: "Sog'liq - bu biz his qiladigan emas, balki qadrlashimiz kerak bo'lgan eng katta boylikdir. Kuniga yetarli suv ichishni unutmang.", author: "Sitseron", category: "Salomatlik" },
  { text: "O'z vaqtini to'g'ri boshqara olgan inson - butun hayotini to'g'ri tashkil qila oladi. Rejalaringizni doim yozib boring.", author: "Ibn Sino", category: "Samaradorlik" },
  { text: "Pul topish qobiliyat emas, balki uni to'g'ri taqsimlay olish haqiqiy mahoratdir. Har doim reja asosida sarf qiling.", author: "Uorren Baffet", category: "Moliya" }
];

export default function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [activeTipIdx, setActiveTipIdx] = useState(0);

  // States aggregated from localStorage
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2450);
  const [taskCount, setTaskCount] = useState({ completed: 0, total: 0 });
  const [netBudget, setNetBudget] = useState(0);

  useEffect(() => {
    // Current time ticking clock
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString("uz-UZ", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Load LocalStorage states
    const savedWater = localStorage.getItem("yordamchi_water");
    if (savedWater) {
      try {
        const parsed = JSON.parse(savedWater);
        const startOfToday = new Date().setHours(0,0,0,0);
        const filtered = parsed.filter((r: any) => r.timestamp >= startOfToday);
        const sum = filtered.reduce((acc: number, r: any) => acc + r.amount, 0);
        setWaterTotal(sum);
      } catch (e) {}
    }

    const savedWeight = localStorage.getItem("yordamchi_weight");
    if (savedWeight) {
      setWaterGoal(Number(savedWeight) * 35);
    }

    const savedTasks = localStorage.getItem("yordamchi_tasks");
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        const completed = parsed.filter((t: any) => t.completed).length;
        setTaskCount({ completed, total: parsed.length });
      } catch (e) {}
    }

    const savedBudget = localStorage.getItem("yordamchi_budget");
    if (savedBudget) {
      try {
        const parsed = JSON.parse(savedBudget);
        const total = parsed.reduce((sum: number, r: any) => sum + r.amount, 0);
        setNetBudget(total);
      } catch (e) {}
    }

    // Set a random tip of the day
    setActiveTipIdx(Math.floor(Math.random() * LIFE_TIPS.length));

    return () => clearInterval(interval);
  }, []);

  const waterPercent = waterGoal > 0 ? Math.min(100, Math.round((waterTotal / waterGoal) * 100)) : 0;
  const taskPercent = taskCount.total > 0 ? Math.round((taskCount.completed / taskCount.total) * 100) : 0;

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      
      {/* Dynamic Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-3xl p-6 md:p-8 border border-indigo-950/20 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-60 h-60 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <span className="text-xs bg-indigo-500/25 border border-indigo-400/25 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider text-indigo-200">
              Bugungi Kundalik Aloqa
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-3 leading-tight tracking-tight">
              Assalomu alaykum! Hayotiy Hamrohingizga xush kelibsiz.
            </h1>
            <p className="text-xs text-indigo-200 mt-2 max-w-xl leading-relaxed">
              Bugun o'zingizni ajoyib his qilishingiz, moliyaviy barqaror bo'lishingiz va rejalaringizni to'liq yakunlashingiz uchun barcha foydali vositalar tayyor.
            </p>
          </div>

          {/* Clock Widget */}
          <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 text-right shrink-0">
            <div className="flex items-center gap-1 text-xs text-indigo-200 font-semibold justify-end mb-1">
              <Clock className="w-4 h-4 text-indigo-300" />
              Toshkent vaqti
            </div>
            <p className="text-3xl font-black tracking-widest">{timeStr}</p>
            <p className="text-[10px] text-indigo-100 font-medium mt-1 uppercase">{dateStr}</p>
          </div>
        </div>
      </div>

      {/* Metrics of the day (Quick summaries) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Hydration */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bugungi gidratatsiya</span>
              <Droplet className="w-5 h-5 text-indigo-500 fill-indigo-50" />
            </div>
            <p className="text-2xl font-black text-gray-800 mt-4">
              {waterTotal} <span className="text-xs font-normal text-gray-500">ml</span>
            </p>
            <div className="relative pt-4">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${waterPercent}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-semibold">
                <span>Maqsad: {waterGoal}ml</span>
                <span>{waterPercent}%</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate("health")}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer pt-4 border-t border-gray-50 mt-4"
          >
            Suv hisoblagichni ko'rish
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 2: Goals & Focus */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kunlik vazifalar</span>
              <CheckSquare className="w-5 h-5 text-emerald-500 fill-emerald-50" />
            </div>
            <p className="text-2xl font-black text-gray-800 mt-4">
              {taskCount.completed} / {taskCount.total} <span className="text-xs font-normal text-gray-500">vazifa</span>
            </p>
            <div className="relative pt-4">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${taskPercent}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-semibold">
                <span>Bajarilganlik darajasi</span>
                <span>{taskPercent}%</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate("tasks")}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer pt-4 border-t border-gray-50 mt-4"
          >
            Rejalar ro'yxatiga o'tish
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 3: Financial budget */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sof hisob balansi</span>
              <DollarSign className="w-5 h-5 text-amber-500 fill-amber-50" />
            </div>
            <p className={`text-2xl font-black mt-4 ${netBudget >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {netBudget.toLocaleString()} <span className="text-xs font-normal text-gray-500">so'm</span>
            </p>
            <div className="relative pt-4">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[100%]" style={{ width: "100%" }}></div>
              </div>
              <div className="text-[10px] text-gray-400 mt-1.5 font-semibold">
                {netBudget >= 0 ? "Moliyaviy hisob barqaror holda" : "Xarajat daromaddan oshdi!"}
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate("budget")}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer pt-4 border-t border-gray-50 mt-4"
          >
            Moliya maslahatchisi o'tish
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Wisdom Quote Box */}
      <div className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 p-6 rounded-3xl border border-amber-100/40 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 shrink-0">
            <Quote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-amber-600 tracking-wider">Kun hikmati</span>
            <blockquote className="text-sm font-semibold text-gray-700 mt-1 leading-relaxed italic">
              "{LIFE_TIPS[activeTipIdx].text}"
            </blockquote>
            <cite className="text-xs text-gray-500 font-bold block mt-2">
              — {LIFE_TIPS[activeTipIdx].author}
            </cite>
          </div>
        </div>
      </div>

      {/* Quick shortcuts to Help Platform */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          Sizga qanday yordam bera olaman?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Dono Sun'iy Idrok", description: "Savollar, rejalashtirish yoki tarjima qilish.", action: "ai", icon: Sparkles, color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100/50" },
            { title: "Salomatlik markazi", description: "Kunlik suv balansi va vazn nazorati.", action: "health", icon: Heart, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100/50" },
            { title: "Moliyaviy oqim tahlili", description: "Xarajat turlari tahlilchisi maslahatlari.", action: "budget", icon: DollarSign, color: "text-amber-600 bg-amber-50 hover:bg-amber-100/50" },
            { title: "Nafas mashqlari", description: "Charchoq va stressdan xalos bo'lish seansi.", action: "breath", icon: Activity, color: "text-rose-600 bg-rose-50 hover:bg-rose-100/50" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onNavigate(item.action as any)}
                className={`p-4 rounded-2xl border border-gray-50 text-left transition-all cursor-pointer flex flex-col justify-between ${item.color}`}
              >
                <div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-white/80 shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
