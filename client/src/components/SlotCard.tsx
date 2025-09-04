import React, { useState } from 'react';
import type { SlotWithDate } from '../types/slot';
import { format } from 'date-fns';
import { Clock, Edit3, Trash2, MoreVertical, Repeat, Calendar } from 'lucide-react';
import SlotModal from './SlotModal';

interface SlotCardProps {
  slot: SlotWithDate;
  onUpdate: (slotId: string, date: string, data: { start_time: string; end_time: string }) => Promise<void>;
  onDelete: (slotId: string, date: string) => Promise<void>;
  onDeleteRecurring: (slotId: string) => Promise<void>;
}

const SlotCard: React.FC<SlotCardProps> = ({ slot, onUpdate, onDelete, onDeleteRecurring }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${slot.start_time}`);
    const end = new Date(`2000-01-01T${slot.end_time}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours === 1) return '1 hour';
    if (diffHours < 1) return `${Math.round(diffHours * 60)} min`;
    if (diffHours % 1 === 0) return `${diffHours} hours`;
    return `${Math.floor(diffHours)}h ${Math.round((diffHours % 1) * 60)}m`;
  };

  const handleEdit = async (data: { start_time: string; end_time: string }) => {
    // Always ensure we get just the date part (YYYY-MM-DD) regardless of input format
    let dateStr: string;
    if (slot.date instanceof Date) {
      dateStr = format(slot.date, 'yyyy-MM-dd');
    } else if (typeof slot.date === 'string') {
      // If it's already a string, parse it first to ensure clean date format
      const parsedDate = new Date(slot.date);
      dateStr = format(parsedDate, 'yyyy-MM-dd');
    } else {
      dateStr = slot.date;
    }
    
    await onUpdate(slot.id, dateStr, data);
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    const dateStr = slot.date instanceof Date ? format(slot.date, 'yyyy-MM-dd') : slot.date;
    await onDelete(slot.id, dateStr);
    setShowMenu(false);
  };

  const handleDeleteRecurring = async () => {
    await onDeleteRecurring(slot.id);
    setShowMenu(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 group">
        {/* Slot Type Indicator & Menu */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            {slot.is_exception ? (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>Modified</span>
              </span>
            ) : slot.is_recurring ? (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
                <Repeat className="w-3 h-3 flex-shrink-0" />
                <span>Weekly</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium whitespace-nowrap">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>One-time</span>
              </span>
            )}
          </div>
          
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 opacity-60 hover:opacity-100 group-hover:opacity-100"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <>
                {/* Backdrop to close menu when clicking outside */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px] sm:min-w-[160px] max-w-[200px]">
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                  >
                    <Edit3 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors duration-150"
                  >
                    <Trash2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Delete this slot</span>
                  </button>
                  {slot.is_recurring && (
                    <>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleDeleteRecurring}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors duration-150"
                      >
                        <Repeat className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">Delete all weeks</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Time Display */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2 min-w-0">
            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900 break-words">
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">
                Duration: {calculateDuration()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowMenu(false)}
        />
      )}

      {showEditModal && (
        <SlotModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEdit}
          title="Edit Slot"
          initialData={{
            start_time: slot.start_time,
            end_time: slot.end_time
          }}
          showDaySelection={false}
          showRecurringOption={true}
          isEditing={true}
          currentSlot={slot}
        />
      )}
    </>
  );
};

export default SlotCard;