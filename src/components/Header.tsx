import React from 'react';
import { MenuIcon, BotIcon } from 'lucide-react';
import { useChat } from '../context/ChatContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { selectedModel, isLoading } = useChat();

  return (
    <header className="bg-gray-950 border-b border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <BotIcon className={`w-8 h-8 text-blue-400 ${isLoading ? 'animate-pulse' : ''}`} />
              {isLoading && (
                <div className="absolute -inset-1 border-2 border-blue-400 rounded-full animate-spin border-t-transparent"></div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">AI Assistant</h1>
              <p className="text-sm text-gray-400">Model: {selectedModel}</p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;