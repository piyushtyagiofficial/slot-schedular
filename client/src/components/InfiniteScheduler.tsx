import React, { useEffect, useRef, useCallback, useState } from 'react';
import { startOfWeek, addWeeks, format, eachDayOfInterval, endOfWeek, isSameDay } from 'date-fns';
import { useSlots } from '../hooks/useSlots';
import WeekView from './WeekView';
import { ChevronLeft, ChevronRight, Calendar, Plus, Settings, Clock, Users, Repeat, CheckCircle, AlertCircle } from 'lucide-react';
import SlotModal from './SlotModal';
import logo from "../assets/logo.jfif";

const InfiniteScheduler: React.FC = () => {
  const { slots, loading, error, loadWeek, createSlot, updateSlot, deleteSlot, deleteRecurringSlot } = useSlots();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCurrentWeek = useCallback((weekIndex: number) => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today);
    return addWeeks(currentWeekStart, weekIndex);
  }, []);

  const getWeekDates = useCallback((weekStart: Date) => {
    return eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart)
    });
  }, []);

  // Load initial week
  useEffect(() => {
    const initialWeek = getCurrentWeek(0);
    loadWeek(initialWeek);
  }, [getCurrentWeek, loadWeek]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentWeekIndex - 1 : currentWeekIndex + 1;
    setCurrentWeekIndex(newIndex);
    
    const targetWeek = getCurrentWeek(newIndex);
    loadWeek(targetWeek);
  };  // Keyboard shortcuts for week navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && !event.shiftKey && !event.altKey) { // Use Ctrl instead of Alt
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          if (currentWeekIndex > 0) { // Only allow going back to week 0 (current week)
            navigateWeek('prev');
          }
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          if (currentWeekIndex < 52) { // Allow planning up to 1 year ahead
            navigateWeek('next');
          }
        } else if (event.key === 'Home') {
          event.preventDefault();
          setCurrentWeekIndex(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWeekIndex, navigateWeek]);

  const renderWeeks = () => {
    // Only render the current week being viewed
    const weekStart = getCurrentWeek(currentWeekIndex);
    const weekDates = getWeekDates(weekStart);
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    
    return (
      <div key={weekKey} className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Week of {format(weekStart, 'MMM d, yyyy')}
          </h3>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              disabled={currentWeekIndex <= 0}
              className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        <WeekView
          weekDates={weekDates}
          slots={slots.filter(slot => {
            const slotDate = new Date(slot.date);
            return weekDates.some(date => isSameDay(date, slotDate));
          })}
          onCreateSlot={createSlot}
          onUpdateSlot={updateSlot}
          onDeleteSlot={deleteSlot}
          onDeleteRecurring={deleteRecurringSlot}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <img className="w-12 h-12" src={logo} alt="logo" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Weekly Scheduler</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your recurring time slots</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{slots.length} slots</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Max 2/day</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-2 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline sm:hidden lg:inline">New Slot</span>
                <span className="xs:hidden sm:inline lg:hidden">Add</span>
              </button>
              
              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
        {/* Week Navigation */}
        <div className="flex flex-col space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* Top Row - Title and Navigation Controls */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between space-y-2 xs:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {format(getCurrentWeek(currentWeekIndex), 'MMMM yyyy')}
            </h2>
            
            <div className="flex items-center justify-between xs:justify-end space-x-2 sm:space-x-3">
              {/* Today Button */}
              {currentWeekIndex !== 0 && (
                <button
                  onClick={() => setCurrentWeekIndex(0)}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200 whitespace-nowrap"
                  title="Ctrl+Home to jump to current week"
                >
                  Today
                </button>
              )}
              
              {/* Week Navigation */}
              <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => navigateWeek('prev')}
                  disabled={currentWeekIndex <= 0}
                  className="p-1.5 sm:p-2 hover:bg-gray-50 rounded-l-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous week"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                
                <div className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 border-x border-gray-200 min-w-0">
                  <div className="text-center">
                    <div className="font-semibold whitespace-nowrap">
                      {currentWeekIndex === 0 ? 'This Week' : 
                       currentWeekIndex > 0 ? `+${currentWeekIndex} Week${currentWeekIndex > 1 ? 's' : ''}` :
                       `${currentWeekIndex} Week${currentWeekIndex < -1 ? 's' : ''}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                      {format(getCurrentWeek(currentWeekIndex), 'MMM d')} - {format(endOfWeek(getCurrentWeek(currentWeekIndex)), 'MMM d')}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => navigateWeek('next')}
                  className="p-1.5 sm:p-2 hover:bg-gray-50 rounded-r-lg transition-colors duration-200"
                  title="Next week"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Bottom Row - Status Indicators */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Current Week Indicator */}
            {currentWeekIndex === 0 && (
              <div className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Current Week</span>
              </div>
            )}
            
            {/* Slot Count */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {slots.filter(slot => {
                  const slotDate = new Date(slot.date);
                  const currentWeekStart = getCurrentWeek(currentWeekIndex);
                  const currentWeekDates = getWeekDates(currentWeekStart);
                  return currentWeekDates.some(date => isSameDay(date, slotDate));
                }).length} slots this week
              </span>
            </div>
            
            {/* Recurring Slots Info */}
            <div className="hidden sm:flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
              <Repeat className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {slots.filter(slot => slot.is_recurring).length} recurring
              </span>
            </div>
            
            {/* Keyboard shortcuts hint */}
            <div className="hidden lg:flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border ml-auto">
              <span className="whitespace-nowrap">Ctrl + ← → for navigation</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start sm:items-center space-x-2 sm:space-x-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-red-800 font-medium text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Calendar Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div
            ref={containerRef}
            className="max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto"
          >
            <div className="p-3 sm:p-4 lg:p-6">
              {renderWeeks()}
              
              {loading && (
                <div className="flex justify-center py-6 sm:py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-gray-600 text-xs sm:text-sm font-medium">Loading week...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Slot Modal */}
      {showCreateModal && (
        <SlotModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            await createSlot(data);
            setShowCreateModal(false);
          }}
          title="Create New Slot"
          showDaySelection={true}
          showRecurringOption={true}
        />
      )}
    </div>
  );
};

export default InfiniteScheduler;