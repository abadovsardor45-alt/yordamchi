export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: "personal" | "study" | "health" | "financial" | "work";
  createdAt: number;
}

export interface WaterRecord {
  id: string;
  amount: number; // in ml
  timestamp: number;
}

export interface BudgetRecord {
  id: string;
  title: string;
  amount: number; // positive = income, negative = expense
  category: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export type ActiveTab = "dashboard" | "ai" | "health" | "budget" | "tasks" | "breath" | "info";
