import type { CreateSlotRequest, UpdateSlotRequest, SlotWithDate } from '../types/slot.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = {
  async createSlot(data: CreateSlotRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create slot');
    }
  },

  async getSlotsForWeek(weekStart: string): Promise<SlotWithDate[]> {
    const response = await fetch(`${API_BASE_URL}/slots/week?weekStart=${weekStart}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch slots');
    }

    return response.json();
  },

  async updateSlot(slotId: string, date: string, data: UpdateSlotRequest): Promise<void> {
    const url = `${API_BASE_URL}/slots/${slotId}?date=${date}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update slot');
    }
  },

  async deleteSlot(slotId: string, date: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/slots/${slotId}?date=${date}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete slot');
    }
  },

  async deleteRecurringSlot(slotId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/slots/${slotId}/recurring`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete recurring slot');
    }
  },
};