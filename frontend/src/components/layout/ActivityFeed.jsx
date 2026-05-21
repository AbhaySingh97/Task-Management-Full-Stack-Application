import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const ActivityFeed = ({ socket }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (socket) {
      const handleActivity = (type, data) => {
        const newActivity = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          data,
          timestamp: new Date(),
        };
        setActivities(prev => [newActivity, ...prev].slice(0, 20));
      };

      socket.on('taskCreated', (task) => handleActivity('created', task));
      socket.on('taskUpdated', (task) => handleActivity('updated', task));
      socket.on('taskDeleted', (id) => handleActivity('deleted', { _id: id }));

      return () => {
        socket.off('taskCreated');
        socket.off('taskUpdated');
        socket.off('taskDeleted');
      };
    }
  }, [socket]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created': return <Plus className="h-4 w-4 text-emerald-500" />;
      case 'updated': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'deleted': return <Trash2 className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  const getActivityText = (activity) => {
    const { type, data } = activity;
    switch (type) {
      case 'created': return `New task: ${data.title}`;
      case 'updated': return `Updated: ${data.title}`;
      case 'deleted': return `A task was removed`;
      default: return 'System activity';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-primary/20 backdrop-blur-md border border-r-0 border-white/10 p-3 rounded-l-2xl hover:bg-primary/30 transition-all z-40 group"
      >
        <Activity className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 glass border-l border-white/10 z-[60] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <h2 className="font-bold tracking-tight">Activity Feed</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {activities.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <Activity className="h-12 w-12 mb-4 stroke-[1]" />
                    <p className="text-xs font-medium uppercase tracking-widest">Watching for signals...</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 group">
                      <div className="mt-1 flex-shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-tight mb-1 truncate group-hover:text-clip group-hover:whitespace-normal">
                          {getActivityText(activity)}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                          {format(activity.timestamp, 'HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ActivityFeed;
