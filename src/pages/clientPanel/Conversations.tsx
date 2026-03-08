import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/instance';

interface Message {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string | number;
  client_id: number;
  visitor_id: string;
  status: 'active' | 'closed';
  created_at: string;
}

interface PaginationInfo {
  current_page: number;
  total_count: number;
  total_pages: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
}

const Conversations: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Apply client-side filtering and pagination
    let filtered = allConversations;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(conv => conv.status === filterStatus);
    }

    const start = (currentPage - 1) * 20;
    const end = start + 20;
    const paginatedConvs = filtered.slice(start, end);

    setConversations(paginatedConvs);
    setPagination({
      current_page: currentPage,
      total_count: filtered.length,
      total_pages: Math.ceil(filtered.length / 20),
      limit: 20,
      has_next: end < filtered.length,
      has_previous: currentPage > 1
    });
  }, [allConversations, filterStatus, currentPage]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Fetch all conversations for this client
      const response = await axiosInstance.get(`/client/conversations`);
      
      if (response.data.conversations && Array.isArray(response.data.conversations)) {
        // Sort conversations by created_at in descending order (most recent first)
        const sorted = [...response.data.conversations].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setAllConversations(sorted);
        setError(null);
      } else {
        setAllConversations([]);
        setError('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again.');
      setAllConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (conversationId: string | number) => {
    try {
      setLoadingMessages(true);
      console.log(`Fetching messages for conversation ID: ${conversationId}`);
      
      const response = await axiosInstance.get(`/chat/history/${conversationId}`);
      
      // Handle successful response - API returns { conversationId, visitorId, status, messages }
      if (response.data && response.data.messages !== undefined) {
        const msgs = Array.isArray(response.data.messages) ? response.data.messages : [];
        console.log(`Fetched ${msgs.length} messages for conversation ${conversationId}`);
        setMessages(msgs);
        setError(null);
      } else {
        console.warn('Unexpected response format:', response.data);
        setMessages([]);
      }
    } catch (err: any) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, err);
      
      // Log backend error details for debugging
      if (err.response?.data) {
        console.error('Backend error:', err.response.data);
      }
      
      // Check for specific error codes
      if (err.response?.status === 404) {
        setError('Conversation not found. Please refresh and try again.');
      } else if (err.response?.status === 403) {
        setError('You do not have access to this conversation.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to load conversation messages.');
      }
      
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    fetchConversationMessages(conversation.id);
  };

  const handleFilterChange = (status: 'all' | 'active' | 'closed') => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="gap-5 pb-20">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-text-primary font-heading text-3xl font-bold">
          Conversations
        </h1>
        <p className="text-text-secondary font-body text-sm mt-1">
          View and manage all conversations with your website visitors
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-bold text-text-primary font-heading">
                All Conversations
              </h2>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    filterStatus === 'all'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange('active')}
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    filterStatus === 'active'
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleFilterChange('closed')}
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    filterStatus === 'closed'
                      ? 'bg-gray-200 text-gray-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>

            {/* Conversations List */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-text-secondary text-sm">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-text-secondary text-sm">No conversations found</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                <div className="divide-y divide-[var(--color-border)]">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full px-6 py-3 text-left transition-colors hover:bg-bg-light ${
                        selectedConversation?.id === conv.id
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {conv.visitor_id.substring(0, 16)}...
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-text-secondary">
                              {formatDate(conv.created_at)}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ml-2 whitespace-nowrap ${
                          conv.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {conv.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Stats & Pagination */}
            <div className="px-4 py-3 border-t border-[var(--color-border)] bg-white">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-text-secondary truncate">
                  {pagination ? `${pagination.total_count} total` : '0'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={!pagination || !pagination.has_previous}
                    className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
                    title="Previous page"
                  >
                    ←
                  </button>
                  <div className="px-2 py-1 bg-gray-50 rounded border border-gray-200 text-center">
                    <span className="text-xs font-semibold text-gray-700">
                      {pagination ? `${pagination.current_page}/${pagination.total_pages}` : '-'}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!pagination || !pagination.has_next}
                    className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
                    title="Next page"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden flex flex-col h-[600px]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[var(--color-border)] bg-bg-light">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary font-heading">
                      Conversation
                    </h2>
                    <p className="text-sm text-text-secondary mt-1">
                      Visitor: {selectedConversation.visitor_id}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Started: {new Date(selectedConversation.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedConversation.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedConversation.status}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-text-secondary text-sm">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-text-secondary text-sm">No messages in this conversation</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
                          msg.role === 'user'
                            ? 'text-white rounded-br-none'
                            : 'bg-gray-100 text-text-primary rounded-bl-none'
                        }`}
                        style={msg.role === 'user' ? { backgroundColor: 'var(--color-primary)' } : {}}
                      >
                        <p className="break-words">{msg.content}</p>
                        <p className={`text-xs mt-2 ${
                          msg.role === 'user' ? 'text-blue-100' : 'text-text-secondary'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[var(--color-border)] rounded-lg h-[600px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-text-secondary text-lg">
                  Select a conversation to view messages
                </p>
                <p className="text-text-secondary text-sm mt-2">
                  Choose from the list on the left
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;
