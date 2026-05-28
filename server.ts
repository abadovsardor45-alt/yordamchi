import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("warning: GEMINI_API_KEY is not defined in environment variables.");
}

// API Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", hasAi: !!ai });
});

// Specialized Help Prompts based on selected category
const SYSTEM_PROMPTS: Record<string, string> = {
  general: "Siz insonlarga yordam beradigan mehribon va oqil Al-Yordamchisiz. Har doim to'liq, tushunarli, aniq va amaliy javoblar bering. Agar foydalanuvchi o'zbek tilida so'ralsa o'zbekcha yozing.",
  health: "Siz sog'liq va o'z-o'zini parvarish qilish bo'yicha professional maslahatchisiz. Foydalanuvchilarning jismoniy, ruhiy yoki ozuqaviy savollariga maslahat bering. MUHIM: Har doim ushbu maslahatlar shifokor maslahatini almashtirmasligini eslatib o'ting. Amaliy, xavfsiz va ilmiy asoslangan maslahatlar bering.",
  study: "Siz o'qitish va ta'lim bo'yicha mutaxassissiz. Darslar, yangi fanlar, dasturlash yoki til o'rganish bo'yicha savollarga dars dasturi, tushuntirishlar, manbalar va maslahatlar bilan yordam bering.",
  financial: "Siz oqlangan moliyaviy maslahatchisiz. Insonlarga pullarini to'g'ri rejalashtirish, xarajatlarni optimallashtirish, tejash san'ati va sarmoya kiritish haqida sodda va amaliy maslahatlar bering.",
  motivation: "Siz qanot bag'ishlovchi motivator va hayotiy murabbiysiz. Stress bilan kurashish, charchash (burnout) holatini bartaraf etish, o'ziga bo'lgan fallsafani yuksaltirish va yangi maqsadlar uchun kuch beruvchi maslahatlar bering."
};

// Gemini Chat Endpoint
app.post("/api/chat", async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: "Gemini API key is not configured yet. Please configure it in Settings > Secrets." });
  }

  const { message, category, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Xabar matni yuborilmadi." });
  }

  const systemInstruction = SYSTEM_PROMPTS[category || "general"] || SYSTEM_PROMPTS.general;

  try {
    // We construct contents with the standard structure
    // history expected: array of { role: 'user' | 'model', text: string }
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }]
        });
      });
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || "Kechirasiz, javob olishda muammo yuz berdi.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error?.message || "Gemini so'rovi amalga oshmadi." });
  }
});

// Start integration with Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Life-Helper Server] running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
