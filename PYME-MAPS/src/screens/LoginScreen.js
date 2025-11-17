import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loginUser } from '../services/authService';

export default function LoginScreen({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos vacíos', 'Por favor completa todos los campos');
      return;
    }

    console.log('Intentando login con:', email);
    setLoading(true);
    
    const result = await loginUser(email, password);
    
    setLoading(false);
    
    if (result.success) {
      console.log('Login exitoso');
      console.log('Datos del usuario:', result.userData);
      
      if (result.userData) {
        Alert.alert(
          '¡Bienvenido!',
          `Hola ${result.userData.nombre}`,
          [
            {
              text: 'OK',
              onPress: () => {
                onLoginSuccess(result.userData);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Atención',
          'Sesión iniciada pero no se encontraron datos del perfil',
          [
            {
              text: 'OK',
              onPress: () => {
                onLoginSuccess({
                  nombre: 'Usuario',
                  apellido: '',
                  correo: email,
                  rut: 'N/A',
                  telefono: 'N/A'
                });
              }
            }
          ]
        );
      }
    } else {
      console.error('Error en login:', result.error);
      Alert.alert(
        'Error de inicio de sesión',
        result.error || 'Credenciales incorrectas',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Próximamente', 'Función de Google pendiente de implementar');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.title}>Únete a Pyme Maps</Text>
        <Text style={styles.subtitle}>Comencemos!</Text>
      </View>

      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="map-marker" size={60} color="#674FA3" /> 
      </View>

      <View style={styles.bottomSection}>
        <TextInput
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={loading}
        />
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={!showPassword}
          style={styles.input}
          disabled={loading}
          right={
            <TextInput.Icon 
              icon={showPassword ? "eye-off" : "eye"} 
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.loginButton}
          labelStyle={{ fontSize: 16 }}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Iniciando...' : 'Iniciar sesión'}
        </Button>

        <Button
          mode="outlined"
          icon="google"
          onPress={handleGoogleSignIn}
          style={styles.googleButton}
          disabled={loading}
        >
          Continuar con Google
        </Button>

        <View style={styles.registerContainer}>
          <Text style={{ color: '#555' }}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => onNavigate('Register')} disabled={loading}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  input: {
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 20,
  },
  googleButton: {
    marginTop: 8,
  },
  registerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerLink: {
    color: '#674FA3',
    fontWeight: 'bold',
  },
});