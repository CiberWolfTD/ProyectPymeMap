import * as React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { logoutUser } from '../services/authService';

export default function ProfileScreen({ onNavigate, userData, onNavigateToScreen }) {
  const [loading, setLoading] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await logoutUser();
            setLoading(false);
            
            if (result.success) {
              console.log('Sesión cerrada exitosamente');
              onNavigate();
            } else {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con botón de cerrar sesión */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity onPress={handleLogout} disabled={loading}>
          <MaterialCommunityIcons 
            name="logout" 
            size={28} 
            color="#674FA3"
          />
        </TouchableOpacity>
      </View>

      {/* Sección blanca superior con avatar y nombre */}
      <View style={styles.topSection}>
        <Avatar.Icon 
          size={120} 
          icon="account" 
          style={styles.avatar}
          color="#fff"
        />
        <Text style={styles.userName}>
          {userData?.nombre || 'Usuario'} {userData?.apellido || ''}
        </Text>
      </View>

      {/* Sección gris inferior */}
      <View style={styles.contentSection}>
        {/* Información del usuario */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="email" size={24} color="#674FA3" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Correo</Text>
              <Text style={styles.infoValue}>{userData?.correo || 'No disponible'}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="card-account-details" size={24} color="#674FA3" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>RUT</Text>
              <Text style={styles.infoValue}>{userData?.rut || 'No disponible'}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="phone" size={24} color="#674FA3" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{userData?.telefono || 'No disponible'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Navigation Bar*/}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigateToScreen?.('Home')}
        >
          <MaterialCommunityIcons name="home" size={28} color="#999" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigateToScreen?.('MapScreen')}
        >
          <MaterialCommunityIcons name="map" size={28} color="#999" />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigateToScreen?.('MyPymeScreen')}
        >
          <MaterialCommunityIcons name="store" size={28} color="#999" />
          <Text style={styles.navText}>Mi Pyme</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="account-circle" size={28} color="#674FA3" />
          <Text style={[styles.navText, styles.navTextActive]}>Mi perfil</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  topSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 40,
  },
  avatar: {
    backgroundColor: '#000',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#222',
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#808080',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  infoContainer: {
    gap: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  bottomNav: {
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