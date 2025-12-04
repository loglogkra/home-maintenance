import dayjs from 'dayjs';
import { create } from 'zustand';
import { clearHomeData, loadHomeData, saveHomeData } from '../storage/storage';
import { Home, HomeItem, Task, defaultHome, demoItems, demoTasks } from '../types/models';
import { ThemeName } from '../theme/theme';

type HomeState = {
  homes: Home[];
  activeHomeId: string | null;
  tasks: Task[];
  items: HomeItem[];
  notificationsEnabled: boolean;
  isHydrated: boolean;
  region: string;
  theme: ThemeName;
  loadFromStorage: () => Promise<void>;
  createHome: (name: string) => Home;
  setActiveHome: (homeId: string) => void;
  renameHome: (homeId: string, newName: string) => void;
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
  homes: Home[],
  activeHomeId: string | null,
  tasks: Task[],
  items: HomeItem[],
  region: string,
  theme: ThemeName,
) => {
  const hydratedHomes = ensureHomePresence(homes);
  const resolvedActiveHome = activeHomeId ?? hydratedHomes[0]?.id ?? defaultHome.id;
  await saveHomeData({ homes: hydratedHomes, activeHomeId: resolvedActiveHome, tasks, items, region, theme });
};

const ensureHomePresence = (homes: Home[]): Home[] => {
  if (homes.length > 0) return homes;
  // Default home keeps single-user devices working while preparing for future multi-user sync.
  return [{ ...defaultHome, createdAt: defaultHome.createdAt ?? new Date().toISOString() }];
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
  homes: [],
  activeHomeId: null,
  tasks: [],
  items: [],
  notificationsEnabled: false,
  region: 'United States',
  theme: 'light',
  isHydrated: false,
  loadFromStorage: async () => {
    const data = await loadHomeData();
    const defaultCreatedAt = new Date().toISOString();

    if (data) {
      const hydratedHomes = ensureHomePresence(data.homes ?? []);
      const activeHomeId = data.activeHomeId ?? hydratedHomes[0]?.id ?? defaultHome.id;

      const normalizedTasks = data.tasks.map((task) => ({
        ...task,
        homeId: task.homeId ?? activeHomeId,
      }));
      const normalizedItems = data.items.map((item) => ({
        ...item,
        homeId: item.homeId ?? activeHomeId,
      }));

      set({
        homes: hydratedHomes,
        activeHomeId,
        tasks: normalizedTasks,
        items: normalizedItems,
        region: data.region ?? 'United States',
        theme: data.theme ?? 'light',
        isHydrated: true,
      });
      void persistState(
        hydratedHomes,
        activeHomeId,
        normalizedTasks,
        normalizedItems,
        data.region ?? 'United States',
        data.theme ?? 'light',
      );
      // Future backend sync: this is the hydration entry point to fan out to Azure.
      return;
    }

    const seedHome = { ...defaultHome, createdAt: defaultCreatedAt };
    set({
      homes: [seedHome],
      activeHomeId: seedHome.id,
      tasks: demoTasks,
      items: demoItems,
      region: 'United States',
      theme: 'light',
      isHydrated: true,
    });
    await persistState([seedHome], seedHome.id, demoTasks, demoItems, 'United States', 'light');
  },
  createHome: (name) => {
    const now = new Date().toISOString();
    const newHome: Home = {
      id: `home-${Date.now()}`,
      name,
      createdAt: now,
    };

    set((state) => {
      const homes = [...state.homes, newHome];
      void persistState(homes, newHome.id, state.tasks, state.items, state.region, state.theme);
      return { ...state, homes, activeHomeId: newHome.id };
    });

    return newHome;
  },
  setActiveHome: (homeId) => {
    set((state) => {
      const exists = state.homes.some((home) => home.id === homeId);
      if (!exists) return state;
      void persistState(state.homes, homeId, state.tasks, state.items, state.region, state.theme);
      return { ...state, activeHomeId: homeId };
    });
  },
  renameHome: (homeId, newName) => {
    set((state) => {
      const homes = state.homes.map((home) =>
        home.id === homeId ? { ...home, name: newName, updatedAt: new Date().toISOString() } : home,
      );
      void persistState(homes, state.activeHomeId, state.tasks, state.items, state.region, state.theme);
      return { ...state, homes };
    });
  },
  addTask: (task) => {
    set((state) => {
      const homes = ensureHomePresence(state.homes);
      const activeHomeId = state.activeHomeId ?? homes[0]?.id ?? defaultHome.id;
      const updatedTasks = [...state.tasks, { ...task, homeId: task.homeId ?? activeHomeId }];
      const resolvedActive = state.activeHomeId ?? activeHomeId;
      void persistState(homes, resolvedActive, updatedTasks, state.items, state.region, state.theme);
      return { ...state, homes, tasks: updatedTasks, activeHomeId: resolvedActive };
    });
  },
  updateTask: (id, updates) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task,
      );
      void persistState(state.homes, state.activeHomeId, updatedTasks, state.items, state.region, state.theme);
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
      void persistState(state.homes, state.activeHomeId, updatedTasks, state.items, state.region, state.theme);
      return { ...state, tasks: updatedTasks };
    });
  },
  removeTask: (id) => {
    set((state) => {
      const updatedTasks = state.tasks.filter((task) => task.id !== id);
      void persistState(state.homes, state.activeHomeId, updatedTasks, state.items, state.region, state.theme);
      return { ...state, tasks: updatedTasks };
    });
  },
  addItem: (item) => {
    set((state) => {
      const homes = ensureHomePresence(state.homes);
      const activeHomeId = state.activeHomeId ?? homes[0]?.id ?? defaultHome.id;
      const updatedItems = [...state.items, { ...item, homeId: item.homeId ?? activeHomeId }];
      const resolvedActive = state.activeHomeId ?? activeHomeId;
      void persistState(homes, resolvedActive, state.tasks, updatedItems, state.region, state.theme);
      return { ...state, homes, items: updatedItems, activeHomeId: resolvedActive };
    });
  },
  updateItem: (id, updates) => {
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      );
      void persistState(state.homes, state.activeHomeId, state.tasks, updatedItems, state.region, state.theme);
      return { ...state, items: updatedItems };
    });
  },
  removeItem: (id) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== id);
      void persistState(state.homes, state.activeHomeId, state.tasks, updatedItems, state.region, state.theme);
      return { ...state, items: updatedItems };
    });
  },
  resetDemoData: async () => {
    await clearHomeData();
    const seededHome = { ...defaultHome, createdAt: new Date().toISOString() };
    set({
      homes: [seededHome],
      activeHomeId: seededHome.id,
      tasks: demoTasks,
      items: demoItems,
      region: 'United States',
      theme: 'light',
    });
    await persistState([seededHome], seededHome.id, demoTasks, demoItems, 'United States', 'light');
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
    const targetHomeId = get().activeHomeId ?? get().homes[0]?.id ?? defaultHome.id;
    const newTasks = recommended
      .filter((name) => !uniqueNames.has(name.toLowerCase()))
      .map((name, idx) => ({
        id: `recommended-${Date.now()}-${idx}`,
        homeId: targetHomeId,
        name,
        frequency: 'Quarterly',
        dueDate: now.add(idx, 'day').toISOString(),
        isCompleted: false,
      }));

    if (newTasks.length === 0) return 0;

    set((state) => {
      const updatedTasks = [...state.tasks, ...newTasks];
      void persistState(state.homes, state.activeHomeId, updatedTasks, state.items, state.region, state.theme);
      return { ...state, tasks: updatedTasks, activeHomeId: state.activeHomeId ?? targetHomeId };
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
      const homeId = state.activeHomeId ?? state.homes[0]?.id ?? defaultHome.id;
      const seasonalTasks = seasonalTemplates.flatMap((template, seasonIdx) =>
        template.tasks.map((taskName, idx) => ({
          id: `seasonal-${template.season}-${Date.now()}-${seasonIdx}-${idx}`,
          homeId,
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
      void persistState(state.homes, state.activeHomeId, updatedTasks, state.items, state.region, state.theme);
      return { ...state, tasks: updatedTasks, activeHomeId: state.activeHomeId ?? homeId };
    });
    return added;
  },
  setRegion: (region) => {
    set((state) => {
      void persistState(state.homes, state.activeHomeId, state.tasks, state.items, region, state.theme);
      return { ...state, region };
    });
  },
  toggleNotifications: () => {
    set((state) => ({ ...state, notificationsEnabled: !state.notificationsEnabled }));
  },
  toggleTheme: () => {
    set((state) => {
      const theme = state.theme === 'light' ? 'dark' : 'light';
      void persistState(state.homes, state.activeHomeId, state.tasks, state.items, state.region, theme);
      return { ...state, theme };
    });
  },
}));
