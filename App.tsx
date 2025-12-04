import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { useHomeStore } from './src/state/useHomeStore';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeProvider';

const AppContent = () => {
  const { isHydrated, loadFromStorage } = useHomeStore();
  const { colors } = useAppTheme();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (!isHydrated) {
    return (
      <SafeAreaProvider>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return <RootNavigator />;
};

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
