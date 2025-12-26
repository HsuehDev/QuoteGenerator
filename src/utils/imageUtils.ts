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


