import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Bot, Send, Sparkles, PhoneCall, ShieldAlert,
  Flame, Heart, Waves, Globe, HelpCircle, AlertTriangle
} from 'lucide-react';

export const AIAssistant = () => {
  const { lang, setLang } = useLanguage();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "👋 Hello! I am the **CrisisMesh AI Emergency Assistant**.\n\nI can assist with real-time first-aid instructions, disaster safety preparedness, or navigating our SOS dispatch portal.\n\n⚠️ *Important: If you are in immediate life-threatening peril, dial **112** or **911** immediately without delay.*",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'CrisisMesh Knowledge Core'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { label: "🔥 Fire in apartment protocol", query: "What should I do immediately if a fire breaks out in my building?" },
    { label: "❤️ How to perform CPR", query: "Can you give me step-by-step CPR instructions for an unconscious adult?" },
    { label: "🌊 Flood safety steps", query: "What are the essential safety precautions during flash flooding?" },
    { label: "🚗 Car accident first aid", query: "How do I triage victims at a highway traffic collision?" },
    { label: "🚨 How to report SOS on this site", query: "How do I submit an emergency report on CrisisMesh AI?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend = inputText) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const languageName = lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English';
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language: languageName
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botReply = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source || 'Google Gemini 1.5'
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error("Chatbot API response error");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: "I am having temporary trouble reaching the neural server. If this is an emergency, dial 112 / 911 immediately.\n\nFor general first aid, keep airways clear, apply pressure on bleeding, and do not move victims unless there is immediate hazard of fire.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'Emergency Fallback Protocol'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-xs font-mono text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>POWERED BY GOOGLE GEMINI</span>
        </div>
        <h1 className="text-3xl font-black text-white">CrisisMesh AI Assistant</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Intelligent emergency response guidance, first aid protocols, and multilingual safety instructions.
        </p>
      </div>

      {/* Safety Callout Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/70 via-slate-900 to-red-950/70 border border-red-500/30 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>AI guidance is informational only. In imminent danger, call <strong>112 / 911</strong> immediately.</span>
        </div>
        <a
          href="tel:112"
          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs shrink-0"
        >
          Call 112
        </a>
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl bg-navy-950/90 border border-slate-800 shadow-2xl flex flex-col h-[560px] overflow-hidden backdrop-blur-xl">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">CrisisMesh AI Safety Agent</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online & Ready
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1" />
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded text-[11px] ${lang === 'en' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-0.5 rounded text-[11px] ${lang === 'hi' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400'}`}
            >
              HI
            </button>
            <button
              onClick={() => setLang('mr')}
              className={`px-2 py-0.5 rounded text-[11px] ${lang === 'mr' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400'}`}
            >
              MR
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-600/20'
                      : 'bg-slate-900 border border-slate-800/90 text-slate-200 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{m.time}</span>
                    {m.source && <span className="opacity-75">{m.source}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 rounded-bl-none flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>CrisisMesh AI is reasoning response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 shrink-0">Quick Topics:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Ask emergency question or safety instructions (${lang.toUpperCase()})...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-lg"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
