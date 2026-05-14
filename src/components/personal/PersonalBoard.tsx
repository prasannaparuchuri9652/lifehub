"use client";

import { useEffect } from "react";
import { usePersonalStore } from "@/store/personalStore";
import HomeTaskList from "./HomeTaskList";
import HabitTracker from "./HabitTracker";

export default function PersonalBoard() {
  const {
    tasks, habits, loading,
    fetchTasks, fetchHabits,
    createTask, updateTask, deleteTask,
    createHabit, logHabit, deleteHabit,
  } = usePersonalStore();

  useEffect(() => {
    fetchTasks();
    fetchHabits();
  }, [fetchTasks, fetchHabits]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <HomeTaskList
        tasks={tasks}
        onAdd={createTask}
        onToggle={(id, status) => updateTask(id, { status })}
        onDelete={deleteTask}
      />
      <HabitTracker
        habits={habits}
        onLog={logHabit}
        onAdd={createHabit}
        onDelete={deleteHabit}
      />
    </div>
  );
}
