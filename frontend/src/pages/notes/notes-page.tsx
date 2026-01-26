import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Folder,
  FolderPlus,
  MoreHorizontal,
  Trash2,
  Edit3,
  Pin,
  PinOff,
  Grid3X3,
  List,
  Share2,
  Bold,
  Italic,
  Underline,
  ListOrdered,
  ListTodo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Types
interface Note {
  id: number;
  title: string;
  content: string;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
}

interface NoteFolder {
  id: string;
  name: string;
  icon?: string;
  color: string;
  isExpanded: boolean;
  isSystem?: boolean;
}

const NotesPage = () => {
  // Sample folders
  const [folders, setFolders] = useState<NoteFolder[]>([
    { id: 'all', name: 'Todas', color: 'text-yellow-500', isExpanded: true, isSystem: true },
    { id: 'personal', name: 'Personal', color: 'text-orange-500', isExpanded: true },
    { id: 'work', name: 'Trabajo', color: 'text-blue-500', isExpanded: true },
    { id: 'ideas', name: 'Ideas', color: 'text-purple-500', isExpanded: true },
  ]);

  // Sample notes
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: 'Lista de compras',
      content: 'Leche\nPan\nHuevos\nFrutas\nVerduras\nCarne\nPollo',
      folderId: 'personal',
      createdAt: new Date(2026, 0, 26, 10, 30),
      updatedAt: new Date(2026, 0, 26, 10, 30),
      isPinned: true,
    },
    {
      id: 2,
      title: 'Reunión del proyecto',
      content: 'Puntos a discutir:\n- Avance del sprint\n- Bloqueos actuales\n- Próximos pasos\n- Asignación de tareas',
      folderId: 'work',
      createdAt: new Date(2026, 0, 25, 14, 0),
      updatedAt: new Date(2026, 0, 25, 16, 45),
      isPinned: true,
    },
    {
      id: 3,
      title: 'Ideas para la app',
      content: 'Funcionalidades nuevas:\n1. Modo oscuro automático\n2. Sincronización en la nube\n3. Compartir notas\n4. Etiquetas y filtros',
      folderId: 'ideas',
      createdAt: new Date(2026, 0, 24, 9, 15),
      updatedAt: new Date(2026, 0, 25, 11, 20),
      isPinned: false,
    },
    {
      id: 4,
      title: 'Receta de pasta',
      content: 'Ingredientes:\n- 500g de pasta\n- Salsa de tomate\n- Queso parmesano\n- Albahaca fresca\n- Aceite de oliva\n\nPreparación:\n1. Hervir agua con sal\n2. Cocinar la pasta al dente\n3. Preparar la salsa',
      folderId: 'personal',
      createdAt: new Date(2026, 0, 23, 18, 0),
      updatedAt: new Date(2026, 0, 23, 18, 30),
      isPinned: false,
    },
    {
      id: 5,
      title: 'Objetivos del mes',
      content: '✓ Completar curso de React\n○ Leer 2 libros\n○ Ejercicio 3 veces por semana\n○ Ahorrar 20% del salario',
      folderId: 'personal',
      createdAt: new Date(2026, 0, 1, 8, 0),
      updatedAt: new Date(2026, 0, 20, 22, 15),
      isPinned: false,
    },
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNoteMenu, setShowNoteMenu] = useState<number | null>(null);

  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const noteMenuRef = useRef<HTMLDivElement>(null);

  // Get selected note
  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  // Filter notes based on folder and search
  const getFilteredNotes = () => {
    let filtered = notes;

    // Filter by folder
    if (selectedFolderId !== 'all') {
      filtered = filtered.filter((n) => n.folderId === selectedFolderId);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query)
      );
    }

    // Sort: pinned first, then by updatedAt
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  };

  const filteredNotes = getFilteredNotes();
  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  // Format full date for editor header
  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get preview text (first line after title)
  const getPreviewText = (content: string) => {
    const lines = content.split('\n').filter((line) => line.trim());
    return lines.slice(0, 2).join(' ') || 'Sin contenido adicional';
  };

  // Create new note
  const createNote = () => {
    const newNote: Note = {
      id: Date.now(),
      title: '',
      content: '',
      folderId: selectedFolderId === 'all' ? 'personal' : selectedFolderId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };

  // Update note
  const updateNote = (noteId: number, updates: Partial<Note>) => {
    setNotes(
      notes.map((n) =>
        n.id === noteId ? { ...n, ...updates, updatedAt: new Date() } : n
      )
    );
  };

  // Delete note
  const deleteNote = (noteId: number) => {
    setNotes(notes.filter((n) => n.id !== noteId));
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
    setShowNoteMenu(null);
  };

  // Toggle pin
  const togglePin = (noteId: number) => {
    setNotes(
      notes.map((n) =>
        n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
      )
    );
    setShowNoteMenu(null);
  };

  // Create folder
  const createFolder = () => {
    if (newFolderName.trim()) {
      const colors = [
        'text-red-500',
        'text-orange-500',
        'text-yellow-500',
        'text-green-500',
        'text-blue-500',
        'text-purple-500',
        'text-pink-500',
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      setFolders([
        ...folders,
        {
          id: newFolderName.toLowerCase().replace(/\s+/g, '_'),
          name: newFolderName.trim(),
          color: randomColor,
          isExpanded: true,
        },
      ]);
      setNewFolderName('');
      setShowFolderDialog(false);
    }
  };

  // Close note menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        noteMenuRef.current &&
        !noteMenuRef.current.contains(event.target as Node)
      ) {
        setShowNoteMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get notes count per folder
  const getNotesCount = (folderId: string) => {
    if (folderId === 'all') return notes.length;
    return notes.filter((n) => n.folderId === folderId).length;
  };

  // Render note item
  const renderNoteItem = (note: Note) => (
    <div
      key={note.id}
      onClick={() => setSelectedNoteId(note.id)}
      className={cn(
        'group relative p-3 rounded-xl cursor-pointer transition-all duration-200',
        'hover:bg-accent/50',
        selectedNoteId === note.id
          ? 'bg-yellow-500/20 dark:bg-yellow-500/10 border border-yellow-500/30'
          : 'bg-card border border-transparent'
      )}
    >
      {/* Note content */}
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-sm line-clamp-1 flex-1">
            {note.title || 'Nueva nota'}
          </h3>
          {note.isPinned && (
            <Pin className="w-3 h-3 text-yellow-500 flex-shrink-0 rotate-45" />
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(note.updatedAt)}</span>
          <span className="truncate">{getPreviewText(note.content)}</span>
        </div>
      </div>

      {/* Menu button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowNoteMenu(showNoteMenu === note.id ? null : note.id);
        }}
        className="absolute right-2 top-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
      >
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Dropdown menu */}
      {showNoteMenu === note.id && (
        <div
          ref={noteMenuRef}
          className="absolute right-2 top-8 w-48 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePin(note.id);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-foreground"
          >
            {note.isPinned ? (
              <>
                <PinOff className="w-4 h-4" />
                <span>Desfijar</span>
              </>
            ) : (
              <>
                <Pin className="w-4 h-4" />
                <span>Fijar nota</span>
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Move to folder logic would go here
              setShowNoteMenu(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-foreground"
          >
            <Folder className="w-4 h-4" />
            <span>Mover a carpeta</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNoteMenu(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-foreground"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir</span>
          </button>
          <div className="border-t border-border my-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteNote(note.id);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-destructive/10 transition-colors text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar - Folders */}
      <div className="w-64 border-r border-border bg-card/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground">Carpetas</h1>
        </div>

        {/* Folders list */}
        <div className="flex-1 overflow-y-auto p-2">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                selectedFolderId === folder.id
                  ? 'bg-yellow-500/20 dark:bg-yellow-500/10 text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <Folder className={cn('w-5 h-5', folder.color)} />
              <span className="flex-1 text-left font-medium">{folder.name}</span>
              <span className="text-xs text-muted-foreground">
                {getNotesCount(folder.id)}
              </span>
            </button>
          ))}
        </div>

        {/* New folder button */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowFolderDialog(true)}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Nueva carpeta</span>
          </Button>
        </div>
      </div>

      {/* Notes list */}
      <div className="w-80 border-r border-border flex flex-col bg-background">
        {/* Search and controls */}
        <div className="p-4 space-y-3 border-b border-border">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0 rounded-xl"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>

            <span className="text-xs text-muted-foreground">
              {filteredNotes.length} notas
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-3 py-2">
                <Pin className="w-3 h-3 text-yellow-500 rotate-45" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Fijadas
                </span>
              </div>
              <div className="space-y-1">
                {pinnedNotes.map(renderNoteItem)}
              </div>
            </div>
          )}

          {/* Unpinned section */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Notas
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {unpinnedNotes.map(renderNoteItem)}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Edit3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'No se encontraron notas' : 'No hay notas'}
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                {searchQuery
                  ? 'Intenta con otros términos'
                  : 'Crea una nueva nota'}
              </p>
            </div>
          )}
        </div>

        {/* New note button */}
        <div className="p-3 border-t border-border">
          <Button
            onClick={createNote}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva nota
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedNote ? (
          <>
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm">
                  <Bold className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Italic className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Underline className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button variant="ghost" size="icon-sm">
                  <ListOrdered className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <ListTodo className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button variant="ghost" size="icon-sm">
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => togglePin(selectedNote.id)}
                >
                  {selectedNote.isPinned ? (
                    <Pin className="w-4 h-4 text-yellow-500 rotate-45" />
                  ) : (
                    <Pin className="w-4 h-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteNote(selectedNote.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Editor content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-8 py-6">
                {/* Last edited date */}
                <p className="text-xs text-muted-foreground text-center mb-6">
                  {formatFullDate(selectedNote.updatedAt)}
                </p>

                {/* Title */}
                <textarea
                  ref={titleInputRef}
                  value={selectedNote.title}
                  onChange={(e) =>
                    updateNote(selectedNote.id, { title: e.target.value })
                  }
                  placeholder="Título"
                  className="w-full text-2xl font-bold text-foreground bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/50 mb-4"
                  rows={1}
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                />

                {/* Content */}
                <textarea
                  ref={contentInputRef}
                  value={selectedNote.content}
                  onChange={(e) =>
                    updateNote(selectedNote.id, { content: e.target.value })
                  }
                  placeholder="Empieza a escribir..."
                  className="w-full text-base text-foreground bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/50 leading-relaxed min-h-[calc(100vh-300px)]"
                />
              </div>
            </div>

            {/* Folder indicator */}
            <div className="px-6 py-3 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
              <Folder
                className={cn(
                  'w-4 h-4',
                  folders.find((f) => f.id === selectedNote.folderId)?.color ||
                    'text-muted-foreground'
                )}
              />
              <span>
                {folders.find((f) => f.id === selectedNote.folderId)?.name ||
                  'Sin carpeta'}
              </span>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
              <Edit3 className="w-12 h-12 text-yellow-500" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Selecciona una nota
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Elige una nota de la lista para verla o editarla, o crea una nueva
            </p>
            <Button
              onClick={createNote}
              className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva nota
            </Button>
          </div>
        )}
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-yellow-500" />
              Nueva carpeta
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Nombre de la carpeta"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createFolder();
              }}
              className="rounded-xl"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFolderDialog(false);
                setNewFolderName('');
              }}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={createFolder}
              disabled={!newFolderName.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl"
            >
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;
