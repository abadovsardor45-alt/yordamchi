import React, { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, AlertCircle, Bot } from "lucide-react";
import { BudgetRecord } from "../types";
import ReactMarkdown from "react-markdown";

export default function FinancialAdvisor() {
  const [records, setRecords] = useState<BudgetRecord[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Oziq-ovqat");

  // AI Response states
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("yordamchi_budget");
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("yordamchi_budget", JSON.stringify(records));
  }, [records]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || !parsedAmount || parsedAmount <= 0) return;

    const newRecord: BudgetRecord = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: type === "income" ? parsedAmount : -parsedAmount,
      category,
      timestamp: Date.now()
    };

    setRecords(prev => [newRecord, ...prev]);
    setTitle("");
    setAmount("");
  };

  const removeRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  // Calculations
  const incomeTotal = records.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0);
  const expenseTotal = Math.abs(records.filter(r => r.amount < 0).reduce((sum, r) => sum + r.amount, 0));
  const netBalance = incomeTotal - expenseTotal;

  // AI custom analysis based on current transactions
  const analyzeWithAI = async () => {
    if (records.length === 0) {
      setAiAnalysis("Iltimos, avvalo moliyaviy holatni baholash uchun bir necha daromad va xarajatlarni yozib chiqing (masalan: Oylik maosh, Oziq-ovqat parxez, Transport xarajatlari).");
      return;
    }

    setLoadingAi(true);
    setAiAnalysis("");

    try {
      const transactionSummary = records.map(r => 
        `- ${r.title} (${r.category}): ${r.amount > 0 ? '+' : ''}${r.amount} so'm`
      ).join("\n");

      const promptMsg = `Ushbu mening bugungi moliyaviy yozuvlarim ro'yxati:\n${transactionSummary}\n\nJami daromadim: ${incomeTotal} so'm\nJami xarajatim: ${expenseTotal} so'm\nSof balansim: ${netBalance} so'm.\n\nIltimos, ushbu xarajat va daromadlarimni aniq tahlil qilib bering va pullarni to'g'ri tejash, ko'proq foyda ko'rish hamda moliya sarfini kamaytirish bo'yicha amaliy maslahatlar bering. Maslahatlaringiz to'liq o'zbek tilida bo'lsin.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptMsg,
          category: "financial"
        })
      });

      if (!res.ok) throw new Error("Serverda xatolik yuz berdi");
      const data = await res.json();
      setAiAnalysis(data.reply);
    } catch (e: any) {
      setAiAnalysis(`Kechirasiz, sun'iy idrok tahlilini amalga oshirib bo'lmadi: ${e.message || "Ulanish xatoligi"}`);
    } finally {
      setLoadingAi(false);
    }
  };

  const categories = type === "income" 
    ? ["Maosh", "Yordamchi ish", "Biznes", "Sarmoya / Foiz", "Boshqa"]
    : ["Oziq-ovqat", "Avtotransport / Yo'lkira", "Uy-joy / Ijara", "Kommunal to'lovlar", "Kiyim-kechak", "Sog'liq / Dori-darmon", "O'qish / Kurslar", "Ko'ngilochar", "Boshqa"];

  // Set default category when type changes
  useEffect(() => {
    setCategory(categories[0]);
  }, [type]);

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      
      {/* Metrics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sof Balans */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Sof Hisob Balansi:</span>
            <p className={`text-xl font-extrabold mt-1.5 ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netBalance.toLocaleString()} so'm
            </p>
          </div>
          <div className={`p-3 rounded-full ${netBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Jami Daromad */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Jami Daromad:</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-1.5">
              + {incomeTotal.toLocaleString()} so'm
            </p>
          </div>
          <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Jami Xarajat */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Jami Xarajat:</span>
            <p className="text-xl font-extrabold text-rose-600 mt-1.5">
              - {expenseTotal.toLocaleString()} so'm
            </p>
          </div>
          <div className="p-3 rounded-full bg-rose-50 text-rose-600">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transaction Input Form & Historic List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-indigo-500" />
              Yangi hisob kiritish
            </h3>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-150">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    type === "expense" ? "bg-white text-rose-600 shadow-xs" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Xarajat
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    type === "income" ? "bg-white text-emerald-600 shadow-xs" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Daromad
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Yozuv nomi (Tavsif):</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="masalan: Bozorlik yoki Oylik avans"
                  className="w-full bg-gray-50 text-gray-800 text-sm px-3.5 py-2 rounded-xl border border-gray-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Miqdori (so'm):</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="masalan: 125000"
                    className="w-full bg-gray-50 text-gray-800 text-sm px-3.5 py-2 rounded-xl border border-gray-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Yo'nalishi (Kategoriya):</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 text-gray-800 text-sm px-3.5 py-2 rounded-xl border border-gray-100 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Ro'yxatga qo'shish
              </button>
            </form>
          </div>

          {/* History */}
          <div className="border-t border-gray-100 pt-5 mt-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Yozuvlar tarixi:</span>
            {records.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Hali hisob-kitoblar kiritilmagan.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {records.map((rec) => {
                  const isInc = rec.amount > 0;
                  return (
                    <div key={rec.id} className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition-all border border-gray-100">
                      <div>
                        <p className="text-xs font-bold text-gray-800">{rec.title}</p>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                          {rec.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-extrabold ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isInc ? '+' : ''}{rec.amount.toLocaleString()} so'm
                        </span>
                        <button
                          onClick={() => removeRecord(rec.id)}
                          className="text-gray-400 hover:text-rose-500 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* AI Financial Checkup Analysis */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 p-6 rounded-3xl border border-indigo-100/40 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-indigo-50/60 pb-3">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Bot className="w-4.5 h-4.5 text-indigo-500" />
                Dono AI - Aqlli Moliyaviy Tahlilchi
              </h3>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                Maslahatchi
              </span>
            </div>
            
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Bugungi daromad va sarf-xarajatlaringiz ro'yxati asosida sun'iy idrok sizga qayerda ortiqcha xarajat qilayotganingizni va qanday tejash rejasini joriy qilish darkorligini aytadi.
            </p>

            {/* Analysis Box */}
            <div className="my-4 min-h-32 bg-white/70 backdrop-blur-xs border border-indigo-50 rounded-2xl p-4 text-xs overflow-y-auto max-h-[280px]">
              {loadingAi ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-400 font-medium">Barcha oqimlarni tahlil qilish jarayoni...</span>
                </div>
              ) : aiAnalysis ? (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed markdown-body">
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6 text-gray-400">
                  <AlertCircle className="w-8 h-8 text-indigo-300 mb-2" />
                  <p>Tahlil natijalarini ko'rish uchun pastdagi tugmani bosing va u oqimlarni oqilona tahlil qiladi.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={analyzeWithAI}
            disabled={loadingAi || records.length === 0}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 fill-white text-yellow-300 animate-pulse" />
            Mening Moliyamni AI Tahlil Qilsin
          </button>
        </div>
      </div>
    </div>
  );
}
