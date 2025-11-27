import { supabase } from "../config/supabase";
import { decode } from "base64-arraybuffer";

export const uploadImage = async (asset, folder, fileName) => {
  try {
    console.log("Subiendo imagen:", fileName);

    if (!asset?.base64) {
      throw new Error("La imagen no contiene base64");
    }

    const arrayBuffer = decode(asset.base64);

    const fileExt = asset.fileName?.split(".").pop() || "jpg";
    const contentType =
      fileExt === "png" ? "image/png" : "image/jpeg";

    const filePath = `${folder}/${fileName}.${fileExt}`;

    const { error } = await supabase.storage
      .from("pyme_image")
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("pyme_image")
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return { success: false, error: error.message };
  }
};

export const generateFileName = (prefix) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}_${timestamp}_${random}`;
};
