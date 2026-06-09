import { requireSupabaseClient } from "./client";
import { isLocalMediaPath, registerLocalMedia, revokeLocalMedia } from "./localMedia";

const HERO_BUCKET = "hero";
const GALLERY_BUCKET = "gallery";
const MAX_SOURCE_BYTES = 30 * 1024 * 1024;
const MAX_GALLERY_VIDEO_BYTES = 1024 * 1024 * 1024;
const MAX_HERO_UPLOAD_MB = 8;
const MAX_HERO_UPLOAD_BYTES = MAX_HERO_UPLOAD_MB * 1024 * 1024;
const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};
const VIDEO_EXTENSION_ALIASES: Record<string, string> = {
  mp4: "mp4",
  m4v: "mp4",
  mov: "mov",
  qt: "mov",
  webm: "webm",
};

function isMissingBucketError(error: unknown) {
  const candidate = error as { message?: string } | null;
  return candidate?.message?.toLowerCase().includes("bucket not found") ?? false;
}

function isLocalDev() {
  return Boolean(import.meta.env.DEV && typeof window !== "undefined");
}

function createLocalGalleryMedia(file: File, type: "photo" | "video") {
  return registerLocalMedia(file).then((path) => ({
    bucket: GALLERY_BUCKET,
    path,
    type,
    usedFallbackBucket: false,
    usedLocalFallback: true,
  } as const));
}

function getVideoExtension(file: File) {
  const normalizedType = file.type.toLowerCase();

  if (VIDEO_EXTENSIONS[normalizedType]) {
    return VIDEO_EXTENSIONS[normalizedType];
  }

  const filenameExtension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSION_ALIASES[filenameExtension] ?? "";
}

async function uploadToBucket(
  bucket: "gallery" | "hero",
  path: string,
  file: File,
  contentType: string,
) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType,
    upsert: false,
  });

  if (error) {
    throw error;
  }
}

async function uploadImageToHeroBucket(
  file: File,
  folder: "hero" | "services" | "chrome",
  onProgress?: (progress: number) => void,
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Choose an image smaller than 30 MB.");
  }

  const supabase = requireSupabaseClient();
  const { default: imageCompression } = await import("browser-image-compression");
  const compressed = await imageCompression(file, {
    fileType: "image/webp",
    initialQuality: 0.94,
    maxSizeMB: MAX_HERO_UPLOAD_MB,
    maxWidthOrHeight: 2400,
    onProgress,
    useWebWorker: true,
  });
  const uploadFile = new File([compressed], `${crypto.randomUUID()}.webp`, {
    type: "image/webp",
  });

  if (uploadFile.size > MAX_HERO_UPLOAD_BYTES) {
    throw new Error("The compressed image is still too large. Try a smaller or simpler image.");
  }

  const year = new Date().getFullYear();
  const path = `${folder}/${year}/${uploadFile.name}`;
  const { error } = await supabase.storage.from(HERO_BUCKET).upload(path, uploadFile, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return {
    bucket: HERO_BUCKET,
    path,
  } as const;
}

export async function uploadHeroImage(file: File, onProgress?: (progress: number) => void) {
  return uploadImageToHeroBucket(file, "hero", onProgress);
}

export async function uploadServiceImage(file: File, onProgress?: (progress: number) => void) {
  return uploadImageToHeroBucket(file, "services", onProgress);
}

export async function uploadChromeLogo(file: File, onProgress?: (progress: number) => void) {
  return uploadImageToHeroBucket(file, "chrome", onProgress);
}

export async function uploadGalleryMedia(file: File, onProgress?: (progress: number) => void) {
  const year = new Date().getFullYear();

  if (file.type.startsWith("image/")) {
    if (file.size > MAX_SOURCE_BYTES) {
      throw new Error("Choose an image smaller than 30 MB.");
    }

    const { default: imageCompression } = await import("browser-image-compression");
    const compressed = await imageCompression(file, {
      fileType: "image/webp",
      initialQuality: 0.94,
      maxSizeMB: MAX_HERO_UPLOAD_MB,
      maxWidthOrHeight: 2400,
      onProgress,
      useWebWorker: true,
    });
    const uploadFile = new File([compressed], `${crypto.randomUUID()}.webp`, {
      type: "image/webp",
    });

    if (uploadFile.size > MAX_HERO_UPLOAD_BYTES) {
      throw new Error("The compressed image is still too large. Try a smaller or simpler image.");
    }

    const path = `photos/${year}/${uploadFile.name}`;
    let bucket: "gallery" | "hero" = GALLERY_BUCKET;
    let usedFallbackBucket = false;

    try {
      await uploadToBucket(GALLERY_BUCKET, path, uploadFile, "image/webp");
    } catch (error) {
      if (!isMissingBucketError(error)) {
        throw error;
      }

      bucket = HERO_BUCKET;
      usedFallbackBucket = true;
      await uploadToBucket(HERO_BUCKET, path, uploadFile, "image/webp");
    }

    return {
      bucket,
      path,
      type: "photo",
      usedFallbackBucket,
      usedLocalFallback: false,
    } as const;
  }

  const extension = getVideoExtension(file);

  if (!extension) {
    throw new Error("Choose a WebM, MP4, or MOV video.");
  }

  if (file.size > MAX_GALLERY_VIDEO_BYTES) {
    throw new Error("Choose a video smaller than 1 GB.");
  }

  if (isLocalDev()) {
    onProgress?.(100);
    return await createLocalGalleryMedia(file, "video");
  }

  onProgress?.(15);

  const path = `videos/${year}/${crypto.randomUUID()}.${extension}`;
  let bucket: "gallery" | "hero" = GALLERY_BUCKET;
  let usedFallbackBucket = false;
  const contentType = file.type || (extension === "mov" ? "video/quicktime" : `video/${extension}`);

  try {
    await uploadToBucket(GALLERY_BUCKET, path, file, contentType);
  } catch (error) {
    if (!isMissingBucketError(error)) {
      throw error;
    }

    bucket = HERO_BUCKET;
    usedFallbackBucket = true;

    try {
      await uploadToBucket(HERO_BUCKET, path, file, contentType);
    } catch (fallbackError) {
      throw fallbackError;
    }
  }

  onProgress?.(100);

  return {
    bucket,
    path,
    type: "video",
    usedFallbackBucket,
    usedLocalFallback: false,
  } as const;
}

export async function deleteGalleryMedia(bucket: "gallery" | "hero", path: string) {
  if (!path) {
    return;
  }

  if (isLocalMediaPath(path)) {
    await revokeLocalMedia(path);
    return;
  }

  const supabase = requireSupabaseClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw error;
  }
}
