import { create } from 'zustand';

export type PendingChange = {
  id: string;
  entity: string;
  action: string;
};

type SyncState = {
  pendingQueue: PendingChange[];
  enqueue: (change: PendingChange) => void;
  clearQueue: () => void;
};

export const useSyncService = create<SyncState>((set) => ({
  pendingQueue: [],
  enqueue: (change) => set((state) => ({ pendingQueue: [...state.pendingQueue, change] })),
  clearQueue: () => set({ pendingQueue: [] }),
}));
