import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_USER_MESSAGE, SEND_MESSAGE_ACTION } from '../graphql/mutations';
import { Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface MessageInputProps {
  chatId: string;
  disabled?: boolean;
}

export function MessageInput({ chatId, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [sendUserMessage] = useMutation(SEND_USER_MESSAGE, {
    onError: (error) => {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    },
  });

  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION, {
    onError: (error) => {
      console.error('Action error:', error);
      toast.error('Failed to get AI response');
      setIsGenerating(false);
    },
    onCompleted: () => {
      setIsGenerating(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled || isGenerating) return;

    const messageContent = message.trim();
    setMessage('');
    setIsGenerating(true);

    try {
      // First, send the user message
      await sendUserMessage({
        variables: {
          chat_id: chatId,
          content: messageContent,
        },
      });

      // Then trigger the AI response action
      await sendMessageAction({
        variables: {
          chat_id: chatId,
          content: messageContent,
        },
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200/50 bg-white/70 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isGenerating ? 'AI is thinking...' : 'Type your message...'}
            disabled={disabled || isGenerating}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            rows={1}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              height: 'auto',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
        </div>
        
        <motion.button
          type="submit"
          disabled={!message.trim() || disabled || isGenerating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </form>
      
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 text-sm text-gray-500"
        >
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          AI is generating a response...
        </motion.div>
      )}
    </div>
  );
}