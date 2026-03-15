import * as React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  validateEmail, 
  validateRUT, 
  validatePhone, 
  validateName,
  formatRUT 
} from '../utils/validation';
import { registerUser } from '../services/authService';

export default function RegisterScreen({ onNavigate }) {
  const [formData, setFormData] = React.useState({
    nombre: '',
    apellidos: '',
    rut: '',
    correo: '',
    celular: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = React.useState({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleInputChange = (field, value) => {
    if (field === 'rut') {
      value = formatRUT(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (!validateName(formData.nombre)) {
      newErrors.nombre = 'Nombre inválido (solo letras)';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (!validateName(formData.apellidos)) {
      newErrors.apellidos = 'Apellidos inválidos (solo letras)';
    }

    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    } else if (!validateRUT(formData.rut)) {
      newErrors.rut = 'RUT inválido';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!validateEmail(formData.correo)) {
      newErrors.correo = 'Correo electrónico inválido';
    }

    if (!formData.celular.trim()) {
      newErrors.celular = 'El celular es requerido';
    } else if (!validatePhone(formData.celular)) {
      newErrors.celular = 'Número inválido (ej: 9 1234 5678)';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      console.log('Formulario válido, iniciando registro...');
      setLoading(true);
      
      const result = await registerUser(formData);
      
      setLoading(false);
      
      if (result.success) {
        console.log('Registro exitoso');
        Alert.alert(
          '¡Registro exitoso!',
          'Tu cuenta ha sido creada correctamente.',
          [
            {
              text: 'OK',
              onPress: () => onNavigate('Login')
            }
          ]
        );
      } else {
        console.error('Error en registro:', result.error);
        Alert.alert(
          'Error en el registro',
          result.error || 'No se pudo completar el registro',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => onNavigate('Login')} 
          style={styles.backButton}
          disabled={loading}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#674FA3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Volver al inicio</Text>
      </View>

      <ScrollView 
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <Text style={styles.title}>Registro</Text>

          <TextInput
            label="Nombre"
            value={formData.nombre}
            onChangeText={(value) => handleInputChange('nombre', value)}
            mode="outlined"
            style={styles.input}
            error={!!errors.nombre}
            disabled={loading}
          />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

          <TextInput
            label="Apellidos"
            value={formData.apellidos}
            onChangeText={(value) => handleInputChange('apellidos', value)}
            mode="outlined"
            style={styles.input}
            error={!!errors.apellidos}
            disabled={loading}
          />
          {errors.apellidos && <Text style={styles.errorText}>{errors.apellidos}</Text>}

          <TextInput
            label="RUT"
            value={formData.rut}
            onChangeText={(value) => handleInputChange('rut', value)}
            mode="outlined"
            style={styles.input}
            placeholder="12.345.678-9"
            error={!!errors.rut}
            maxLength={12}
            disabled={loading}
          />
          {errors.rut && <Text style={styles.errorText}>{errors.rut}</Text>}

          <TextInput
            label="Correo electrónico"
            value={formData.correo}
            onChangeText={(value) => handleInputChange('correo', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.correo}
            disabled={loading}
          />
          {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}

          <TextInput
            label="Celular"
            value={formData.celular}
            onChangeText={(value) => handleInputChange('celular', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="9 1234 5678"
            error={!!errors.celular}
            disabled={loading}
          />
          {errors.celular && <Text style={styles.errorText}>{errors.celular}</Text>}

          <TextInput
            label="Contraseña"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            error={!!errors.password}
            disabled={loading}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TextInput
            label="Confirmar contraseña"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            error={!!errors.confirmPassword}
            disabled={loading}
            right={
              <TextInput.Icon 
                icon={showConfirmPassword ? "eye-off" : "eye"} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.registerButton}
            labelStyle={{ fontSize: 16 }}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: '#674FA3',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formSection: {
    backgroundColor: '#f3eefaff',
    borderRadius: 20,
    padding: 30,
    borderWidth: 2,
    borderColor: '#674FA3',
  },
  title: {
    fontFamily: 'CabinSketch_700Bold',
    fontSize: 32,
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  registerButton: {
    marginTop: 20,
  },
});