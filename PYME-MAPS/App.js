import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { useFonts, CabinSketch_400Regular, CabinSketch_700Bold } from '@expo-google-fonts/cabin-sketch';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState('Login');
  const [userData, setUserData] = React.useState(null);
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

  // Login exitoso
  const handleLoginSuccess = (data) => {
    console.log('📱 Navegando a ProfileScreen con datos:', data);
    setUserData(data);
    setCurrentScreen('Profile');
  };

  // Cierra sesión
  const handleLogout = () => {
    console.log('Cerrando sesión y volviendo a Login');
    setUserData(null);
    setCurrentScreen('Login');
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
      {currentScreen === 'Profile' && (
        <ProfileScreen 
          onNavigate={handleLogout} 
          userData={userData}
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