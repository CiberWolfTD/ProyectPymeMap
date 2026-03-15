import { useFonts, CabinSketch_400Regular, CabinSketch_700Bold } from '@expo-google-fonts/cabin-sketch';

export function useCustomFonts() {
  const [fontsLoaded] = useFonts({
    CabinSketch_400Regular,
    CabinSketch_700Bold
  });

  return fontsLoaded;
}