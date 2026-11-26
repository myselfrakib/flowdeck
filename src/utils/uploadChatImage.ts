import { MessageAttachment } from '../types';
import { uploadFileToStorage } from '../services/firebaseStorage';

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const compressImageToDataUrl = (file: File, maxDim = 1024, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

export const uploadChatImage = async (file: File): Promise<MessageAttachment> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported.');
  }

  try {
    const uploaded = await Promise.race([
      uploadFileToStorage(file, 'chat_images'),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Storage upload timeout')), 8000)
      )
    ]);
    return {
      name: uploaded.name,
      size: formatFileSize(uploaded.size),
      type: 'image',
      url: uploaded.url
    };
  } catch {
    // Fallback to compressed Data URL so image syncs cleanly via Firestore even without Storage rules
    const dataUrl = await compressImageToDataUrl(file);
    return {
      name: file.name,
      size: formatFileSize(file.size),
      type: 'image',
      url: dataUrl
    };
  }
};
