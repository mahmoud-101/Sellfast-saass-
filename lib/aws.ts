/**
 * Upload helper — AWS S3 is not configured.
 * Returns the base64 data as-is for in-memory usage.
 * When you configure S3 in the future, restore the upload logic here.
 */
export async function uploadBase64ToS3(base64Data: string, _mimeType: string): Promise<string> {
    // No S3 configured — return base64 directly (works fine for all current features)
    return base64Data;
}
