export const config = {
    runtime: 'edge',
};

/**
 * Upload endpoint — currently disabled.
 * S3 storage is not configured. Returns a helpful message.
 * Re-enable when AWS S3 credentials are added to Vercel env vars.
 */
export default async function handler(req: Request) {
    return new Response(JSON.stringify({
        error: "S3 upload is not configured. Add AWS credentials to Vercel env vars to enable."
    }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' }
    });
}
