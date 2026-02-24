/**
 * Compresses and resizes an image (from a File or base64) to prevent
 * exceeding API payload limits (413 errors). 
 * Returns a base64 string of the compressed image.
 */

const MAX_DIMENSION = 1000; // Max width or height in pixels
const QUALITY = 0.82;       // JPEG quality (0-1)

export interface CompressedImage {
    base64: string;
    mimeType: 'image/jpeg';
    originalSizeKB: number;
    compressedSizeKB: number;
}

/**
 * Compresses a File object (from an <input type="file"> element).
 */
export function compressImageFile(file: File): Promise<CompressedImage> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            compressBase64Image(base64, file.size / 1024).then(resolve).catch(reject);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Compresses an existing base64 data URL.
 */
export function compressBase64Image(dataUrl: string, originalSizeKB = 0): Promise<CompressedImage> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            // Scale down if needed
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                if (width > height) {
                    height = Math.round((height * MAX_DIMENSION) / width);
                    width = MAX_DIMENSION;
                } else {
                    width = Math.round((width * MAX_DIMENSION) / height);
                    height = MAX_DIMENSION;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', QUALITY);

            // Strip the data:image/jpeg;base64, prefix
            const base64 = compressedDataUrl.split(',')[1];
            const compressedSizeKB = Math.round((base64.length * 3) / 4 / 1024);

            resolve({
                base64,
                mimeType: 'image/jpeg',
                originalSizeKB: Math.round(originalSizeKB),
                compressedSizeKB,
            });
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
}

/**
 * Utility: formats the compression result as a human-readable string.
 */
export function formatCompressionResult(result: CompressedImage): string {
    const ratio = result.originalSizeKB > 0
        ? Math.round((1 - result.compressedSizeKB / result.originalSizeKB) * 100)
        : 0;
    return `${result.originalSizeKB} KB → ${result.compressedSizeKB} KB (${ratio}% reduction)`;
}
