import * as React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createLocal } from '../services/localService';
import { createDireccion } from '../services/direccionService';
import { uploadImage, generateFileName } from '../services/imageService';

export default function RegisterLocalScreen({ userData, onNavigateToScreen }) {
  const [formData, setFormData] = React.useState({
    nombre: '',
    descripcion: '',
    rut: '',
    telefono: '',
    correo: '',
    // Dirección
    region: 'Región Metropolitana',
    comuna: '',
    calle: '',
    numeracion: '',
  });

  const [imagenPortada, setImagenPortada] = React.useState(null);
  const [imagenIcono, setImagenIcono] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


const pickImage = async (tipo) => {
  try {
    console.log("Abriendo selector...");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: tipo === "portada" ? [16, 9] : [1, 1],
      quality: 0.8,
      base64: true,
    });

    console.log("Resultado picker:", result);
    if (result.canceled) return;

    const asset = result.assets[0];

    if (tipo === "portada") {
      setImagenPortada(asset);
    } else if (tipo === "icono") {
      setImagenIcono(asset);
    } else {
      console.warn("pickImage: tipo desconocido:", tipo);
    }
  } catch (err) {
    console.log("Error seleccionando imagen:", err);
    Alert.alert("Error", "No se pudo seleccionar la imagen.");
  }
};


  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim())
      newErrors.nombre = "El nombre del local es requerido";
    if (!formData.descripcion.trim())
      newErrors.descripcion = "La descripción es requerida";
    if (!formData.rut.trim()) newErrors.rut = "El RUT es requerido";
    if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es requerido";
    if (!formData.correo.trim() || !formData.correo.includes("@"))
      newErrors.correo = "Correo inválido";
    if (!formData.comuna.trim()) newErrors.comuna = "La comuna es requerida";
    if (!formData.calle.trim()) newErrors.calle = "La calle es requerida";
    if (!formData.numeracion.trim())
      newErrors.numeracion = "La numeración es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Subir imágenes si existen
      let urlPortada = null;
      let urlIcono = null;

      if (imagenPortada) {
        const resultPortada = await uploadImage(
          imagenPortada,
          'locales',
          generateFileName('portada')
        );
        if (resultPortada.success) urlPortada = resultPortada.url;
      }

      if (imagenIcono) {
        const resultIcono = await uploadImage(
          imagenIcono,
          'locales',
          generateFileName('icono')
        );
        if (resultIcono.success) urlIcono = resultIcono.url;
      }

      // Crear el local
      const localResult = await createLocal({
        id_user: userData?.id_user,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        rut: formData.rut,
        telefono: formData.telefono,
        correo: formData.correo,
        imagen_portada: urlPortada,
        imagen_icono: urlIcono,
      });

      if (!localResult.success) {
        setLoading(false);
        Alert.alert('Error', localResult.error || 'No se pudo registrar el local');
        return;
      }

      // Crear la dirección
      await createDireccion({
        id_local: localResult.local.id_local,
        region: formData.region,
        comuna: formData.comuna,
        calle: formData.calle,
        numeracion: formData.numeracion,
        codigo_postal: null,
        latitud: null,
        longitud: null,
      });

      setLoading(false);

      Alert.alert(
        '¡Éxito!',
        'Tu local ha sido registrado correctamente.',
        [{
          text: 'OK',
          onPress: () => onNavigateToScreen('MyPymeScreen'),
        }]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Ocurrió un error al registrar el local');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigateToScreen("MyPymeScreen")}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#674FA3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registro de negocios</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* SECCIÓN DE IMÁGENES*/}
        <View style={styles.imageSection}>

          {/* PORTADA */}
          <TouchableOpacity
            style={styles.imagePlaceholder}
            onPress={() => pickImage("portada")}
          >
            {imagenPortada ? (
              <Image source={{ uri: imagenPortada.uri }} style={styles.imagePreview} />
            ) : (
              <>
                <MaterialCommunityIcons name="camera" size={50} color="#999" />
                <Text style={styles.imageHint}>Imagen de portada</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ICONO */}
          <TouchableOpacity
            style={styles.avatarPlaceholder}
            onPress={() => pickImage("icono")}
          >
            {imagenIcono ? (
              <Image source={{ uri: imagenIcono.uri }} style={styles.avatarPreview} />
            ) : (
              <MaterialCommunityIcons name="camera" size={30} color="#999" />
            )}
          </TouchableOpacity>
        </View>

        {/* FORMULARIO */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información del Local</Text>

          <TextInput
            label="Nombre del local*"
            value={formData.nombre}
            onChangeText={v => handleInputChange("nombre", v)}
            style={styles.input}
            mode="outlined"
          />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

          <TextInput
            label="RUT Local*"
            value={formData.rut}
            onChangeText={v => handleInputChange("rut", v)}
            style={styles.input}
            mode="outlined"
          />
          {errors.rut && <Text style={styles.errorText}>{errors.rut}</Text>}

          <TextInput
            label="Teléfono*"
            value={formData.telefono}
            onChangeText={v => handleInputChange("telefono", v)}
            style={styles.input}
            mode="outlined"
          />
          {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}

          <TextInput
            label="Correo electrónico*"
            value={formData.correo}
            onChangeText={v => handleInputChange("correo", v)}
            mode="outlined"
            style={styles.input}
          />
          {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}

          <TextInput
            label="Descripción*"
            value={formData.descripcion}
            onChangeText={v => handleInputChange("descripcion", v)}
            style={[styles.input, styles.textArea]}
            multiline
            mode="outlined"
          />
          {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}

          <Text style={styles.sectionTitle}>Dirección</Text>

          <TextInput
            label="Comuna"
            value={formData.comuna}
            onChangeText={v => handleInputChange("comuna", v)}
            style={styles.input}
            mode="outlined"
          />
          {errors.comuna && <Text style={styles.errorText}>{errors.comuna}</Text>}

          <TextInput
            label="Calle"
            value={formData.calle}
            onChangeText={v => handleInputChange("calle", v)}
            style={styles.input}
            mode="outlined"
          />
          {errors.calle && <Text style={styles.errorText}>{errors.calle}</Text>}

          <TextInput
            label="Numeración"
            value={formData.numeracion}
            onChangeText={v => handleInputChange("numeracion", v)}
            style={styles.input}
            mode="outlined"
          />
          {errors.numeracion && <Text style={styles.errorText}>{errors.numeracion}</Text>}

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.registerButton}
            loading={loading}
          >
            {loading ? "Registrando..." : "Registrar local"}
          </Button>
        </View>

        <View style={{ height: 50 }} />
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
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 30,
    alignItems: 'center',
    position: 'relative',
  },
  imagePlaceholder: {
    width: 280,
    height: 150,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 20,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  formSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
    marginTop: 10,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  registerButton: {
    marginTop: 20,
  },
});