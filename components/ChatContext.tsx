'use client';

import React, { createContext, useContext, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // NOTE: Messages are only stored in memory and are not persisted in localStorage or any other storage.
  // All data is cleared when the page is refreshed or closed.
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Function to add a new message
  const addMessage = (message: Message) => {
    // Check if it's a welcome message and prevent duplicates
    if (message.role === 'assistant' && message.content.includes("I've analyzed")) {
      // Check if we already have a welcome message
      const hasWelcomeMessage = messages.some(
        msg => msg.role === 'assistant' && msg.content.includes("I've analyzed")
      );
      
      if (hasWelcomeMessage) {
        // Already have a welcome message, don't add another one
        return;
      }
    }
    
    // Add timestamp if not provided
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || new Date()
    };
    
    setMessages(prev => [...prev, messageWithTimestamp]);
  };
  
  // Function to clear all messages
  const clearMessages = () => {
    setMessages([]);
  };
  
  return (
    <ChatContext.Provider value={{ messages, setMessages, addMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
} 