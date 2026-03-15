import * as React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, TextInput, Button, Portal, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';

import { createLocal } from '../services/localService';
import { createDireccion } from '../services/direccionService';
import { uploadImage, generateFileName } from '../services/imageService';
import { geocodificarDireccion } from '../services/geocodingService';

export default function RegisterLocalScreen({ userData, onNavigateToScreen }) {

  // Limites de zona San Diego - Santiago Centro
  const SAN_DIEGO_BOUNDARY = {
    minLat: -33.4650,  // Sur (Más al sur de San Diego)
    maxLat: -33.4300,  // Norte (Hacia Santiago Centro)
    minLng: -70.6800,  // Oeste (Límite poniente)
    maxLng: -70.6350,  // Este (Hacia el centro)
  };

  // Polígono visual para el mapa (las 4 esquinas del rectángulo)
  const zonaPermitida = [
    { latitude: SAN_DIEGO_BOUNDARY.minLat, longitude: SAN_DIEGO_BOUNDARY.minLng }, // SO
    { latitude: SAN_DIEGO_BOUNDARY.maxLat, longitude: SAN_DIEGO_BOUNDARY.minLng }, // NO
    { latitude: SAN_DIEGO_BOUNDARY.maxLat, longitude: SAN_DIEGO_BOUNDARY.maxLng }, // NE
    { latitude: SAN_DIEGO_BOUNDARY.minLat, longitude: SAN_DIEGO_BOUNDARY.maxLng }, // SE
  ];

  const [formData, setFormData] = React.useState({
    nombre: '',
    descripcion: '',
    rut: '',
    telefono: '',
    correo: '',
    region: 'Región Metropolitana',
    comuna: '',
    calle: '',
    numeracion: '',
  });

  const [imagenPortada, setImagenPortada] = React.useState(null);
  const [imagenIcono, setImagenIcono] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const [coordenadas, setCoordenadas] = React.useState(null);
  const [showMapDialog, setShowMapDialog] = React.useState(false);
  const [loadingGeocode, setLoadingGeocode] = React.useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const pickImage = async (tipo) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: tipo === "portada" ? [16, 9] : [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      if (tipo === "portada") setImagenPortada(asset);
      else if (tipo === "icono") setImagenIcono(asset);

    } catch (err) {
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim())
      newErrors.nombre = "El nombre del local es requerido";
    if (!formData.descripcion.trim())
      newErrors.descripcion = "La descripción es requerida";
    if (!formData.rut.trim())
      newErrors.rut = "El RUT es requerido";
    if (!formData.telefono.trim())
      newErrors.telefono = "El teléfono es requerido";
    if (!formData.correo.trim() || !formData.correo.includes("@"))
      newErrors.correo = "Correo inválido";
    if (!formData.comuna.trim())
      newErrors.comuna = "La comuna es requerida";
    if (!formData.calle.trim())
      newErrors.calle = "La calle es requerida";
    if (!formData.numeracion.trim())
      newErrors.numeracion = "La numeración es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const estaDentroDeZona = (lat, lon) => {
    const dentroLat = lat >= SAN_DIEGO_BOUNDARY.minLat && lat <= SAN_DIEGO_BOUNDARY.maxLat;
    const dentroLng = lon >= SAN_DIEGO_BOUNDARY.minLng && lon <= SAN_DIEGO_BOUNDARY.maxLng;
    
    console.log('Verificando coordenadas:', {
      lat,
      lon,
      dentroLat,
      dentroLng,
      resultado: dentroLat && dentroLng
    });
    
    return dentroLat && dentroLng;
  };

  // Geocodificar y mostrar mapa de confirmación
  const handleGeocodificar = async () => {

    if (!formData.comuna.trim() || !formData.calle.trim() || !formData.numeracion.trim()) {
      Alert.alert('Dirección incompleta', 'Por favor completa calle, número y comuna para verificar la ubicación.');
      return;
    }

    setLoadingGeocode(true);

    try {
      const resultado = await geocodificarDireccion({
        calle: formData.calle,
        numeracion: formData.numeracion,
        comuna: formData.comuna,
        region: formData.region
      });

      console.log('Resultado geocodificación:', resultado);

      const dentroDeLaZona = estaDentroDeZona(resultado.latitude, resultado.longitude);

      if (!dentroDeLaZona) {
        Alert.alert(
          'Zona no permitida',
          `Esta dirección está FUERA de la zona permitida (San Diego - Santiago Centro).\n\nCoordenadas encontradas:\nLat: ${resultado.latitude.toFixed(6)}\nLon: ${resultado.longitude.toFixed(6)}\n\nPor favor ingresa una dirección dentro de la zona.`,
          [{ text: 'Cambiar dirección' }]
        );
        setLoadingGeocode(false);
        return;
      }

      setCoordenadas(resultado);
      setShowMapDialog(true);

      if (resultado.accuracy === 'approximate') {
        Alert.alert(
          'Ubicación aproximada',
          'No se encontró la dirección exacta. Puedes ajustar el marcador arrastrándolo en el mapa.',
          [{ text: 'Entendido' }]
        );
      }

    } catch (err) {
      console.error('Error en geocodificación:', err);
      Alert.alert('Error', 'No se pudo obtener la ubicación. Intenta nuevamente.');
    } finally {
      setLoadingGeocode(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    if (!coordenadas) {
      Alert.alert(
        'Falta verificar ubicación',
        'Debes verificar la ubicación en el mapa antes de registrar el local.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!estaDentroDeZona(coordenadas.latitude, coordenadas.longitude)) {
      Alert.alert(
        'Zona no permitida',
        'El marcador está fuera de la zona permitida. Por favor ajústalo dentro del área marcada.',
        [{ text: 'OK' }]
      );
      return;
    }

    await registrarLocal();
  };

  const registrarLocal = async () => {
    setLoading(true);

    try {
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

      await createDireccion({
        id_local: localResult.local.id_local,
        region: formData.region,
        comuna: formData.comuna,
        calle: formData.calle,
        numeracion: formData.numeracion,
        codigo_postal: null,
        latitud: coordenadas.latitude,
        longitud: coordenadas.longitude,
      });

      setLoading(false);

      Alert.alert(
        '¡Éxito!',
        'Tu local ha sido registrado y aparecerá en el mapa.',
        [{
          text: 'OK',
          onPress: () => onNavigateToScreen('MyPymeScreen'),
        }]
      );

    } catch (error) {
      setLoading(false);
      console.error('Error registrando local:', error);
      Alert.alert('Error', 'Ocurrió un error al registrar el local');
    }
  };

  const handleMarkerDrag = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    
    // Verificar si está dentro de la zona
    const dentroDeZona = estaDentroDeZona(latitude, longitude);
    
    if (!dentroDeZona) {
      // Mostrar advertencia
      console.warn('Marcador fuera de zona');
    }
    
    setCoordenadas({
      latitude,
      longitude,
      accuracy: 'manual'
    });
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


        <View style={styles.imageSection}>
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
          <Text style={styles.helpText}>
            📍 Solo se permiten locales en la zona San Diego - Santiago Centro
          </Text>

          <TextInput
            label="Comuna*"
            value={formData.comuna}
            onChangeText={v => handleInputChange("comuna", v)}
            style={styles.input}
            mode="outlined"
            placeholder="ej: Santiago, San Diego"
          />
          {errors.comuna && <Text style={styles.errorText}>{errors.comuna}</Text>}

          <TextInput
            label="Calle*"
            value={formData.calle}
            onChangeText={v => handleInputChange("calle", v)}
            style={styles.input}
            mode="outlined"
            placeholder="ej: Av. Libertador Bernardo O'Higgins"
          />
          {errors.calle && <Text style={styles.errorText}>{errors.calle}</Text>}

          <TextInput
            label="Numeración*"
            value={formData.numeracion}
            onChangeText={v => handleInputChange("numeracion", v)}
            style={styles.input}
            mode="outlined"
            placeholder="ej: 1234"
            keyboardType="numeric"
          />
          {errors.numeracion && <Text style={styles.errorText}>{errors.numeracion}</Text>}


          <Button
            mode="outlined"
            icon="map-marker-check"
            onPress={handleGeocodificar}
            style={styles.verifyButton}
            loading={loadingGeocode}
            disabled={loadingGeocode}
          >
            {coordenadas ? 'Ubicación verificada ✓' : 'Verificar ubicación en mapa'}
          </Button>

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.registerButton}
            loading={loading}
            disabled={loading || !coordenadas}
          >
            {loading ? "Registrando..." : "Registrar local"}
          </Button>

        </View>

        <View style={{ height: 50 }} />
      </ScrollView>


      <Portal>
        <Dialog 
          visible={showMapDialog} 
          onDismiss={() => setShowMapDialog(false)}
          style={styles.mapDialog}
        >
          <Dialog.Title>Confirmar ubicación</Dialog.Title>

          <Dialog.Content>
            <Text style={styles.mapHint}>
              Arrastra el marcador para ajustar la ubicación exacta.{'\n'}
              El área verde muestra la zona permitida.
            </Text>
            
            {coordenadas && (
              <MapView
                style={styles.mapPreview}
                initialRegion={{
                  latitude: coordenadas.latitude,
                  longitude: coordenadas.longitude,
                  latitudeDelta: 0.03,
                  longitudeDelta: 0.03,
                }}
              >

                <Polygon
                  coordinates={zonaPermitida}
                  fillColor="rgba(103, 79, 163, 0.2)"
                  strokeColor="#674FA3"
                  strokeWidth={2}
                />

                <Marker
                  draggable
                  coordinate={{
                    latitude: coordenadas.latitude,
                    longitude: coordenadas.longitude,
                  }}
                  title="Tu local"
                  description="Arrastra para ajustar"
                  onDragEnd={handleMarkerDrag}
                >
                  <View style={styles.customMarker}>
                    <MaterialCommunityIcons name="store" size={30} color="#674FA3" />
                  </View>
                </Marker>
              </MapView>
            )}

            {coordenadas && (
              <View style={styles.coordsInfo}>
                <Text style={styles.coordsText}>
                  Lat: {coordenadas.latitude.toFixed(6)}, Lon: {coordenadas.longitude.toFixed(6)}
                </Text>
                <Text style={[
                  styles.zoneStatus,
                  estaDentroDeZona(coordenadas.latitude, coordenadas.longitude) 
                    ? styles.zoneInside 
                    : styles.zoneOutside
                ]}>
                  {estaDentroDeZona(coordenadas.latitude, coordenadas.longitude)
                    ? '✓ Dentro de zona permitida'
                    : '⚠ Fuera de zona permitida'}
                </Text>
              </View>
            )}
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={() => setShowMapDialog(false)}>
              {estaDentroDeZona(coordenadas?.latitude, coordenadas?.longitude)
                ? 'Confirmar'
                : 'Ajustar posición'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  helpText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
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
  verifyButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  registerButton: {
    marginTop: 10,
  },
  mapDialog: {
    maxHeight: '85%',
  },
  mapHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 18,
  },
  mapPreview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  customMarker: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#674FA3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  coordsInfo: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  coordsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  zoneStatus: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  zoneInside: {
    color: '#4CAF50',
  },
  zoneOutside: {
    color: '#F44336',
  },
});