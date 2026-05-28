import React, { useState, useEffect } from "react";
import { Droplet, Trash2, Plus, Smile, Flame, Activity, Info, Sparkles } from "lucide-react";
import { WaterRecord } from "../types";

export default function HealthTracker() {
  // Water Tracker States
  const [weight, setWeight] = useState<number>(70);
  const [waterGoal, setWaterGoal] = useState<number>(2450); // Weight * 35 ml
  const [waterRecords, setWaterRecords] = useState<WaterRecord[]>([]);
  const [totalWater, setTotalWater] = useState<number>(0);

  // BMI States
  const [bmiHeight, setBmiHeight] = useState<string>("175");
  const [bmiWeight, setBmiWeight] = useState<string>("70");
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<{ status: string; color: string; advice: string } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedWater = localStorage.getItem("yordamchi_water");
    if (savedWater) {
      try {
        const parsed = JSON.parse(savedWater);
        // Clean records older than today (midnight)
        const startOfToday = new Date().setHours(0,0,0,0);
        const filtered = parsed.filter((r: WaterRecord) => r.timestamp >= startOfToday);
        setWaterRecords(filtered);
      } catch (e) {
        console.error(e);
      }
    }

    const savedWeight = localStorage.getItem("yordamchi_weight");
    if (savedWeight) {
      setWeight(Number(savedWeight));
    }
  }, []);

  // Update total water & storage
  useEffect(() => {
    const sum = waterRecords.reduce((acc, r) => acc + r.amount, 0);
    setTotalWater(sum);
    localStorage.setItem("yordamchi_water", JSON.stringify(waterRecords));
  }, [waterRecords]);

  // Goal updates when weight changes
  useEffect(() => {
    const limit = Math.round(weight * 35);
    setWaterGoal(limit);
    localStorage.setItem("yordamchi_weight", weight.toString());
  }, [weight]);

  const addWater = (amount: number) => {
    const newRecord: WaterRecord = {
      id: Date.now().toString(),
      amount,
      timestamp: Date.now()
    };
    setWaterRecords(prev => [newRecord, ...prev]);
  };

  const removeRecord = (id: string) => {
    setWaterRecords(prev => prev.filter(r => r.id !== id));
  };

  const calculateBMI = () => {
    const h = parseFloat(bmiHeight) / 100;
    const w = parseFloat(bmiWeight);
    if (!h || !w || h <= 0 || w <= 0) return;

    const bmi = Math.round((w / (h * h)) * 10) / 10;
    setBmiResult(bmi);

    let status = "";
    let color = "";
    let advice = "";

    if (bmi < 18.5) {
      status = "Vazni yetarli emas (Nimjon)";
      color = "text-sky-500 bg-sky-50 border-sky-200";
      advice = "Sizga sog'lom va kaloriyali taomlar iste'mol qilish, oqsil ulushini ko'paytirish tavsiya etiladi. Jismoniy mashqlar bilan mushak massasini oshiring.";
    } else if (bmi >= 18.5 && bmi < 24.9) {
      status = "Sog'lom (Me'yoriy)";
      color = "text-emerald-500 bg-emerald-50 border-emerald-200";
      advice = "Ajoyib natija! Sizning vazningiz butunlay ideal me'yorda. Ushbu faol hayot tarzi va muvozanatli ovqatlanish tartibini davom ettiring.";
    } else if (bmi >= 25 && bmi < 29.9) {
      status = "Ortiqcha vazn";
      color = "text-amber-500 bg-amber-50 border-amber-200";
      advice = "Siz jismoniy faollikni biroz ko'paytirishingiz va shakarli, xamirli taomlarni kamaytirishingiz lozim. Har kuni kamida 30 daqiqa piyoda yuring.";
    } else {
      status = "Semizlik";
      color = "text-rose-500 bg-rose-50 border-rose-200";
      advice = "Kardio va sog'lom parhez tartibiga o'tish tavsiya etiladi. Vaznni kamaytirish yurak-qon tomir tizimi salomatligi uchun juda muhimdir. Mutaxassis bilan maslahatlashing.";
    }

    setBmiCategory({ status, color, advice });
  };

  const waterPercent = Math.min(100, Math.round((totalWater / waterGoal) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
      
      {/* SECTION 1: Hydration Tracker */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-indigo-500 fill-indigo-100" />
                Suv Balansi va Gidratatsiya
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Tanangizning kunlik suv ehtiyojini qondirish aqlni tetik tutadi.
              </p>
            </div>
            
            {/* Weight Setting Input */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Tana vazningiz</span>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                  className="w-14 text-center text-sm font-semibold bg-gray-50 text-gray-800 px-1 py-1 rounded-lg border border-gray-100 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-gray-600">kg</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-50 text-center">
              <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wide">Bugun ichildi</span>
              <p className="text-lg font-bold text-indigo-700 mt-1">{totalWater} <span className="text-xs font-normal">ml</span></p>
            </div>
            <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-50 text-center">
              <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">Kunlik me'yor</span>
              <p className="text-lg font-bold text-emerald-700 mt-1">{waterGoal} <span className="text-xs font-normal">ml</span></p>
            </div>
            <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-50 text-center">
              <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide">Foizda</span>
              <p className="text-lg font-bold text-amber-700 mt-1">{waterPercent}%</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center my-6">
            {/* Cool Dynamic Hydration Graphic */}
            <div className="relative w-32 h-44 bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden flex items-end shrink-0 shadow-inner">
              <div
                className="w-full bg-gradient-to-t from-sky-400 to-indigo-400 transition-all duration-700 relative flex items-center justify-center"
                style={{ height: `${waterPercent}%` }}
              >
                {waterPercent > 5 && (
                  <span className="absolute text-xs font-extrabold text-white drop-shadow-sm">
                    {waterPercent}%
                  </span>
                )}
              </div>
              
              {/* Overlay Glass Indicator */}
              <div className="absolute inset-0 pointer-events-none border-2 border-white/40 rounded-2xl flex flex-col justify-between p-3">
                <div className="w-full border-t border-gray-300/30 text-[9px] text-gray-400 flex justify-between"><span>Max</span><span>{waterGoal}ml</span></div>
                <div className="w-full border-t border-gray-300/30 text-[9px] text-gray-400"><span>50%</span></div>
                <div className="w-full border-t border-gray-300/30 text-[9px] text-gray-400"><span>Min</span></div>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="flex-1 w-full space-y-3">
              <span className="text-xs font-semibold text-gray-500 block">Tezkor suv qo'shish:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addWater(150)}
                  className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 border border-slate-100 hover:border-indigo-300 rounded-xl text-xs text-slate-700 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-500" />
                  Kichik (150 ml)
                </button>
                <button
                  onClick={() => addWater(250)}
                  className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 border border-slate-100 hover:border-indigo-300 rounded-xl text-xs text-slate-700 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-500" />
                  Oddiy finjon (250 ml)
                </button>
                <button
                  onClick={() => addWater(500)}
                  className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 border border-slate-100 hover:border-indigo-300 rounded-xl text-xs text-slate-700 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-500" />
                  Shisha (500 ml)
                </button>
                <button
                  onClick={() => addWater(750)}
                  className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 border border-slate-100 hover:border-indigo-300 rounded-xl text-xs text-slate-700 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-500" />
                  Sport (750 ml)
                </button>
              </div>

              {totalWater >= waterGoal && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs flex items-center gap-2 animate-bounce">
                  <Smile className="w-4 h-4 text-emerald-500" />
                  Kunlik suv ichish me'yoriga to'liq erishildi! Sog'lom hayot!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History of drinks */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Bugungi ichimliklar tarixi:</span>
          {waterRecords.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Hali biror marta suv qo'shilmadi. Yuqoridagi tugmalardan foydalaning.</p>
          ) : (
            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-2">
              {waterRecords.map((rec) => (
                <div key={rec.id} className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-colors">
                  <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <Droplet className="w-3 h-3 text-indigo-500" />
                    + {rec.amount} ml
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400">
                      {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => removeRecord(rec.id)}
                      className="text-gray-400 hover:text-rose-500 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: BMI Calculator */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Tana Vazni Indeksi (BMI) Kalkulyatori
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Bo'yingiz va vazningizning nisbati sog'lom ekanligini tezkor aniqlang.
          </p>

          <div className="grid grid-cols-2 gap-4 my-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Bo'yingiz uzunligi (cm):</label>
              <input
                type="number"
                value={bmiHeight}
                onChange={(e) => setBmiHeight(e.target.value)}
                placeholder="masalan: 175"
                className="w-full bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded-xl border border-gray-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Vazningiz (kg):</label>
              <input
                type="number"
                value={bmiWeight}
                onChange={(e) => setBmiWeight(e.target.value)}
                placeholder="masalan: 70"
                className="w-full bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded-xl border border-gray-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={calculateBMI}
            className="w-full py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <Activity className="w-3.5 h-3.5" />
            Hisoblash & Maslahat Olish
          </button>

          {/* Results Display */}
          {bmiResult !== null && bmiCategory && (
            <div className="mt-5 space-y-3 animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500">Sizning BMI ko'rsatkichingiz:</span>
                <span className="text-lg font-extrabold text-indigo-700">{bmiResult}</span>
              </div>

              {/* Status block */}
              <div className={`p-4 rounded-2xl border ${bmiCategory.color} flex flex-col gap-1`}>
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  {bmiCategory.status}
                </div>
                <p className="text-xs leading-relaxed opacity-95">
                  {bmiCategory.advice}
                </p>
              </div>

              {/* Graphic representation */}
              <div className="relative pt-2">
                <div className="h-2 w-full bg-gray-100 rounded-full flex overflow-hidden">
                  <div className="w-[18.5%] bg-sky-400 h-full"></div>
                  <div className="w-[6.4%] bg-emerald-400 h-full"></div>
                  <div className="w-[5%] bg-amber-400 h-full"></div>
                  <div className="w-[10%] bg-rose-400 h-full"></div>
                </div>
                <div className="flex justify-between text-[8px] text-gray-400 mt-1 uppercase font-semibold">
                  <span>Nimjon (&lt;18.5)</span>
                  <span>Normal (18.5-24.9)</span>
                  <span>Ortiqcha (25-29.9)</span>
                  <span>Semiz (30+)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informative Tip Box */}
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl mt-4 flex items-start gap-2.5">
          <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-slate-500">
            <strong>FOYDALI ESLATMA:</strong> Sog'lom turmush tarzi uchun kuniga kamida 30 daqiqa yengil faoliyat (piyoda yurish, yugurish, yoga) va yetarli uxlash kerak. Har kuni o'rtacha 7-8 soat uxlash jismoniy yangilanishning asosi hisoblanadi.
          </p>
        </div>
      </div>

    </div>
  );
}
