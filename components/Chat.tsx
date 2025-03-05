import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from './ui/button';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatContext } from './ChatContext';
import { useLiveChartData } from '@/app/Chart/page';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatProps {
  analysis: any;
}

interface MarkdownComponentProps {
  node?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Chat({ analysis }: ChatProps) {
  const { messages, setMessages, addMessage } = useChatContext();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { liveData } = useLiveChartData();

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!analysis) return;
    
    const trend = analysis.trend || 'sideways pattern';
    const currentPrice = analysis.currentPrice || 'N/A';
    const support = analysis.support || 'N/A';
    const resistance = analysis.resistance || 'N/A';
    const recommendation = analysis.recommendation || 'View the live chart for the most current information';
    
    const welcomeMessage = {
      role: 'assistant' as const,
      content: `I've analyzed the ${analysis.name || 'stock'} chart for you. Here's what I found:\n\nKey Insights:\n• 📊 Trend: The stock is showing a ${trend}\n• 💰 Current Price: ${currentPrice}\n• 🔍 Key Levels: Support at ${support}, resistance at ${resistance}\n• 🎯 Recommendation: ${recommendation}\n\nHow can I help you understand this analysis further?`,
      timestamp: new Date()
    };
    
    const hasWelcomeMessage = messages.some(
      msg => msg.role === 'assistant' && msg.content.includes("I've analyzed")
    );
    
    if (!hasWelcomeMessage) {
      addMessage(welcomeMessage);
    } else {
      const hasNAValues = messages.some(
        msg => msg.role === 'assistant' && 
               msg.content.includes("I've analyzed") && 
               (msg.content.includes("Support at N/A") || 
                msg.content.includes("Current Price: N/A"))
      );
      
      if (hasNAValues && (currentPrice !== 'N/A' || support !== 'N/A')) {
        const welcomeMessages = messages.filter(
          msg => msg.role === 'assistant' && msg.content.includes("I've analyzed")
        );
        
        if (welcomeMessages.length > 0) {
          const updatedMessages = messages.map(msg => 
            msg.role === 'assistant' && msg.content.includes("I've analyzed")
              ? { ...welcomeMessage, timestamp: msg.timestamp }
              : msg
          );
          
          setMessages(updatedMessages);
        }
      }
    }
    
    scrollToBottom();
  }, [analysis, messages, addMessage, setMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date()
    };
    addMessage(userMessage);
    setInput('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    try {
      const enhancedAnalysis = {
        ...analysis,
        liveData: {
          ...liveData,
          timestamp: new Date().toISOString()
        },
        isLiveData: true
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          analysis: enhancedAnalysis
        }),
      });

      const data = await response.json();
      
      if (data.message) {
        addMessage({
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        });
      } else if (data.error) {
        addMessage({
          role: 'assistant',
          content: `Sorry, there was an error: ${data.error}. Please try asking in a different way.`,
          timestamp: new Date()
        });
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble analyzing this data right now. Please try asking a simpler question or check the live chart for the most accurate information.',
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white flex items-center">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 mr-2">
            <Bot size={14} className="text-white" />
          </span>
          Chat with ROAR AI
        </h3>
      </div>
      
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-fadeIn`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-white" />
              </div>
            )}
            
            <div
              className={`rounded-lg px-4 py-2 max-w-[85%] ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }: MarkdownComponentProps) => (
                    <p className="mb-2 last:mb-0" {...props} />
                  ),
                  ul: ({ node, ...props }: MarkdownComponentProps) => (
                    <ul className="list-disc pl-5 mb-2" {...props} />
                  ),
                  ol: ({ node, ...props }: MarkdownComponentProps) => (
                    <ol className="list-decimal pl-5 mb-2" {...props} />
                  ),
                  li: ({ node, ...props }: MarkdownComponentProps) => (
                    <li className="mb-1" {...props} />
                  ),
                  code: ({ node, ...props }: MarkdownComponentProps) => (
                    <code className="bg-gray-700 px-1 py-0.5 rounded text-sm" {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {message.timestamp && (
                <div className="text-xs opacity-70 mt-1 text-right">
                  {formatTime(message.timestamp)}
                </div>
              )}
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-gray-300" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center justify-start gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div className="bg-gray-800 rounded-lg px-4 py-3 text-gray-300 flex items-center">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <form 
          onSubmit={handleSubmit}
          className="border-t border-gray-800 p-3 bg-gray-850"
        >
          <div className="flex items-end gap-2 bg-gray-800 rounded-lg p-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyPress}
              placeholder="Ask about the stock analysis..."
              className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 overflow-y-auto text-gray-100 placeholder-gray-400 py-1 px-2"
              style={{ height: 'auto', minHeight: '40px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`px-3 py-2 rounded-lg flex-shrink-0 transition-all ${
                !input.trim() || isLoading
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Press Ctrl+Enter to send
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          ROAR AI can make mistakes, so double-check it
        </p>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
} 