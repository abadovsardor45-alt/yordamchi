import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, MessageSquare, BookOpen, Heart, DollarSign, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

const QUICK_PROMPTS = [
  { text: "Sog'lom ovqatlanish uchun yangi boshlovchi rejasini tuzib ber.", icon: Heart, color: "text-emerald-500 bg-emerald-50" },
  { text: "Ingliz tilini tez va mustaqil o'rganish bo'yicha amaliy yo'l xaritasi tuz.", icon: BookOpen, color: "text-indigo-500 bg-indigo-50" },
  { text: "Kichik biznes yoki startup boshlash uchun moliyaviy maslahatlar ber.", icon: DollarSign, color: "text-amber-500 bg-amber-50" },
  { text: "Menga o'zimni baxtli his qilishim va stressni kamaytirishim uchun 5 ta kundalik g'oya ber.", icon: Lightbulb, color: "text-rose-500 bg-rose-50" },
];

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Salom! Men sizning shaxsiy Hayotiy Yordamchingizman. \n\nSizga **Salomatlik**, **Ta'lim**, **Moliya**, **Stress bilan kurashish** va boshqa har qanday hayotiy masalalarda yordam berishga tayyorman. Savolingizni bering yoki pastdagi tayyor g'oyalardan birini tanlang!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Map history in Gemini's format: { role: 'user' | 'model', text: string }
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          category,
          history: history.slice(-6) // Include up to last 6 messages
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Serverda xatolik yuz berdi");
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: data.reply
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: `Kechirasiz, Aloqada xatolik yuz berdi: ${error.message || 'Iltimos, API kalitni tekshiring.'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[620px] bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
      {/* Category selector */}
      <div className="flex items-center gap-2 p-4 bg-gray-50 border-b border-gray-100 overflow-x-auto scrollbar-none">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap mr-2">Maslahat yo'nalishi:</span>
        {[
          { id: "general", label: "Umumiy", icon: MessageSquare, activeColor: "bg-blue-600 text-white" },
          { id: "health", label: "Salomatlik", icon: Heart, activeColor: "bg-emerald-600 text-white" },
          { id: "study", label: "Ta'lim", icon: BookOpen, activeColor: "bg-purple-600 text-white" },
          { id: "financial", label: "Moliya", icon: DollarSign, activeColor: "bg-amber-600 text-white" },
          { id: "motivation", label: "Ruhlantirish", icon: Lightbulb, activeColor: "bg-rose-600 text-white" }
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive ? cat.activeColor : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/30">
        {messages.map((msg) => {
          const isBot = msg.role === "model";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isBot ? "bg-indigo-100 text-indigo-600" : "bg-gray-800 text-white"
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              
              <div className={`px-4 py-3 rounded-2xl text-sm ${
                isBot 
                  ? "bg-white text-gray-800 border border-gray-100 shadow-2xs" 
                  : "bg-indigo-600 text-white shadow-xs"
              }`}>
                <div className="markdown-body prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-3 max-w-[75%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl text-sm bg-white text-gray-500 border border-gray-100 shadow-2xs flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span>Dono AI o'ylamoqda...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recommended ideas if empty or just welcome */}
      {messages.length === 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Tezkor foydali mavzular:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.text)}
                  className="flex items-start text-left gap-2 p-2 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 transition-all text-xs text-gray-700 font-medium group"
                >
                  <span className={`p-1 rounded-lg shrink-0 ${prompt.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="group-hover:text-indigo-600 transition-colors line-clamp-2 leading-relaxed">
                    {prompt.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 md:p-4 bg-white border-t border-gray-100 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Savolingizni yoki masalani yozing (masalan: qanday to'g'ri rejalashtirish qilish kerak?)..."
          className="flex-1 bg-gray-50 text-gray-800 placeholder-gray-400 text-sm px-4 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
