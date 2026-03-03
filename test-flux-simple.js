const fs = require('fs');
const path = require('path');

async function testFluxBase() {
    const prompt = "A ultra-premium luxury perfume bottle, gold accents, floating in a cosmic dark space with nebula clouds, hyper-realistic, 8k, product photography, dramatic lighting";
    const seed = Math.floor(Math.random() * 1000000);
    const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux&seed=${seed}`;

    console.log(`🚀 Testing Flux Engine...`);
    console.log(`🔗 URL: ${fluxUrl}`);

    try {
        const response = await fetch(fluxUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const buffer = await response.arrayBuffer();
        const imagePath = path.join(process.cwd(), 'test_output_flux.jpg');
        fs.writeFileSync(imagePath, Buffer.from(buffer));
        console.log(`\n✅ SUCCESS! Image saved to: ${imagePath}`);
        console.log(`📏 Size: ${buffer.byteLength} bytes`);
    } catch (error) {
        console.error(`\n❌ FAILED: ${error.message}`);
    }
}

testFluxBase();
