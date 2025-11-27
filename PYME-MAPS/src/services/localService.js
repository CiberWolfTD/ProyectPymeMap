import { supabase } from '../config/supabase';

// Obtener todos los locales (para el mapa)
export const getAllLocales = async () => {
  try {
    console.log('Obteniendo todos los locales...');
    
    const { data, error } = await supabase
      .from('local')
      .select('*');

    if (error) throw error;

    console.log('Todos los locales obtenidos:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error al obtener todos los locales:', error);
    return [];
  }
};

// Obtener locales del usuario
export const getUserLocales = async (userId) => {
  try {
    console.log('Obteniendo locales del usuario:', userId);
    
    if (!userId) {
      console.error('userId no está disponible');
      return [];
    }

    const { data, error } = await supabase
      .from('local')
      .select('*')
      .eq('id_user', userId);

    if (error) throw error;

    console.log('Locales obtenidos:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error al obtener locales:', error);
    return [];
  }
};

// Crear local
export const createLocal = async (localData) => {
  try {
    console.log('Creando local...', localData);
    
    if (!localData.id_user) {
      throw new Error('El ID del usuario es requerido');
    }

    const { data, error } = await supabase
      .from('local')
      .insert([localData])
      .select()
      .single();

    if (error) throw error;

    console.log('Local creado:', data);
    return { success: true, local: data };
  } catch (error) {
    console.error('Error al crear local:', error);
    return { success: false, error: error.message };
  }
};

// Obtener local con productos
export const getLocalWithProducts = async (localId) => {
  try {
    console.log('Obteniendo local con productos:', localId);
    
    if (!localId) {
      throw new Error('El ID del local es requerido');
    }

    const { data: localData, error: localError } = await supabase
      .from('local')
      .select('*')
      .eq('id_local', localId)
      .single();

    if (localError) throw localError;

    const { data: productData, error: productError } = await supabase
      .from('producto')
      .select('*')
      .eq('id_local', localId);

    if (productError) throw productError;

    console.log('Local con productos obtenido. Productos:', productData?.length || 0);
    return {
      ...localData,
      productos: productData || []
    };
  } catch (error) {
    console.error('Error al obtener local con productos:', error);
    return null;
  }
};

// Actualizar local
export const updateLocal = async (localId, updates) => {
  try {
    console.log('Actualizando local:', localId);
    
    if (!localId) {
      throw new Error('El ID del local es requerido');
    }

    const { data, error } = await supabase
      .from('local')
      .update(updates)
      .eq('id_local', localId)
      .select()
      .single();

    if (error) throw error;

    console.log('Local actualizado:', data);
    return { success: true, local: data };
  } catch (error) {
    console.error('Error al actualizar local:', error);
    return { success: false, error: error.message };
  }
};

// Eliminar local
export const deleteLocal = async (localId) => {
  try {
    console.log('Eliminando local:', localId);
    
    if (!localId) {
      throw new Error('El ID del local es requerido');
    }

    const { error } = await supabase
      .from('local')
      .delete()
      .eq('id_local', localId);

    if (error) throw error;

    console.log('Local eliminado');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar local:', error);
    return { success: false, error: error.message };
  }
};

// Obtener productos de un local
export const getLocalProducts = async (localId) => {
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