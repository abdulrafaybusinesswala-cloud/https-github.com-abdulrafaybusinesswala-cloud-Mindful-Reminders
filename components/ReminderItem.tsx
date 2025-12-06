import React from 'react';
import { Reminder } from '../types';
import { Check, Trash2, Clock, Calendar, AlertCircle } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

interface ReminderItemProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const CategoryBadge: React.FC<{ category?: string }> = ({ category }) => {
  if (!category) return null;
  
  const colors: Record<string, string> = {
    work: 'bg-blue-100 text-blue-700 border-blue-200',
    personal: 'bg-purple-100 text-purple-700 border-purple-200',
    urgent: 'bg-red-100 text-red-700 border-red-200',
    health: 'bg-green-100 text-green-700 border-green-200',
  };

  const style = colors[category] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${style} font-medium capitalize`}>
      {category}
    </span>
  );
};

export const ReminderItem: React.FC<ReminderItemProps> = ({ reminder, onToggle, onDelete }) => {
  const date = parseISO(reminder.dateTime);
  const isOverdue = isPast(date) && !reminder.completed;

  return (
    <div className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
      reminder.completed 
        ? 'bg-slate-50 border-slate-100 opacity-60' 
        : isOverdue 
          ? 'bg-white border-red-200 shadow-sm' 
          : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <button
        onClick={() => onToggle(reminder.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          reminder.completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-300 text-transparent hover:border-emerald-500'
        }`}
        aria-label={reminder.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        <Check size={14} strokeWidth={3} />
      </button>

      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium truncate ${reminder.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
            {reminder.title}
            </h3>
            <CategoryBadge category={reminder.category} />
        </div>
        
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
             {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
             <span>{format(date, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
             <Clock size={12} />
             <span>{format(date, 'h:mm a')}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(reminder.id)}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete reminder"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};
