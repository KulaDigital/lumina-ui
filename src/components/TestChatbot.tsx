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

    // Add user message to chat
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

      // Make test API call
      const response = await axiosInstance.post('/search/test', {
        query: inputValue,
      }, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      // Handle response
      let assistantReply = '';
      if (response.data.response) {
        // Use the response field from the API
        assistantReply = response.data.response;
      } else if (response.data.results && response.data.results.length > 0) {
        // Format the results as a response
        assistantReply = response.data.results
          .map((result: any) => result.text || result.content || result)
          .join('\n\n---\n\n');
      } else if (response.data.chunks && response.data.chunks.length > 0) {
        // Fallback for chunks format
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
      
      // Add error message to chat
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
    <div className="flex flex-col w-full h-screen bg-white overflow-hidden">
      {/* Header */}
      <div 
        className="text-white px-8 py-6 flex justify-between items-center border-b border-opacity-10"
        style={{ background: 'var(--color-secondary)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-white hover:opacity-75 transition-opacity p-2 hover:bg-white/10 rounded"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-2xl">Test Your Chatbot</h1>
          <p className="text-sm opacity-90 mt-1">Ask a question to preview how your widget responds</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-bg-light">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xl px-5 py-4 rounded-[var(--radius-md)] ${
                message.type === 'user'
                  ? 'text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}
              style={message.type === 'user' ? { background: 'var(--color-primary)' } : undefined}
            >
              <p className="text-base whitespace-pre-wrap break-words">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-gray-200' : 'text-gray-600'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-5 py-4 rounded-lg rounded-bl-none">
              <div className="flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-gray-600 animate-bounce" />
                <div className="w-3 h-3 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-3 h-3 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-8 py-3 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border px-8 py-6 bg-white">
        <div className="flex gap-4 max-w-4xl">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            placeholder="Ask your question here..."
            className="flex-1 px-4 py-3 border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
            className="px-6 py-3 text-white bg-primary rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M16.828 9.172a6 6 0 010 8.485m2.828-10.313a8 8 0 010 12.728M6.343 3.515a8 8 0 0110.314 10.314M3.515 6.343a6 6 0 018.485 8.485" />
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
  );
};

export default TestChatbot;
