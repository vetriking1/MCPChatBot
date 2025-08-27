import React, { useState } from 'react';
import { PlusIcon, SettingsIcon, MessageSquareIcon, ChevronLeftIcon, ServerIcon } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import SettingsModal from './SettingsModal';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { threads, currentThread, createNewThread, switchThread } = useChat();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className={`bg-gray-950 transition-all duration-300 ease-in-out ${isOpen ? 'w-80' : 'w-0'} overflow-hidden border-r border-gray-800`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ServerIcon className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  MCP Chat
                </h1>
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={createNewThread}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Recent Chats</h2>
            <div className="space-y-2">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => switchThread(thread.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-gray-800 group ${
                    currentThread === thread.id 
                      ? 'bg-blue-900/30 border border-blue-600/30' 
                      : 'hover:scale-105'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquareIcon className={`w-4 h-4 ${
                      currentThread === thread.id ? 'text-blue-400' : 'text-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${
                        currentThread === thread.id ? 'text-blue-300' : 'text-gray-300'
                      }`}>
                        {thread.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {thread.lastMessage?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <SettingsIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">Settings</span>
            </button>
          </div>
        </div>
      </div>
      
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </>
  );
};

export default Sidebar;