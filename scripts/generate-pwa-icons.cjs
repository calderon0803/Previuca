// Script puntual para generar los iconos PWA reales a partir del logo.
// Se ejecuta una vez a mano (node scripts/generate-pwa-icons.cjs); no forma
// parte del build ni de ningún paso automático.
const sharp = require('sharp');
const path = require('path');

const SRC = path.join(__dirname, '..', 'public', 'logo.png');
const OUT = path.join(__dirname, '..', 'public', 'icons');
const BG = '#1f2b55'; // color de fondo real del logo (esquina de la imagen)

async function run() {
    // Icono normal (purpose "any"): el logo tal cual, a los tamaños estándar.
    await sharp(SRC).resize(192, 192).png().toFile(path.join(OUT, 'icon-192.png'));
    await sharp(SRC).resize(512, 512).png().toFile(path.join(OUT, 'icon-512.png'));

    // Icono maskable: el contenido tiene que caber en la "safe zone" central
    // (~80%) porque Android puede recortarlo en círculo/redondeado/etc.
    const inner = await sharp(SRC).resize(410, 410).toBuffer();
    await sharp({
        create: { width: 512, height: 512, channels: 3, background: BG },
    })
        .composite([{ input: inner, top: 51, left: 51 }])
        .png()
        .toFile(path.join(OUT, 'icon-maskable-512.png'));

    // apple-touch-icon: iOS no respeta transparencia, así que va opaco.
    await sharp(SRC).resize(180, 180).flatten({ background: BG }).png().toFile(path.join(OUT, 'apple-touch-icon.png'));

    // Favicon para la pestaña del navegador.
    await sharp(SRC).resize(32, 32).png().toFile(path.join(OUT, 'favicon-32.png'));

    console.log('Iconos PWA generados en public/icons/');
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
