import { useEffect, useRef } from 'react';
import { useSubscription } from '@apollo/client';
import { SUBSCRIBE_TO_MESSAGES } from '../graphql/subscriptions';
import { User, Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { LoadingSpinner } from './LoadingSpinner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  sender_id: string;
}

interface MessageListProps {
  chatId: string;
}

export function MessageList({ chatId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data, loading, error } = useSubscription<{ messages: Message[] }>(
    SUBSCRIBE_TO_MESSAGES,
    {
      variables: { chat_id: chatId },
      skip: !chatId,
    }
  );

  const messages = data?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-red-600">
          <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load messages</p>
          <p className="text-sm opacity-75">{error.message}</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center text-gray-500 max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Start a conversation</h3>
          <p className="text-sm leading-relaxed">
            Send a message to begin chatting with the AI assistant. Ask questions, seek advice, or just have a friendly conversation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={clsx(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className={clsx(
                'max-w-[70%] rounded-2xl px-4 py-3 shadow-sm',
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-900'
              )}
            >
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </div>
              <div
                className={clsx(
                  'text-xs mt-2 opacity-75',
                  message.role === 'user' ? 'text-white/80' : 'text-gray-500'
                )}
              >
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}