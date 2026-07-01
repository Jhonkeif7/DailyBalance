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
  ChevronLeft,
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
import { toast } from 'sonner';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as notesService from '@/services/notes.service';

// Types
interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
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

const toNote = (n: notesService.Note): Note => ({
  id: n.id,
  title: n.title,
  content: n.content,
  folderId: n.folderId,
  createdAt: new Date(n.createdAt),
  updatedAt: new Date(n.updatedAt),
  isPinned: n.isPinned,
});

// Carpeta virtual "Todas" (no existe en la BD; agrupa todas las notas).
const ALL_FOLDER: NoteFolder = {
  id: 'all',
  name: 'Todas',
  color: 'text-yellow-500',
  isExpanded: true,
  isSystem: true,
};

const NotesPage = () => {
  const { isSmallScreen } = useBreakpoint();
  const [dbFolders, setDbFolders] = useState<NoteFolder[]>([]);
  const folders: NoteFolder[] = [ALL_FOLDER, ...dbFolders];

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNoteMenu, setShowNoteMenu] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const noteMenuRef = useRef<HTMLDivElement>(null);
  // Temporizadores para guardar (debounce) cambios de cada nota.
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Carga inicial desde Supabase.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [foldersData, notesData] = await Promise.all([
          notesService.getFolders(),
          notesService.getNotes(),
        ]);
        if (!active) return;
        setDbFolders(
          foldersData.map((f) => ({
            id: f.id,
            name: f.name,
            color: f.color,
            icon: f.icon,
            isExpanded: true,
          }))
        );
        setNotes(notesData.map(toNote));
      } catch (err) {
        console.error(err);
        toast.error('No se pudieron cargar las notas');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
  const createNote = async () => {
    try {
      const created = await notesService.createNote({
        title: '',
        content: '',
        folderId: selectedFolderId === 'all' ? null : selectedFolderId,
      });
      const note = toNote(created);
      setNotes((prev) => [note, ...prev]);
      setSelectedNoteId(note.id);
      setTimeout(() => titleInputRef.current?.focus(), 100);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo crear la nota');
    }
  };

  // Update note (optimista + guardado diferido)
  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, ...updates, updatedAt: new Date() } : n
      )
    );
    if (saveTimers.current[noteId]) clearTimeout(saveTimers.current[noteId]);
    saveTimers.current[noteId] = setTimeout(() => {
      notesService
        .updateNote(noteId, {
          title: updates.title,
          content: updates.content,
          folderId: updates.folderId,
          isPinned: updates.isPinned,
        })
        .catch((err) => {
          console.error(err);
          toast.error('No se pudo guardar la nota');
        });
    }, 600);
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    const prev = notes;
    setNotes((curr) => curr.filter((n) => n.id !== noteId));
    if (selectedNoteId === noteId) setSelectedNoteId(null);
    setShowNoteMenu(null);
    try {
      await notesService.deleteNote(noteId);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo eliminar la nota');
      setNotes(prev);
    }
  };

  // Toggle pin
  const togglePin = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    const next = !note.isPinned;
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isPinned: next } : n))
    );
    setShowNoteMenu(null);
    try {
      await notesService.updateNote(noteId, { isPinned: next });
    } catch (err) {
      console.error(err);
      toast.error('No se pudo actualizar la nota');
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isPinned: !next } : n))
      );
    }
  };

  // Create folder
  const createFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
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
    try {
      const created = await notesService.createFolder({ name, color: randomColor });
      setDbFolders((prev) => [
        ...prev,
        { id: created.id, name: created.name, color: created.color, isExpanded: true },
      ]);
      setNewFolderName('');
      setShowFolderDialog(false);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo crear la carpeta');
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
          ? 'bg-primary/15 dark:bg-primary/10 border border-primary/30'
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
        className="group-hover-actions absolute right-2 top-2 rounded-md p-1 transition-all hover:bg-muted"
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
    <div className="-mx-4 -mb-4 flex h-[calc(100dvh-6rem)] min-h-0 overflow-hidden sm:-mx-6 sm:-mb-6 lg:h-[calc(100dvh-7rem)]">
      {/* Sidebar - Folders (solo escritorio) */}
      <div className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/50 lg:flex">
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
                  ? 'bg-primary/15 dark:bg-primary/10 text-foreground'
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
      <div
        className={cn(
          'flex w-full shrink-0 flex-col border-r border-border bg-background lg:w-80',
          isSmallScreen && selectedNoteId && 'hidden lg:flex'
        )}
      >
        {/* Selector de carpetas (móvil) */}
        {isSmallScreen && (
          <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-all',
                  selectedFolderId === folder.id
                    ? 'bg-primary/15 text-foreground dark:bg-primary/10'
                    : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                <Folder className={cn('h-3.5 w-3.5', folder.color)} />
                <span className="font-medium">{folder.name}</span>
                <span className="text-muted-foreground">{getNotesCount(folder.id)}</span>
              </button>
            ))}
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              onClick={() => setShowFolderDialog(true)}
              aria-label="Nueva carpeta"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
        )}

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

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground text-sm">Cargando notas...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredNotes.length === 0 && (
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
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva nota
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col bg-background',
          isSmallScreen && !selectedNoteId && 'hidden lg:flex'
        )}
      >
        {selectedNote ? (
          <>
            {/* Editor toolbar */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto px-3 py-3 sm:px-6 border-b border-border">
              <div className="flex shrink-0 items-center gap-1">
                {isSmallScreen && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSelectedNoteId(null)}
                    aria-label="Volver a la lista"
                    className="mr-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
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
              <div className="mx-auto max-w-3xl px-4 py-4 sm:px-8 sm:py-6">
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
                  className="w-full min-h-[50dvh] resize-none border-none bg-transparent text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 lg:min-h-[calc(100vh-300px)]"
                />
              </div>
            </div>

            {/* Folder indicator */}
            <div className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:px-6">
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
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Edit3 className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Selecciona una nota
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Elige una nota de la lista para verla o editarla, o crea una nueva
            </p>
            <Button
              onClick={createNote}
              className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl"
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
              <FolderPlus className="w-5 h-5 text-primary" />
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
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
