import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Bot, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatViewProps {
  chatId: string | null;
}

export function ChatView({ chatId }: ChatViewProps) {
  if (!chatId) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50/50 to-white/50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-lg">
            <Bot className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to ChatBot AI
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Select a chat from the sidebar to start a conversation, or create a new chat to begin exploring the possibilities with AI.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Settings className="w-4 h-4" />
            <span>Powered by advanced AI technology</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50/30 to-white/30">
      <div className="flex-1 min-h-0">
        <MessageList chatId={chatId} />
      </div>
      <MessageInput chatId={chatId} />
    </div>
  );
}