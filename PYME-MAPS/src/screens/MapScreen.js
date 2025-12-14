import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, ActivityIndicator, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getAllLocales } from '../services/localService';

export default function MapScreen({ userData, onNavigateToScreen }) {
  const [locales, setLocales] = React.useState([]);
  const [selectedLocal, setSelectedLocal] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const mapRef = React.useRef(null);

  // Límites de mapa
  const SAN_DIEGO_BOUNDARY = {
    minLat: -33.4650,
    maxLat: -33.4300,
    minLng: -70.6800,
    maxLng: -70.6350,
  };

  const [region] = React.useState({
    latitude: -33.455,
    longitude: -70.646,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  React.useEffect(() => {
    cargarLocales();
  }, []);

  // Función para validar coordenadas
  const validarCoordenadas = (lat, lon) => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    if (isNaN(latNum) || isNaN(lonNum)) {
      return null;
    }
    
    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      return null;
    }
    
    return { latitude: latNum, longitude: lonNum };
  };

  const cargarLocales = async () => {
    setLoading(true);
    try {
      const datos = await getAllLocales();
      console.log("Coordenadas obtenidas:", datos.map(l => ({
        nombre: l.nombre,
        latitud: l.latitud,
        longitud: l.longitud
      })));

      // Filtrar locales con coordenadas válidas y dentro de la zona
      const localesValidos = datos.filter(local => {
        const coords = validarCoordenadas(local.latitud, local.longitud);
        
        if (!coords) {
          console.warn(`Local "${local.nombre}" sin coordenadas válidas`);
          return false;
        }
        
        const dentroZona = (
          coords.latitude >= SAN_DIEGO_BOUNDARY.minLat &&
          coords.latitude <= SAN_DIEGO_BOUNDARY.maxLat &&
          coords.longitude >= SAN_DIEGO_BOUNDARY.minLng &&
          coords.longitude <= SAN_DIEGO_BOUNDARY.maxLng
        );
        
        if (!dentroZona) {
          console.warn(`Local "${local.nombre}" fuera de zona`);
        }
        
        return dentroZona;
      });

      setLocales(localesValidos);
      console.log("Locales válidos dentro de zona:", localesValidos.length);

      if (localesValidos.length > 0) {
        const first = localesValidos[0];
        const coords = validarCoordenadas(first.latitud, first.longitud);
        
        if (coords && mapRef.current) {
          mapRef.current.animateToRegion({
            ...coords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 600);
        }
      } else {
        Alert.alert(
          "Sin locales visibles",
          "No hay locales con coordenadas válidas en la zona permitida."
        );
      }

    } catch (error) {
      console.error("Error cargando locales:", error);
      Alert.alert("Error", "No se pudieron cargar los locales");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (local) => {
    const coords = validarCoordenadas(local.latitud, local.longitud);
    
    if (!coords) {
      console.error(`Coordenadas inválidas para local: ${local.nombre}`);
      Alert.alert("Error", "Este local no tiene coordenadas válidas");
      return;
    }
    
    setSelectedLocal(local);
    
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleCardPress = () => {
    if (selectedLocal && selectedLocal.id_local) {
      onNavigateToScreen('LocalDetailScreen', {
        localId: selectedLocal.id_local,
        origin: 'MapScreen'
      });
    }
  };

  const handleCenterMap = () => {
    if (locales.length > 0) {
      const first = locales[0];
      const coords = validarCoordenadas(first.latitud, first.longitud);
      
      if (coords && mapRef.current) {
        mapRef.current.animateToRegion({
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      }
    } else if (mapRef.current) {
      mapRef.current.animateToRegion(region, 500);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="map-marker-multiple" size={24} color="#674FA3" />
          <Text style={styles.headerTitle}>Mapa de Locales</Text>
        </View>
        <TouchableOpacity onPress={cargarLocales} disabled={loading}>
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color={loading ? "#ccc" : "#674FA3"}
          />
        </TouchableOpacity>
      </View>

      {/* Mapa */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsCompass={true}
        loadingEnabled={true}
      >
        {locales.map((local) => {
          const coords = validarCoordenadas(local.latitud, local.longitud);
          
          if (!coords) return null;
          
          return (
            <Marker
              key={local.id_local}
              coordinate={coords}
              onPress={() => handleMarkerPress(local)}
            >
              <View style={styles.markerContainer}>
                <View style={[
                  styles.marker,
                  selectedLocal?.id_local === local.id_local && styles.markerSelected
                ]}>
                  <MaterialCommunityIcons name="store" size={20} color="#fff" />
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.counter}>
        <View style={styles.counterBadge}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#674FA3" />
          <Text style={styles.counterText}>
            {locales.length} {locales.length === 1 ? 'local' : 'locales'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.centerButton} onPress={handleCenterMap}>
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#674FA3" />
      </TouchableOpacity>

      {selectedLocal && (
        <View style={styles.selectedCard}>
          <Card style={styles.card} onPress={handleCardPress}>
            <View style={styles.cardHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedLocal(null)}
              >
                <MaterialCommunityIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardImageContainer}>
                {selectedLocal.imagen_portada ? (
                  <Image source={{ uri: selectedLocal.imagen_portada }} style={styles.cardImage} />
                ) : (
                  <View style={styles.cardImagePlaceholder}>
                    <MaterialCommunityIcons name="store" size={30} color="#999" />
                  </View>
                )}
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {selectedLocal.nombre}
                </Text>

                {selectedLocal.descripcion && (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {selectedLocal.descripcion}
                  </Text>
                )}

                {selectedLocal.direccion_completa && (
                  <View style={styles.cardAddress}>
                    <MaterialCommunityIcons name="map-marker" size={14} color="#674FA3" />
                    <Text style={styles.cardAddressText} numberOfLines={1}>
                      {selectedLocal.direccion_completa}
                    </Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.cardLink}>Ver detalles →</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#674FA3" />
          <Text style={styles.loadingText}>Cargando locales...</Text>
        </View>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToScreen('Home')}>
          <MaterialCommunityIcons name="home" size={28} color="#999" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="map" size={28} color="#674FA3" />
          <Text style={[styles.navText, styles.navTextActive]}>Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigateToScreen('MyPymeScreen')}
        >
          <MaterialCommunityIcons name="store" size={28} color="#999" />
          <Text style={styles.navText}>Mi Pyme</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigateToScreen('Profile')}
        >
          <MaterialCommunityIcons name="account-circle" size={28} color="#999" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#222',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#674FA3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerSelected: {
    backgroundColor: '#FF6B6B',
    transform: [{ scale: 1.2 }],
  },
  counter: {
    position: 'absolute',
    top: 120,
    left: 15,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  counterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  centerButton: {
    position: 'absolute',
    top: 120,
    right: 15,
    backgroundColor: '#fff',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCard: {
    position: 'absolute',
    bottom: 90,
    left: 15,
    right: 15,
  },
  card: {
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    backgroundColor: '#fff',
  },
  cardHeader: {
    alignItems: 'flex-end',
    paddingTop: 8,
    paddingRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  cardBody: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 0,
  },
  cardImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  cardAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardAddressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  cardFooter: {
    marginTop: 4,
  },
  cardLink: {
    fontSize: 13,
    color: '#674FA3',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#D3D3D3',
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  navTextActive: {
    color: '#674FA3',
    fontWeight: '600',
  },
});