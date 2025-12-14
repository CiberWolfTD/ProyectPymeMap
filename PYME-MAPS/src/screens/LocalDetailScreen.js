import * as React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Button, Card, Dialog, Portal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { getLocalWithProducts, updateLocal, deleteLocal } from '../services/localService';
import { deleteProducto, updateProducto } from '../services/productoService';
import { getDireccionByLocal, updateDireccion, createDireccion } from '../services/direccionService';
import { uploadImage, generateFileName } from '../services/imageService';
import { geocodificarDireccion } from '../services/geocodingService';

export default function LocalDetailScreen({ userData, localId, previousScreen, origin, onNavigateToScreen }) {
  const [local, setLocal] = React.useState(null);
  const [productos, setProductos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editMode, setEditMode] = React.useState(false);
  const [editData, setEditData] = React.useState({});
  const [editImages, setEditImages] = React.useState({
    portada: null,
    icono: null
  });

  // Estados para dirección
  const [editDireccion, setEditDireccion] = React.useState({
    calle: '',
    numeracion: '',
    comuna: ''
  });
  const [showLocationDialog, setShowLocationDialog] = React.useState(false);
  const [newCoords, setNewCoords] = React.useState(null);
  const [loadingGeocode, setLoadingGeocode] = React.useState(false);

  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const [editProductDialog, setEditProductDialog] = React.useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [editProductData, setEditProductData] = React.useState({});
  const [editProductImage, setEditProductImage] = React.useState(null);

  // Determinar la pantalla de origen
  const screenToReturn = origin || previousScreen || 'MyPymeScreen';

  React.useEffect(() => {
    cargarLocal();
  }, [localId]);

  const cargarLocal = async () => {
    if (!localId) return;
    setLoading(true);

    try {
      const datos = await getLocalWithProducts(localId);

      if (datos) {
        setLocal(datos);
        setProductos(datos.productos || []);
        setEditData({
          descripcion: datos.descripcion,
          telefono: datos.telefono,
          correo: datos.correo
        });

        const direccion = await getDireccionByLocal(localId);
        if (direccion) {
          setEditDireccion({
            calle: direccion.calle || '',
            numeracion: direccion.numeracion || '',
            comuna: direccion.comuna || ''
          });
        } else {
          console.log('Este local no tiene dirección registrada');
          setEditDireccion({
            calle: '',
            numeracion: '',
            comuna: ''
          });
        }
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

  const handleGoBack = () => {
    console.log('Volviendo a:', screenToReturn);
    onNavigateToScreen(screenToReturn, {});
  };

  const pickLocalImage = async (tipo) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: tipo === 'portada' ? [16, 9] : [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setEditImages(prev => ({
          ...prev,
          [tipo]: result.assets[0]
        }));
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const pickProductImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setEditProductImage(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleVerificarUbicacion = async () => {
    if (!editDireccion.calle || !editDireccion.numeracion || !editDireccion.comuna) {
      Alert.alert('Error', 'Completa todos los campos de dirección');
      return;
    }

    setLoadingGeocode(true);

    try {
      const resultado = await geocodificarDireccion({
        calle: editDireccion.calle,
        numeracion: editDireccion.numeracion,
        comuna: editDireccion.comuna,
        region: 'Región Metropolitana'
      });

      if (resultado.success) {
        setNewCoords({
          latitude: resultado.latitude,
          longitude: resultado.longitude
        });
        setShowLocationDialog(true);
      } else {
        Alert.alert('Error', 'No se pudo encontrar la dirección');
      }
    } catch (err) {
      Alert.alert('Error', 'Error al verificar ubicación');
    } finally {
      setLoadingGeocode(false);
    }
  };

  const handleSaveLocal = async () => {
    setLoading(true);
    try {
      let updates = {
        descripcion: editData.descripcion,
        telefono: editData.telefono,
        correo: editData.correo
      };

      if (editImages.portada) {
        const result = await uploadImage(
          editImages.portada,
          'locales',
          generateFileName('portada')
        );
        if (result.success) updates.imagen_portada = result.url;
      }

      if (editImages.icono) {
        const result = await uploadImage(
          editImages.icono,
          'locales',
          generateFileName('icono')
        );
        if (result.success) updates.imagen_icono = result.url;
      }

      const result = await updateLocal(localId, updates);
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'No se pudo actualizar');
        setLoading(false);
        return;
      }

      if (newCoords) {
        const direccionActual = await getDireccionByLocal(localId);
        
        if (direccionActual) {
          await updateDireccion(direccionActual.id_direccion, {
            calle: editDireccion.calle,
            numeracion: editDireccion.numeracion,
            comuna: editDireccion.comuna,
            latitud: newCoords.latitude,
            longitud: newCoords.longitude
          });
        } else {
          await createDireccion({
            id_local: localId,
            region: 'Región Metropolitana',
            calle: editDireccion.calle,
            numeracion: editDireccion.numeracion,
            comuna: editDireccion.comuna,
            codigo_postal: null,
            latitud: newCoords.latitude,
            longitud: newCoords.longitude
          });
        }
      }

      Alert.alert('¡Éxito!', 'Local actualizado correctamente');
      setEditMode(false);
      setEditImages({ portada: null, icono: null });
      setNewCoords(null);
      cargarLocal();
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocal = async () => {
    setLoading(true);
    try {
      const result = await deleteLocal(localId);
      
      if (result.success) {
        Alert.alert('¡Éxito!', 'Local eliminado correctamente', [
          { text: 'OK', onPress: () => onNavigateToScreen('MyPymeScreen', {}) }
        ]);
      } else {
        Alert.alert('Error', result.error || 'No se pudo eliminar');
        setLoading(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error al eliminar');
      setLoading(false);
    }
  };

  const openEditProduct = (producto) => {
    setSelectedProduct(producto);
    setEditProductData({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      descripcion: producto.descripcion,
      marca: producto.marca || ''
    });
    setEditProductImage(null);
    setEditProductDialog(true);
  };

  const handleSaveProduct = async () => {
    if (!editProductData.nombre || !editProductData.precio) {
      Alert.alert('Error', 'Nombre y precio son requeridos');
      return;
    }

    setLoading(true);
    try {
      let updates = {
        nombre: editProductData.nombre,
        precio: parseFloat(editProductData.precio),
        descripcion: editProductData.descripcion,
        marca: editProductData.marca || null
      };

      if (editProductImage) {
        const result = await uploadImage(
          editProductImage,
          'productos',
          generateFileName('producto')
        );
        if (result.success) updates.imagen_producto = result.url;
      }

      const result = await updateProducto(selectedProduct.id_producto, updates);
      
      if (result.success) {
        Alert.alert('¡Éxito!', 'Producto actualizado');
        setEditProductDialog(false);
        cargarLocal();
      } else {
        Alert.alert('Error', result.error || 'No se pudo actualizar');
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteProduct = (producto) => {
    setSelectedProduct(producto);
    setDeleteProductDialog(true);
  };

  const handleDeleteProduct = async () => {
    setLoading(true);
    try {
      const result = await deleteProducto(selectedProduct.id_producto);
      
      if (result.success) {
        Alert.alert('¡Éxito!', 'Producto eliminado');
        setDeleteProductDialog(false);
        cargarLocal();
      } else {
        Alert.alert('Error', result.error || 'No se pudo eliminar');
        setLoading(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error al eliminar');
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

  const esElDueño = userData?.id_user === local.id_user;

  const coordenadas = {
    latitude: parseFloat(local.latitud) || -33.45,
    longitude: parseFloat(local.longitud) || -70.6667,
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#674FA3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del local</Text>
        {esElDueño && (
          !editMode ? (
            <TouchableOpacity onPress={() => setEditMode(true)}>
              <MaterialCommunityIcons name="pencil" size={24} color="#674FA3" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => {
              setEditMode(false);
              setEditImages({ portada: null, icono: null });
              setNewCoords(null);
              setEditData({
                descripcion: local.descripcion,
                telefono: local.telefono,
                correo: local.correo
              });
            }}>
              <MaterialCommunityIcons name="close" size={24} color="#d32f2f" />
            </TouchableOpacity>
          )
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PORTADA */}
        <View>
          {editImages.portada ? (
            <Image source={{ uri: editImages.portada.uri }} style={styles.coverImage} />
          ) : local.imagen_portada ? (
            <Image source={{ uri: local.imagen_portada }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <MaterialCommunityIcons name="image-off" size={70} color="#bbb" />
            </View>
          )}
          {editMode && (
            <TouchableOpacity 
              style={styles.editImageButton}
              onPress={() => pickLocalImage('portada')}
            >
              <MaterialCommunityIcons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* INFO */}
        <View style={styles.infoContainer}>
          <View style={styles.avatarContainer}>
            {editImages.icono ? (
              <Image source={{ uri: editImages.icono.uri }} style={styles.avatarImage} />
            ) : local.imagen_icono ? (
              <Image source={{ uri: local.imagen_icono }} style={styles.avatarImage} />
            ) : (
              <MaterialCommunityIcons name="store" size={45} color="#fff" />
            )}
            {editMode && (
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={() => pickLocalImage('icono')}
              >
                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.localName}>{local.nombre}</Text>

          {editMode ? (
            <>
              <TextInput
                label="Descripción"
                value={editData.descripcion}
                onChangeText={(v) => setEditData(prev => ({ ...prev, descripcion: v }))}
                mode="outlined"
                multiline
                style={styles.editInput}
              />
              <TextInput
                label="Teléfono"
                value={editData.telefono}
                onChangeText={(v) => setEditData(prev => ({ ...prev, telefono: v }))}
                mode="outlined"
                style={styles.editInput}
              />
              <TextInput
                label="Correo"
                value={editData.correo}
                onChangeText={(v) => setEditData(prev => ({ ...prev, correo: v }))}
                mode="outlined"
                style={styles.editInput}
              />

              <Text style={styles.sectionTitle}>Dirección</Text>
              <TextInput
                label="Calle"
                value={editDireccion.calle}
                onChangeText={(v) => setEditDireccion(prev => ({ ...prev, calle: v }))}
                mode="outlined"
                style={styles.editInput}
              />
              <TextInput
                label="Numeración"
                value={editDireccion.numeracion}
                onChangeText={(v) => setEditDireccion(prev => ({ ...prev, numeracion: v }))}
                mode="outlined"
                style={styles.editInput}
                keyboardType="numeric"
              />
              <TextInput
                label="Comuna"
                value={editDireccion.comuna}
                onChangeText={(v) => setEditDireccion(prev => ({ ...prev, comuna: v }))}
                mode="outlined"
                style={styles.editInput}
              />

              <Button
                mode="outlined"
                icon="map-marker-check"
                onPress={handleVerificarUbicacion}
                style={styles.verifyButton}
                loading={loadingGeocode}
              >
                {newCoords ? 'Ubicación verificada ✓' : 'Verificar nueva ubicación'}
              </Button>

              <View style={styles.editButtons}>
                <Button mode="contained" onPress={handleSaveLocal} style={{ flex: 1, marginRight: 5 }}>
                  Guardar
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => setDeleteDialog(true)} 
                  style={{ flex: 1, marginLeft: 5 }}
                  textColor="#d32f2f"
                >
                  Eliminar Local
                </Button>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.localDesc}>{local.descripcion}</Text>

              <View style={styles.infoCard}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#674FA3" />
                <Text style={styles.infoText}>
                  {local.direccion_completa || "Sin dirección"}
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
            </>
          )}
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
              <Marker coordinate={coordenadas} title={local.nombre} />
            </MapView>
          </View>
        )}

        {/* PRODUCTOS */}
        <View style={styles.productContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos</Text>

            {esElDueño && (
              <Button
                icon="plus"
                onPress={() => onNavigateToScreen('AddProductScreen', { localId })}
              >
                Agregar
              </Button>
            )}
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
                  <Text style={styles.productPrice}>
                    ${typeof producto.precio === 'number' 
                      ? producto.precio.toLocaleString('es-CL') 
                      : parseFloat(producto.precio).toLocaleString('es-CL')}
                  </Text>
                  <Text style={styles.productDesc} numberOfLines={2}>
                    {producto.descripcion}
                  </Text>
                  
                  {esElDueño && (
                    <View style={styles.productActions}>
                      <Button 
                        icon="pencil" 
                        mode="outlined" 
                        onPress={() => openEditProduct(producto)}
                        style={{ flex: 1, marginRight: 5 }}
                      >
                        Editar
                      </Button>
                      <Button 
                        icon="delete" 
                        mode="outlined" 
                        onPress={() => openDeleteProduct(producto)}
                        style={{ flex: 1, marginLeft: 5 }}
                        textColor="#d32f2f"
                      >
                        Eliminar
                      </Button>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>

        <View style={{ height: 70 }} />
      </ScrollView>

      {/* DIÁLOGOS */}
      <Portal>
        <Dialog visible={deleteDialog} onDismiss={() => setDeleteDialog(false)}>
          <Dialog.Title>Confirmar eliminación</Dialog.Title>
          <Dialog.Content>
            <Text>¿Estás seguro de eliminar este local? Esta acción eliminará también todos sus productos y dirección.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialog(false)}>Cancelar</Button>
            <Button onPress={handleDeleteLocal} textColor="#d32f2f">Eliminar</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={showLocationDialog} 
          onDismiss={() => setShowLocationDialog(false)}
          style={styles.mapDialog}
        >
          <Dialog.Title>Nueva ubicación</Dialog.Title>
          <Dialog.Content>
            {newCoords && (
              <MapView
                style={styles.mapPreview}
                initialRegion={{
                  latitude: newCoords.latitude,
                  longitude: newCoords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  draggable
                  coordinate={newCoords}
                  onDragEnd={(e) => setNewCoords(e.nativeEvent.coordinate)}
                />
              </MapView>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLocationDialog(false)}>Aceptar</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={editProductDialog} 
          onDismiss={() => setEditProductDialog(false)}
          style={styles.dialogLarge}
        >
          <Dialog.Title>Editar Producto</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <TouchableOpacity onPress={pickProductImage} style={styles.dialogImagePicker}>
                {editProductImage ? (
                  <Image source={{ uri: editProductImage.uri }} style={styles.dialogImage} />
                ) : selectedProduct?.imagen_producto ? (
                  <Image source={{ uri: selectedProduct.imagen_producto }} style={styles.dialogImage} />
                ) : (
                  <MaterialCommunityIcons name="camera-plus" size={40} color="#999" />
                )}
              </TouchableOpacity>

              <TextInput
                label="Nombre"
                value={editProductData.nombre}
                onChangeText={(v) => setEditProductData(prev => ({ ...prev, nombre: v }))}
                mode="outlined"
                style={styles.dialogInput}
              />
              <TextInput
                label="Precio"
                value={editProductData.precio}
                onChangeText={(v) => setEditProductData(prev => ({ ...prev, precio: v }))}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.dialogInput}
              />
              <TextInput
                label="Marca"
                value={editProductData.marca}
                onChangeText={(v) => setEditProductData(prev => ({ ...prev, marca: v }))}
                mode="outlined"
                style={styles.dialogInput}
              />
              <TextInput
                label="Descripción"
                value={editProductData.descripcion}
                onChangeText={(v) => setEditProductData(prev => ({ ...prev, descripcion: v }))}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.dialogInput}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setEditProductDialog(false)}>Cancelar</Button>
            <Button onPress={handleSaveProduct}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={deleteProductDialog} onDismiss={() => setDeleteProductDialog(false)}>
          <Dialog.Title>Confirmar eliminación</Dialog.Title>
          <Dialog.Content>
            <Text>¿Eliminar el producto "{selectedProduct?.nombre}"?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteProductDialog(false)}>Cancelar</Button>
            <Button onPress={handleDeleteProduct} textColor="#d32f2f">Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 15,
    color: '#222'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  coverImage: { width: "100%", height: 200 },
  coverPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center"
  },
  editImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(103, 79, 163, 0.8)',
    borderRadius: 20,
    padding: 8
  },
  infoContainer: { padding: 20 },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#674FA3",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -45,
    position: 'relative'
  },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#674FA3',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff'
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 15,
    marginBottom: 10
  },
  editInput: {
    marginBottom: 10,
    backgroundColor: '#fff' 
  },
  verifyButton: {
    marginTop: 5,
    marginBottom: 10 
  },
  editButtons: {
    flexDirection: 'row',
    marginTop: 15 
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
    marginBottom: 12,
    alignItems: 'center'
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
    color: "#666",
    marginBottom: 10 
  },
  productActions: {
    flexDirection: 'row',
    marginTop: 10 
  },
  dialogLarge: {
    maxHeight: '80%' 
  },
  dialogImagePicker: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  dialogImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10 
  },
  dialogInput: {
    marginBottom: 10,
    backgroundColor: '#fff' 
  },
  mapDialog: {
    maxHeight: '70%' 
  },
  mapPreview: {
    width: '100%',
    height: 250,
    borderRadius: 10 
  }
});