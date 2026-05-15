"use client";

import { useEffect, useState } from "react";
import { usePersonalStore } from "@/store/personalStore";
import type { PersonalTask, Habit } from "@/store/personalStore";
import HomeTaskList from "./HomeTaskList";
import HabitTracker from "./HabitTracker";
import PersonalTaskModal from "./PersonalTaskModal";
import HabitDetailModal from "./HabitDetailModal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useToastStore } from "@/store/toastStore";

export default function PersonalBoard() {
  const {
    tasks, habits, loading,
    fetchTasks, fetchHabits,
    createTask, updateTask, deleteTask,
    createHabit, updateHabit, logHabit, deleteHabit,
  } = usePersonalStore();
  const toast = useToastStore((s) => s.show);

  const [selectedTask, setSelectedTask] = useState<PersonalTask | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [confirmTaskId, setConfirmTaskId] = useState<number | null>(null);
  const [confirmHabitId, setConfirmHabitId] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchHabits();
  }, [fetchTasks, fetchHabits]);

  async function handleDeleteTask(id: number) {
    await deleteTask(id);
    toast("Task deleted", "error");
    setConfirmTaskId(null);
    setSelectedTask(null);
  }

  async function handleDeleteHabit(id: number) {
    await deleteHabit(id);
    toast("Habit deleted", "error");
    setConfirmHabitId(null);
    setSelectedHabit(null);
  }

  return (
    <>
      <PersonalTaskModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={async (id, data) => { await updateTask(id, data); }}
        onDelete={(id) => setConfirmTaskId(id)}
      />
      <HabitDetailModal
        habit={selectedHabit}
        open={!!selectedHabit}
        onClose={() => setSelectedHabit(null)}
        onUpdate={async (id, data) => { await updateHabit(id, data); }}
        onDelete={(id) => setConfirmHabitId(id)}
      />
      <ConfirmDialog
        open={confirmTaskId !== null}
        title="Delete task?"
        message="This will permanently remove the task."
        onConfirm={() => confirmTaskId !== null && handleDeleteTask(confirmTaskId)}
        onCancel={() => setConfirmTaskId(null)}
      />
      <ConfirmDialog
        open={confirmHabitId !== null}
        title="Delete habit?"
        message="This will remove the habit and all its logs."
        onConfirm={() => confirmHabitId !== null && handleDeleteHabit(confirmHabitId)}
        onCancel={() => setConfirmHabitId(null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HomeTaskList
          tasks={tasks}
          onAdd={createTask}
          onToggle={(id, status) => updateTask(id, { status })}
          onDelete={(id) => setConfirmTaskId(id)}
          onView={setSelectedTask}
        />
        <HabitTracker
          habits={habits}
          onLog={logHabit}
          onAdd={createHabit}
          onDelete={(id) => setConfirmHabitId(id)}
          onView={setSelectedHabit}
        />
      </div>
    </>
  );
}
