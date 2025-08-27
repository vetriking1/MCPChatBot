import React, { useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';

const ChatArea: React.FC = () => {
  const { messages, currentThread, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentThread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">🤖</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to MCP Chat</h2>
          <p className="text-gray-400 mb-6">Start a new conversation to begin chatting with AI</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
              <h3 className="font-medium text-white mb-1">📝 Ask Questions</h3>
              <p className="text-sm text-gray-400">Get help with any topic</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
              <h3 className="font-medium text-white mb-1">🔧 Use Tools</h3>
              <p className="text-sm text-gray-400">Leverage MCP server tools</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 h-full overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-gray-400">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatArea;