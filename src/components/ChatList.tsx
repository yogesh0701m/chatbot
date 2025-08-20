import { useState } from 'react';
import { useSubscription, useMutation } from '@apollo/client';
import { SUBSCRIBE_TO_CHATS } from '../graphql/subscriptions';
import { CREATE_CHAT, DELETE_CHAT } from '../graphql/mutations';
import { Plus, MessageSquare, Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface Chat {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
  

}

interface ChatListProps {
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

export function ChatList({ selectedChatId, onChatSelect }: ChatListProps) {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const { data, loading, error } = useSubscription<{ chats: Chat[] }>(SUBSCRIBE_TO_CHATS);
  const [createChat] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      onChatSelect(data.insert_chats_one.id);
      toast.success('New chat created');
    },
    onError: (error) => {
      console.error('Create chat error:', error);
      toast.error('Failed to create chat');
    },
  });
  const [deleteChat] = useMutation(DELETE_CHAT, {
    onCompleted: () => {
      toast.success('Chat deleted');
      setShowDropdown(null);
    },
    onError: (error) => {
      console.error('Delete chat error:', error);
      toast.error('Failed to delete chat');
    },
  });

  const chats = data?.chats || [];

  const handleCreateChat = async () => {
    try {
      await createChat({
        variables: { title: 'New Chat' },
      });
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat({
        variables: { chat_id: chatId },
      });
      if (selectedChatId === chatId) {
        onChatSelect('');
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-red-600">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load chats</p>
          <p className="text-sm opacity-75">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        <h2 className="font-semibold text-gray-900">Chats</h2>
        <button
          onClick={handleCreateChat}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-16 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">No chats yet</p>
              <p className="text-sm">Create your first chat to get started</p>
            </div>
          </div>
        ) : (
          <div className="p-2">
            <AnimatePresence>
              {chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <button
                    onClick={() => onChatSelect(chat.id)}
                    className={clsx(
                      'w-full text-left p-4 rounded-xl transition-all duration-200 group relative',
                      selectedChatId === chat.id
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-md'
                        : 'hover:bg-gray-50/70 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={clsx(
                          'font-medium text-sm truncate mb-1',
                          selectedChatId === chat.id ? 'text-blue-900' : 'text-gray-900'
                        )}>
                          {chat.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(showDropdown === chat.id ? null : chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-md transition-all duration-200"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showDropdown === chat.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}