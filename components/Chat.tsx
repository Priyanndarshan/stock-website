import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Loader2, Send, Menu } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  analysis: any;
  isSidebarOpen: boolean;
}

export function Chat({ analysis, isSidebarOpen }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          analysis: analysis,
          history: messages
        }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className={`flex flex-col h-full bg-[#1A1B1E] transition-all duration-300 ${
      isSidebarOpen ? 'ml-[400px]' : 'ml-0'
    }`}>
      {/* Chat Header */}
      <div className="border-b border-gray-800/60 py-3 px-4 flex items-center justify-center">
        <Menu className="h-6 w-6 text-gray-400 absolute left-4" />
        <h2 className="text-[15px] font-medium text-gray-200">Chat with Chart AI</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[48rem] mx-auto px-4 py-5 space-y-6">
          {/* Initial System Message */}
          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded-full bg-[#2563EB] flex-shrink-0 flex items-center justify-center mt-1">
              <span className="text-white text-xs">AI</span>
            </div>
            <div className="flex-1 text-[#E3E3E3] text-[15px] leading-normal min-w-0">
              I've analyzed your chart. Feel free to ask any questions about the technical analysis, trends, or trading strategies.
            </div>
          </div>

          {messages.map((message, index) => (
            <div key={index} 
              className={`flex gap-4 items-start ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                message.role === 'user' ? 'bg-[#3F3F46]' : 'bg-[#2563EB]'
              }`}>
                <span className="text-white text-xs">
                  {message.role === 'user' ? 'U' : 'AI'}
                </span>
              </div>
              <div className={`flex-1 min-w-0 text-[15px] leading-normal ${
                message.role === 'user' ? 'text-right' : ''
              } text-[#E3E3E3]`}>
                {message.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-[#2563EB] flex-shrink-0 flex items-center justify-center mt-1">
                <span className="text-white text-xs">AI</span>
              </div>
              <div className="flex-1">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800/60 bg-[#1A1B1E]">
        <div className="max-w-[48rem] mx-auto px-4 py-3">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              placeholder="Ask Chart AI..."
              rows={1}
              className="w-full bg-[#2A2B32] text-[#E3E3E3] rounded-2xl pl-4 pr-12 py-3 
                resize-none focus:outline-none border border-gray-800/60
                focus:border-gray-600 placeholder-gray-500 text-[15px]"
              style={{ minHeight: '44px', maxHeight: '200px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-[6px] p-1.5 hover:bg-gray-700/50 
                text-gray-400 rounded-lg disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
          <div className="text-[11px] text-gray-500 mt-2 text-center">
            Chart AI can make mistakes, so double-check it
          </div>
        </div>
      </div>
    </div>
  );
} 