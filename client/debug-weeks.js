import { startOfWeek, addWeeks, format } from 'date-fns';

const today = new Date();
console.log('Today:', today.toISOString());
console.log('Today formatted:', format(today, 'yyyy-MM-dd'));

const currentWeekStart = startOfWeek(today);
console.log('Current Week Start:', format(currentWeekStart, 'yyyy-MM-dd'));

for(let i = 0; i <= 3; i++) {
  const week = addWeeks(currentWeekStart, i);
  console.log(`Week ${i}: ${format(week, 'MMM d, yyyy')} (${format(week, 'yyyy-MM-dd')})`);
}
