import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const config = {
    runtime: 'edge', // Using Edge runtime for fastest global response
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { filename, contentType } = await req.json();

        if (!filename || !contentType) {
            return new Response('Missing filename or contentType', { status: 400 });
        }

        // Verify ENV vars exist
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_S3_BUCKET_NAME) {
            console.warn("AWS Credentials not found in Vercel ENV.");
            return new Response(JSON.stringify({ error: "AWS credentials not configured" }), { status: 500 });
        }

        const client = new S3Client({
            region: process.env.AWS_REGION || 'eu-central-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });

        const bucketName = process.env.AWS_S3_BUCKET_NAME || '';

        // Create unique key (clean filename)
        const exactName = filename.replace(/[^a-zA-Z0-9.-]/g, '');
        const key = `uploads/${Date.now()}-${exactName}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: contentType,
        });

        // Create the presigned URL with an expiry of 5 minutes
        const url = await getSignedUrl(client, command, { expiresIn: 300 });

        const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'eu-central-1'}.amazonaws.com/${key}`;

        return new Response(JSON.stringify({ uploadUrl: url, publicUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error generating presigned URL', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
