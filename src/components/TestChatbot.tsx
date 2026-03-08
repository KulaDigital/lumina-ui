import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/instance';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TestChatbotProps {
  apiKey: string | null;
}

const TestChatbot: React.FC<TestChatbotProps> = ({ apiKey }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your test chatbot. Ask me anything about your knowledge base to test how your widget will respond.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      if (!apiKey) {
        throw new Error('API key not found. Please refresh the page and try again.');
      }

      const response = await axiosInstance.post('/search/test', {
        query: inputValue,
      }, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      let assistantReply = '';
      if (response.data.response) {
        assistantReply = response.data.response;
      } else if (response.data.results && response.data.results.length > 0) {
        assistantReply = response.data.results
          .map((result: any) => result.text || result.content || result)
          .join('\n\n---\n\n');
      } else if (response.data.chunks && response.data.chunks.length > 0) {
        assistantReply = response.data.chunks
          .map((chunk: any) => chunk.content || chunk.text || chunk)
          .join('\n\n');
      } else if (response.data.message) {
        assistantReply = response.data.message;
      } else {
        assistantReply = 'No relevant information found in the knowledge base. Please try a different question.';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response. Please try again.';
      setError(errorMessage);

      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline"
            style={{ padding: '8px' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1>Test Your Chatbot</h1>
            <p>Ask a question to preview how your widget responds</p>
          </div>
        </div>
      </div>

      {/* Chat Card */}
      <div className="card" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <div className="card-header">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: 'var(--color-success)' }}
            />
            <span className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
              Chat Preview
            </span>
          </div>
          <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
            {messages.length - 1} messages
          </span>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: 'var(--space-lg)', background: 'var(--color-bg-light)' }}
        >
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[75%] px-4 py-3"
                  style={{
                    borderRadius: message.type === 'user'
                      ? 'var(--radius-md) var(--radius-md) var(--radius-sm) var(--radius-md)'
                      : 'var(--radius-md) var(--radius-md) var(--radius-md) var(--radius-sm)',
                    background: message.type === 'user' ? '#2563EB' : 'var(--color-bg-white)',
                    color: message.type === 'user' ? '#FFFFFF' : 'var(--color-text-primary)',
                    border: message.type === 'assistant' ? '1px solid var(--color-border)' : 'none',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <p style={{ fontSize: 'var(--text-body-size)', lineHeight: 'var(--text-body-line)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.content}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--text-xs-size)',
                      marginTop: '6px',
                      opacity: 0.7,
                      color: message.type === 'user' ? '#FFFFFF' : 'var(--color-text-secondary)',
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3"
                  style={{
                    background: 'var(--color-bg-white)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md) var(--radius-md) var(--radius-md) var(--radius-sm)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-text-secondary)', animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-text-secondary)', animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-text-secondary)', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: 'var(--space-sm) var(--space-lg)', background: 'rgba(239, 68, 68, 0.05)', borderTop: '1px solid var(--color-border)' }}>
            <p className="text-small" style={{ color: 'var(--color-error)' }}>{error}</p>
          </div>
        )}

        {/* Input */}
        <div
          style={{
            padding: 'var(--space-md) var(--space-lg)',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg-white)',
          }}
        >
          <div className="flex gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder="Ask your question here..."
              className="input flex-1"
              style={{ margin: 0 }}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
              className="btn btn-primary"
              style={{ padding: '10px 20px' }}
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestChatbot;
