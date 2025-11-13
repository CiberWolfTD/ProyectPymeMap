import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import {Provider as PaperProvider,Text,TextInput,Button, } from 'react-native-paper';
import { useFonts, CabinSketch_400Regular, CabinSketch_700Bold } from '@expo-google-fonts/cabin-sketch';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function App() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fontsLoaded] = useFonts({ CabinSketch_400Regular, CabinSketch_700Bold });

// Pantalla de carga; la puse por las fuentes, si no es necesaria la podemos quitar.
if (!fontsLoaded) {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f3eefaff'
    }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>Cargando Pyme Maps...</Text>
      <View style={{
        width: 120,
        height: 8,
        backgroundColor: '#ddd',
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        <View style={{
          width: '60%',
          height: '100%',
          backgroundColor: '#6200ee'
        }} />
      </View>
    </View>
  );
}



  return (
    <PaperProvider>
      <View style={styles.container}>

        <View style={styles.topSection}>
          <Text style={styles.title}>Únete a Pyme Maps</Text>
          <Text style={styles.subtitle}>Comencemos!</Text>
        </View>

        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="map-marker" size={60} color="#674FA3" style={styles.iconContainer} /> 
        </View>

        <View style={styles.bottomSection}>
          <TextInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={() => console.log('Iniciar sesión')}
            style={styles.loginButton}
            labelStyle={{ fontSize: 16 }}
          >
            Iniciar sesión
          </Button>

          <Button
            mode="outlined"
            icon="google"
            onPress={() => console.log('Google Sign-In')}
            style={styles.googleButton}
          >
            Continuar con Google
          </Button>

          <View style={styles.registerContainer}>
            <Text style={{ color: '#555' }}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => console.log('Ir a registro')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 0.4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  bottomSection: {
    flex: 0.7,
    backgroundColor: '#f3eefaff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 40,
    gap: 12,
  },
  title: {
    fontFamily: 'CabinSketch_700Bold',
    fontSize: 36,
    color: '#222',
    marginTop: 30,
  },

  subtitle: {
    fontSize: 26,
    fontFamily: 'CabinSketch_400Regular',
    color: '#222',
    marginTop: 10,
  },

  iconContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: -30,
  marginBottom: 15,
  },

  loginButton: {
    gap: 12,
    marginTop: 20,
  },
  
  registerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});
