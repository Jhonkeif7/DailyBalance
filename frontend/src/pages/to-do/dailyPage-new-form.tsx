import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  name: string;
  color: string;
}

interface Categories {
  [key: string]: Category;
}

interface NewTaskData {
  title: string;
  description: string;
  dueDate: string;
  importance: 'normal' | 'medium' | 'high';
  category: string;
  steps: { id: number; text: string; completed: boolean }[];
}

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTask: NewTaskData;
  setNewTask: React.Dispatch<React.SetStateAction<NewTaskData>>;
  onAddTask: () => void;
  categories: Categories;
}

const NewTaskDialog: React.FC<NewTaskDialogProps> = ({
  open,
  onOpenChange,
  newTask,
  setNewTask,
  onAddTask,
  categories
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Tarea</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label htmlFor="new-task-title" className="sr-only">Título de la tarea</label>
            <Input
              id="new-task-title"
              placeholder="Título de la tarea…"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="new-task-description" className="sr-only">Descripción</label>
            <Textarea
              id="new-task-description"
              placeholder="Descripción (opcional)…"
              value={newTask.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTask({ ...newTask, description: e.target.value })}
              rows={3}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="new-task-date" className="sr-only">Fecha de vencimiento</label>
            <Input
              id="new-task-date"
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              autoComplete="off"
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
          <Button onClick={onAddTask} className="w-full">
            Agregar Tarea
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskDialog;
