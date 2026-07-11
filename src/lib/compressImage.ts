import imageCompression from "browser-image-compression";

/**
 * Comprime uma imagem no navegador (via Web Worker) antes do upload.
 * Se a compressão falhar por qualquer motivo, retorna o arquivo original
 * para não travar o fluxo do usuário.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    return await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    });
  } catch {
    return file;
  }
}
