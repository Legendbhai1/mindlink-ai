import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface UserSettings {
  ai_model: string;
  ai_temperature: number;
  ai_personality: string;
  theme: string;
  language: string;
}

interface TranslatedTexts {
  [key: string]: {
    [language: string]: string;
  };
}

const translations: TranslatedTexts = {
  welcome: {
    en: "Welcome to Siivi",
    es: "Bienvenido a Siivi",
    fr: "Bienvenue chez Siivi",
    de: "Willkommen bei Siivi",
    zh: "欢迎使用 Siivi"
  },
  tagline: {
    en: "Your Intelligent AI Companion",
    es: "Tu Compañero de IA Inteligente",
    fr: "Votre Compagnon IA Intelligent",
    de: "Ihr Intelligenter KI-Begleiter",
    zh: "您的智能AI伙伴"
  },
  description: {
    en: "Ask questions, get intelligent responses, and explore endless possibilities with your personalized AI assistant!",
    es: "¡Haz preguntas, obtén respuestas inteligentes y explora infinitas posibilidades con tu asistente de IA personalizado!",
    fr: "Posez des questions, obtenez des réponses intelligentes et explorez des possibilités infinies avec votre assistant IA personnalisé !",
    de: "Stellen Sie Fragen, erhalten Sie intelligente Antworten und erkunden Sie endlose Möglichkeiten mit Ihrem personalisierten KI-Assistenten!",
    zh: "提出问题，获得智能回答，与您的个性化AI助手探索无限可能！"
  }
};

export const useSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    ai_model: 'openrouter/auto',
    ai_temperature: 0.7,
    ai_personality: 'helpful',
    theme: 'dark',
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setSettings({
          ai_model: data.ai_model || 'openrouter/auto',
          ai_temperature: data.ai_temperature || 0.7,
          ai_personality: data.ai_personality || 'helpful',
          theme: data.theme || 'dark',
          language: data.language || 'en'
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updatedSettings
        });
      
      if (error) throw error;
      
      setSettings(updatedSettings);
      
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const translate = (key: string): string => {
    return translations[key]?.[settings.language] || translations[key]?.['en'] || key;
  };

  const getPersonalityPrompt = (): string => {
    const personalityPrompts = {
      helpful: "You are a helpful and professional AI assistant. Provide clear, accurate, and useful responses.",
      creative: "You are a creative and imaginative AI assistant. Think outside the box and provide innovative solutions.",
      casual: "You are a casual and friendly AI assistant. Use a conversational tone and be approachable.",
      technical: "You are a technical and precise AI assistant. Focus on accuracy, details, and technical depth."
    };
    
    return personalityPrompts[settings.ai_personality as keyof typeof personalityPrompts] || personalityPrompts.helpful;
  };

  return {
    settings,
    updateSettings,
    translate,
    getPersonalityPrompt,
    isLoading
  };
};