import { motion } from 'framer-motion';
import { ArrowLeft, User } from 'lucide-react';

interface TopBarProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  userName?: string;
}

export default function TopBar({ title, showBackButton = false, onBack, userName = 'User' }: TopBarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>
          )}
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full">
            <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              <User size={12} className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">{userName}</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}