export const config = {
    runtime: 'edge',
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

        // Zero-dependency HTML parsing using Regex
        const extract = (regex: RegExp, fallbackRegex?: RegExp) => {
            const match = html.match(regex);
            if (match && match[1]) return match[1].trim();
            if (fallbackRegex) {
                const fallbackMatch = html.match(fallbackRegex);
                if (fallbackMatch && fallbackMatch[1]) return fallbackMatch[1].trim();
            }
            return '';
        };

        const title = extract(/<meta property="og:title" content="([^"]+)"/i, /<title>([^<]+)<\/title>/i);
        const description = extract(/<meta property="og:description" content="([^"]+)"/i, /<meta name="description" content="([^"]+)"/i);
        const image = extract(/<meta property="og:image" content="([^"]+)"/i);
        let price = extract(/<meta property="product:price:amount" content="([^"]+)"/i) ||
            extract(/class="product-price"[^>]*>([^<]+)</i);

        price = price.replace(/\s+/g, ' ').trim();

        return new Response(JSON.stringify({
            title,
            description,
            image,
            price
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || "Failed to parse product link" }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
}
