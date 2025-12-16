import React from 'react';
import {
  Calendar,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  ChevronUp,
  ChevronDown,
  Trash2
} from 'lucide-react';

interface DatePickerDropdownProps {
  pickerRef: React.RefObject<HTMLDivElement | null>;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  calendarDate: Date;
  setCalendarDate: (date: Date) => void;
  currentDueDate: string;
  onSelectQuickDate: (date: Date) => void;
  onSelectCalendarDate: (day: number) => void;
  onSaveCalendarDate: () => void;
  onClearDate: () => void;
  // Helper functions
  getToday: () => Date;
  getTomorrow: () => Date;
  getNextWeek: () => Date;
  getDayName: (date: Date, short?: boolean) => string;
  getDaysInMonth: (date: Date) => number;
  getFirstDayOfMonth: (date: Date) => number;
}

const DatePickerDropdown: React.FC<DatePickerDropdownProps> = ({
  pickerRef,
  showCalendar,
  setShowCalendar,
  calendarDate,
  setCalendarDate,
  currentDueDate,
  onSelectQuickDate,
  onSelectCalendarDate,
  onSaveCalendarDate,
  onClearDate,
  getToday,
  getTomorrow,
  getNextWeek,
  getDayName,
  getDaysInMonth,
  getFirstDayOfMonth,
}) => {
  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const isSelectedDate = (day: number) => {
    if (!currentDueDate) return false;
    const selected = parseLocalDate(currentDueDate);
    return selected.getDate() === day &&
      selected.getMonth() === calendarDate.getMonth() &&
      selected.getFullYear() === calendarDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
      today.getMonth() === calendarDate.getMonth() &&
      today.getFullYear() === calendarDate.getFullYear();
  };

  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  return (
    <div
      ref={pickerRef}
      className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-[100] min-w-[280px]"
      onClick={(e) => e.stopPropagation()}
    >
      {!showCalendar ? (
        <div className="py-2">
          <div className="px-4 py-2 text-sm font-medium text-foreground border-b border-border">
            Vencimiento
          </div>

          <button
            onClick={() => onSelectQuickDate(getToday())}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CalendarCheck className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">Hoy</span>
            </div>
            <span className="text-sm text-muted-foreground">{getDayName(getToday())}.</span>
          </button>

          <button
            onClick={() => onSelectQuickDate(getTomorrow())}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CalendarClock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">Mañana</span>
            </div>
            <span className="text-sm text-muted-foreground">{getDayName(getTomorrow())}.</span>
          </button>

          <button
            onClick={() => onSelectQuickDate(getNextWeek())}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">Semana próxima</span>
            </div>
            <span className="text-sm text-muted-foreground">{getDayName(getNextWeek())}.</span>
          </button>

          <div className="border-t border-border mt-2 pt-2">
            <button
              onClick={() => setShowCalendar(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">Elegir una fecha</span>
            </button>
          </div>

          {currentDueDate && (
            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={onClearDate}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-red-500"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-sm">Quitar fecha de vencimiento</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">
              {calendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
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
            {Array.from({ length: getFirstDayOfMonth(calendarDate) - 1 }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {Array.from({ length: getDaysInMonth(calendarDate) }).map((_, i) => {
              const day = i + 1;
              const isPast = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day) < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={day}
                  onClick={() => onSelectCalendarDate(day)}
                  disabled={isPast}
                  className={`h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors
                    ${isSelectedDate(day)
                      ? 'bg-blue-500 text-white'
                      : isToday(day)
                        ? 'border-2 border-blue-500 text-foreground'
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

          <button
            onClick={onSaveCalendarDate}
            className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};

export default DatePickerDropdown;
