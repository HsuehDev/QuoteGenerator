// 圖片以 base64 存 localStorage（~5MB 上限），限制單檔大小避免撐爆儲存空間
export const MAX_IMAGE_FILE_SIZE = 2 * 1024 * 1024;

export function validateImageFile(file: File): boolean {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  return validTypes.includes(file.type);
}

export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!validateImageFile(file)) {
      reject(new Error('不支援的圖片格式，請使用 PNG、JPG 或 GIF'));
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      reject(new Error('圖片檔案過大，請使用 2MB 以內的圖片'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('讀取圖片失敗'));
    };
    
    reader.readAsDataURL(file);
  });
}


