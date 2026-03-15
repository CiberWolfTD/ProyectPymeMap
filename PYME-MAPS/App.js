import * as React from 'react';
import { View, StyleSheet, Text, StatusBar, Platform } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useFonts, CabinSketch_400Regular, CabinSketch_700Bold } from '@expo-google-fonts/cabin-sketch';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MyPymeScreen from './src/screens/MyPymeScreen';
import RegisterLocalScreen from './src/screens/RegisterLocalScreen';
import LocalDetailScreen from './src/screens/LocalDetailScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import MapScreen from './src/screens/MapScreen';
import HomeScreen from './src/screens/HomeScreen';

// Tema a modo claro
const lightTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#674FA3',
    primaryContainer: '#f3eefaff',
    secondary: '#674FA3',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    onSurface: '#222222',
    onSurfaceVariant: '#666666',
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState('Login');
  const [userData, setUserData] = React.useState(null);
  const [fontsLoaded] = useFonts({ CabinSketch_400Regular, CabinSketch_700Bold });
  const [selectedLocalId, setSelectedLocalId] = React.useState(null);
  const [previousScreen, setPreviousScreen] = React.useState(null);

  const handleNavigateToScreen = (screen, data) => {
    console.log('Navegando a:', screen);
    
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
        <StatusBar barStyle="dark-content" backgroundColor="#f3eefaff" />
        <Text style={styles.loadingTitle}>Cargando Pyme Maps...</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>
    );
  }

  const handleLoginSuccess = (data) => {
    setUserData(data);
    setCurrentScreen('MapScreen');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentScreen('Login');
    setSelectedLocalId(null);
  };

  return (
    <PaperProvider theme={lightTheme}>
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#ffffff"
          translucent={false}
        />
        
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
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
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
    color: '#222',
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
    backgroundColor: '#674FA3',
  },
});