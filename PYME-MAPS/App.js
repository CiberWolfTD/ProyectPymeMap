import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Provider as PaperProvider, Button } from 'react-native-paper';
import { useFonts, CabinSketch_400Regular, CabinSketch_700Bold } from '@expo-google-fonts/cabin-sketch';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MyPymeScreen from './src/screens/MyPymeScreen';
import RegisterLocalScreen from './src/screens/RegisterLocalScreen';
import LocalDetailScreen from './src/screens/LocalDetailScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import MapScreen from './src/screens/MapScreen';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState('Login');
  const [userData, setUserData] = React.useState(null);
  const [fontsLoaded] = useFonts({ CabinSketch_400Regular, CabinSketch_700Bold });
  const [selectedLocalId, setSelectedLocalId] = React.useState(null);
  const [previousScreen, setPreviousScreen] = React.useState(null);

  const handleNavigateToScreen = (screen, data) => {
    console.log('Navegando a:', screen, 'con datos:', data);
    
    if (data?.localId) {
      setSelectedLocalId(data.localId);
    }
    
    if (data?.origin) {
      setPreviousScreen(data.origin);
    }
    
    setCurrentScreen(screen);
  };

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

  const handleLoginSuccess = (data) => {
    console.log('Login exitoso:', data);
    setUserData(data);
    setCurrentScreen('MapScreen');
  };

  const handleLogout = () => {
    console.log('Cerrando sesion');
    setUserData(null);
    setCurrentScreen('Login');
    setSelectedLocalId(null);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <PaperProvider>
          {currentScreen === 'Login' && (
            <LoginScreen 
              onNavigate={setCurrentScreen} 
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {currentScreen === 'Register' && (
            <RegisterScreen onNavigate={setCurrentScreen} />
          )}

          {currentScreen === 'Home' && userData && (
            <HomeScreen 
              userData={userData}
              onNavigateToScreen={handleNavigateToScreen}
            />
          )}

          {currentScreen === 'MapScreen' && userData && (
            <MapScreen 
              userData={userData}
              onNavigateToScreen={handleNavigateToScreen}
            />
          )}

          {currentScreen === 'Profile' && userData && (
            <ProfileScreen 
              onNavigate={handleLogout} 
              userData={userData}
              onNavigateToScreen={handleNavigateToScreen}
            />
          )}

          {currentScreen === 'MyPymeScreen' && userData && (
            <MyPymeScreen 
              userData={userData}
              onNavigateToScreen={handleNavigateToScreen}
            />
          )}

          {currentScreen === 'RegisterLocalScreen' && userData && (
            <RegisterLocalScreen 
              userData={userData}
              onNavigateToScreen={handleNavigateToScreen}
            />
          )}

          {currentScreen === 'LocalDetailScreen' && userData && (
            <LocalDetailScreen 
              userData={userData}
              localId={selectedLocalId}
              previousScreen={previousScreen}
              onNavigateToScreen={handleNavigateToScreen}
            />
          )}

          {currentScreen === 'AddProductScreen' && userData && (
            <AddProductScreen 
              userData={userData}
              localId={selectedLocalId}
              onNavigateToScreen={handleNavigateToScreen}
            />
          )}
        </PaperProvider>
      </SafeAreaView>
    </SafeAreaProvider>
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