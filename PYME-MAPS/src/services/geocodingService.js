import Constants from 'expo-constants';

const GOOGLE_API_KEY = Constants.expoConfig.extra.googleApiKey;

export const geocodificarDireccion = async ({ calle, numeracion, comuna, region }) => {
  try {
    const direccionCompleta = `${calle} ${numeracion}, ${comuna}, ${region || "Chile"}`;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      direccionCompleta
    )}&key=${GOOGLE_API_KEY}`;

    console.log('Geocodificando:', direccionCompleta);

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        error: 'Dirección no encontrada',
        latitude: -33.4489,
        longitude: -70.6693,
        accuracy: 'fallback'
      };
    }

    const location = data.results[0].geometry.location;

    return {
      success: true,
      latitude: location.lat,
      longitude: location.lng,
      displayName: data.results[0].formatted_address,
      accuracy: 'exact'
    };

  } catch (error) {
    console.error("Error al geocodificar:", error);
    return {
      success: false,
      error: error.message,
      latitude: -33.4489,
      longitude: -70.6693,
      accuracy: 'fallback'
    };
  }
};
