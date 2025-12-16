import React from 'react';
import {
  Calendar,
  Clock,
  BellRing,
  ChevronUp,
  ChevronDown,
  Trash2
} from 'lucide-react';

interface ReminderPickerDropdownProps {
  pickerRef: React.RefObject<HTMLDivElement | null>;
  showDateTime: boolean;
  setShowDateTime: (show: boolean) => void;
  selectedReminder: { type: string; date: Date } | null;
  reminderDate: Date;
  setReminderDate: (date: Date) => void;
  reminderTime: string;
  setReminderTime: (time: string) => void;
  onSelectQuickReminder: (type: string, date: Date) => void;
  onSelectCalendarDate: (day: number) => void;
  onSaveReminder: () => void;
  onClearReminder: () => void;
  // Helper functions
  getLaterToday: () => Date;
  getTomorrowAt9: () => Date;
  getNextWeekAt9: () => Date;
  getDayName: (date: Date, short?: boolean) => string;
  getDaysInMonth: (date: Date) => number;
  getFirstDayOfMonth: (date: Date) => number;
}

const ReminderPickerDropdown: React.FC<ReminderPickerDropdownProps> = ({
  pickerRef,
  showDateTime,
  setShowDateTime,
  selectedReminder,
  reminderDate,
  setReminderDate,
  reminderTime,
  setReminderTime,
  onSelectQuickReminder,
  onSelectCalendarDate,
  onSaveReminder,
  onClearReminder,
  getLaterToday,
  getTomorrowAt9,
  getNextWeekAt9,
  getDayName,
  getDaysInMonth,
  getFirstDayOfMonth,
}) => {
  const prevMonth = () => {
    setReminderDate(new Date(reminderDate.getFullYear(), reminderDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setReminderDate(new Date(reminderDate.getFullYear(), reminderDate.getMonth() + 1, 1));
  };

  const isSelectedDate = (day: number) => {
    return reminderDate.getDate() === day &&
      reminderDate.getMonth() === reminderDate.getMonth() &&
      reminderDate.getFullYear() === reminderDate.getFullYear();
  };

  return (
    <div
      ref={pickerRef}
      className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[280px]"
      onClick={(e) => e.stopPropagation()}
    >
      {!showDateTime ? (
        <div className="py-2">
          <div className="px-4 py-2 text-sm font-medium text-foreground border-b border-border">
            Aviso
          </div>

          <button
            onClick={() => onSelectQuickReminder('later', getLaterToday())}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">Más tarde hoy</span>
            </div>
          </button>

          <button
            onClick={() => onSelectQuickReminder('tomorrow', getTomorrowAt9())}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BellRing className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">Mañana</span>
            </div>
            <span className="text-sm text-muted-foreground">{getDayName(getTomorrowAt9())}., 9:00</span>
          </button>

          <button
            onClick={() => onSelectQuickReminder('nextweek', getNextWeekAt9())}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BellRing className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">Semana próxima</span>
            </div>
            <span className="text-sm text-muted-foreground">{getDayName(getNextWeekAt9())}., 9:00</span>
          </button>

          <div className="border-t border-border mt-2 pt-2">
            <button
              onClick={() => setShowDateTime(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">Elegir una fecha y una hora</span>
            </button>
          </div>

          {selectedReminder && (
            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={onClearReminder}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-red-500"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-sm">Quitar aviso</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">
              {reminderDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-blue-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'].map((day) => (
              <div key={day} className="text-center text-xs text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: getFirstDayOfMonth(reminderDate) - 1 }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {Array.from({ length: getDaysInMonth(reminderDate) }).map((_, i) => {
              const day = i + 1;
              const isPast = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), day) < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={day}
                  onClick={() => onSelectCalendarDate(day)}
                  disabled={isPast}
                  className={`h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors
                    ${isSelectedDate(day)
                      ? 'bg-blue-500 text-white'
                      : isPast
                        ? 'text-muted-foreground/50 cursor-not-allowed'
                        : 'text-foreground hover:bg-muted'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground"
            />
          </div>

          <button
            onClick={onSaveReminder}
            className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};

export default ReminderPickerDropdown;
