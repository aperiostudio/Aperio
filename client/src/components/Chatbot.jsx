import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content: "Hello! I am Aperio's Digital Architect. I help businesses design, structure, and scale their premium web presences. What is the name of your business or project?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialogue state tracked on frontend and sent to backend
  const [leadState, setLeadState] = useState({
    step: 'ask_business',
    data: { name: '', email: '', businessName: '', projectDetails: '', budget: '' }
  });

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    if (!textToSend) {
      setInputText('');
    }

    // Add user message
    const updatedMessages = [...messages, { sender: 'user', content: text }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          leadState
        })
      });

      if (!response.ok) throw new Error('Chatbot response error');

      const data = await response.json();

      // Append bot response and update state
      setMessages((prev) => [...prev, { sender: 'bot', content: data.reply }]);
      if (data.nextState) {
        setLeadState(data.nextState);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        { 
          sender: 'bot', 
          content: "Oops! I encountered an transmission issue. Feel free to use the main contact form at the bottom of the page or refresh to try again." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const selectQuickPrompt = (promptText) => {
    handleSendMessage(promptText);
  };

  return (
    <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 1000 }}>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, var(--accent-purple) 0%, #6f26d9 100%)',
            border: 'none',
            color: '#fff',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(161, 79, 255, 0.4), 0 0 15px rgba(0, 242, 254, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1) translateY(-3px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
        >
          <MessageSquare size={26} />
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            width: '380px',
            height: '520px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(161, 79, 255, 0.25)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 25px rgba(161, 79, 255, 0.15)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(16, 8, 30, 0.8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-cyan)',
                  boxShadow: '0 0 8px var(--accent-cyan)',
                }}
              />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Aperio Digital Bot</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead Qualification Architect</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                {msg.sender === 'bot' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(161, 79, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-purple)',
                      border: '1px solid rgba(161, 79, 255, 0.3)',
                    }}
                  >
                    <Bot size={14} />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    lineHeight: '1.4',
                    background: msg.sender === 'user' ? 'rgba(161, 79, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: msg.sender === 'user' ? '1px solid rgba(161, 79, 255, 0.3)' : '1px solid var(--glass-border)',
                    color: msg.sender === 'user' ? '#fff' : 'var(--text-bright)',
                    borderTopRightRadius: msg.sender === 'user' ? '2px' : '12px',
                    borderTopLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                  }}
                >
                  {msg.content}
                </div>
                {msg.sender === 'user' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(0, 242, 254, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(0, 242, 254, 0.3)',
                    }}
                  >
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.8rem' }}>Architect is designing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {leadState.step === 'complete' && (
            <div
              style={{
                padding: '0 20px 10px 20px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => selectQuickPrompt("Tell me about website pricing.")}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--accent-cyan)',
                  borderRadius: '15px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 242, 254, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
              >
                Pricing Structure
              </button>
              <button
                onClick={() => selectQuickPrompt("Show me details of recent works.")}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--accent-purple)',
                  borderRadius: '15px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(161, 79, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
              >
                Portfolio Info
              </button>
            </div>
          )}

          {/* Input Footer */}
          <div
            style={{
              padding: '15px 20px',
              borderTop: '1px solid var(--glass-border)',
              display: 'flex',
              gap: '10px',
              background: 'rgba(16, 8, 30, 0.9)',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--glass-border)',
                borderRadius: '24px',
                padding: '10px 16px',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(161, 79, 255, 0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              style={{
                background: 'var(--accent-purple)',
                color: '#fff',
                border: 'none',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: !inputText.trim() || isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (inputText.trim() && !isLoading) e.currentTarget.style.backgroundColor = '#6f26d9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-purple)';
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Embedded CSS animation for rotating spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
