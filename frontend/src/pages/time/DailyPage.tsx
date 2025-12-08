import React, { useState } from 'react';
import { 
  Plus, 
  Star, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Circle, 
  CheckCircle2, 
  X,
  Sun,
  Bell,
  RefreshCw,
  Tag,
  Paperclip,
  Trash2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface Step {
  id: number;
  text: string;
  completed: boolean;
}

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  importance: 'normal' | 'medium' | 'high';
  completed: boolean;
  category: string;
  steps: Step[];
  createdAt?: string;
  assignedTo?: string;
}

interface Category {
  name: string;
  color: string;
}

interface Categories {
  [key: string]: Category;
}

interface ExpandedCategories {
  [key: string]: boolean;
}

const DailyPage = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Planes de Pago - Acuerdos de pago vigentes - Crear CRUD',
      description: '',
      dueDate: '',
      importance: 'normal',
      completed: false,
      category: 'desarrollo',
      steps: [],
      createdAt: new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' }),
      assignedTo: 'Usuario'
    },
    {
      id: 2,
      title: 'Integraciones de API - Crear API Financiero',
      description: '',
      dueDate: '',
      importance: 'high',
      completed: false,
      category: 'api',
      steps: [],
      createdAt: new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' }),
      assignedTo: 'Usuario'
    }
  ]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<ExpandedCategories>({
    desarrollo: true,
    api: true,
    configuracion: true
  });

  const [showCompleted, setShowCompleted] = useState(true);

  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed'>>({
    title: '',
    description: '',
    dueDate: '',
    importance: 'normal',
    category: 'desarrollo',
    steps: []
  });

  const categories: Categories = {
    desarrollo: { name: 'Desarrollo', color: 'bg-blue-500' },
    api: { name: 'API', color: 'bg-purple-500' },
    configuracion: { name: 'Configuración', color: 'bg-orange-500' }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const addTask = () => {
    if (newTask.title.trim()) {
      setTasks([...tasks, {
        ...newTask,
        id: Date.now(),
        completed: false,
        steps: [],
        createdAt: new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' }),
        assignedTo: 'Usuario'
      }]);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        importance: 'normal',
        category: 'desarrollo',
        steps: []
      });
      setShowNewTaskDialog(false);
    }
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setSelectedTask(null);
  };

  const toggleTaskComplete = (taskId: number) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, completed: !selectedTask.completed });
    }
  };

  const toggleImportance = () => {
    if (selectedTask) {
      const newImportance = selectedTask.importance === 'high' ? 'normal' : 'high';
      updateTask({ ...selectedTask, importance: newImportance });
    }
  };

  const addStep = () => {
    if (selectedTask) {
      const updatedTask: Task = {
        ...selectedTask,
        steps: [...selectedTask.steps, { id: Date.now(), text: '', completed: false }]
      };
      updateTask(updatedTask);
    }
  };

  const updateStep = (stepId: number, text: string) => {
    if (selectedTask) {
      const updatedTask: Task = {
        ...selectedTask,
        steps: selectedTask.steps.map(s => s.id === stepId ? { ...s, text } : s)
      };
      updateTask(updatedTask);
    }
  };

  const toggleStepComplete = (stepId: number) => {
    if (selectedTask) {
      const updatedTask: Task = {
        ...selectedTask,
        steps: selectedTask.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
      };
      updateTask(updatedTask);
    }
  };

  const deleteStep = (stepId: number) => {
    if (selectedTask) {
      const updatedTask: Task = {
        ...selectedTask,
        steps: selectedTask.steps.filter(s => s.id !== stepId)
      };
      updateTask(updatedTask);
    }
  };

  const getTasksByCategory = (category: string) => {
    return tasks.filter(t => t.category === category && !t.completed);
  };

  const getCompletedTasks = () => {
    return tasks.filter(t => t.completed);
  };

  const ImportanceIcon = ({ level }: { level: string }) => {
    if (level === 'high') return <Star className="w-4 h-4 fill-blue-500 text-blue-500" />;
    if (level === 'medium') return <Star className="w-4 h-4 fill-blue-500 text-blue-500 opacity-50" />;
    return <Star className="w-4 h-4 text-muted-foreground" />;
  };

  // Action Item Component for the detail panel
  const ActionItem = ({ 
    icon, 
    label, 
    onClick, 
    active = false,
    rightContent
  }: { 
    icon: React.ReactNode; 
    label: string; 
    onClick?: () => void;
    active?: boolean;
    rightContent?: React.ReactNode;
  }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${active ? 'text-blue-500' : 'text-foreground'}`}
    >
      <span className={active ? 'text-blue-500' : 'text-muted-foreground'}>{icon}</span>
      <span className="flex-1 text-sm">{label}</span>
      {rightContent}
    </button>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Implementación y fin UCE</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <span className="text-sm">Ordenar</span>
            </Button>
            <Button variant="outline" size="sm">
              <span className="text-sm">Grupo</span>
            </Button>
          </div>
        </div>

        <Button 
          onClick={() => setShowNewTaskDialog(true)}
          variant="ghost" 
          className="text-blue-500 hover:text-blue-600 mb-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar una tarea
        </Button>

        <div className="bg-card rounded-lg shadow-sm border border-border">
          {Object.entries(categories).map(([key, category]) => {
            const categoryTasks = getTasksByCategory(key);
            if (categoryTasks.length === 0) return null;

            return (
              <div key={key} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => toggleCategory(key)}
                  className="w-full flex items-center gap-2 p-4 hover:bg-muted/50 transition-colors"
                >
                  {expandedCategories[key] ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{categoryTasks.length}</span>
                </button>

                {expandedCategories[key] && (
                  <div>
                    {categoryTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-t border-border ${selectedTask?.id === task.id ? 'bg-muted/50' : ''}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(task.id);
                          }}
                          className="flex-shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground hover:text-blue-500" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {task.dueDate}
                            </span>
                          )}
                          <ImportanceIcon level={task.importance} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {getCompletedTasks().length > 0 && (
          <div className="bg-card rounded-lg shadow-sm border border-border mt-6">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full flex items-center gap-2 p-4 hover:bg-muted/50 transition-colors"
            >
              {showCompleted ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground">Completado</span>
              <span className="text-sm text-muted-foreground">{getCompletedTasks().length}</span>
            </button>

            {showCompleted && (
              <div>
                {getCompletedTasks().map(task => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-t border-border ${selectedTask?.id === task.id ? 'bg-muted/50' : ''}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                      className="flex-shrink-0"
                    >
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-through text-muted-foreground">
                        {task.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                      )}
                      <ImportanceIcon level={task.importance} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Task Dialog */}
        <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Tarea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Input
                  placeholder="Título de la tarea"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Descripción (opcional)"
                  value={newTask.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Select value={newTask.importance} onValueChange={(value: 'normal' | 'medium' | 'high') => setNewTask({ ...newTask, importance: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="medium">Medio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addTask} className="w-full bg-blue-500 hover:bg-blue-600">
                Agregar Tarea
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Task Detail Panel - Microsoft To-Do Style */}
        <Dialog open={selectedTask !== null} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent 
            className="!fixed !right-0 !top-0 !left-auto !translate-x-0 !translate-y-0 h-screen max-w-md w-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300 !rounded-none border-l !p-0 !gap-0"
            showCloseButton={false}
          >
            {selectedTask && (
              <div className="flex flex-col h-full">
                {/* Header - Task Title with checkbox and star */}
                <div className="flex items-start gap-3 p-4 border-b border-border">
                  <button
                    onClick={() => toggleTaskComplete(selectedTask.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    {selectedTask.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground hover:text-blue-500" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <Textarea
                      value={selectedTask.title}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateTask({ ...selectedTask, title: e.target.value })}
                      className={`w-full text-base font-medium border-none p-0 resize-none bg-transparent focus-visible:ring-0 ${selectedTask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                      rows={2}
                    />
                  </div>

                  <button
                    onClick={toggleImportance}
                    className="flex-shrink-0 mt-1"
                  >
                    {selectedTask.importance === 'high' ? (
                      <Star className="w-5 h-5 fill-blue-500 text-blue-500" />
                    ) : (
                      <Star className="w-5 h-5 text-muted-foreground hover:text-blue-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedTask(null)}
                    className="flex-shrink-0 mt-1 p-1 hover:bg-muted rounded"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  {/* Steps Section */}
                  <div className="border-b border-border">
                    {selectedTask.steps.map(step => (
                      <div key={step.id} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30">
                        <button
                          onClick={() => toggleStepComplete(step.id)}
                          className="flex-shrink-0"
                        >
                          {step.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground hover:text-blue-500" />
                          )}
                        </button>
                        <input
                          type="text"
                          value={step.text}
                          onChange={(e) => updateStep(step.id, e.target.value)}
                          placeholder="Describe el paso..."
                          className={`flex-1 bg-transparent border-none outline-none text-sm ${step.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                        />
                        <button
                          onClick={() => deleteStep(step.id)}
                          className="flex-shrink-0 p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add Step Button */}
                    <button 
                      onClick={addStep}
                      className="w-full flex items-center gap-3 px-4 py-3 text-blue-500 hover:bg-muted/30 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-sm">Paso siguiente</span>
                    </button>
                  </div>

                  {/* Action Items */}
                  <div className="border-b border-border">
                    <ActionItem 
                      icon={<Sun className="w-5 h-5" />} 
                      label="Agregar a Mi día"
                    />
                    <ActionItem 
                      icon={<Bell className="w-5 h-5" />} 
                      label="Recordarme"
                    />
                    <ActionItem 
                      icon={<Calendar className="w-5 h-5" />} 
                      label={selectedTask.dueDate || "Agregar fecha de vencimiento"}
                      active={!!selectedTask.dueDate}
                      rightContent={
                        !selectedTask.dueDate && (
                          <input
                            type="date"
                            className="absolute opacity-0 w-full h-full cursor-pointer"
                            onChange={(e) => updateTask({ ...selectedTask, dueDate: e.target.value })}
                          />
                        )
                      }
                    />
                    <ActionItem 
                      icon={<RefreshCw className="w-5 h-5" />} 
                      label="Repetir"
                    />
                  </div>

                  {/* Assigned User */}
                  <div className="border-b border-border">
                    <ActionItem 
                      icon={
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium">
                          {selectedTask.assignedTo?.charAt(0) || 'U'}
                        </div>
                      } 
                      label={selectedTask.assignedTo || "Usuario"}
                    />
                  </div>

                  {/* Category */}
                  <div className="border-b border-border">
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3 mb-2">
                        <Tag className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-foreground">Elige una categoría</span>
                      </div>
                      <Select 
                        value={selectedTask.category} 
                        onValueChange={(value) => updateTask({ ...selectedTask, category: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categories).map(([key, cat]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                                {cat.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Add File */}
                  <div className="border-b border-border">
                    <ActionItem 
                      icon={<Paperclip className="w-5 h-5" />} 
                      label="Agregar archivo"
                    />
                  </div>

                  {/* Notes/Description */}
                  <div className="p-4">
                    <Textarea
                      value={selectedTask.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateTask({ ...selectedTask, description: e.target.value })}
                      placeholder="Agregar nota..."
                      className="w-full min-h-[100px] text-sm resize-none"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Creada el {selectedTask.createdAt}</span>
                  </div>
                  <button
                    onClick={() => deleteTask(selectedTask.id)}
                    className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DailyPage;
