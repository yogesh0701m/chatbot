import { useState } from 'react';
import { NhostProvider } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';
import { Toaster } from 'react-hot-toast';
import { nhost } from './lib/nhost';
import { apolloClient } from './lib/apollo';
import { AuthGate } from './components/AuthGate';
import { ChatList } from './components/ChatList';
import { ChatView } from './components/ChatView';
import { UserMenu } from './components/UserMenu';
import { MessageSquare, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ChatApp() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
     <motion.aside
        initial={false}
        animate={
          typeof window !== "undefined" && window.innerWidth < 1024 // lg breakpoint check
            ? { x: isSidebarOpen ? 0 : "-100%" } // mobile mai slide karega
            : {} // desktop mai no animation
        }
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col lg:translate-x-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-gray-900">ChatBot AI</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 min-h-0">
          <ChatList
            selectedChatId={selectedChatId}
            onChatSelect={(chatId) => {
              setSelectedChatId(chatId);
              setIsSidebarOpen(false);
            }}
          />
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200/50">
          <UserMenu />
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">ChatBot AI</span>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Chat View */}
        <div className="flex-1 min-h-0">
          <ChatView chatId={selectedChatId} />
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost} apolloClient={apolloClient}>
        <AuthGate>
          <ChatApp />
        </AuthGate>
      </NhostApolloProvider>
    </NhostProvider>
  );
}