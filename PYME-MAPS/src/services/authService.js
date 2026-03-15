import { supabase } from '../config/supabase';

// Iniciar sesión
export const loginUser = async (email, password) => {
  try {
    console.log('Autenticando...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Error en autenticación:', error.message);
      throw error;
    }
    
    console.log('Autenticación exitosa');

    // Obtener datos de tabla
    console.log('Obteniendo datos de la tabla usuario...');
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id_user, nombre, apellido, correo, rut, telefono')
      .eq('correo', email)
      .single();

    if (userError) {
      console.error('Error al obtener datos:', userError.message);
    } else {
      console.log('Datos obtenidos:', userData);
    }

    return { 
      success: true, 
      user: data.user,
      userData: userData || null,
      session: data.session 
    };

  } catch (error) {
    console.error('Error en login:', error);
    
    let errorMessage = error.message;
    
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Correo o contraseña incorrectos';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Por favor confirma tu correo electrónico';
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

// Registrar usuario
export const registerUser = async (userData) => {
  try {
    console.log('Registrando en Auth...');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.correo,
      password: userData.password,
    });

    if (authError) {
      console.error('Error en Auth:', authError.message);
      throw authError;
    }
    console.log('Usuario creado en Auth');

    const idAuth = authData.user.id;

    console.log('Guardando en tabla usuario...');
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert([
        {
          id_user: idAuth,
          nombre: userData.nombre,
          apellido: userData.apellidos,
          correo: userData.correo,
          rut: userData.rut,
          telefono: userData.celular,
        }
      ]);

    if (dbError) {
      console.error('Error en BD:', dbError.message);
      throw dbError;
    }
    console.log('Datos guardados en BD');

    return { 
      success: true, 
      user: authData.user,
      message: 'Usuario registrado exitosamente'
    };

  } catch (error) {
    console.error('Error en registro:', error);
    
    let errorMessage = error.message;
    
    if (error.message.includes('duplicate key')) {
      errorMessage = 'Este correo o RUT ya está registrado';
    } else if (error.message.includes('invalid email')) {
      errorMessage = 'Correo electrónico inválido';
    } else if (error.message.includes('password')) {
      errorMessage = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

// Cerrar sesión
export const logoutUser = async () => {
  try {
    console.log('Cerrando sesión...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    console.log('Sesión cerrada');
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Obtener usuario actual
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id_user, nombre, apellido, correo, rut, telefono')
        .eq('correo', user.email)
        .single();
      
      return { ...user, userData };
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
};