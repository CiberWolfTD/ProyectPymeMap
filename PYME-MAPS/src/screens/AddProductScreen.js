import * as React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createProducto } from '../services/productoService';
import { uploadImage, generateFileName } from '../services/imageService';

export default function AddProductScreen({ userData, localId, onNavigateToScreen }) {
  const [formData, setFormData] = React.useState({
    nombre: '',
    precio: '',
    descripcion: '',
    marca: '',
  });

  const [imagenProducto, setImagenProducto] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!localId) {
      Alert.alert('Error', 'No se especificó un local válido');
      onNavigateToScreen('LocalDetailScreen');
    }
  }, [localId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };


  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos permisos para acceder a tus fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setImagenProducto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error en pickImage:', error);
      Alert.alert('Error', 'No se pudo abrir la galería: ' + error.message);
    }
  };

  const removeImage = () => {
    setImagenProducto(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.precio.trim()) newErrors.precio = 'El precio es requerido';
    else if (isNaN(parseFloat(formData.precio))) newErrors.precio = 'Debe ser número';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      let imageUrl = null;

      if (imagenProducto) {
        const uploadResult = await uploadImage(
          imagenProducto,
          'productos',
          generateFileName('producto')
        );
        if (uploadResult.success) imageUrl = uploadResult.url;
      }

      const result = await createProducto({
        id_local: localId,
        nombre: formData.nombre,
        precio: parseFloat(formData.precio),
        descripcion: formData.descripcion,
        marca: formData.marca || null,
        imagen_producto: imageUrl,
      });

      setLoading(false);

      if (result.success) {
        Alert.alert('¡Éxito!', 'Producto agregado', [
          {
            text: 'Añadir otro',
            onPress: () => {
              setFormData({ nombre: '', precio: '', descripcion: '', marca: '' });
              setImagenProducto(null);
            },
          },
          {
            text: 'Volver',
            onPress: () => onNavigateToScreen('LocalDetailScreen', { localId }),
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'No se pudo agregar');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Ocurrió un error al agregar');
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigateToScreen('LocalDetailScreen', { localId })}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#674FA3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar producto</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.imageSection}>
          <Text style={styles.imageSectionTitle}>Imagen del producto</Text>

          <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
            {imagenProducto ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: imagenProducto.uri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                  <MaterialCommunityIcons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <MaterialCommunityIcons name="camera-plus" size={40} color="#999" />
                <Text style={styles.imageHint}>Seleccionar imagen</Text>
              </>
            )}
          </TouchableOpacity>
        </View>


        <View style={styles.formSection}>
          <TextInput
            label="Nombre*"
            value={formData.nombre}
            onChangeText={(v) => handleInputChange('nombre', v)}
            mode="outlined"
            style={styles.input}
          />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

          <TextInput
            label="Precio*"
            value={formData.precio}
            onChangeText={(v) => handleInputChange('precio', v)}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Affix text="$" />}
          />
          {errors.precio && <Text style={styles.errorText}>{errors.precio}</Text>}

          <TextInput
            label="Marca"
            value={formData.marca}
            onChangeText={(v) => handleInputChange('marca', v)}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Descripción*"
            value={formData.descripcion}
            onChangeText={(v) => handleInputChange('descripcion', v)}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
          />
          {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}

          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleAddProduct} style={styles.addButton}>
              Agregar producto
            </Button>
            <Button
              mode="outlined"
              onPress={() => onNavigateToScreen('LocalDetailScreen', { localId })}
              style={styles.cancelButton}
            >
              Cancelar
            </Button>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle:
  { fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#222'
  },

  content:{
    flex: 1
  },

  imageSection: {
    padding: 20,
    backgroundColor: '#f5f5f5'
  },

  imageSectionTitle: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#666'
  },

  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageWrapper: {
    width: '100%',
    height: '100%'
  },

  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10
  },

  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 2,
    borderRadius: 12,
  },

  imageHint: {
    marginTop: 8,
    color: '#999'
  },

  formSection: {
    padding: 20
  },
  input: {
    marginBottom: 10
  },
  textArea: {
    height: 100
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4
  },

  buttonContainer:
  { marginTop: 20, gap: 10 },
  addButton: {},
  cancelButton: 
  { borderColor: '#674FA3' },
});
