import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  Circle, 
  RefreshCw,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  Clock,
  BellRing,
  Bell,
  Repeat,
  Repeat1,
  Repeat2,
  CalendarRange,
  Settings2,
  Star,
  ArrowUpDown,
  SortAsc,
  CalendarPlus,
  X,
  Check,
  Tag,
  Plus,
  Trash2,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import NewTaskDialog from './dailyPage-new-form';
import TaskDetailPanel from './dailyPage-detail-form';
import DatePickerDropdown from './DatePickerDropdown';
import ReminderPickerDropdown from './ReminderPickerDropdown';
import RepeatPickerDropdown from './RepeatPickerDropdown';
import TaskCategoryList from './TaskCategoryList';
import CompletedTasksList from './CompletedTasksList';

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
  reminder?: string; // 'later' | 'tomorrow' | 'nextweek' | 'custom' | ''
  reminderDate?: string;
  reminderTime?: string;
  repeat?: string; // 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly' | 'custom' | ''
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
      title: 'Planes de Pago - vigentes - Crear CRUD',
      description: '',
      dueDate: '',
      importance: 'normal',
      completed: false,
      category: 'nubeteck',
      steps: [],
      createdAt: new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' }),
    },
    {
      id: 2,
      title: 'Integraciones de API - Crear API Financiero',
      description: '',
      dueDate: '',
      importance: 'high',
      completed: false,
      category: 'nubeteck',
      steps: [],
      createdAt: new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' }),
    }
  ]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<ExpandedCategories>({
    outlier: true,
    nubeteck: true,
    personal: true
  });

  const [showCompleted, setShowCompleted] = useState(true);
  
  // Categories management states
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [categories, setCategories] = useState<Categories>({
    outlier: { name: 'Trabajo Outlier', color: 'bg-blue-500' },
    nubeteck: { name: 'Trabajo Nubeteck', color: 'bg-purple-500' },
    personal: { name: 'Personal', color: 'bg-green-500' }
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('bg-blue-500');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  
  // Available colors for categories
  const availableColors = [
    { name: 'Azul', value: 'bg-blue-500' },
    { name: 'Púrpura', value: 'bg-purple-500' },
    { name: 'Verde', value: 'bg-green-500' },
    { name: 'Rojo', value: 'bg-red-500' },
    { name: 'Naranja', value: 'bg-orange-500' },
    { name: 'Amarillo', value: 'bg-yellow-500' },
    { name: 'Rosa', value: 'bg-pink-500' },
    { name: 'Índigo', value: 'bg-indigo-500' },
    { name: 'Cian', value: 'bg-cyan-500' },
    { name: 'Gris', value: 'bg-gray-500' },
  ];
  
  // Sort dropdown states
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortMethod, setSortMethod] = useState<'importance' | 'dueDate' | 'alphabetical' | 'createdAt' | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // Reminder picker states
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showReminderDateTime, setShowReminderDateTime] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminderTime, setReminderTime] = useState('09:00');
  const [selectedReminder, setSelectedReminder] = useState<string>('');
  const reminderPickerRef = useRef<HTMLDivElement>(null);
  
  // Repeat picker states
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [selectedRepeat, setSelectedRepeat] = useState<string>('');
  const repeatPickerRef = useRef<HTMLDivElement>(null);

  // Task detail date picker states
  const [showTaskDatePicker, setShowTaskDatePicker] = useState(false);
  const [showTaskCalendar, setShowTaskCalendar] = useState(false);
  const [taskCalendarDate, setTaskCalendarDate] = useState(new Date());
  const taskDatePickerRef = useRef<HTMLDivElement>(null);

  // Task detail reminder picker states
  const [showTaskReminderPicker, setShowTaskReminderPicker] = useState(false);
  const [showTaskReminderDateTime, setShowTaskReminderDateTime] = useState(false);
  const [taskReminderDate, setTaskReminderDate] = useState(new Date());
  const [taskReminderTime, setTaskReminderTime] = useState('09:00');
  const [selectedTaskReminder, setSelectedTaskReminder] = useState<string>('');
  const taskReminderPickerRef = useRef<HTMLDivElement>(null);

  // Task detail repeat picker states
  const [showTaskRepeatPicker, setShowTaskRepeatPicker] = useState(false);
  const [selectedTaskRepeat, setSelectedTaskRepeat] = useState<string>('');
  const taskRepeatPickerRef = useRef<HTMLDivElement>(null);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
        setShowCalendar(false);
      }
      if (reminderPickerRef.current && !reminderPickerRef.current.contains(event.target as Node)) {
        setShowReminderPicker(false);
        setShowReminderDateTime(false);
      }
      if (repeatPickerRef.current && !repeatPickerRef.current.contains(event.target as Node)) {
        setShowRepeatPicker(false);
      }
      if (taskDatePickerRef.current && !taskDatePickerRef.current.contains(event.target as Node)) {
        setShowTaskDatePicker(false);
        setShowTaskCalendar(false);
      }
      if (taskReminderPickerRef.current && !taskReminderPickerRef.current.contains(event.target as Node)) {
        setShowTaskReminderPicker(false);
        setShowTaskReminderDateTime(false);
      }
      if (taskRepeatPickerRef.current && !taskRepeatPickerRef.current.contains(event.target as Node)) {
        setShowTaskRepeatPicker(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed'>>({
    title: '',
    description: '',
    dueDate: '',
    importance: 'normal',
    category: 'personal',
    steps: []
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Category management functions
  const addCategory = () => {
    if (newCategoryName.trim()) {
      const key = newCategoryName.toLowerCase().replace(/\s+/g, '_');
      if (!categories[key]) {
        setCategories(prev => ({
          ...prev,
          [key]: { name: newCategoryName.trim(), color: newCategoryColor }
        }));
        setExpandedCategories(prev => ({
          ...prev,
          [key]: true
        }));
        setNewCategoryName('');
        setNewCategoryColor('bg-blue-500');
      }
    }
  };

  const updateCategoryColor = (categoryKey: string, color: string) => {
    setCategories(prev => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], color }
    }));
    setEditingCategory(null);
  };

  const updateCategoryName = (categoryKey: string, newName: string) => {
    setCategories(prev => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], name: newName }
    }));
  };

  const deleteCategory = (categoryKey: string) => {
    // Check if there are tasks in this category
    const tasksInCategory = tasks.filter(t => t.category === categoryKey);
    if (tasksInCategory.length > 0) {
      // Move tasks to 'personal' or first available category
      const defaultCategory = Object.keys(categories).find(k => k !== categoryKey) || 'personal';
      setTasks(tasks.map(t => 
        t.category === categoryKey ? { ...t, category: defaultCategory } : t
      ));
    }
    
    // Remove category
    const { [categoryKey]: removed, ...rest } = categories;
    setCategories(rest);
    
    // Remove from expanded categories
    const { [categoryKey]: removedExpanded, ...restExpanded } = expandedCategories;
    setExpandedCategories(restExpanded);
  };

  const addTask = () => {
    if (newTask.title.trim()) {
      setTasks([...tasks, {
        ...newTask,
        id: Date.now(),
        completed: false,
        steps: [],
        createdAt: new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' }),
      }]);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        importance: 'normal',
        category: 'personal',
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

  const toggleTaskImportance = (taskId: number) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, importance: t.importance === 'high' ? 'normal' : 'high' } : t
    ));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, importance: selectedTask.importance === 'high' ? 'normal' : 'high' });
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
    let filteredTasks = tasks.filter(t => t.category === category && !t.completed);
    
    // Apply sorting
    if (sortMethod) {
      filteredTasks = [...filteredTasks].sort((a, b) => {
        switch (sortMethod) {
          case 'importance':
            const importanceOrder = { high: 0, medium: 1, normal: 2 };
            return importanceOrder[a.importance] - importanceOrder[b.importance];
          case 'dueDate':
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          case 'alphabetical':
            return a.title.localeCompare(b.title, 'es');
          case 'createdAt':
            if (!a.createdAt && !b.createdAt) return 0;
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return 0; // Keep original order for createdAt since we don't have timestamps
          default:
            return 0;
        }
      });
    }
    
    return filteredTasks;
  };

  const getCompletedTasks = () => {
    return tasks.filter(t => t.completed);
  };

  // Handle task selection and initialize state from task
  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    // Initialize reminder state from task
    setSelectedTaskReminder(task.reminder || '');
    if (task.reminderDate) {
      setTaskReminderDate(parseLocalDate(task.reminderDate));
    } else {
      setTaskReminderDate(new Date());
    }
    setTaskReminderTime(task.reminderTime || '09:00');
    // Initialize repeat state from task
    setSelectedTaskRepeat(task.repeat || '');
  };

  // Date helper functions
  const getDayName = (date: Date, short = true) => {
    return date.toLocaleDateString('es-ES', { weekday: short ? 'short' : 'long' }).replace('.', '');
  };

  const getToday = () => new Date();
  
  const getTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  };

  const getNextWeek = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse date string as local date (not UTC)
  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const selectQuickDate = (date: Date) => {
    setNewTask({ ...newTask, dueDate: formatDateForInput(date) });
    setShowDatePicker(false);
    setShowCalendar(false);
  };

  const selectCalendarDate = (day: number) => {
    const selectedDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    setNewTask({ ...newTask, dueDate: formatDateForInput(selectedDate) });
  };

  const saveCalendarDate = () => {
    setShowDatePicker(false);
    setShowCalendar(false);
  };

  // Task detail date picker functions
  const clearTaskDueDate = () => {
    if (selectedTask) {
      updateTask({ ...selectedTask, dueDate: '' });
    }
    setShowTaskDatePicker(false);
    setShowTaskCalendar(false);
  };

  // Get formatted label for task due date
  const getTaskDateLabel = (dueDate: string): string => {
    if (!dueDate) return "Agregar fecha de vencimiento";
    
    const selected = parseLocalDate(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    if (selected.getTime() === today.getTime()) return 'Hoy';
    if (selected.getTime() === tomorrow.getTime()) return 'Mañana';
    if (selected.getTime() === nextWeek.getTime()) return 'Semana próxima';
    
    return selected.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Get formatted label for task due date in list view
  const getTaskDateLabelForList = (dueDate: string): string => {
    if (!dueDate) return '';
    
    const selected = parseLocalDate(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (selected.getTime() === today.getTime()) return 'Hoy';
    if (selected.getTime() === tomorrow.getTime()) return 'Mañana';
    
    const dayName = selected.toLocaleDateString('es-ES', { weekday: 'short' });
    const day = selected.getDate();
    const month = selected.toLocaleDateString('es-ES', { month: 'long' });
    return `Vence el ${dayName}, ${day} ${month}`;
  };

  // Get reminder label for list view
  const getTaskReminderLabelForList = (task: Task): string => {
    if (!task.reminder) return '';
    
    switch (task.reminder) {
      case 'later':
        return 'Más tarde';
      case 'tomorrow':
        return 'Mañana';
      case 'nextweek':
        return 'Semana próxima';
      case 'custom':
        if (task.reminderDate) {
          const date = parseLocalDate(task.reminderDate);
          return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + (task.reminderTime ? `, ${task.reminderTime}` : '');
        }
        return 'Personalizado';
      default:
        return '';
    }
  };


  // Get the label for the selected date
  const getSelectedDateLabel = (): { label: string; icon: React.ReactNode } | null => {
    if (!newTask.dueDate) return null;
    
    const selected = parseLocalDate(newTask.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    if (selected.getTime() === today.getTime()) {
      return { label: 'Hoy', icon: <CalendarCheck className="w-4 h-4" /> };
    }
    
    if (selected.getTime() === tomorrow.getTime()) {
      return { label: 'Mañana', icon: <CalendarClock className="w-4 h-4" /> };
    }
    
    if (selected.getTime() === nextWeek.getTime()) {
      return { label: 'Semana próxima', icon: <CalendarDays className="w-4 h-4" /> };
    }
    
    // Format as "día mes" for other dates
    const formattedDate = selected.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
    return { label: formattedDate, icon: <Calendar className="w-4 h-4" /> };
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert Sunday (0) to 7 for Monday-first week
    return firstDay === 0 ? 7 : firstDay;
  };

  // New Task DatePicker - using shared component
  const renderNewTaskDatePicker = () => (
    <DatePickerDropdown
      pickerRef={datePickerRef}
      showCalendar={showCalendar}
      setShowCalendar={setShowCalendar}
      calendarDate={calendarDate}
      setCalendarDate={setCalendarDate}
      currentDueDate={newTask.dueDate}
      onSelectQuickDate={selectQuickDate}
      onSelectCalendarDate={selectCalendarDate}
      onSaveCalendarDate={saveCalendarDate}
      onClearDate={() => {
        setNewTask({ ...newTask, dueDate: '' });
        setShowDatePicker(false);
        setShowCalendar(false);
      }}
      getToday={getToday}
      getTomorrow={getTomorrow}
      getNextWeek={getNextWeek}
      getDayName={getDayName}
      getDaysInMonth={getDaysInMonth}
      getFirstDayOfMonth={getFirstDayOfMonth}
    />
  );

  // Reminder helper functions
  const getLaterToday = () => {
    const date = new Date();
    date.setHours(date.getHours() + 3);
    date.setMinutes(0);
    return date;
  };

  const getTomorrowAt9 = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
    return date;
  };

  const getNextWeekAt9 = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    date.setHours(9, 0, 0, 0);
    return date;
  };

  const formatReminderTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const selectQuickReminder = (type: string, date: Date) => {
    setSelectedReminder(type);
    setReminderDate(date);
    setReminderTime(formatReminderTime(date));
    setShowReminderPicker(false);
    setShowReminderDateTime(false);
  };

  const clearReminder = () => {
    setSelectedReminder('');
    setShowReminderPicker(false);
    setShowReminderDateTime(false);
  };

  const saveReminderDateTime = () => {
    setSelectedReminder('custom');
    setShowReminderPicker(false);
    setShowReminderDateTime(false);
  };

  // Get the label for the selected reminder
  const getSelectedReminderLabel = (): { label: string; icon: React.ReactNode } | null => {
    if (!selectedReminder) return null;
    
    switch (selectedReminder) {
      case 'later':
        return { label: 'Más tarde', icon: <Clock className="w-4 h-4" /> };
      case 'tomorrow':
        return { label: 'Mañana', icon: <BellRing className="w-4 h-4" /> };
      case 'nextweek':
        return { label: 'Semana próxima', icon: <BellRing className="w-4 h-4" /> };
      case 'custom':
        const formattedDate = reminderDate.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short' 
        });
        return { label: `${formattedDate}, ${reminderTime}`, icon: <Bell className="w-4 h-4" /> };
      default:
        return null;
    }
  };

  const selectReminderCalendarDate = (day: number) => {
    const newDate = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), day);
    setReminderDate(newDate);
  };

  // Reminder Picker using imported component
  const renderReminderPicker = () => (
    <ReminderPickerDropdown
      pickerRef={reminderPickerRef}
      showDateTime={showReminderDateTime}
      setShowDateTime={setShowReminderDateTime}
      selectedReminder={selectedReminder ? { type: selectedReminder, date: reminderDate } : null}
      reminderDate={reminderDate}
      setReminderDate={setReminderDate}
      reminderTime={reminderTime}
      setReminderTime={setReminderTime}
      onSelectQuickReminder={selectQuickReminder}
      onSelectCalendarDate={selectReminderCalendarDate}
      onSaveReminder={saveReminderDateTime}
      onClearReminder={clearReminder}
      getLaterToday={getLaterToday}
      getTomorrowAt9={getTomorrowAt9}
      getNextWeekAt9={getNextWeekAt9}
      getDayName={getDayName}
      getDaysInMonth={getDaysInMonth}
      getFirstDayOfMonth={getFirstDayOfMonth}
    />
  );

  // Repeat helper functions
  const selectRepeat = (type: string) => {
    setSelectedRepeat(type);
    setShowRepeatPicker(false);
  };

  const clearRepeat = () => {
    setSelectedRepeat('');
    setShowRepeatPicker(false);
  };

  // Get the label for the selected repeat
  const getSelectedRepeatLabel = (): { label: string; icon: React.ReactNode } | null => {
    if (!selectedRepeat) return null;
    
    switch (selectedRepeat) {
      case 'daily':
        return { label: 'Diariamente', icon: <Repeat className="w-4 h-4" /> };
      case 'weekdays':
        return { label: 'Días laborables', icon: <Repeat1 className="w-4 h-4" /> };
      case 'weekly':
        return { label: 'Semanalmente', icon: <Repeat2 className="w-4 h-4" /> };
      case 'monthly':
        return { label: 'Mensualmente', icon: <CalendarRange className="w-4 h-4" /> };
      case 'yearly':
        return { label: 'Anualmente', icon: <Calendar className="w-4 h-4" /> };
      case 'custom':
        return { label: 'Personalizado', icon: <Settings2 className="w-4 h-4" /> };
      default:
        return null;
    }
  };

  // Repeat Picker using imported component
  const renderRepeatPicker = () => (
    <RepeatPickerDropdown
      pickerRef={repeatPickerRef}
      selectedRepeat={selectedRepeat}
      onSelectRepeat={selectRepeat}
      onClearRepeat={clearRepeat}
    />
  );

  // Task detail reminder functions
  const formatTaskReminderTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const selectTaskQuickReminder = (type: string, date: Date) => {
    setSelectedTaskReminder(type);
    setTaskReminderDate(date);
    setTaskReminderTime(formatTaskReminderTime(date));
    setShowTaskReminderPicker(false);
    setShowTaskReminderDateTime(false);
    // Update the task with reminder
    if (selectedTask) {
      updateTask({
        ...selectedTask,
        reminder: type,
        reminderDate: formatDateForInput(date),
        reminderTime: formatTaskReminderTime(date)
      });
    }
  };

  const clearTaskReminder = () => {
    setSelectedTaskReminder('');
    setShowTaskReminderPicker(false);
    setShowTaskReminderDateTime(false);
    // Clear reminder from task
    if (selectedTask) {
      updateTask({
        ...selectedTask,
        reminder: '',
        reminderDate: '',
        reminderTime: ''
      });
    }
  };

  const saveTaskReminderDateTime = () => {
    setSelectedTaskReminder('custom');
    // Update the task with custom reminder
    if (selectedTask) {
      updateTask({
        ...selectedTask,
        reminder: 'custom',
        reminderDate: formatDateForInput(taskReminderDate),
        reminderTime: taskReminderTime
      });
    }
    setShowTaskReminderPicker(false);
    setShowTaskReminderDateTime(false);
  };

  const getTaskReminderLabel = (): { label: string; icon: React.ReactNode } | null => {
    if (!selectedTaskReminder) return null;
    
    switch (selectedTaskReminder) {
      case 'later':
        return { label: 'Más tarde', icon: <Clock className="w-4 h-4" /> };
      case 'tomorrow':
        return { label: 'Mañana', icon: <BellRing className="w-4 h-4" /> };
      case 'nextweek':
        return { label: 'Semana próxima', icon: <BellRing className="w-4 h-4" /> };
      case 'custom':
        const formattedDate = taskReminderDate.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short' 
        });
        return { label: `${formattedDate}, ${taskReminderTime}`, icon: <Bell className="w-4 h-4" /> };
      default:
        return null;
    }
  };

  // Task detail repeat functions
  const selectTaskRepeat = (type: string) => {
    setSelectedTaskRepeat(type);
    setShowTaskRepeatPicker(false);
    // Update the task with repeat
    if (selectedTask) {
      updateTask({
        ...selectedTask,
        repeat: type
      });
    }
  };

  const clearTaskRepeat = () => {
    setSelectedTaskRepeat('');
    setShowTaskRepeatPicker(false);
    // Clear repeat from task
    if (selectedTask) {
      updateTask({
        ...selectedTask,
        repeat: ''
      });
    }
  };

  const getTaskRepeatLabel = (): { label: string; icon: React.ReactNode } | null => {
    if (!selectedTaskRepeat) return null;
    
    switch (selectedTaskRepeat) {
      case 'daily':
        return { label: 'Diariamente', icon: <Repeat className="w-4 h-4" /> };
      case 'weekdays':
        return { label: 'Días laborables', icon: <Repeat1 className="w-4 h-4" /> };
      case 'weekly':
        return { label: 'Semanalmente', icon: <Repeat2 className="w-4 h-4" /> };
      case 'monthly':
        return { label: 'Mensualmente', icon: <CalendarRange className="w-4 h-4" /> };
      case 'yearly':
        return { label: 'Anualmente', icon: <Calendar className="w-4 h-4" /> };
      case 'custom':
        return { label: 'Personalizado', icon: <Settings2 className="w-4 h-4" /> };
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Lista de actividades</h1>
          <div className="flex gap-2">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className={sortMethod ? 'border-blue-500 text-blue-500' : ''}
              >
                <ArrowUpDown className="w-4 h-4 mr-1 cursor-pointer" />
                <span className="text-sm cursor-pointer">Ordenar</span>
              </Button>
              
              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-lg shadow-lg z-50 cursor-pointer">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Ordenar por</span>
                    {sortMethod && (
                      <button
                        onClick={() => {
                          setSortMethod(null);
                          setShowSortDropdown(false);
                        }}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Quitar ordenamiento"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSortMethod('importance');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${sortMethod === 'importance' ? 'text-blue-500' : 'text-foreground'} cursor-pointer`}
                    >
                      <Star className={`w-4 h-4 ${sortMethod === 'importance' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                      <span className="flex-1 text-left">Importancia</span>
                      {sortMethod === 'importance' && <Check className="w-4 h-4 text-blue-500" />}
                    </button>
                    <button
                      onClick={() => {
                        setSortMethod('dueDate');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${sortMethod === 'dueDate' ? 'text-blue-500' : 'text-foreground'} cursor-pointer`}
                    >
                      <Calendar className={`w-4 h-4 ${sortMethod === 'dueDate' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                      <span className="flex-1 text-left">Fecha de vencimiento</span>
                      {sortMethod === 'dueDate' && <Check className="w-4 h-4 text-blue-500" />}
                    </button>
                    <button
                      onClick={() => {
                        setSortMethod('alphabetical');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${sortMethod === 'alphabetical' ? 'text-blue-500' : 'text-foreground'} cursor-pointer`}
                    >
                      <SortAsc className={`w-4 h-4 ${sortMethod === 'alphabetical' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                      <span className="flex-1 text-left">Alfabéticamente</span>
                      {sortMethod === 'alphabetical' && <Check className="w-4 h-4 text-blue-500" />}
                    </button>
                    <button
                      onClick={() => {
                        setSortMethod('createdAt');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${sortMethod === 'createdAt' ? 'text-blue-500' : 'text-foreground'} cursor-pointer`}
                    >
                      <CalendarPlus className={`w-4 h-4 ${sortMethod === 'createdAt' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                      <span className="flex-1 text-left">Fecha de creación</span>
                      {sortMethod === 'createdAt' && <Check className="w-4 h-4 text-blue-500" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setShowCategoriesModal(true)}>
              <Tag className="w-4 h-4 mr-1" />
              <span className="text-sm">Categorías</span>
            </Button>
          </div>
        </div>

        {/* Categories Management Modal */}
        <Dialog open={showCategoriesModal} onOpenChange={setShowCategoriesModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Gestionar Categorías
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              {/* Add new category */}
              <div className="flex gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="Nueva categoría..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCategory();
                    }
                  }}
                  className="flex-1"
                />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(editingCategory === 'new' ? null : 'new')}
                    className={`w-10 h-10 rounded-md border border-border flex items-center justify-center ${newCategoryColor}`}
                    title="Seleccionar color"
                  >
                    <Palette className="w-4 h-4 text-white cursor-pointer" />
                  </button>
                  {editingCategory === 'new' && (
                    <div className="absolute right-0 top-full mt-1 p-3 bg-card border border-border rounded-lg shadow-lg z-50 grid grid-cols-5 gap-2 min-w-[160px] cursor-pointer">
                      {availableColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => {
                            setNewCategoryColor(color.value);
                            setEditingCategory(null);
                          }}
                          className={`w-6 h-6 rounded-full ${color.value} hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all ${newCategoryColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''} cursor-pointer`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={addCategory} disabled={!newCategoryName.trim()} className="cursor-pointer bg-green-500 hover:bg-green-600">
                  <Plus className="w-4 h-4 cursor-pointer" />
                </Button>
              </div>

              {/* Categories list */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {Object.entries(categories).map(([key, category]) => (
                  <div 
                    key={key} 
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Color picker */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(editingCategory === key ? null : key)}
                        className={`w-8 h-8 rounded-full ${category.color} hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all flex items-center justify-center`}
                        title="Cambiar color"
                      >
                        <Palette className="w-3 h-3 text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer" />
                      </button>
                      {editingCategory === key && (
                        <div className="absolute left-0 top-full mt-1 p-3 bg-card border border-border rounded-lg shadow-lg z-50 grid grid-cols-5 gap-2 min-w-[160px] cursor-pointer">
                          {availableColors.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => updateCategoryColor(key, color.value)}
                              className={`w-6 h-6 rounded-full ${color.value} hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all ${category.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''} cursor-pointer`}
                              title={color.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Category name (editable) */}
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategoryName(key, e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-foreground focus:bg-muted/50 rounded px-2 py-1"
                    />

                    {/* Task count */}
                    <span className="text-xs text-muted-foreground">
                      {tasks.filter(t => t.category === key).length} tareas
                    </span>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => deleteCategory(key)}
                      className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                      title="Eliminar categoría"
                      disabled={Object.keys(categories).length <= 1}
                    >
                      <Trash2 className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                ))}
              </div>

              {Object.keys(categories).length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No hay categorías. Agrega una nueva categoría arriba.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoriesModal(false)} className="cursor-pointer">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Inline Add Task Input */}
        <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
          {/* Input Row */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Agregar una tarea"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTask.title.trim()) {
                  addTask();
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          {/* Toolbar Row */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border">
            <div className="flex items-center gap-1">
              {/* Date Picker Button with Dropdown */}
              <div className="relative">
                <button 
                  className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-muted rounded-md transition-colors ${newTask.dueDate ? 'text-blue-500' : 'text-muted-foreground'}`}
                  onClick={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowCalendar(false);
                  }}
                  title="Agregar fecha"
                >
                  {getSelectedDateLabel() ? (
                    <>
                      {getSelectedDateLabel()?.icon}
                      <span className="text-sm">{getSelectedDateLabel()?.label}</span>
                    </>
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                </button>
                {showDatePicker && renderNewTaskDatePicker()}
              </div>
              {/* Reminder Picker Button with Dropdown */}
              <div className="relative">
                <button 
                  className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-muted rounded-md transition-colors ${selectedReminder ? 'text-blue-500' : 'text-muted-foreground'}`}
                  onClick={() => {
                    setShowReminderPicker(!showReminderPicker);
                    setShowReminderDateTime(false);
                  }}
                  title="Recordarme"
                >
                  {getSelectedReminderLabel() ? (
                    <>
                      {getSelectedReminderLabel()?.icon}
                      <span className="text-sm">{getSelectedReminderLabel()?.label}</span>
                    </>
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </button>
                {showReminderPicker && renderReminderPicker()}
              </div>
              {/* Repeat Picker Button with Dropdown */}
              <div className="relative">
                <button 
                  className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-muted rounded-md transition-colors ${selectedRepeat ? 'text-blue-500' : 'text-muted-foreground'}`}
                  onClick={() => setShowRepeatPicker(!showRepeatPicker)}
                  title="Repetir"
                >
                  {getSelectedRepeatLabel() ? (
                    <>
                      {getSelectedRepeatLabel()?.icon}
                      <span className="text-sm">{getSelectedRepeatLabel()?.label}</span>
                    </>
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
                {showRepeatPicker && renderRepeatPicker()}
              </div>
            </div>
            
            <Button 
              onClick={addTask}
              variant="outline"
              size="sm"
              disabled={!newTask.title.trim()}
              className="text-sm"
            >
              Agregar
            </Button>
          </div>
        </div>

        {/* Task Category List */}
        <TaskCategoryList
          categories={categories}
          expandedCategories={expandedCategories}
          selectedTask={selectedTask}
          getTasksByCategory={getTasksByCategory}
          toggleCategory={toggleCategory}
          handleSelectTask={handleSelectTask}
          toggleTaskComplete={toggleTaskComplete}
          toggleTaskImportance={toggleTaskImportance}
          getTaskDateLabelForList={getTaskDateLabelForList}
          getTaskReminderLabelForList={getTaskReminderLabelForList}
        />

        {/* Completed Tasks List */}
        <CompletedTasksList
          completedTasks={getCompletedTasks()}
          selectedTask={selectedTask}
          showCompleted={showCompleted}
          setShowCompleted={setShowCompleted}
          handleSelectTask={handleSelectTask}
          toggleTaskComplete={toggleTaskComplete}
          toggleTaskImportance={toggleTaskImportance}
        />

        {/* New Task Dialog */}
        <NewTaskDialog
          open={showNewTaskDialog}
          onOpenChange={setShowNewTaskDialog}
          newTask={newTask}
          setNewTask={setNewTask}
          onAddTask={addTask}
          categories={categories}
        />
        </div>
      </div>

      {/* Task Detail Panel - Side Panel */}
      <TaskDetailPanel
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        updateTask={updateTask}
        deleteTask={deleteTask}
        toggleStepComplete={toggleStepComplete}
        updateStep={updateStep}
        deleteStep={deleteStep}
        addStep={addStep}
        categories={categories}
        showTaskDatePicker={showTaskDatePicker}
        setShowTaskDatePicker={setShowTaskDatePicker}
        showTaskCalendar={showTaskCalendar}
        setShowTaskCalendar={setShowTaskCalendar}
        taskCalendarDate={taskCalendarDate}
        setTaskCalendarDate={setTaskCalendarDate}
        taskDatePickerRef={taskDatePickerRef}
        getTaskDateLabel={getTaskDateLabel}
        clearTaskDueDate={clearTaskDueDate}
        getToday={getToday}
        getTomorrow={getTomorrow}
        getNextWeek={getNextWeek}
        getDayName={getDayName}
        getDaysInMonth={getDaysInMonth}
        getFirstDayOfMonth={getFirstDayOfMonth}
        formatDateForInput={formatDateForInput}
        // Reminder props
        showTaskReminderPicker={showTaskReminderPicker}
        setShowTaskReminderPicker={setShowTaskReminderPicker}
        showTaskReminderDateTime={showTaskReminderDateTime}
        setShowTaskReminderDateTime={setShowTaskReminderDateTime}
        taskReminderDate={taskReminderDate}
        setTaskReminderDate={setTaskReminderDate}
        taskReminderTime={taskReminderTime}
        setTaskReminderTime={setTaskReminderTime}
        taskReminderPickerRef={taskReminderPickerRef}
        selectedTaskReminder={selectedTaskReminder}
        getTaskReminderLabel={getTaskReminderLabel}
        selectTaskQuickReminder={selectTaskQuickReminder}
        clearTaskReminder={clearTaskReminder}
        saveTaskReminderDateTime={saveTaskReminderDateTime}
        getLaterToday={getLaterToday}
        getTomorrowAt9={getTomorrowAt9}
        getNextWeekAt9={getNextWeekAt9}
        // Repeat props
        showTaskRepeatPicker={showTaskRepeatPicker}
        setShowTaskRepeatPicker={setShowTaskRepeatPicker}
        taskRepeatPickerRef={taskRepeatPickerRef}
        selectedTaskRepeat={selectedTaskRepeat}
        getTaskRepeatLabel={getTaskRepeatLabel}
        selectTaskRepeat={selectTaskRepeat}
        clearTaskRepeat={clearTaskRepeat}
      />
    </div>
  );
};

export default DailyPage;
