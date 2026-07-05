import React, { useState, useEffect, useRef } from 'react';
import type { FarmProject } from '../utils/helpers';
import { generateAIAdvice, getAIAnswer } from '../utils/helpers';
import type { TranslationSet, Language } from '../data/translations';
import { Sparkles, Send, Bot, User, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface AIAnalystPanelProps {
  project: FarmProject | null;
  t: TranslationSet;
  language: Language;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const AIAnalystPanel: React.FC<AIAnalystPanelProps> = ({ project, t, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Generate recommendations (if project exists)
  const recommendations = project ? generateAIAdvice(project, language) : [];

  // Initialize welcome message when language or project changes
  useEffect(() => {
    const welcomeText = getAIAnswer('hello', project, language);
    setMessages([
      { id: 'welcome', sender: 'ai', text: welcomeText }
    ]);
  }, [language, project?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputVal
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiReplyText = getAIAnswer(userMsg.text, project, language);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickQuestion = (qType: string, qLabel: string) => {
    if (isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: qLabel
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const aiReplyText = getAIAnswer(qType, project, language);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const getAdviceIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="ai-rec-icon" size={18} color="#ea580c" />;
      case 'success': return <CheckCircle className="ai-rec-icon" size={18} color="#16a34a" />;
      default: return <Info className="ai-rec-icon" size={18} color="#2563eb" />;
    }
  };

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="panel-title">
        <span>
          <Sparkles size={20} color="var(--primary)" />
          {t.aiTitle}
        </span>
      </div>

      {project ? (
        <div className="ai-advisor-container">
          <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {t.aiSuggestions}
          </h4>
          
          <div className="ai-recommendations-list">
            {recommendations.map((rec) => (
              <div key={rec.id} className={`ai-rec-box ${rec.type}`}>
                {getAdviceIcon(rec.type)}
                <span>{rec.text}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="ai-rec-box info">
          <Info className="ai-rec-icon" size={18} color="#2563eb" />
          <span>Add a farm project to see specific financial audit recommendations! You can still use the chatbot helper below for instant tips.</span>
        </div>
      )}

      <div className="ai-advisor-container" style={{ marginTop: '10px' }}>
        <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bot size={16} />
          {t.askAi}
        </h4>

        <div className="ai-chatbot">
          <div className="chat-history">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', opacity: 0.7, fontSize: '11px', fontWeight: 'bold' }}>
                  {msg.sender === 'ai' ? <Bot size={12} /> : <User size={12} />}
                  {msg.sender === 'ai' ? 'Farmoholic AI' : 'Farmer'}
                </div>
                <div>{msg.text}</div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-message ai">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', opacity: 0.7, fontSize: '11px', fontWeight: 'bold' }}>
                  <Bot size={12} />
                  Farmoholic AI
                </div>
                <div className="ai-typing-dots" style={{ color: 'var(--text-muted)' }}>
                  {t.aiAnalysing}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Preset buttons to help less-literate farmers */}
          <div style={{ padding: '0 10px 10px 10px', background: '#ffffff', borderTop: '1px solid var(--border-glass)' }}>
            <div className="quick-questions-container">
              <button
                type="button"
                className="quick-question-btn"
                onClick={() => handleQuickQuestion('fertilizer', t.aiTipFertilizer)}
                disabled={isTyping}
              >
                🌱 {t.aiTipFertilizer}
              </button>
              <button
                type="button"
                className="quick-question-btn"
                onClick={() => handleQuickQuestion('pest', t.aiTipPest)}
                disabled={isTyping}
              >
                🐛 {t.aiTipPest}
              </button>
              <button
                type="button"
                className="quick-question-btn"
                onClick={() => handleQuickQuestion('weather', t.aiTipRain)}
                disabled={isTyping}
              >
                🌧️ {t.aiTipRain}
              </button>
              <button
                type="button"
                className="quick-question-btn"
                onClick={() => handleQuickQuestion('timing', t.aiTipTiming)}
                disabled={isTyping}
              >
                📅 {t.aiTipTiming}
              </button>
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-bar">
            <input
              type="text"
              className="chat-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={t.aiChatPlaceholder}
              disabled={isTyping}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px' }} disabled={isTyping}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
