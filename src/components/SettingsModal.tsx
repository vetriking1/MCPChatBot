import React, { useState } from 'react';
import { XIcon, ServerIcon, CpuIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useChat } from '../context/ChatContext';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { models, selectedModel, setSelectedModel, mcpServers, addMcpServer } = useChat();
  const [activeTab, setActiveTab] = useState<'models' | 'servers'>('models');
  const [newServerName, setNewServerName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [isAddingServer, setIsAddingServer] = useState(false);

  const handleAddServer = async () => {
    if (newServerName.trim() && newServerUrl.trim()) {
      setIsAddingServer(true);
      try {
        await addMcpServer(newServerName.trim(), newServerUrl.trim());
        setNewServerName('');
        setNewServerUrl('');
      } catch (error) {
        console.error('Error adding server:', error);
      } finally {
        setIsAddingServer(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('models')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'models'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-950/30'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CpuIcon className="w-4 h-4" />
              <span>Models</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('servers')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'servers'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-950/30'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <ServerIcon className="w-4 h-4" />
              <span>MCP Servers</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'models' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Available Models</h3>
              <div className="grid gap-3">
                {models.map((model) => (
                  <label
                    key={model}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedModel === model
                        ? 'border-blue-500 bg-blue-950/30'
                        : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                    }`}
                  >
                    <input
                      type="radio"
                      value={model}
                      checked={selectedModel === model}
                      onChange={() => setSelectedModel(model)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedModel === model
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-600'
                      }`}>
                        {selectedModel === model && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{model}</p>
                        <p className="text-sm text-gray-400">Ollama Model</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'servers' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">MCP Servers</h3>
                <div className="space-y-3">
                  {mcpServers.map((server) => (
                    <div
                      key={server}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <ServerIcon className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">{server}</p>
                          <p className="text-sm text-gray-400">Active Server</p>
                        </div>
                      </div>
                      <button className="p-2 text-red-400 hover:bg-red-950/30 rounded-lg transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h4 className="text-md font-semibold text-white mb-4">Add New Server</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Server Name
                    </label>
                    <input
                      type="text"
                      value={newServerName}
                      onChange={(e) => setNewServerName(e.target.value)}
                      placeholder="Enter server name"
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Server URL
                    </label>
                    <input
                      type="url"
                      value={newServerUrl}
                      onChange={(e) => setNewServerUrl(e.target.value)}
                      placeholder="Enter server URL"
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddServer}
                    disabled={!newServerName.trim() || !newServerUrl.trim() || isAddingServer}
                    className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg transition-all ${
                      !newServerName.trim() || !newServerUrl.trim() || isAddingServer
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                    }`}
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>{isAddingServer ? 'Adding...' : 'Add Server'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;