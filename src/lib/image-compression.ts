const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.78;

export interface CompressedImage {
  dataUrl: string;
  mimeType: "image/jpeg";
}

/**
 * Resizes photos before they leave the device. Food identification does not
 * need the original multi-megapixel image, and a smaller payload starts the
 * analysis sooner on slower connections.
 */
export async function compressFoodImage(file: File): Promise<CompressedImage> {
  const image = await createImageBitmap(file);

  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the image.");

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("Your browser could not compress the image."));
      }, "image/jpeg", JPEG_QUALITY);
    });

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Your browser could not read the compressed image."));
      reader.readAsDataURL(blob);
    });

    return { dataUrl, mimeType: "image/jpeg" };
  } finally {
    image.close();
  }
}
