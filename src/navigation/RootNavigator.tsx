import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AddTaskScreen from '../screens/AddTaskScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddItemScreen from '../screens/AddItemScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import ItemsScreen from '../screens/ItemsScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TasksScreen from '../screens/TasksScreen';
import { useAppTheme } from '../theme/ThemeProvider';

export type DashboardStackParamList = {
  DashboardHome: undefined;
  Search: undefined;
};

export type TaskStackParamList = {
  Tasks: undefined;
  AddTask: { id?: string } | undefined;
};

export type ItemsStackParamList = {
  Items: undefined;
  ItemDetail: { id: string };
  AddItem: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
};

export type RootTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList> | undefined;
  TasksTab: NavigatorScreenParams<TaskStackParamList> | undefined;
  ItemsTab: NavigatorScreenParams<ItemsStackParamList> | undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const TaskStack = createNativeStackNavigator<TaskStackParamList>();
const ItemStack = createNativeStackNavigator<ItemsStackParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const TasksStackNavigator = () => (
  <TaskStack.Navigator>
    <TaskStack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tasks' }} />
    <TaskStack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Add Task' }} />
  </TaskStack.Navigator>
);

const ItemsStackNavigator = () => (
  <ItemStack.Navigator>
    <ItemStack.Screen name="Items" component={ItemsScreen} options={{ title: 'Items' }} />
    <ItemStack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Add Item' }} />
    <ItemStack.Screen
      name="ItemDetail"
      component={ItemDetailScreen}
      options={{ title: 'Item Details' }}
    />
  </ItemStack.Navigator>
);

const DashboardStackNavigator = () => (
  <DashboardStack.Navigator>
    <DashboardStack.Screen
      name="DashboardHome"
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <DashboardStack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
  </DashboardStack.Navigator>
);

const SettingsStackNavigator = () => (
  <SettingsStack.Navigator>
    <SettingsStack.Screen
      name="SettingsHome"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </SettingsStack.Navigator>
);

const RootNavigator = () => {
  const { colors, navigationTheme } = useAppTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarIcon: ({ color, size }) => {
            const iconName = (() => {
              switch (route.name) {
                case 'Dashboard':
                  return 'home-outline';
                case 'TasksTab':
                  return 'checkmark-done-outline';
                case 'ItemsTab':
                  return 'cube-outline';
                case 'Settings':
                  return 'settings-outline';
                default:
                  return 'ellipse-outline';
              }
            })();
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
        <Tab.Screen
          name="TasksTab"
          component={TasksStackNavigator}
          options={{ title: 'Tasks' }}
        />
        <Tab.Screen
          name="ItemsTab"
          component={ItemsStackNavigator}
          options={{ title: 'Items' }}
        />
        <Tab.Screen name="Settings" component={SettingsStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
