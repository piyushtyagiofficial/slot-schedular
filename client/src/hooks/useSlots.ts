import { useState, useCallback } from 'react';
import type { SlotWithDate, CreateSlotRequest, UpdateSlotRequest } from '../types/slot';
import { api } from '../services/api.ts';
import { format, startOfWeek, addWeeks } from 'date-fns';

export const useSlots = () => {
  const [slots, setSlots] = useState<SlotWithDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedWeeks, setLoadedWeeks] = useState<Set<string>>(new Set());

  const loadWeek = useCallback(async (weekStart: Date) => {
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    
    if (loadedWeeks.has(weekKey)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const weekSlots = await api.getSlotsForWeek(weekKey);
      
      setSlots(prev => {
        const filtered = prev.filter(slot => {
          const slotWeekStart = format(startOfWeek(new Date(slot.date)), 'yyyy-MM-dd');
          return slotWeekStart !== weekKey;
        });
        return [...filtered, ...weekSlots].sort((a, b) => {
          const aDate = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
          const bDate = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
          
          if (aDate !== bDate) {
            return aDate - bDate;
          }
          return a.start_time.localeCompare(b.start_time);
        });
      });
      setLoadedWeeks(prev => new Set([...prev, weekKey]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, [loadedWeeks]);

  const createSlot = useCallback(async (data: CreateSlotRequest) => {
    setError(null);
    try {
      await api.createSlot(data);
      
      if (data.is_recurring) {
        // For recurring slots, only reload the current week and next few weeks
        const currentWeek = startOfWeek(new Date());
        for (let i = 0; i < 4; i++) { // Reduced from 10 to 4 weeks
          const week = addWeeks(currentWeek, i);
          const weekKey = format(week, 'yyyy-MM-dd');
          if (loadedWeeks.has(weekKey)) {
            setLoadedWeeks(prev => {
              const newSet = new Set(prev);
              newSet.delete(weekKey);
              return newSet;
            });
            await loadWeek(week);
          }
        }
      } else {
        // For one-time slots, only reload the specific week containing the selected date
        const selectedDate = (data as any).selected_date;
        if (selectedDate) {
          const slotDate = new Date(selectedDate);
          const slotWeek = startOfWeek(slotDate);
          const weekKey = format(slotWeek, 'yyyy-MM-dd');
          if (loadedWeeks.has(weekKey)) {
            setLoadedWeeks(prev => {
              const newSet = new Set(prev);
              newSet.delete(weekKey);
              return newSet;
            });
            await loadWeek(slotWeek);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create slot');
      throw err;
    }
  }, [loadWeek, loadedWeeks]);

  const updateSlot = useCallback(async (slotId: string, date: string, data: UpdateSlotRequest) => {
    setError(null);
    
    try {
      await api.updateSlot(slotId, date, data);
      
      // Force reload by directly fetching fresh data
      const weekStart = startOfWeek(new Date(date));
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      // Directly fetch fresh data without checking cache
      setLoading(true);
      const weekSlots = await api.getSlotsForWeek(weekKey);
      
      setSlots(prev => {
        const filtered = prev.filter(slot => {
          const slotWeekStart = format(startOfWeek(new Date(slot.date)), 'yyyy-MM-dd');
          return slotWeekStart !== weekKey;
        });
        return [...filtered, ...weekSlots].sort((a, b) => {
          const aDate = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
          const bDate = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
          
          if (aDate !== bDate) {
            return aDate - bDate;
          }
          return a.start_time.localeCompare(b.start_time);
        });
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to update slot');
      throw err;
    }
  }, []);

  const deleteSlot = useCallback(async (slotId: string, date: string) => {
    setError(null);
    
    // Optimistic update - convert date string to compare properly
    setSlots(prev => prev.filter(slot => {
      const slotDateStr = slot.date instanceof Date ? format(slot.date, 'yyyy-MM-dd') : slot.date;
      return !(slot.id === slotId && slotDateStr === date);
    }));

    try {
      await api.deleteSlot(slotId, date);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete slot');
      // Revert optimistic update
      const weekStart = startOfWeek(new Date(date));
      await loadWeek(weekStart);
      throw err;
    }
  }, [loadWeek]);

  const deleteRecurringSlot = useCallback(async (slotId: string) => {
    setError(null);
    
    // Optimistic update
    setSlots(prev => prev.filter(slot => slot.id !== slotId));

    try {
      await api.deleteRecurringSlot(slotId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recurring slot');
      // Reload all loaded weeks
      const weeks = Array.from(loadedWeeks);
      setLoadedWeeks(new Set());
      for (const weekKey of weeks) {
        await loadWeek(new Date(weekKey));
      }
      throw err;
    }
  }, [loadedWeeks, loadWeek]);

  return {
    slots,
    loading,
    error,
    loadWeek,
    createSlot,
    updateSlot,
    deleteSlot,
    deleteRecurringSlot,
  };
};