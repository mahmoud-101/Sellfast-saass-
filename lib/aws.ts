/**
 * Helper function to upload Base64 string directly to S3 via our secure API.
 */
export async function uploadBase64ToS3(base64Data: string, mimeType: string): Promise<string> {
    try {
        // 1. Get the raw base64 string (remove data:image/png;base64, if it exists)
        const base64String = base64Data.includes('base64,')
            ? base64Data.split('base64,')[1]
            : base64Data;

        // 2. Convert base64 to Blob
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Use a generated filename
        const extension = mimeType.split('/')[1] || 'png';
        const filename = `generated-asset-${Date.now()}.${extension}`;

        // 3. Get Presigned URL from our Vercel Backend
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename,
                contentType: mimeType,
            }),
        });

        if (!response.ok) {
            console.warn("Failed to get presigned URL from API. AWS might not be configured. Falling back to base64.");
            return base64Data;
        }

        const data = await response.json();
        const uploadUrl = data.uploadUrl;
        const publicUrl = data.publicUrl;

        if (!uploadUrl || !publicUrl) {
            return base64Data;
        }

        // 4. Upload directly to AWS S3 using the presigned URL
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: blob,
            headers: {
                'Content-Type': mimeType,
            },
        });

        if (uploadResponse.ok) {
            return publicUrl;
        } else {
            console.error("Failed to upload to S3", await uploadResponse.text());
            return base64Data; // Fallback
        }
    } catch (e) {
        console.error("AWS S3 Upload exception:", e);
        return base64Data; // Fallback to raw base64 if S3 fails
    }
}
