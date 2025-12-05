export type ChangeEntity = 'task' | 'item';

export type ChangeAction = 'create' | 'update' | 'delete' | 'toggleComplete';

export type ChangeRecord = {
  id: string;
  entity: ChangeEntity;
  action: ChangeAction;
  homeId: string;
  payload?: Record<string, unknown>;
  timestamp: string;
};
