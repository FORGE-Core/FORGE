#!/usr/bin/env node
/**
 * Cloudinary onboarding — sube, consulta y transforma una imagen de prueba.
 * Ejecutar: node scripts/cloudinary-onboarding.mjs
 */
import { v2 as cloudinary } from "cloudinary";

// --- Configuración inline (onboarding) ---
cloudinary.config({
  cloud_name: "dhxufo5yf",
  api_key: "859694128117936",
  api_secret: "EsknrBQThokwPzQMV0hbTywBrGw",
  secure: true,
});

const DEMO_IMAGE_URL =
  "https://res.cloudinary.com/demo/image/upload/sample.jpg";

async function main() {
  console.log("Subiendo imagen de demostración...\n");

  const upload = await cloudinary.uploader.upload(DEMO_IMAGE_URL);

  console.log("--- Imagen subida ---");
  console.log("Secure URL:", upload.secure_url);
  console.log("Public ID:", upload.public_id);
  console.log();

  console.log("Consultando metadatos...\n");

  const details = await cloudinary.api.resource(upload.public_id);

  console.log("--- Detalles de la imagen ---");
  console.log("Ancho (px):", details.width);
  console.log("Alto (px):", details.height);
  console.log("Formato:", details.format);
  console.log("Tamaño (bytes):", details.bytes);
  console.log();

  // f_auto: elige el mejor formato para el navegador (p. ej. WebP/AVIF).
  // q_auto: ajusta la calidad de compresión de forma automática.
  const transformedUrl = cloudinary.url(upload.public_id, {
    secure: true,
    transformation: [{ fetch_format: "auto", quality: "auto" }],
  });

  console.log(
    "Done! Click link below to see optimized version of the image. Check the size and the format."
  );
  console.log("URL transformada:", transformedUrl);
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
