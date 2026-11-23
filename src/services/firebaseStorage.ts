import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTaskSnapshot
} from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface UploadProgressCallback {
  (progressPercent: number, snapshot: UploadTaskSnapshot): void;
}

/**
 * Upload any File or Blob to Firebase Cloud Storage under `studioflow/{folder}/{fileName}`
 */
export const uploadFileToStorage = async (
  file: File | Blob,
  folder: string,
  fileName?: string,
  onProgress?: UploadProgressCallback
): Promise<{ url: string; path: string; name: string; size: number }> => {
  const sanitizedName = fileName || (file instanceof File ? file.name : `asset_${Date.now()}`);
  const storagePath = `studioflow/${folder}/${Date.now()}_${sanitizedName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress), snapshot);
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadUrl,
            path: storagePath,
            name: sanitizedName,
            size: uploadTask.snapshot.totalBytes
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

/**
 * Delete a file from Cloud Storage given its storage path or download URL
 */
export const deleteFileFromStorage = async (filePath: string): Promise<void> => {
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
};

