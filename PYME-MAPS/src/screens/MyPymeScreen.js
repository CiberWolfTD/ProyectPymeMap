import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getUserLocales } from '../services/localService';

export default function MyPymeScreen({ userData, onNavigateToScreen }) {
  const [locales, setLocales] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    cargarLocales();
  }, [userData?.id_user]);

  const cargarLocales = async () => {
    if (!userData?.id_user) {
      console.log('No hay id_user disponible');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log('Cargando locales del usuario:', userData.id_user);
    const datos = await getUserLocales(userData.id_user);
    console.log('Locales cargados:', datos.length);
    setLocales(datos);
    setLoading(false);
  };

  const handleLocalPress = (localId) => {
    console.log('Abriendo local:', localId);
    onNavigateToScreen('LocalDetailScreen', { localId });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis locales</Text>
        <TouchableOpacity onPress={cargarLocales}>
          <MaterialCommunityIcons name="refresh" size={24} color="#674FA3" />
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#674FA3" />
            <Text style={styles.loadingText}>Cargando locales...</Text>
          </View>
        ) : locales.length > 0 ? (
          locales.map((local) => (
            <Card
              key={local.id_local}
              style={styles.localCard}
              onPress={() => handleLocalPress(local.id_local)}
            >
              <Card.Cover
                source={{
                  uri: local.imagen_portada
                    ? local.imagen_portada
                    : "https://via.placeholder.com/300x150?text=Sin+portada"
                }}
                style={styles.cardImage}
              />

              <Card.Content style={styles.cardContent}>
                <Text style={styles.localName}>{local.nombre}</Text>
                <Text style={styles.localDesc} numberOfLines={2}>{local.descripcion}</Text>
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="store-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No tienes locales registrados</Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => onNavigateToScreen('RegisterLocalScreen', { userData })}
              style={styles.addButtonEmpty}
            >
              Crear mi primer local
            </Button>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón flotante */}
      {locales.length > 0 && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => onNavigateToScreen('RegisterLocalScreen', { userData })}
            style={styles.addButton}
            labelStyle={{ fontSize: 16 }}
          >
            Agregar un negocio
          </Button>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigateToScreen('Home')}
        >
          <MaterialCommunityIcons name="home" size={28} color="#999" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigateToScreen('MapScreen')}
        >
          <MaterialCommunityIcons name="map" size={28} color="#999" />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="store" size={28} color="#674FA3" />
          <Text style={[styles.navText, styles.navTextActive]}>Mi Pyme</Text>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  localCard: {
    marginBottom: 15,
    borderRadius: 15,
  },
  cardImage: {
    height: 150,
  },
  cardContent: {
    paddingVertical: 12,
  },
  localName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  localDesc: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    marginBottom: 30,
  },
  addButtonEmpty: {
    marginTop: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  addButton: {
    marginTop: 10,
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