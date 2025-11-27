import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Provider as PaperProvider, Button } from 'react-native-paper';
import { useFonts, CabinSketch_400Regular, CabinSketch_700Bold } from '@expo-google-fonts/cabin-sketch';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MyPymeScreen from './src/screens/MyPymeScreen';
import RegisterLocalScreen from './src/screens/RegisterLocalScreen';
import LocalDetailScreen from './src/screens/LocalDetailScreen';
import AddProductScreen from './src/screens/AddProductScreen';

// Pantallas placeholder
const HomeScreen = ({ onNavigateToScreen }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <Text style={{ fontSize: 24, marginBottom: 20 }}>Home (En desarrollo)</Text>
    <Button mode="contained" onPress={() => onNavigateToScreen('Profile')}>Ir a Perfil</Button>
  </View>
);

const MapScreen = ({ onNavigateToScreen }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <Text style={{ fontSize: 24, marginBottom: 20 }}>Mapa (En desarrollo)</Text>
    <Button mode="contained" onPress={() => onNavigateToScreen('Profile')}>Ir a Perfil</Button>
  </View>
);

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState('Login');
  const [userData, setUserData] = React.useState(null);
  const [fontsLoaded] = useFonts({ CabinSketch_400Regular, CabinSketch_700Bold });
  const [selectedLocalId, setSelectedLocalId] = React.useState(null);

  const handleNavigateToScreen = (screen, data) => {
    console.log('Navegando a:', screen, 'con datos:', data);
    
    if (data?.localId) {
      setSelectedLocalId(data.localId);
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

  // Login exitoso → ProfileScreen
  const handleLoginSuccess = (data) => {
    console.log('Login exitoso:', data);
    setUserData(data);
    setCurrentScreen('Profile');
  };

  // Cierra sesión
  const handleLogout = () => {
    console.log('Cerrando sesión');
    setUserData(null);
    setCurrentScreen('Login');
    setSelectedLocalId(null);
  };

  return (
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
        <HomeScreen onNavigateToScreen={handleNavigateToScreen} />
      )}

      {currentScreen === 'MapScreen' && userData && (
        <MapScreen onNavigateToScreen={handleNavigateToScreen} />
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