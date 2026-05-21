import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/api';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/layout/Navbar';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetails from '../components/tasks/TaskDetails';
import ActivityFeed from '../components/layout/ActivityFeed';
import { Plus, ListFilter, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [filter, setFilter] = useState('all');
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToView, setTaskToView] = useState(null);
  const socket = useSocket();
  const queryClient = useQueryClient();

  // Queries
  const { data: tasksResponse, isLoading, isError } = useQuery({
    queryKey: ['tasks', activeWorkspace?._id],
    queryFn: async () => {
        const { data } = await fetchTasks(activeWorkspace?._id);
        return data.data;
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created');
      setIsModalOpen(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create task'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      queryClient.setQueryData(['tasks'], (old) => {
        return (old || []).map((t) => 
          t._id === id ? { ...t, ...data } : t
        );
      });

      return { previousTasks };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['tasks'], context.previousTasks);
      toast.error(error.response?.data?.message || 'Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onSuccess: () => {
      toast.success('Task updated');
      setIsModalOpen(false);
      setTaskToEdit(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
    },
    onError: () => toast.error('Failed to delete task'),
  });

  // Real-time Socket Integration
  useEffect(() => {
    if (socket) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo?._id) {
        socket.emit('join', userInfo._id);
      }
      
      if (activeWorkspace) {
        socket.emit('joinWorkspace', activeWorkspace._id);
      }
      
      const handleCreated = (newTask) => {
        queryClient.setQueryData(['tasks'], (old) => [newTask, ...(old || [])]);
      };
      const handleUpdated = (updatedTask) => {
        queryClient.setQueryData(['tasks'], (old) => 
          (old || []).map((t) => (t._id === updatedTask._id ? updatedTask : t))
        );
      };
      const handleDeleted = (id) => {
        queryClient.setQueryData(['tasks'], (old) => 
          (old || []).filter((t) => t._id !== id)
        );
      };

      socket.on('taskCreated', handleCreated);
      socket.on('taskUpdated', handleUpdated);
      socket.on('taskDeleted', handleDeleted);

      return () => {
        socket.off('taskCreated', handleCreated);
        socket.off('taskUpdated', handleUpdated);
        socket.off('taskDeleted', handleDeleted);
      };
    }
  }, [socket, queryClient, activeWorkspace]);

  const handleCreateOrUpdate = (formData) => {
    if (taskToEdit) {
      updateMutation.mutate({ id: taskToEdit._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, destination, source } = result;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    updateMutation.mutate({ id: draggableId, data: { status: newStatus } });
  };

  const columns = {
    pending: { title: 'Backlog', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    'in-progress': { title: 'Active', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    completed: { title: 'Finished', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  };

  const filteredTasks = useMemo(() => {
    const tasks = tasksResponse || [];
    const grouped = { pending: [], 'in-progress': [], completed: [] };
    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [tasksResponse]);

  if (isError) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-destructive/10 blur-[100px] rounded-full" />
      <div className="text-center glass p-10 rounded-3xl border border-white/5 relative z-10">
        <h2 className="text-2xl font-bold text-destructive mb-2">Systems Failure</h2>
        <p className="text-muted-foreground mb-6">We couldn't synchronize your workspace</p>
        <button 
          onClick={() => queryClient.invalidateQueries(['tasks'])} 
          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-foreground rounded-xl transition-all"
        >
          Attempt Reconnection
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-foreground selection:bg-primary/30 selection:text-white">
      <Navbar activeWorkspace={activeWorkspace} setActiveWorkspace={setActiveWorkspace} />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Workspace</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gradient">Your Workflow</h1>
            <p className="text-muted-foreground mt-3 max-w-md">Orchestrate your tasks with precision and real-time synchronization.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                <ListFilter className="h-4 w-4" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer min-w-[180px]"
              >
                <option value="all" className="bg-[#0c0c0e]">All Stages</option>
                <option value="pending" className="bg-[#0c0c0e]">Backlog</option>
                <option value="in-progress" className="bg-[#0c0c0e]">Active</option>
                <option value="completed" className="bg-[#0c0c0e]">Finished</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsModalOpen(true);
              }}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="mt-8 text-sm font-medium tracking-widest uppercase text-muted-foreground animate-pulse">Syncing environment...</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {Object.entries(columns).map(([status, config]) => (
                <div key={status} className="flex flex-col gap-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${config.bg.replace('/10', '')}`} />
                      <h2 className="font-bold tracking-tight text-lg">{config.title}</h2>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-muted-foreground">
                        {filteredTasks[status].length}
                      </span>
                    </div>
                  </div>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-[500px] p-4 rounded-[2.5rem] transition-colors duration-200 border border-dashed ${
                          snapshot.isDraggingOver ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-transparent'
                        }`}
                      >
                        <div className="flex flex-col gap-6">
                          <AnimatePresence mode="popLayout">
                            {filteredTasks[status].map((task, index) => (
                              <Draggable key={task._id} draggableId={task._id} index={index}>
                                {(provided, snapshot) => (
                                  <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`${snapshot.isDragging ? 'z-50' : ''}`}
                                  >
                                    <div className="relative group">
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded-md"
                                      >
                                        <GripVertical className="h-4 w-4" />
                                      </div>
                                      <TaskCard
                                        task={task}
                                        onEdit={(t) => {
                                          setTaskToEdit(t);
                                          setIsModalOpen(true);
                                        }}
                                        onDelete={(id) => deleteMutation.mutate(id)}
                                        onStatusChange={(id, newStatus) => updateMutation.mutate({ id, data: { status: newStatus } })}
                                        onClick={() => {
                                          setTaskToView(task);
                                          setIsDetailsOpen(true);
                                        }}
                                      />
                                    </div>
                                  </motion.div>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </main>

      <TaskForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSubmit={handleCreateOrUpdate}
        taskToEdit={taskToEdit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        activeWorkspace={activeWorkspace}
      />
      <TaskDetails
        task={taskToView}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setTaskToView(null);
        }}
      />
      <ActivityFeed socket={socket} workspaceId={activeWorkspace?._id} />
    </div>
  );
};

export default Dashboard;
