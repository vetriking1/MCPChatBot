import React from 'react';
import { UserIcon, BotIcon, WrenchIcon } from 'lucide-react';

interface Message {
  id: string;
  type: 'human' | 'ai' | 'tool';
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'human';
  const isAI = message.type === 'ai';
  const isTool = message.type === 'tool';

  const getIcon = () => {
    if (isUser) return <UserIcon className="w-4 h-4" />;
    if (isAI) return <BotIcon className="w-4 h-4" />;
    return <WrenchIcon className="w-4 h-4" />;
  };

  const getBgColor = () => {
    if (isUser) return 'bg-blue-600';
    if (isAI) return 'bg-gray-700';
    return 'bg-purple-600';
  };

  const getTextColor = () => {
    if (isUser) return 'text-white';
    if (isAI) return 'text-gray-100';
    return 'text-white';
  };

  const getAlignment = () => {
    return isUser ? 'justify-end' : 'justify-start';
  };

  return (
    <div className={`flex ${getAlignment()} animate-fade-in`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${getBgColor()} rounded-2xl px-4 py-3 shadow-lg`}>
        <div className="flex items-center space-x-2 mb-1">
          <div className={`${getTextColor()} opacity-70`}>
            {getIcon()}
          </div>
          <span className={`text-xs ${getTextColor()} opacity-70 font-medium capitalize`}>
            {message.type === 'human' ? 'You' : message.type === 'ai' ? 'Assistant' : 'Tool'}
          </span>
        </div>
        <p className={`${getTextColor()} text-sm leading-relaxed whitespace-pre-wrap`}>
          {message.content}
        </p>
        <div className={`text-xs ${getTextColor()} opacity-50 mt-2`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;