import React, { useState, useEffect, useCallback } from 'react';
import { Reminder } from './types';
import { SmartInput } from './components/SmartInput';
import { ReminderItem } from './components/ReminderItem';
import { Bell, BellOff, ListTodo, CheckCircle2 } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';

const App: React.FC = () => {
  // Load from local storage
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    Notification.permission
  );

  // Save to local storage whenever reminders change
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  // Check for due reminders every 10 seconds
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      
      setReminders(prevReminders => {
        let hasChanges = false;
        
        const updatedReminders = prevReminders.map(reminder => {
          if (reminder.completed || reminder.notified) return reminder;

          const reminderDate = parseISO(reminder.dateTime);
          
          // Trigger if time has passed
          if (isPast(reminderDate)) {
            // Send notification
            if (notificationPermission === 'granted') {
              new Notification("Reminder Due!", {
                body: reminder.title,
                icon: '/vite.svg' // Fallback icon
              });
            } else {
              // Fallback audio or alert could go here
              console.log("Notification: ", reminder.title);
            }
            
            hasChanges = true;
            return { ...reminder, notified: true };
          }
          return reminder;
        });

        return hasChanges ? updatedReminders : prevReminders;
      });
    }, 10000); // Check every 10s

    return () => clearInterval(checkInterval);
  }, [notificationPermission]);

  const addReminder = (title: string, dateTime: string, category: Reminder['category'] = 'personal') => {
    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      title,
      dateTime,
      completed: false,
      notified: false,
      category
    };
    // Add to top of list
    setReminders(prev => [newReminder, ...prev]);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    // Incomplete first
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Then by date
    return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
  });

  const pendingCount = reminders.filter(r => !r.completed).length;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-white/50 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <header className="bg-white/80 border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="text-indigo-600" />
              Mindful Reminders
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              You have {pendingCount} pending {pendingCount === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {notificationPermission === 'granted' ? (
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-full" title="Notifications Enabled">
                <Bell size={20} />
              </span>
            ) : (
               <button 
                onClick={() => Notification.requestPermission().then(setNotificationPermission)}
                className="p-2 bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-full transition-colors"
                title="Enable Notifications"
               >
                <BellOff size={20} />
               </button>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Input Section */}
          <section>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 px-1">New Reminder</h2>
            <SmartInput onAdd={addReminder} />
          </section>

          {/* List Section */}
          <section>
             <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 px-1 flex items-center justify-between">
                <span>Upcoming</span>
                <ListTodo size={16} />
             </h2>
             
             {sortedReminders.length === 0 ? (
               <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200">
                 <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-3">
                    <ListTodo size={32} />
                 </div>
                 <h3 className="text-slate-600 font-medium">No reminders yet</h3>
                 <p className="text-slate-400 text-sm mt-1">Use the smart input above to add one!</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {sortedReminders.map(reminder => (
                   <ReminderItem 
                     key={reminder.id}
                     reminder={reminder}
                     onToggle={toggleReminder}
                     onDelete={deleteReminder}
                   />
                 ))}
               </div>
             )}
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
                Powered by Gemini 2.5 Flash • React • Tailwind
            </p>
        </div>

      </div>
    </div>
  );
};

export default App;
