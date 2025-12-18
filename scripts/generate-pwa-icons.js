const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputImage = path.join(__dirname, '../public/images/favicon.png');
const outputDir = path.join(__dirname, '../public/images');

const sizes = [
    { name: 'pwa-icon-512.png', size: 512 },
    { name: 'pwa-icon-192.png', size: 192 },
    { name: 'pwa-icon-96.png', size: 96 },
    { name: 'pwa-icon-48.png', size: 48 }
];

async function generateIcons() {
    console.log('Generating PWA icons from:', inputImage);

    for (const { name, size } of sizes) {
        const outputPath = path.join(outputDir, name);
        await sharp(inputImage)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toFile(outputPath);
        console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    console.log('\nAll icons generated successfully!');
}

generateIcons().catch(err => {
    console.error('Error generating icons:', err);
    process.exit(1);
});
