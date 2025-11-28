import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CyberSecurityBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const CyberSecurityBot: React.FC<CyberSecurityBotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm CyberShield AI Assistant. I can help you with cybersecurity questions, explain threats, and provide security best practices. How can I help you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          userMessage: userMessage
        }),
      });

      const data = await response.json();

      // Add delay to show thinking animation (1.5-2 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (data.success && data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.error || "I apologize, but I'm having trouble responding right now. Please try again." 
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      
      // Add delay even for errors to show thinking animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm having trouble connecting to the server. Please check your connection and try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What is phishing?",
    "How can I create strong passwords?",
    "What is a DDoS attack?",
    "How do I protect against ransomware?"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen 
            ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/50' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/50'
        }`}
      >
        <span className="material-icons text-white text-2xl">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5">
          <Card className="bg-gradient-to-br from-slate-900/95 to-blue-900/50 backdrop-blur-xl border border-white/20 shadow-2xl hover:border-white/40 transition-all">
            <CardHeader className="pb-3 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/0">
              <CardTitle className="text-white flex items-center text-lg">
                <div className="p-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-600 rounded-lg mr-3 shadow-lg shadow-blue-500/50">
                  <span className="material-icons text-white text-xl">smart_toy</span>
                </div>
                <div>
                  <div className="font-bold">CyberShield AI Assistant</div>
                  <div className="text-xs text-cyan-300 font-normal flex items-center">
                    <span className="material-icons text-xs mr-1">fiber_manual_record</span>
                    Online & Ready
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 bg-gradient-to-b from-slate-900/50 to-blue-900/30">
              {/* Messages Container */}
              <div className="h-80 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex animate-message-fade ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg text-sm transition-all duration-200 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none shadow-lg hover:shadow-blue-500/50'
                          : 'bg-white/10 text-blue-100 rounded-bl-none border border-white/10 hover:border-white/30 hover:bg-white/15'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start animate-message-fade">
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-100 p-4 rounded-lg rounded-bl-none border border-blue-500/30 animate-pulse-glow">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-cyan-300 font-medium">Thinking</span>
                        {/* Thinking Wave Animation */}
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-thinking-wave" style={{ animationDelay: '0s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-thinking-wave" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-thinking-wave" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 animate-message-fade">
                  <div className="text-xs text-blue-300 mb-3 flex items-center">
                    <span className="material-icons text-xs mr-1">lightbulb</span>
                    Quick questions:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setInputValue(question)}
                        className="text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/40 hover:to-purple-500/40 text-blue-200 px-3 py-1.5 rounded-full transition-all duration-200 border border-blue-400/30 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20"
                        style={{ animationDelay: `${(index + 1) * 50}ms` }}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/0">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about cybersecurity..."
                    className="flex-1 bg-white/10 border border-white/20 hover:border-white/40 rounded-lg px-4 py-2 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 text-sm transition-all duration-200"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 transition-all duration-200 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/50'
                    }`}
                  >
                    {isLoading ? (
                      <span className="material-icons text-sm animate-thinking-spinner">sync</span>
                    ) : (
                      <span className="material-icons text-sm">send</span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CyberSecurityBot;
