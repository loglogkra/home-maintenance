import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import { Task } from '../types/models';

export type ScheduledNotifications = {
  tasks: Record<string, string>;
  weeklySummaryId: string | null;
};

export const DEFAULT_SCHEDULED_NOTIFICATIONS: ScheduledNotifications = {
  tasks: {},
  weeklySummaryId: null,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const initializeNotificationChannels = async () => {
  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
};

export const getPermissionStatus = async (): Promise<Notifications.PermissionStatus> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};

export const requestPermission = async (): Promise<Notifications.PermissionStatus> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
};

const buildTaskReminderContent = (task: Task): Notifications.NotificationContentInput => ({
  title: task.name,
  body: task.dueDate ? `Due ${dayjs(task.dueDate).format('MMM D, YYYY')}` : 'Task reminder',
  data: { taskId: task.id },
});

const getTriggerFromDueDate = (dueDate: string): Date | null => {
  const triggerDate = dayjs(dueDate);
  if (!triggerDate.isValid()) return null;
  return triggerDate.toDate();
};

export const scheduleTaskReminder = async (task: Task): Promise<string | null> => {
  if (!task.dueDate || task.isCompleted) return null;
  const trigger = getTriggerFromDueDate(task.dueDate);
  if (!trigger || dayjs(trigger).isBefore(dayjs())) return null;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: buildTaskReminderContent(task),
    trigger,
  });
  return identifier;
};

export const cancelNotification = async (identifier: string | null | undefined) => {
  if (!identifier) return;
  await Notifications.cancelScheduledNotificationAsync(identifier);
};

export const cancelNotifications = async (identifiers: Array<string | null | undefined>) => {
  await Promise.all(identifiers.map((id) => cancelNotification(id)));
};

const buildWeeklySummaryContent = (overdueCount: number, upcomingCount: number) => {
  const parts = [] as string[];
  if (overdueCount > 0) parts.push(`${overdueCount} overdue`);
  if (upcomingCount > 0) parts.push(`${upcomingCount} due soon`);
  const summary = parts.length > 0 ? parts.join(' • ') : 'You are all caught up!';

  return {
    title: 'Weekly home care summary',
    body: summary,
    data: { type: 'weekly-summary' },
  } satisfies Notifications.NotificationContentInput;
};

const getNextWeeklyTrigger = (): Date => {
  const now = dayjs();
  let target = now.day(1).hour(9).minute(0).second(0).millisecond(0);
  if (target.isBefore(now)) {
    target = target.add(1, 'week');
  }
  return target.toDate();
};

export const scheduleWeeklySummary = async (tasks: Task[]): Promise<string | null> => {
  const now = dayjs();
  const overdueCount = tasks.filter((task) => task.dueDate && !task.isCompleted && dayjs(task.dueDate).isBefore(now)).length;
  const upcomingCount = tasks.filter((task) =>
    task.dueDate &&
    !task.isCompleted &&
    dayjs(task.dueDate).isAfter(now) &&
    dayjs(task.dueDate).isBefore(now.add(7, 'day')),
  ).length;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: buildWeeklySummaryContent(overdueCount, upcomingCount),
    trigger: getNextWeeklyTrigger(),
  });

  return identifier;
};
