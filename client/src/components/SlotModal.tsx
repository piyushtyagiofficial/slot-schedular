import React, { useState, useEffect } from 'react';
import { X, Clock, Save } from 'lucide-react';

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  title: string;
  initialData?: {
    day_of_week?: number;
    start_time?: string;
    end_time?: string;
  };
  showDaySelection?: boolean;
  showRecurringOption?: boolean;
  isEditing?: boolean;
  currentSlot?: any;
}

const SlotModal: React.FC<SlotModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  showDaySelection = false,
  showRecurringOption = false,
  isEditing = false,
  currentSlot
}) => {
  const [formData, setFormData] = useState({
    day_of_week: initialData?.day_of_week || 1,
    start_time: initialData?.start_time || '09:00',
    end_time: initialData?.end_time || '17:00',
    is_recurring: currentSlot?.is_recurring ?? true // Use nullish coalescing to handle false properly
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        day_of_week: initialData.day_of_week || 1,
        start_time: initialData.start_time || '09:00',
        end_time: initialData.end_time || '17:00',
        is_recurring: currentSlot?.is_recurring ?? true // Use nullish coalescing to handle false properly
      });
    }
  }, [initialData, currentSlot]);

  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours <= 0) return 'Invalid duration';
    if (diffHours === 1) return '1 hour';
    if (diffHours < 1) return `${Math.round(diffHours * 60)} minutes`;
    if (diffHours % 1 === 0) return `${diffHours} hours`;
    return `${Math.floor(diffHours)}h ${Math.round((diffHours % 1) * 60)}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.start_time >= formData.end_time) {
      alert('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {showDaySelection && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <div className="grid grid-cols-2 gap-2">
                {dayNames.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, day_of_week: index }))}
                    className={`p-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                      formData.day_of_week === index
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recurring Option - Only show during creation, not editing */}
          {(showDaySelection || showRecurringOption) && !isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slot Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_recurring: true }))}
                  className={`p-3 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                    formData.is_recurring
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Weekly</div>
                    <div className="text-xs opacity-75">Repeats every week</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_recurring: false }))}
                  className={`p-3 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                    !formData.is_recurring
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">One-time</div>
                    <div className="text-xs opacity-75">This instance only</div>
                  </div>
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {formData.is_recurring 
                  ? "This slot will repeat every week on the selected day"
                  : "This slot will only appear once"
                }
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                id="start-time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                id="end-time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Duration Display */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Duration: {calculateDuration()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.start_time >= formData.end_time}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Slot
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SlotModal;