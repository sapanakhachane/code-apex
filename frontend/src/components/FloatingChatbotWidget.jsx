import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FloatingChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '🚨 CrisisMesh AI Assistant here. Need quick safety advice or first-aid guidance?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, language: lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English' })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'In danger, call 112 / 911 immediately.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen ? (
        <div className="w-80 sm:w-96 rounded-2xl bg-navy-950 border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[420px] backdrop-blur-2xl animate-in zoom-in-95">
          {/* Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white text-xs">AI Assistant</strong>
                <span className="text-[10px] text-cyan-400 block font-mono">Gemini 1.5 Flash</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link to="/ai-assistant" onClick={() => setIsOpen(false)} className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800">
                Full Page
              </Link>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                  m.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none whitespace-pre-line'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-[11px] text-slate-500 italic">Thinking...</div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2 border-t border-slate-800 bg-slate-900/80 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask safety advice..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-3.5 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-purple-600/30 hover:scale-105 transition-all flex items-center gap-2"
          title="Open Emergency AI Assistant"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="hidden sm:inline text-xs font-bold tracking-wide pr-1">AI Assistant</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
        </button>
      )}
    </div>
  );
};
