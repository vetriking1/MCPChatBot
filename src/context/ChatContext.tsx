import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Message {
  id: string;
  type: 'human' | 'ai' | 'tool';
  content: string;
  timestamp: Date;
}

interface ChatThread {
  id: string;
  name: string;
  messages: Message[];
  lastMessage?: Date;
}

interface ChatContextType {
  threads: ChatThread[];
  currentThread: string | null;
  messages: Message[];
  models: string[];
  selectedModel: string;
  mcpServers: string[];
  isLoading: boolean;
  createNewThread: () => void;
  switchThread: (threadId: string) => void;
  sendMessage: (message: string) => Promise<void>;
  setSelectedModel: (model: string) => void;
  addMcpServer: (name: string, url: string) => Promise<void>;
  loadThreads: () => Promise<void>;
  loadModels: () => Promise<void>;
  loadMcpServers: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const API_BASE_URL = 'https://naturals-preference-seemed-evanescence.trycloudflare.com';

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThread, setCurrentThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('qwen3:1.7b');
  const [mcpServers, setMcpServers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadThreads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/threadid`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const threadData = data.thread_ids.map((id: string) => ({
        id,
        name: `Chat ${id}`,
        messages: [],
        lastMessage: new Date()
      }));
      setThreads(threadData);
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/model_list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setModels(data.model_list);
      if (data.model_list.length > 0 && !selectedModel) {
        setSelectedModel(data.model_list[0]);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadMcpServers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/server_names`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMcpServers(data.mcpserver_names);
    } catch (error) {
      console.error('Error loading MCP servers:', error);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${threadId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const loadedMessages: Message[] = [];
      
      // Combine messages from all types with proper ordering
      const humanMessages = data.Human || [];
      const aiMessages = data.AI || [];
      const toolMessages = data.Tool || [];
      
      // Simple interleaving - in practice you might want better message ordering
      const maxLength = Math.max(humanMessages.length, aiMessages.length, toolMessages.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (i < humanMessages.length) {
          loadedMessages.push({
            id: `human-${i}`,
            type: 'human',
            content: humanMessages[i],
            timestamp: new Date()
          });
        }
        if (i < aiMessages.length) {
          loadedMessages.push({
            id: `ai-${i}`,
            type: 'ai',
            content: aiMessages[i],
            timestamp: new Date()
          });
        }
        if (i < toolMessages.length) {
          loadedMessages.push({
            id: `tool-${i}`,
            type: 'tool',
            content: toolMessages[i],
            timestamp: new Date()
          });
        }
      }
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const createNewThread = () => {
    const newThreadId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newThreadId,
      name: `New Chat`,
      messages: [],
      lastMessage: new Date()
    };
    
    setThreads(prev => [newThread, ...prev]);
    setCurrentThread(newThreadId);
    setMessages([]);
  };

  const switchThread = (threadId: string) => {
    setCurrentThread(threadId);
    loadMessages(threadId);
  };

  const sendMessage = async (message: string) => {
    if (!currentThread) {
      createNewThread();
      return;
    }

    setIsLoading(true);
    
    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'human',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          user_prompt: message,
          model_name: selectedModel,
          chat_name: currentThread
        }),
      });

      if (response.ok) {
        // Reload messages to get the AI response
        await loadMessages(currentThread);
        
        // Update thread's last message time
        setThreads(prev => prev.map(thread => 
          thread.id === currentThread 
            ? { ...thread, lastMessage: new Date() }
            : thread
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMcpServer = async (name: string, url: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/add_mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          server_name: name,
          url: url
        }),
      });

      if (response.ok) {
        await loadMcpServers();
      }
    } catch (error) {
      console.error('Error adding MCP server:', error);
    }
  };

  useEffect(() => {
    loadThreads();
    loadModels();
    loadMcpServers();
  }, []);

  const value: ChatContextType = {
    threads,
    currentThread,
    messages,
    models,
    selectedModel,
    mcpServers,
    isLoading,
    createNewThread,
    switchThread,
    sendMessage,
    setSelectedModel,
    addMcpServer,
    loadThreads,
    loadModels,
    loadMcpServers
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};