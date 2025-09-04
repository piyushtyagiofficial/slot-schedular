import React, { useState } from 'react';
import type { SlotWithDate } from '../types/slot';
import { format, isSameDay, isToday } from 'date-fns';
import SlotCard from './SlotCard';
import { Plus, CircleDot } from 'lucide-react';
import SlotModal from './SlotModal';

interface WeekViewProps {
  weekDates: Date[];
  slots: SlotWithDate[];
  onCreateSlot: (data: { day_of_week: number; start_time: string; end_time: string }) => Promise<void>;
  onUpdateSlot: (slotId: string, date: string, data: { start_time: string; end_time: string }) => Promise<void>;
  onDeleteSlot: (slotId: string, date: string) => Promise<void>;
  onDeleteRecurring: (slotId: string) => Promise<void>;
}

const WeekView: React.FC<WeekViewProps> = ({
  weekDates,
  slots,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
  onDeleteRecurring
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateClick = (dayOfWeek: number, date: Date) => {
    setSelectedDay(dayOfWeek);
    setSelectedDate(date);
    setShowCreateModal(true);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getSlotsForDate = (date: Date) => {
    return slots.filter(slot => isSameDay(new Date(slot.date), date));
  };

  const canAddSlot = (date: Date) => {
    return getSlotsForDate(date).length < 2;
  };

  const handleCreateSlot = (dayOfWeek: number, date: Date) => {
    handleCreateClick(dayOfWeek, date);
  };

  const handleSubmitCreate = async (data: { start_time: string; end_time: string; is_recurring: boolean }) => {
    if (selectedDay !== null) {
      const submitData = { ...data, day_of_week: selectedDay };
      
      // If it's a one-time slot, also include the selected date
      if (!data.is_recurring && selectedDate) {
        (submitData as any).selected_date = format(selectedDate, 'yyyy-MM-dd');
      }
      
      await onCreateSlot(submitData);
      setShowCreateModal(false);
      setSelectedDay(null);
      setSelectedDate(null);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 md:gap-5 lg:gap-6">
        {weekDates.map((date) => {
          const daySlots = getSlotsForDate(date);
          const dayOfWeek = date.getDay();
          const isCurrentDay = isToday(date);
          
          return (
            <div 
              key={date.toISOString()} 
              className={`rounded-lg border p-4 min-h-[300px] flex flex-col transition-all duration-200 ${
                isCurrentDay 
                  ? 'bg-blue-50 border-blue-300 shadow-md' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Day Header */}
              <div className="text-center mb-4 pb-3 border-b border-gray-200">
                <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                  isCurrentDay ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {dayNames[dayOfWeek]}
                </div>
                <div className={`text-xl font-bold ${
                  isCurrentDay ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {format(date, 'd')}
                </div>
                {isCurrentDay && (
                  <CircleDot className="w-4 h-4 text-blue-500 mx-auto mt-2" />
                )}
              </div>

              {/* Slots Container */}
              <div className="flex-1 space-y-3">
                {daySlots.map(slot => (
                  <SlotCard
                    key={`${slot.id}-${slot.date}`}
                    slot={slot}
                    onUpdate={onUpdateSlot}
                    onDelete={onDeleteSlot}
                    onDeleteRecurring={onDeleteRecurring}
                  />
                ))}

                {/* Add Slot Button */}
                {canAddSlot(date) && (
                  <button
                    onClick={() => handleCreateSlot(dayOfWeek, date)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2 group min-h-[60px]"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm font-medium">Add Slot</span>
                  </button>
                )}
                
                {/* Day Full Indicator */}
                {daySlots.length === 2 && (
                  <div className="text-center py-2">
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      Day Full (2/2)
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <SlotModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedDay(null);
          }}
          onSubmit={handleSubmitCreate}
          title="Create New Slot"
          showDaySelection={true}
                    showRecurringOption={true}
          initialData={{ 
            day_of_week: selectedDay || 1, 
            start_time: '09:00', 
            end_time: '17:00' 
          }}
        />
      )}
    </div>
  );
};

export default WeekView;