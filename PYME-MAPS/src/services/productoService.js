import { supabase } from '../config/supabase';

// Crear producto
export const createProducto = async (productoData) => {
  try {
    console.log('Creando producto...', productoData);
    
    if (!productoData.id_local) {
      throw new Error('El ID del local es requerido');
    }

    if (!productoData.nombre) {
      throw new Error('El nombre del producto es requerido');
    }

    if (typeof productoData.precio !== 'number' || productoData.precio <= 0) {
      throw new Error('El precio debe ser un número mayor a 0');
    }

    const { data, error } = await supabase
      .from('producto')
      .insert([productoData])
      .select()
      .single();

    if (error) throw error;

    console.log('Producto creado:', data);
    return { success: true, producto: data };
  } catch (error) {
    console.error('Error al crear producto:', error);
    return { success: false, error: error.message };
  }
};

// Obtener productos de un local
export const getProductosByLocal = async (localId) => {
  try {
    console.log('Obteniendo productos del local:', localId);
    
    if (!localId) {
      throw new Error('El ID del local es requerido');
    }

    const { data, error } = await supabase
      .from('producto')
      .select('*')
      .eq('id_local', localId);

    if (error) throw error;

    console.log('Productos obtenidos:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};

// Obtener un producto por ID
export const getProductoById = async (productoId) => {
  try {
    console.log('Obteniendo producto:', productoId);
    
    if (!productoId) {
      throw new Error('El ID del producto es requerido');
    }

    const { data, error } = await supabase
      .from('producto')
      .select('*')
      .eq('id_producto', productoId)
      .single();

    if (error) throw error;

    console.log('Producto obtenido:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return null;
  }
};

// Actualizar producto
export const updateProducto = async (productoId, updates) => {
  try {
    console.log('Actualizando producto:', productoId);
    
    if (!productoId) {
      throw new Error('El ID del producto es requerido');
    }

    const { data, error } = await supabase
      .from('producto')
      .update(updates)
      .eq('id_producto', productoId)
      .select()
      .single();

    if (error) throw error;

    console.log('Producto actualizado:', data);
    return { success: true, producto: data };
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return { success: false, error: error.message };
  }
};

// Eliminar producto
export const deleteProducto = async (productoId) => {
  try {
    console.log('Eliminando producto:', productoId);
    
    if (!productoId) {
      throw new Error('El ID del producto es requerido');
    }

    const { error } = await supabase
      .from('producto')
      .delete()
      .eq('id_producto', productoId);

    if (error) throw error;

    console.log('Producto eliminado');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return { success: false, error: error.message };
  }
};