import { useState, useEffect } from 'react';
import { ChatMessage } from '@/services/openrouter';

export interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'ai-chat-history';

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const history = parsed.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatHistory(history);
      } catch (error) {
        console.error('Failed to parse chat history:', error);
      }
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
  }, [chatHistory]);

  const createNewChat = (): string => {
    const newChatId = Date.now().toString();
    const newChat: ChatHistory = {
      id: newChatId,
      title: 'New chat',
      timestamp: new Date(),
      messages: []
    };
    
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    return newChatId;
  };

  const updateChatTitle = (chatId: string, messages: ChatMessage[]) => {
    if (messages.length > 0) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        const title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
        setChatHistory(prev => prev.map(chat => 
          chat.id === chatId ? { ...chat, title } : chat
        ));
      }
    }
  };

  const updateChat = (chatId: string, messages: ChatMessage[]) => {
    setChatHistory(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages, timestamp: new Date() }
        : chat
    ));
    
    // Update title based on first message
    updateChatTitle(chatId, messages);
  };

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const getCurrentChat = (): ChatHistory | null => {
    if (!currentChatId) return null;
    return chatHistory.find(chat => chat.id === currentChatId) || null;
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  return {
    chatHistory,
    currentChatId,
    createNewChat,
    updateChat,
    deleteChat,
    getCurrentChat,
    selectChat,
    setCurrentChatId
  };
};