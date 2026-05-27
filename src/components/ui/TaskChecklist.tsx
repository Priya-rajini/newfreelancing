import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { Plus, Trash2, Edit2, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskChecklistProps {
  roleView: "client" | "freelancer";
  title: string;
}

/** Legacy demo task ids — stripped when loading saved checklists */
const LEGACY_SAMPLE_TASK_IDS = new Set([
  "f-1",
  "f-2",
  "f-3",
  "c-1",
  "c-2",
  "c-3",
]);

function loadTasks(storageKey: string): TaskItem[] {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as TaskItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t) => t?.id && !LEGACY_SAMPLE_TASK_IDS.has(t.id));
  } catch (e) {
    console.error("Failed to parse saved tasks", e);
    return [];
  }
}

export function TaskChecklist({ roleView, title }: TaskChecklistProps) {
  const { user } = useUser();
  const storageKey = `skillsync_tasks_${roleView}`;

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    setTasks(loadTasks(storageKey));
  }, [roleView, storageKey]);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [tasks, storageKey]);

  // Create
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskText("");
  };

  // Toggle complete
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Delete
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Start Edit
  const handleStartEdit = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  // Save Edit
  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) {
      handleDeleteTask(id);
      setEditingTaskId(null);
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: editingText.trim() } : t))
    );
    setEditingTaskId(null);
  };

  return (
    <div className="glass rounded-xl p-5 border border-white/5 bg-white/[0.01] flex flex-col gap-4">
      {/* Title */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="font-semibold text-sm text-white capitalize">{title}</h3>
        {tasks.length > 0 && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[var(--color-muted)]">
            {tasks.filter((t) => t.completed).length}/{tasks.length} completed
          </span>
        )}
      </div>

      {/* Add Task Input Form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder={roleView === "client" ? "Add new hiring task..." : "Add new work focus task..."}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors text-white placeholder-white/20"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        />
        <button
          type="submit"
          className="p-2 rounded-xl text-black hover:opacity-90 transition-opacity flex items-center justify-center"
          style={{ backgroundColor: user.color }}
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-2 mt-2">
        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-6 text-center border border-dashed border-white/5 rounded-xl text-xs text-[var(--color-muted)]"
            >
              No tasks yet. Add your first task.
            </motion.div>
          ) : (
            tasks.map((task) => {
              const isEditing = editingTaskId === task.id;
              return (
                <motion.div
                  key={task.id}
                  layoutId={task.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/[0.03] bg-white/[0.003] hover:border-white/10 hover:bg-white/[0.01] transition-all group gap-3"
                >
                  {/* Left Section: Checkbox & Text */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(task.id)}
                      className="shrink-0 transition-colors hover:text-white"
                      style={{ color: task.completed ? user.color : "rgba(255,255,255,0.2)" }}
                    >
                      {task.completed ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Circle size={16} />
                      )}
                    </button>

                    {isEditing ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => handleSaveEdit(task.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(task.id)}
                        autoFocus
                        className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-[var(--color-warm)]/40"
                      />
                    ) : (
                      <span
                        onClick={() => handleStartEdit(task)}
                        className={`text-xs text-white truncate cursor-pointer transition-all flex-1 select-none ${
                          task.completed ? "line-through opacity-50 text-[var(--color-muted)]" : ""
                        }`}
                      >
                        {task.text}
                      </span>
                    )}
                  </div>

                  {/* Right Section: Action buttons (Edit & Delete) */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(task)}
                        className="p-1 rounded text-[var(--color-muted)] hover:text-white transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded text-[var(--color-muted)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
