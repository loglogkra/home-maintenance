export type TaskFrequency =
  | 'One-time'
  | 'Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Every 6 Months'
  | 'Yearly'
  | 'Custom';

export type Task = {
  id: string;
  name: string;
  frequency: TaskFrequency | string;
  room?: string;
  dueDate?: string;
  lastCompletedDate?: string;
  isCompleted?: boolean;
  photos?: string[];
  seasonalTag?: string;
};

export type HomeItem = {
  id: string;
  name: string;
  model?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyEnd?: string;
  room?: string;
  notes?: string;
  photos?: string[];
  receiptPhotos?: string[];
  warrantyPhotos?: string[];
};

export const demoTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Replace HVAC filter',
    frequency: 'Every 6 Months',
    room: 'Hallway',
    dueDate: new Date().toISOString(),
    isCompleted: false,
  },
  {
    id: 'task-2',
    name: 'Test smoke detectors',
    frequency: 'Monthly',
    room: 'Whole Home',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    isCompleted: false,
  },
  {
    id: 'task-3',
    name: 'Clean gutters',
    frequency: 'Quarterly',
    room: 'Exterior',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(),
    isCompleted: false,
  },
];

export const demoItems: HomeItem[] = [
  {
    id: 'item-1',
    name: 'Water Heater',
    model: 'Rheem Performance 50 gal',
    serialNumber: 'WH-12345',
    installDate: new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString(),
    warrantyEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 4)).toISOString(),
    room: 'Basement',
  },
  {
    id: 'item-2',
    name: 'Furnace',
    model: 'Carrier Comfort 80',
    serialNumber: 'FUR-98765',
    installDate: new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString(),
    warrantyEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    room: 'Basement',
  },
  {
    id: 'item-3',
    name: 'Refrigerator',
    model: 'LG SmartCool',
    serialNumber: 'FR-54321',
    installDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
    room: 'Kitchen',
  },
];
