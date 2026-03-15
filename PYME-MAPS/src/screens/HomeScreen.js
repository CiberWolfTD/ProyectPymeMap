import * as React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Menu, Button, Chip, Portal, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllProductos,  buscarProductoPorNombre, buscarProductoPorMarca, ordenarPorPrecioMenor, ordenarPorPrecioMayor, filtrarPorRangoPrecio } from '../services/productoService';
import { getAllLocales, buscarLocalPorNombre } from '../services/localService';

export default function HomeScreen({ userData, onNavigateToScreen }) {
  const [productos, setProductos] = React.useState([]);
  const [productosFiltrados, setProductosFiltrados] = React.useState([]);
  const [todosLosLocales, setTodosLosLocales] = React.useState([]);
  const [localesEncontrados, setLocalesEncontrados] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchMode, setSearchMode] = React.useState('productos');
  const [menuVisible, setMenuVisible] = React.useState(false);
  
  // Estados para filtro de rango de precio
  const [showPriceDialog, setShowPriceDialog] = React.useState(false);
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');
  
  // Estado para filtro de marca
  const [showBrandDialog, setShowBrandDialog] = React.useState(false);
  const [brandQuery, setBrandQuery] = React.useState('');

  // Cargar datos iniciales solo una vez
  React.useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    
    try {
      // Cargar productos y locales en paralelo
      const [datosProductos, datosLocales] = await Promise.all([
        getAllProductos(),
        getAllLocales()
      ]);
      
      setProductos(datosProductos);
      setProductosFiltrados(datosProductos);
      setTodosLosLocales(datosLocales);
      setLocalesEncontrados(datosLocales);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = React.useCallback(async () => {
    const query = searchQuery.trim();
    
    if (!query) {
      if (searchMode === 'productos') {
        setProductosFiltrados(productos);
      } else {
        setLocalesEncontrados(todosLosLocales);
      }
      return;
    }

    setLoading(true);

    try {
      if (searchMode === 'productos') {
        const resultados = await buscarProductoPorNombre(query);
        setProductosFiltrados(resultados);
      } else {
        const resultados = await buscarLocalPorNombre(query);
        setLocalesEncontrados(resultados);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchMode, productos, todosLosLocales]);

  const handleOrdenar = React.useCallback(async (tipo) => {
    setLoading(true);
    setMenuVisible(false);

    try {
      let resultados;
      if (tipo === 'menor') {
        resultados = await ordenarPorPrecioMenor(100);
      } else if (tipo === 'mayor') {
        resultados = await ordenarPorPrecioMayor(100);
      } else {
        resultados = productos;
      }
      setProductosFiltrados(resultados);
    } catch (error) {
      console.error('Error ordenando:', error);
      Alert.alert('Error', 'No se pudo ordenar los productos');
    } finally {
      setLoading(false);
    }
  }, [productos]);

  const handleFiltrarPorPrecio = React.useCallback(async () => {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (isNaN(min) || isNaN(max)) {
      Alert.alert('Error', 'Ingresa valores numéricos válidos');
      return;
    }

    if (min > max) {
      Alert.alert('Error', 'El precio mínimo debe ser menor que el máximo');
      return;
    }

    setShowPriceDialog(false);
    setLoading(true);

    try {
      const resultados = await filtrarPorRangoPrecio(min, max);
      setProductosFiltrados(resultados);
    } catch (error) {
      console.error('Error filtrando por precio:', error);
      Alert.alert('Error', 'No se pudo filtrar por precio');
    } finally {
      setLoading(false);
    }
  }, [minPrice, maxPrice]);

  const handleFiltrarPorMarca = React.useCallback(async () => {
    const query = brandQuery.trim();
    
    if (!query) {
      Alert.alert('Error', 'Ingresa una marca para buscar');
      return;
    }

    setShowBrandDialog(false);
    setLoading(true);

    try {
      const resultados = await buscarProductoPorMarca(query);
      setProductosFiltrados(resultados);
      setBrandQuery('');
    } catch (error) {
      console.error('Error filtrando por marca:', error);
      Alert.alert('Error', 'No se pudo filtrar por marca');
    } finally {
      setLoading(false);
    }
  }, [brandQuery]);

  const handleProductPress = React.useCallback((producto) => {
    if (!producto.id_local) {
      Alert.alert('Error', 'Este producto no tiene un local asociado');
      return;
    }
    
    onNavigateToScreen('LocalDetailScreen', { 
      localId: producto.id_local,
      origin: 'Home'
    });
  }, [onNavigateToScreen]);

  const handleLocalPress = React.useCallback((local) => {
    if (!local.id_local) {
      Alert.alert('Error', 'Este local no tiene ID válido');
      return;
    }
    
    onNavigateToScreen('LocalDetailScreen', { 
      localId: local.id_local,
      origin: 'Home'
    });
  }, [onNavigateToScreen]);

  const cambiarModoProductos = React.useCallback(() => {
    setSearchMode('productos');
    setSearchQuery('');
    setProductosFiltrados(productos);
  }, [productos]);

  const cambiarModoLocales = React.useCallback(() => {
    setSearchMode('locales');
    setSearchQuery('');
    setLocalesEncontrados(todosLosLocales);
  }, [todosLosLocales]);

  const renderProducto = React.useCallback(({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri: item.imagen_producto || 'https://via.placeholder.com/150?text=Producto'
          }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.nombre || 'Sin nombre'}
          </Text>
          <Text style={styles.productPrice}>
            ${(() => {
              try {
                const precio = typeof item.precio === 'number' 
                  ? item.precio 
                  : parseFloat(item.precio);
                return isNaN(precio) ? '0' : precio.toLocaleString('es-CL');
              } catch (e) {
                return '0';
              }
            })()}
          </Text>
          {item.marca && (
            <Text style={styles.productBrand} numberOfLines={1}>
              {item.marca}
            </Text>
          )}
          {item.local && (
            <View style={styles.localBadge}>
              <MaterialCommunityIcons name="store" size={12} color="#674FA3" />
              <Text style={styles.localName} numberOfLines={1}>
                {item.local.nombre}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [handleProductPress]);

  const renderLocal = React.useCallback(({ item }) => {
    return (
      <TouchableOpacity
        style={styles.localCard}
        onPress={() => handleLocalPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri: item.imagen_portada || 'https://via.placeholder.com/300x150?text=Local'
          }}
          style={styles.localImage}
        />
        <View style={styles.localInfo}>
          <Text style={styles.localTitle}>{item.nombre}</Text>
          {item.direccion_completa && (
            <View style={styles.localAddress}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
              <Text style={styles.localAddressText} numberOfLines={1}>
                {item.direccion_completa}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [handleLocalPress]);

  const keyExtractor = React.useCallback((item, index) => {
    return searchMode === 'productos' 
      ? (item.id_producto?.toString() || `prod-${index}`)
      : (item.id_local?.toString() || `local-${index}`);
  }, [searchMode]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={searchMode === 'productos' ? '¿Qué deseas buscar?' : 'Buscar locales...'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchModeContainer}>
          <Chip
            selected={searchMode === 'productos'}
            onPress={cambiarModoProductos}
            style={styles.chip}
          >
            Productos
          </Chip>
          <Chip
            selected={searchMode === 'locales'}
            onPress={cambiarModoLocales}
            style={styles.chip}
          >
            Locales
          </Chip>
        </View>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>Anuncios</Text>
      </View>

      {searchMode === 'productos' && (
        <View style={styles.filterBarContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterBarContent}
          >
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  icon="sort"
                  style={styles.filterButton}
                  compact
                  labelStyle={styles.filterButtonLabel}
                >
                  Ordenar
                </Button>
              }
            >
              <Menu.Item onPress={() => handleOrdenar('menor')} title="Menor a Mayor" />
              <Menu.Item onPress={() => handleOrdenar('mayor')} title="Mayor a Menor" />
              <Menu.Item onPress={() => handleOrdenar('default')} title="Sin ordenar" />
            </Menu>

            <Button
              mode="outlined"
              onPress={() => setShowPriceDialog(true)}
              icon="currency-usd"
              style={styles.filterButton}
              compact
              labelStyle={styles.filterButtonLabel}
            >
              Rango precio
            </Button>

            <Button
              mode="outlined"
              onPress={() => setShowBrandDialog(true)}
              icon="tag"
              style={styles.filterButton}
              compact
              labelStyle={styles.filterButtonLabel}
            >
              Por marca
            </Button>

            <Button
              mode="outlined"
              onPress={cargarDatosIniciales}
              icon="refresh"
              style={styles.filterButton}
              compact
              labelStyle={styles.filterButtonLabel}
            >
              Recargar
            </Button>
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#674FA3" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          key={searchMode}
          data={searchMode === 'productos' ? productosFiltrados : localesEncontrados}
          renderItem={searchMode === 'productos' ? renderProducto : renderLocal}
          keyExtractor={keyExtractor}
          numColumns={searchMode === 'productos' ? 2 : 1}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={searchMode === 'productos' ? styles.row : null}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name={searchMode === 'productos' ? "package-variant" : "store-outline"} 
                size={60} 
                color="#ccc" 
              />
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? `No se encontraron ${searchMode}` 
                  : `No hay ${searchMode} disponibles`}
              </Text>
            </View>
          }
        />
      )}

      {/* Diálogos de filtros */}
      <Portal>
        {/* Filtro de rango de precio */}
        <Dialog visible={showPriceDialog} onDismiss={() => setShowPriceDialog(false)}>
          <Dialog.Title>Filtrar por precio</Dialog.Title>
          <Dialog.Content>
            <TextInput
              style={styles.dialogInput}
              placeholder="Precio mínimo"
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.dialogInput, { marginTop: 10 }]}
              placeholder="Precio máximo"
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPriceDialog(false)}>Cancelar</Button>
            <Button onPress={handleFiltrarPorPrecio}>Aplicar</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Filtro por marca */}
        <Dialog visible={showBrandDialog} onDismiss={() => setShowBrandDialog(false)}>
          <Dialog.Title>Buscar por marca</Dialog.Title>
          <Dialog.Content>
            <TextInput
              style={styles.dialogInput}
              placeholder="Nombre de la marca"
              value={brandQuery}
              onChangeText={setBrandQuery}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowBrandDialog(false)}>Cancelar</Button>
            <Button onPress={handleFiltrarPorMarca}>Buscar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={28} color="#674FA3" />
          <Text style={[styles.navText, styles.navTextActive]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigateToScreen('MapScreen')}
        >
          <MaterialCommunityIcons name="map" size={28} color="#999" />
          <Text style={styles.navText}>Mapa</Text>
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
          <Text style={styles.navText}>Mi perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 15,
    marginRight: 10,
  },
  searchButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#674FA3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: { marginRight: 8 },
  banner: {
    height: 150,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    borderRadius: 15,
  },
  bannerText: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  filterBarContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterBarContent: {
    paddingHorizontal: 15,
    gap: 10,
    alignItems: 'center',
  },
  filterButton: { 
    marginRight: 8,
    minWidth: 120,
  },
  filterButtonLabel: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 100,
    paddingTop: 10,
  },
  row: { justifyContent: 'space-between' },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  productInfo: { padding: 10 },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#674FA3',
    marginBottom: 3,
  },
  productBrand: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  localBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  localName: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  localCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  localImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  localInfo: { padding: 12 },
  localTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  localAddress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  localAddressText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  dialogInput: {
    height: 45,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#D3D3D3',
    paddingVertical: 10,
    paddingBottom: 25,
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