import React from 'react';
import {
  Calendar,
  Repeat,
  Repeat1,
  Repeat2,
  CalendarRange,
  Settings2,
  Trash2
} from 'lucide-react';

interface RepeatPickerDropdownProps {
  pickerRef: React.RefObject<HTMLDivElement | null>;
  selectedRepeat: string;
  onSelectRepeat: (type: string) => void;
  onClearRepeat: () => void;
}

const RepeatPickerDropdown: React.FC<RepeatPickerDropdownProps> = ({
  pickerRef,
  selectedRepeat,
  onSelectRepeat,
  onClearRepeat,
}) => {
  return (
    <div
      ref={pickerRef}
      className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[220px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-2">
        <div className="px-4 py-2 text-sm font-medium text-foreground border-b border-border">
          Repetir
        </div>

        <button
          onClick={() => onSelectRepeat('daily')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <Repeat className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-foreground">Diariamente</span>
        </button>

        <button
          onClick={() => onSelectRepeat('weekdays')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <Repeat1 className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-foreground">Días laborables</span>
        </button>

        <button
          onClick={() => onSelectRepeat('weekly')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <Repeat2 className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-foreground">Semanalmente</span>
        </button>

        <button
          onClick={() => onSelectRepeat('monthly')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <CalendarRange className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-foreground">Mensualmente</span>
        </button>

        <button
          onClick={() => onSelectRepeat('yearly')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-foreground">Anualmente</span>
        </button>

        <div className="border-t border-border mt-2 pt-2">
          <button
            onClick={() => onSelectRepeat('custom')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <Settings2 className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-foreground">Personalizado</span>
          </button>
        </div>

        {selectedRepeat && (
          <div className="border-t border-border mt-2 pt-2">
            <button
              onClick={onClearRepeat}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-red-500"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-sm">No repetir nunca</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepeatPickerDropdown;
