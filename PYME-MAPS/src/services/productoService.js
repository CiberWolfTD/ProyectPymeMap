import { supabase } from '../config/supabase';


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

// FUNCIONES PARA HOME

/**
 * Obtener todos los productos
 * Incluye información del local
 */
export const getAllProductos = async () => {
  try {
    console.log('Obteniendo todos los productos...');
    
    const { data, error } = await supabase
      .from('producto')
      .select(`
        *,
        local (
          id_local,
          nombre,
          imagen_icono
        )
      `);

    if (error) throw error;

    console.log('Productos obtenidos:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};

/**
 * Buscar productos por nombre
 * @param {string} searchTerm - Término de búsqueda
 */
export const buscarProductoPorNombre = async (searchTerm) => {
  try {
    console.log('Buscando productos por nombre:', searchTerm);
    
    const { data, error } = await supabase
      .rpc('buscar_producto_nombre_v2', { search_term: searchTerm });

    if (error) {
      console.warn('RPC buscar_producto_nombre no disponible, usando fallback');
      throw error;
    }

    console.log('Productos encontrados:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.log('Usando búsqueda simple (fallback)');
    return await buscarProductoSimple(searchTerm);
  }
};

/**
 * Buscar productos por marca
 * @param {string} searchTerm - Término de búsqueda
 */
export const buscarProductoPorMarca = async (searchTerm) => {
  try {
    console.log('Buscando productos por marca:', searchTerm);
    
    const { data, error } = await supabase
      .rpc('buscar_producto_marca_v2', { search_term: searchTerm });

    if (error) {
      console.warn('RPC buscar_producto_marca no disponible, usando fallback');
      throw error;
    }

    console.log('Productos encontrados por marca:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.log('Usando búsqueda por marca simple (fallback)');
    return await buscarPorMarcaSimple(searchTerm);
  }
};

/**
 * Filtrar productos por rango de precio
 * @param {number} minPrecio - Precio mínimo
 * @param {number} maxPrecio - Precio máximo
 */
export const filtrarPorRangoPrecio = async (minPrecio, maxPrecio) => {
  try {
    console.log('Filtrando por rango de precio:', minPrecio, '-', maxPrecio);
    
    const { data, error } = await supabase
      .rpc('rango_de_valor_v2', { 
        prec_min: minPrecio,
        prec_max: maxPrecio
      });

    if (error) {
      console.warn('RPC rango_de_valor_v2 no disponible, usando fallback');
      throw error;
    }

    console.log('Productos filtrados por precio:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.log('Usando filtro de precio simple (fallback)');
    return await filtrarPorPrecioSimple(minPrecio, maxPrecio);
  }
};

/**
 * Ordenar productos por precio menor a mayor
 * @param {number} limit - Límite de resultados (opcional)
 */
export const ordenarPorPrecioMenor = async (limit = 100) => {
  try {
    console.log('Ordenando productos: menor a mayor, limit:', limit);
    
    const { data, error } = await supabase
      .rpc('orden_men_v2');

    if (error) {
      console.warn('RPC orden_men no disponible, usando fallback');
      throw error;
    }

    console.log('Productos ordenados:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.log('Usando ordenamiento simple (fallback): asc');
    return await ordenarProductosSimple('asc', limit);
  }
};

/**
 * Ordenar productos por precio mayor a menor
 * @param {number} limit - Límite de resultados (opcional)
 */
export const ordenarPorPrecioMayor = async (limit = 100) => {
  try {
    console.log('Ordenando productos: mayor a menor, limit:', limit);
    
    const { data, error } = await supabase
      .rpc('orden_mayor_v2');

    if (error) {
      console.warn('RPC orden_mayor no disponible, usando fallback');
      throw error;
    }

    console.log('Productos ordenados:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.log('Usando ordenamiento simple (fallback): desc');
    return await ordenarProductosSimple('desc', limit);
  }
};


/**
 * Búsqueda simple de productos (fallback)
 */
const buscarProductoSimple = async (searchTerm) => {
  try {
    console.log('Usando búsqueda simple (fallback)');
    
    const { data, error } = await supabase
      .from('producto')
      .select(`
        *,
        local (
          id_local,
          nombre,
          imagen_icono
        )
      `)
      .ilike('nombre', `%${searchTerm}%`);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error en búsqueda simple:', error);
    return [];
  }
};

/**
 * Búsqueda por marca simple (fallback)
 */
const buscarPorMarcaSimple = async (searchTerm) => {
  try {
    console.log('Usando búsqueda por marca simple (fallback)');
    
    const { data, error } = await supabase
      .from('producto')
      .select(`
        *,
        local (
          id_local,
          nombre,
          imagen_icono
        )
      `)
      .ilike('marca', `%${searchTerm}%`);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error en búsqueda por marca simple:', error);
    return [];
  }
};

/**
 * Filtrar por precio simple (fallback)
 */
const filtrarPorPrecioSimple = async (minPrecio, maxPrecio) => {
  try {
    console.log('Usando filtro de precio simple (fallback)');
    
    const { data, error } = await supabase
      .from('producto')
      .select(`
        *,
        local (
          id_local,
          nombre,
          imagen_icono
        )
      `)
      .gte('precio', prec_min)
      .lte('precio', prec_max);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error en filtro de precio simple:', error);
    return [];
  }
};

/**
 * Ordenamiento simple de productos (fallback)
 */
const ordenarProductosSimple = async (order = 'asc', limit = 100) => {
  try {
    console.log('Usando ordenamiento simple (fallback):', order);
    
    const { data, error } = await supabase
      .from('producto')
      .select(`
        *,
        local (
          id_local,
          nombre,
          imagen_icono
        )
      `)
      .order('precio', { ascending: order === 'asc' })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error en ordenamiento simple:', error);
    return [];
  }
};