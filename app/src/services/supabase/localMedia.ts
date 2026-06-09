const LOCAL_MEDIA_PREFIX = "local-media://";
const LOCAL_MEDIA_DB = "pera-garden-local-media";
const LOCAL_MEDIA_STORE = "files";
const localMediaUrls = new Map<string, string>();

function getMediaId(path: string) {
  return path.replace(LOCAL_MEDIA_PREFIX, "").split("/")[0] ?? "";
}

function openLocalMediaDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(LOCAL_MEDIA_DB, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(LOCAL_MEDIA_STORE)) {
        database.createObjectStore(LOCAL_MEDIA_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local media storage."));
  });
}

async function putLocalMediaBlob(id: string, file: File) {
  const database = await openLocalMediaDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(LOCAL_MEDIA_STORE, "readwrite");
    const store = transaction.objectStore(LOCAL_MEDIA_STORE);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not save local media."));

    store.put(file, id);
  });
}

async function getLocalMediaBlob(id: string) {
  const database = await openLocalMediaDb();

  return new Promise<File | Blob | null>((resolve, reject) => {
    const transaction = database.transaction(LOCAL_MEDIA_STORE, "readonly");
    const store = transaction.objectStore(LOCAL_MEDIA_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve((request.result as File | Blob | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("Could not read local media."));
  });
}

async function deleteLocalMediaBlob(id: string) {
  const database = await openLocalMediaDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(LOCAL_MEDIA_STORE, "readwrite");
    const store = transaction.objectStore(LOCAL_MEDIA_STORE);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not delete local media."));

    store.delete(id);
  });
}

export function isLocalMediaPath(path: string) {
  return path.startsWith(LOCAL_MEDIA_PREFIX);
}

export async function resolveLocalMediaUrl(path: string) {
  const cached = localMediaUrls.get(path);

  if (cached) {
    return cached;
  }

  const blob = await getLocalMediaBlob(getMediaId(path));

  if (!blob) {
    return "";
  }

  const url = URL.createObjectURL(blob);
  localMediaUrls.set(path, url);
  return url;
}

export async function registerLocalMedia(file: File) {
  const id = crypto.randomUUID();
  const path = `${LOCAL_MEDIA_PREFIX}${id}/${file.name}`;
  await putLocalMediaBlob(id, file);
  return path;
}

export async function revokeLocalMedia(path: string) {
  const url = localMediaUrls.get(path);

  if (url) {
    URL.revokeObjectURL(url);
    localMediaUrls.delete(path);
  }

  await deleteLocalMediaBlob(getMediaId(path));
}
