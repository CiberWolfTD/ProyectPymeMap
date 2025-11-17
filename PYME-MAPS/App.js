import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { useFonts, CabinSketch_400Regular, CabinSketch_700Bold } from '@expo-google-fonts/cabin-sketch';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState('Login');
  const [fontsLoaded] = useFonts({ CabinSketch_400Regular, CabinSketch_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Cargando Pyme Maps...</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>
    );
  }

  return (
    <PaperProvider>
      {currentScreen === 'Login' && <LoginScreen onNavigate={setCurrentScreen} />}
      {currentScreen === 'Register' && <RegisterScreen onNavigate={setCurrentScreen} />}
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3eefaff',
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressBar: {
    width: 120,
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#6200ee',
  },
});