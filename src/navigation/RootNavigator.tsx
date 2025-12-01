import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { colors } from '../theme/theme';
import AddTaskScreen from '../screens/AddTaskScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import ItemsScreen from '../screens/ItemsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TasksScreen from '../screens/TasksScreen';

export type TaskStackParamList = {
  Tasks: undefined;
  AddTask: undefined;
};

export type ItemsStackParamList = {
  Items: undefined;
  ItemDetail: { id: string };
};

const Tab = createBottomTabNavigator();
const TaskStack = createNativeStackNavigator<TaskStackParamList>();
const ItemStack = createNativeStackNavigator<ItemsStackParamList>();

const TasksStackNavigator = () => (
  <TaskStack.Navigator>
    <TaskStack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tasks' }} />
    <TaskStack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Add Task' }} />
  </TaskStack.Navigator>
);

const ItemsStackNavigator = () => (
  <ItemStack.Navigator>
    <ItemStack.Screen name="Items" component={ItemsScreen} options={{ title: 'Items' }} />
    <ItemStack.Screen
      name="ItemDetail"
      component={ItemDetailScreen}
      options={{ title: 'Item Details' }}
    />
  </ItemStack.Navigator>
);

const RootNavigator = () => {
  return (
    <NavigationContainer>
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
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
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
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
