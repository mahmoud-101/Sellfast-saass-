import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function testFluxDirect() {
    const prompt = "A ultra-premium luxury perfume bottle, gold accents, floating in a cosmic dark space with nebula clouds, hyper-realistic, 8k, product photography, dramatic lighting";
    const seed = Math.floor(Math.random() * 1000000);
    const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux&seed=${seed}`;

    console.log(`🚀 Testing Flux Engine...`);
    console.log(`🔗 URL: ${fluxUrl}`);

    try {
        const response = await axios.get(fluxUrl, { responseType: 'arraybuffer' });
        const imagePath = path.join(process.cwd(), 'test_output_flux.jpg');
        fs.writeFileSync(imagePath, response.data);
        console.log(`✅ SUCCESS! Image saved to: ${imagePath}`);
        console.log(`📏 Size: ${response.data.length} bytes`);
    } catch (error: any) {
        console.error(`❌ FAILED: ${error.message}`);
    }
}

testFluxDirect();
