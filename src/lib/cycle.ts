export function isCycleOpen(cycle: any): boolean {
  if (!cycle) return false;
  const now = new Date();

  // If both start and end times are set, open state is strictly dependent on the timer
  if (cycle.startAt && cycle.endAt) {
    const start = new Date(cycle.startAt);
    const end = new Date(cycle.endAt);
    return now >= start && now <= end;
  }

  // If only start time is set, must be after start time and manual toggle is true
  if (cycle.startAt) {
    const start = new Date(cycle.startAt);
    return now >= start && !!cycle.isOpen;
  }

  // Fallback to manual toggle state
  return !!cycle.isOpen;
}
