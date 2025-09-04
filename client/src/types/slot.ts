export interface Slot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface SlotWithDate extends Slot {
  date: Date;
  is_exception?: boolean;
  is_recurring?: boolean;
}

export interface CreateSlotRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
}

export interface UpdateSlotRequest {
  start_time: string;
  end_time: string;
}