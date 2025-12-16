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
          <Button onClick={onAddTask} className="w-full bg-blue-500 hover:bg-blue-600">
            Agregar Tarea
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskDialog;
