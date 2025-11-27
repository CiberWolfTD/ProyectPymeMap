import * as React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { getLocalWithProducts } from '../services/localService';

export default function LocalDetailScreen({ userData, localId, onNavigateToScreen }) {
  const [local, setLocal] = React.useState(null);
  const [productos, setProductos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    cargarLocal();
  }, [localId]);

  const cargarLocal = async () => {
    if (!localId) return;
    setLoading(true);

    console.log("Cargando local:", localId);

    try {
      const datos = await getLocalWithProducts(localId);

      if (datos) {
        setLocal(datos);
        setProductos(datos.productos || []);
      } else {
        setLocal(null);
        setProductos([]);
      }
    } catch (err) {
      console.error('Error cargando local:', err);
      setLocal(null);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !local) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const coordenadas = {
    latitude: parseFloat(local.latitud) || -33.45,
    longitude: parseFloat(local.longitud) || -70.6667,
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigateToScreen('MyPymeScreen', {})}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#674FA3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del local</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PORTADA */}
        {local.imagen_portada ? (
          <Image source={{ uri: local.imagen_portada }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <MaterialCommunityIcons name="image-off" size={70} color="#bbb" />
          </View>
        )}

        {/* INFO */}
        <View style={styles.infoContainer}>
          {/* ICONO */}
          <View style={styles.avatarContainer}>
            {local.imagen_icono ? (
              <Image source={{ uri: local.imagen_icono }} style={styles.avatarImage} />
            ) : (
              <MaterialCommunityIcons name="store" size={45} color="#fff" />
            )}
          </View>

          <Text style={styles.localName}>{local.nombre}</Text>
          <Text style={styles.localDesc}>{local.descripcion}</Text>

        <View style={styles.infoCard}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#674FA3" />
            <Text style={styles.infoText}>
              {local.direccion || "Sin dirección aún"}
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="phone" size={24} color="#674FA3" />
            <Text style={styles.infoText}>{local.telefono}</Text>
          </View>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="email" size={24} color="#674FA3" />
            <Text style={styles.infoText}>{local.correo}</Text>
          </View>
        </View>

        {/* MAPA */}
        {local.latitud && local.longitud && (
          <View style={styles.mapContainer}>
            <Text style={styles.sectionTitle}>Ubicación</Text>

            <MapView
              style={styles.map}
              initialRegion={{
                ...coordenadas,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={coordenadas} />
            </MapView>
          </View>
        )}

        {/* PRODUCTOS */}
        <View style={styles.productContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos</Text>

            <Button
              icon="plus"
              onPress={() => onNavigateToScreen('AddProductScreen', { localId })}
            >
              Agregar
            </Button>
          </View>

          {productos.length === 0 ? (
            <View style={styles.emptyProducts}>
              <MaterialCommunityIcons name="package-variant" size={60} color="#ccc" />
              <Text style={{ color: '#777', marginTop: 10 }}>No hay productos aún</Text>
            </View>
          ) : (
            productos.map((producto) => (
              <Card key={producto.id_producto} style={styles.productCard}>
                <Card.Cover
                  source={{
                    uri: producto.imagen_producto ||
                      "https://via.placeholder.com/300x200?text=Producto"
                  }}
                  style={styles.productImage}
                />

                <Card.Content style={styles.productContent}>
                  <Text style={styles.productName}>{producto.nombre}</Text>
                  <Text style={styles.productPrice}>${producto.precio}</Text>
                  <Text style={styles.productDesc} numberOfLines={2}>
                    {producto.descripcion}
                  </Text>
                </Card.Content>
              </Card>
            ))
          )}
        </View>

        <View style={{ height: 70 }} />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },

  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
    color: '#222'
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  coverImage: {
    width: "100%",
    height: 200
  },
  coverPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center"
  },

  infoContainer: {
    padding: 20
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#674FA3",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -45
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45
  },
  localName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    color: '#222'
  },
  localDesc: {
    textAlign: "center",
    color: "#555",
    marginBottom: 20
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },
  infoText: {
    marginLeft: 10,
    color: "#333",
    fontSize: 14
  },

  mapContainer: {
    padding: 20
  },
  map: {
    height: 220,
    borderRadius: 10
  },

  productContainer: {
    padding: 20
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: '#222'
  },
  emptyProducts: {
    alignItems: "center",
    paddingVertical: 40
  },
  productCard: {
    marginBottom: 15
  },
  productImage: {
    height: 150
  },
  productContent: {
    paddingVertical: 10
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold"
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#674FA3",
    marginVertical: 5
  },
  productDesc: {
    fontSize: 14,
    color: "#666"
  },
});