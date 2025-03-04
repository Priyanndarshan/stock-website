import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from './ui/button';
import { Menu, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  analysis: any;
  isSidebarOpen: boolean;
}

interface MarkdownComponentProps {
  node?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Chat({ analysis, isSidebarOpen }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (analysis?.stockName) {
      setMessages([{
        role: 'assistant',
        content: `I've analyzed the chart for ${analysis.stockName}. I can see the price movements, trends, and technical indicators. What would you like to know about this stock?`
      }]);
    }
  }, [analysis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          analysis,
          history: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.text();
      setMessages(prev => [...prev, { role: 'assistant', content: data }]);
      
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error processing your request. Please try again.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
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
          {messages.length === 0 && (
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-[#2563EB] flex-shrink-0 flex items-center justify-center mt-1">
                <span className="text-white text-xs">AI</span>
              </div>
              <div className="flex-1 text-[#E3E3E3] text-[15px] leading-normal min-w-0">
                Loading chart analysis...
              </div>
            </div>
          )}

          {/* Chat Messages */}
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
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children, ...props}: MarkdownComponentProps) => 
                        <h1 className="text-2xl font-bold my-4 text-gray-100" {...props}>{children}</h1>,
                      h2: ({children, ...props}: MarkdownComponentProps) => 
                        <h2 className="text-xl font-bold my-3 text-gray-200" {...props}>{children}</h2>,
                      h3: ({children, ...props}: MarkdownComponentProps) => 
                        <h3 className="text-lg font-bold my-2 text-gray-300" {...props}>{children}</h3>,
                      ul: ({children, ...props}: MarkdownComponentProps) => 
                        <ul className="list-disc ml-6 my-2 space-y-1" {...props}>{children}</ul>,
                      li: ({children, ...props}: MarkdownComponentProps) => 
                        <li className="text-gray-300" {...props}>{children}</li>,
                      p: ({children, ...props}: MarkdownComponentProps) => 
                        <p className="my-2 text-gray-300" {...props}>{children}</p>,
                      strong: ({children, ...props}: MarkdownComponentProps) =>
                        <strong className="font-bold text-blue-400" {...props}>{children}</strong>,
                      code: ({children, ...props}: MarkdownComponentProps) =>
                        <code className="bg-gray-700 rounded px-1" {...props}>{children}</code>
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-[#2563EB] flex-shrink-0 flex items-center justify-center mt-1">
                <span className="text-white text-xs">AI</span>
              </div>
              <div className="flex-1 text-[#E3E3E3] text-[15px] leading-normal min-w-0">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
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
              onKeyDown={handleKeyPress}
              placeholder="Ask about the stock analysis..."
              rows={1}
              className="w-full bg-[#2A2B32] text-[#E3E3E3] rounded-2xl pl-4 pr-12 py-3 
                resize-none focus:outline-none border border-gray-800/60
                focus:border-gray-600 placeholder-gray-500 text-[15px]"
              style={{ minHeight: '44px', maxHeight: '200px' }}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
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