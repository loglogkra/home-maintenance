import dayjs from 'dayjs';
import { create } from 'zustand';
import { clearHomeData, loadHomeData, saveHomeData } from '../storage/storage';
import { HomeItem, Task, demoItems, demoTasks } from '../types/models';
import { ThemeName } from '../theme/theme';

type HomeState = {
  tasks: Task[];
  items: HomeItem[];
  notificationsEnabled: boolean;
  isHydrated: boolean;
  region: string;
  theme: ThemeName;
  loadFromStorage: () => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskCompleted: (id: string) => void;
  removeTask: (id: string) => void;
  addItem: (item: HomeItem) => void;
  updateItem: (id: string, updates: Partial<HomeItem>) => void;
  removeItem: (id: string) => void;
  resetDemoData: () => Promise<void>;
  bulkAddRecommendedTasks: () => number;
  addSeasonalChecklists: () => number;
  setRegion: (region: string) => void;
  toggleNotifications: () => void;
  toggleTheme: () => void;
};

const persistState = async (
  tasks: Task[],
  items: HomeItem[],
  region: string,
  theme: ThemeName,
) => {
  await saveHomeData({ tasks, items, region, theme });
};

const getNextDueDate = (task: Task): string | undefined => {
  const baseDate = dayjs();

  switch (task.frequency) {
    case 'Monthly':
      return baseDate.add(1, 'month').toISOString();
    case 'Quarterly':
      return baseDate.add(3, 'month').toISOString();
    case 'Every 6 Months':
      return baseDate.add(6, 'month').toISOString();
    default:
      return undefined;
  }
};

