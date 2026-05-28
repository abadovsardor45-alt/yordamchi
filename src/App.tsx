import React, { useState } from "react";
import { Sparkles, Activity, Home, Heart, DollarSign, CheckSquare, Wind, HelpCircle } from "lucide-react";
import DashboardOverview from "./components/DashboardOverview";
import AiAssistant from "./components/AiAssistant";
import HealthTracker from "./components/HealthTracker";
import FinancialAdvisor from "./components/FinancialAdvisor";
import TaskPlanner from "./components/TaskPlanner";
import BreathCompanion from "./components/BreathCompanion";
import { ActiveTab } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Sidebar navigation options
  const navItems = [
    { id: "dashboard", label: "Bosh Sahifa", icon: Home },
    { id: "ai", label: "Dono AI Hamroh", icon: Sparkles },
    { id: "health", label: "Suv & Salomatlik", icon: Heart },
    { id: "tasks", label: "Vazifalar & Taymer", icon: CheckSquare },
    { id: "budget", label: "Aqlli Moliya", icon: DollarSign },
    { id: "breath", label: "Nafas Mashqi", icon: Wind },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col md:flex-row antialiased font-sans">
      
      {/* Sidebar - Desktop Layout */}
      <aside className="w-full md:w-64 shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between py-6 px-4 md:sticky md:top-0 md:h-screen">
        <div>
          {/* Logo Brand Frame */}
          <div className="flex items-center gap-3 px-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5 fill-white/10" />
            </div>
            <div>
              <h2 className="text-sm font-black text-indigo-950 uppercase tracking-wider">Yordamchi</h2>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Hamroh Hub v1.5</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Brand footer inside Sidebar */}
        <div className="pt-6 border-t border-gray-50 px-3 hidden md:block">
          <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
            Insonlarga yordam berish va hayotlarini yanada mukammallah qilish uchun maxsus ishlab chiqildi.
          </p>
          <span className="text-[9px] text-indigo-500 font-bold block mt-2">© 2026 Hayotiy Hamroh</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Dynamic header navigation representing currently active tab */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">LOYIHA SARLOVHASI</span>
            <span className="text-gray-300">/</span>
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-wider">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
              O'zbekcha Hamroh
            </span>
          </div>
        </header>

        {/* Selected Component Render Grid */}
        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-1">
          {activeTab === "dashboard" && <DashboardOverview onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === "ai" && <AiAssistant />}
          {activeTab === "health" && <HealthTracker />}
          {activeTab === "tasks" && <TaskPlanner />}
          {activeTab === "budget" && <FinancialAdvisor />}
          {activeTab === "breath" && <BreathCompanion />}
        </div>
      </main>

    </div>
  );
}
