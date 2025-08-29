import { useEffect, useState } from "react";
import { fetchTasks, addTask, deleteTask } from "../lib/api";
import { Task } from "../types/task";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetchTasks().then(setTasks);
  }, []);

  const handleAdd = async () => {
    if (!newTask) return;
    const task = await addTask(newTask);
    setTasks([...tasks, task]);
    setNewTask("");
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Todo List</h1>
      <div className="flex mb-4">
        <input
          className="border p-2 mr-2"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task"
        />
        <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="flex justify-between border-b py-2">
            <span>{task.title}</span>
            <button onClick={() => handleDelete(task.id)} className="text-red-500">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