export const useHomeStore = create<HomeState>((set, get) => ({
  tasks: [],
  items: [],
  notificationsEnabled: false,
  region: 'United States',
  theme: 'light',
  isHydrated: false,
  loadFromStorage: async () => {
    const data = await loadHomeData();
    if (data) {
      set({
        tasks: data.tasks,
        items: data.items,
        region: data.region ?? 'United States',
        theme: data.theme ?? 'light',
        isHydrated: true,
      });
      return;
    }

    set({
      tasks: demoTasks,
      items: demoItems,
      region: 'United States',
      theme: 'light',
      isHydrated: true,
    });
    await persistState(demoTasks, demoItems, 'United States', 'light');
  },
  addTask: (task) => {
    set((state) => {
      const updatedTasks = [...state.tasks, task];
      void persistState(updatedTasks, state.items, state.region, state.theme);
      return { ...state, tasks: updatedTasks };
    });
  },
  updateTask: (id, updates) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task,
      );
      void persistState(updatedTasks, state.items, state.region, state.theme);
      return { ...state, tasks: updatedTasks };
    });
  },
  toggleTaskCompleted: (id) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) => {
        if (task.id !== id) return task;
        const wasCompleted = Boolean(task.isCompleted);
        const now = dayjs().toISOString();

        if (!wasCompleted) {
          const nextDueDate = getNextDueDate(task);

          return {
            ...task,
            isCompleted: nextDueDate ? false : true,
            lastCompletedDate: now,
            dueDate: nextDueDate ?? task.dueDate,
          };
        }

        return {
          ...task,
          isCompleted: false,
          lastCompletedDate: undefined,
        };
      });
      void persistState(updatedTasks, state.items, state.region, state.theme);
      return { ...state, tasks: updatedTasks };
    });
  },
  removeTask: (id) => {
    set((state) => {
      const updatedTasks = state.tasks.filter((task) => task.id !== id);
      void persistState(updatedTasks, state.items, state.region, state.theme);
      return { ...state, tasks: updatedTasks };
    });
  },
  addItem: (item) => {
    set((state) => {
      const updatedItems = [...state.items, item];
      void persistState(state.tasks, updatedItems, state.region, state.theme);
      return { ...state, items: updatedItems };
    });
  },
  updateItem: (id, updates) => {
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      );
      void persistState(state.tasks, updatedItems, state.region, state.theme);
      return { ...state, items: updatedItems };
    });
  },
  removeItem: (id) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== id);
      void persistState(state.tasks, updatedItems, state.region, state.theme);
      return { ...state, items: updatedItems };
    });
  },
  resetDemoData: async () => {
    await clearHomeData();
    set({ tasks: demoTasks, items: demoItems, region: 'United States', theme: 'light' });
    await persistState(demoTasks, demoItems, 'United States', 'light');
  },
  bulkAddRecommendedTasks: () => {
    const recommended = [
      'Furnace filter',
      'Gutter cleaning',
      'AC coil clean',
      'Smoke detector test',
      'Clean dishwasher filter',
      'Change fridge water filter',
      'Inspect dryer vent',
      'Flush water heater',
      'Test sump pump',
      'Clean range hood filter',
      'Check GFCI outlets',
      'Deep clean garbage disposal',
    ];

    const uniqueNames = new Set(get().tasks.map((task) => task.name.toLowerCase()));
    const now = dayjs();
    const newTasks = recommended
      .filter((name) => !uniqueNames.has(name.toLowerCase()))
      .map((name, idx) => ({
        id: `recommended-${Date.now()}-${idx}`,
        name,
        frequency: 'Quarterly',
        dueDate: now.add(idx, 'day').toISOString(),
        isCompleted: false,
      }));

    if (newTasks.length === 0) return 0;

    set((state) => {
      const updatedTasks = [...state.tasks, ...newTasks];
      void persistState(updatedTasks, state.items, state.region, state.theme);
      return { ...state, tasks: updatedTasks };
    });
    return newTasks.length;
  },
  addSeasonalChecklists: () => {
    const region = get().region;
    const now = dayjs();

    const seasonalTemplates = [
      {
        season: 'Summer',
        name: 'Summer checklist',
        tasks: [
          'Inspect HVAC condensate line',
          'Clean ceiling fan blades',
          'Rinse AC condenser fins',
        ],
      },
      {
        season: 'Fall',
        name: 'Fall prep',
        tasks: ['Blow out sprinklers', 'Reseal exterior gaps', 'Inspect roof flashing'],
      },
      {
        season: 'Winter',
        name: 'Winterizing checklist',
        tasks: [
          'Cover hose bibs',
          'Test carbon monoxide detectors',
          'Check attic insulation',
        ],
      },
    ];

    let added = 0;
    set((state) => {
      const existingNames = new Set(state.tasks.map((task) => task.name.toLowerCase()));
      const seasonalTasks = seasonalTemplates.flatMap((template, seasonIdx) =>
        template.tasks.map((taskName, idx) => ({
          id: `seasonal-${template.season}-${Date.now()}-${seasonIdx}-${idx}`,
          name: `${template.name}: ${taskName}`,
          frequency: 'Yearly',
          dueDate: now.add(seasonIdx * 30 + idx, 'day').toISOString(),
          isCompleted: false,
          seasonalTag: `${template.season} - ${region}`,
        })),
      );

      const filtered = seasonalTasks.filter(
        (task) => !existingNames.has(task.name.toLowerCase()),
      );

      added = filtered.length;
      if (filtered.length === 0) return state;

      const updatedTasks = [...state.tasks, ...filtered];
      void persistState(updatedTasks, state.items, state.region, state.theme);
      return { ...state, tasks: updatedTasks };
    });
    return added;
  },
  setRegion: (region) => {
    set((state) => {
      void persistState(state.tasks, state.items, region, state.theme);
      return { ...state, region };
    });
  },
  toggleNotifications: () => {
    set((state) => ({ ...state, notificationsEnabled: !state.notificationsEnabled }));
  },
  toggleTheme: () => {
    set((state) => {
      const theme = state.theme === 'light' ? 'dark' : 'light';
      void persistState(state.tasks, state.items, state.region, theme);
      return { ...state, theme };
    });
  },
}));
