import { supabase } from '../config/supabase';

// Crear dirección
export const createDireccion = async (direccionData) => {
  try {
    console.log('Creando dirección...', direccionData);
    
    const { data, error } = await supabase
      .from('direccion')
      .insert([direccionData])
      .select()
      .single();

    if (error) throw error;

    console.log('Dirección creada:', data);
    return { success: true, direccion: data };
  } catch (error) {
    console.error('Error al crear dirección:', error);
    return { success: false, error: error.message };
  }
};

// Obtener dirección por ID de local
export const getDireccionByLocal = async (idLocal) => {
  try {
    console.log('Obteniendo dirección del local:', idLocal);
    
    if (!idLocal) {
      throw new Error('El ID del local es requerido');
    }

    const { data, error } = await supabase
      .from('direccion')
      .select('*')
      .eq('id_local', idLocal)
      .single();

    if (error) throw error;

    console.log('Dirección obtenida:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener dirección:', error);
    return null;
  }
};

// Actualizar dirección
export const updateDireccion = async (idDireccion, updates) => {
  try {
    console.log('Actualizando dirección:', idDireccion);
    
    if (!idDireccion) {
      throw new Error('El ID de dirección es requerido');
    }

    const { data, error } = await supabase
      .from('direccion')
      .update(updates)
      .eq('id_direccion', idDireccion)
      .select()
      .single();

    if (error) throw error;

    console.log('Dirección actualizada:', data);
    return { success: true, direccion: data };
  } catch (error) {
    console.error('Error al actualizar dirección:', error);
    return { success: false, error: error.message };
  }
};

// Eliminar dirección
export const deleteDireccion = async (idDireccion) => {
  try {
    console.log('Eliminando dirección:', idDireccion);
    
    if (!idDireccion) {
      throw new Error('El ID de dirección es requerido');
    }

    const { error } = await supabase
      .from('direccion')
      .delete()
      .eq('id_direccion', idDireccion);

    if (error) throw error;

    console.log('Dirección eliminada');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar dirección:', error);
    return { success: false, error: error.message };
  }
};