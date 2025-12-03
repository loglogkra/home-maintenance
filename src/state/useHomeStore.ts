import dayjs from 'dayjs';
import { create } from 'zustand';
import { clearHomeData, loadHomeData, saveHomeData } from '../storage/storage';
import { HomeItem, Task, demoItems, demoTasks } from '../types/models';

type HomeState = {
  tasks: Task[];
  items: HomeItem[];
  notificationsEnabled: boolean;
  isHydrated: boolean;
  loadFromStorage: () => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskCompleted: (id: string) => void;
  removeTask: (id: string) => void;
  addItem: (item: HomeItem) => void;
  updateItem: (id: string, updates: Partial<HomeItem>) => void;
  removeItem: (id: string) => void;
  resetDemoData: () => Promise<void>;
  toggleNotifications: () => void;
};

const persistState = async (tasks: Task[], items: HomeItem[]) => {
  await saveHomeData({ tasks, items });
};

export const useHomeStore = create<HomeState>((set, get) => ({
  tasks: [],
  items: [],
  notificationsEnabled: false,
  isHydrated: false,
  loadFromStorage: async () => {
    const data = await loadHomeData();
    if (data) {
      set({ tasks: data.tasks, items: data.items, isHydrated: true });
      return;
    }

    set({ tasks: demoTasks, items: demoItems, isHydrated: true });
    await persistState(demoTasks, demoItems);
  },
  addTask: (task) => {
    set((state) => {
      const updatedTasks = [...state.tasks, task];
      void persistState(updatedTasks, state.items);
      return { ...state, tasks: updatedTasks };
    });
  },
  updateTask: (id, updates) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task,
      );
      void persistState(updatedTasks, state.items);
      return { ...state, tasks: updatedTasks };
    });
  },
  toggleTaskCompleted: (id) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) => {
        if (task.id !== id) return task;
        const isCompleted = !task.isCompleted;
        return {
          ...task,
          isCompleted,
          lastCompletedDate: isCompleted ? dayjs().toISOString() : undefined,
        };
      });
      void persistState(updatedTasks, state.items);
      return { ...state, tasks: updatedTasks };
    });
  },
  removeTask: (id) => {
    set((state) => {
      const updatedTasks = state.tasks.filter((task) => task.id !== id);
      void persistState(updatedTasks, state.items);
      return { ...state, tasks: updatedTasks };
    });
  },
  addItem: (item) => {
    set((state) => {
      const updatedItems = [...state.items, item];
      void persistState(state.tasks, updatedItems);
      return { ...state, items: updatedItems };
    });
  },
  updateItem: (id, updates) => {
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      );
      void persistState(state.tasks, updatedItems);
      return { ...state, items: updatedItems };
    });
  },
  removeItem: (id) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== id);
      void persistState(state.tasks, updatedItems);
      return { ...state, items: updatedItems };
    });
  },
  resetDemoData: async () => {
    await clearHomeData();
    set({ tasks: demoTasks, items: demoItems });
    await persistState(demoTasks, demoItems);
  },
  toggleNotifications: () => {
    set((state) => ({ ...state, notificationsEnabled: !state.notificationsEnabled }));
  },
}));
