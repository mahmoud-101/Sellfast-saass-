import * as cheerio from 'cheerio';

export const config = {
    runtime: 'edge', // Using Edge runtime for fast processing
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    try {
        const { url } = await req.json();

        if (!url) {
            return new Response(JSON.stringify({ error: "URL is required" }), { status: 400 });
        }

        // Fetch the HTML content
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;'
            }
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ error: "Failed to fetch URL" }), { status: response.status });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract OpenGraph tags which are heavily used by Salla, Zid, and Shopify
        let title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        let description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        let image = $('meta[property="og:image"]').attr('content') || '';

        // Try to extract price from common Salla / ecommerce selectors
        let price = $('.product-price').first().text().trim() ||
            $('.price-wrapper').first().text().trim() ||
            $('meta[property="product:price:amount"]').attr('content') || '';

        // Clean up price string if needed
        price = price.replace(/\s+/g, ' ').trim();

        return new Response(JSON.stringify({
            title,
            description,
            image,
            price
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            status: 200
        });

    } catch (error: any) {
        console.error("Scraping error:", error);
        return new Response(JSON.stringify({ error: error.message || "Failed to parse product link" }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
}
