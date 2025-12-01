import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { useHomeStore } from './src/state/useHomeStore';
import { colors } from './src/theme/theme';

const App = () => {
  const { isHydrated, loadFromStorage } = useHomeStore();

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

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
};

export default App;
