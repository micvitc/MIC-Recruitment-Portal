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

export function isStageOpen(cycle: any, dept: any, stageNum: number): boolean {
  if (!isCycleOpen(cycle)) return false;
  if (!dept) return false;
  
  const stageKey = stageNum.toString();
  // If stageToggles map exists, check it. Default to true if not explicitly set to false.
  if (dept.stageToggles && dept.stageToggles.get) {
    return dept.stageToggles.get(stageKey) !== false;
  }
  
  // Fallback for objects that aren't full Mongoose docs (like plain objects)
  if (dept.stageToggles && typeof dept.stageToggles === 'object') {
    return dept.stageToggles[stageKey] !== false;
  }

  return true;
}
