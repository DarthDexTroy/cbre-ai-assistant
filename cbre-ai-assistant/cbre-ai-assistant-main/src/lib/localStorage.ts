// User authentication and data management with localStorage

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface SavedProperty {
  propertyId: string;
  savedAt: string;
  notes?: string;
  tags: string[];
}

export interface PropertyAlert {
  id: string;
  propertyId: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

// Chat
import type { ChatMessage } from "./gemini";

const STORAGE_KEYS = {
  USER: 'realestate_ai_user',
  SAVED_PROPERTIES: 'realestate_ai_saved_properties',
  ALERTS: 'realestate_ai_alerts',
  COLLECTIONS: 'realestate_ai_collections',
  ONBOARDING_COMPLETED: 'realestate_ai_onboarding',
  CHAT_HISTORY: 'realestate_ai_chat_history',
};

// User Management
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER);
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Simulated login (for demo purposes)
export const login = (email: string, name: string): User => {
  const user: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    createdAt: new Date().toISOString(),
  };
  setCurrentUser(user);
  return user;
};

// Saved Properties Management
export const getSavedProperties = (): SavedProperty[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.SAVED_PROPERTIES);
  return saved ? JSON.parse(saved) : [];
};

export const saveProperty = (propertyId: string, notes?: string, tags: string[] = []): void => {
  const saved = getSavedProperties();
  const existing = saved.find(p => p.propertyId === propertyId);
  
  if (existing) {
    existing.notes = notes;
    existing.tags = tags;
  } else {
    saved.push({
      propertyId,
      savedAt: new Date().toISOString(),
      notes,
      tags,
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.SAVED_PROPERTIES, JSON.stringify(saved));
};

export const unsaveProperty = (propertyId: string): void => {
  const saved = getSavedProperties();
  const filtered = saved.filter(p => p.propertyId !== propertyId);
  localStorage.setItem(STORAGE_KEYS.SAVED_PROPERTIES, JSON.stringify(filtered));
};

export const isPropertySaved = (propertyId: string): boolean => {
  const saved = getSavedProperties();
  return saved.some(p => p.propertyId === propertyId);
};

// Alerts Management
export const getAlerts = (): PropertyAlert[] => {
  const alerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
  return alerts ? JSON.parse(alerts) : [];
};

export const addAlert = (propertyId: string, type: string, message: string): void => {
  const alerts = getAlerts();
  alerts.unshift({
    id: `alert-${Date.now()}`,
    propertyId,
    type,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  });
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
};

export const markAlertAsRead = (alertId: string): void => {
  const alerts = getAlerts();
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.read = true;
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }
};

export const getUnreadAlertCount = (): number => {
  return getAlerts().filter(a => !a.read).length;
};

// Onboarding
export const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
};

export const completeOnboarding = (): void => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
};

export const resetOnboarding = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
};

// Chat history
export const getChatHistory = (): ChatMessage[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveChatHistory = (messages: ChatMessage[]): void => {
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
};

export const clearChatHistory = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
};
