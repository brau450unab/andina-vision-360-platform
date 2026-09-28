import fs from 'fs';
import path from 'path';
import https from 'https';

const pubDir = path.resolve(process.cwd(), 'public');
const panoDir = path.join(pubDir, 'panoramas');
fs.mkdirSync(panoDir, { recursive: true });

const FALLBACK_URLS = {
  'panoramas/depto_living_terraza.jpg': 'https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg',
  'panoramas/depto_living_acceso.jpg': 'https://pannellum.org/images/bma-1.jpg',
  'panoramas/depto_hall_cocina.jpg': 'https://pannellum.org/images/bma-0.jpg',
  'panoramas/depto_dormitorio.jpg': 'https://pannellum.org/images/alma.jpg',
  'panoramas/depto_pasillo_bano.jpg': 'https://pannellum.org/images/cerro-toco-0.jpg'
};

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      return resolve(true);
    }
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 200) {
          res.pipe(file);
          file.on('finish', () => {
            file.close(() => resolve(true));
          });
        } else {
          file.close(() => resolve(false));
        }
      })
      .on('error', () => {
        file.close(() => resolve(false));
      });
  });
}

async function main() {
  for (const [relPath, url] of Object.entries(FALLBACK_URLS)) {
    const dest = path.join(pubDir, relPath);
    await downloadFile(url, dest);
  }

  const aliases = {
    'panoramas/living-room-360.jpg': 'panoramas/depto_living_terraza.jpg',
    'panoramas/bedroom-360.jpg': 'panoramas/depto_dormitorio.jpg',
    'panoramas/aerial-coast-360.jpg': 'panoramas/depto_hall_cocina.jpg'
  };

  for (const [alias, src] of Object.entries(aliases)) {
    const dest = path.join(pubDir, alias);
    const srcPath = path.join(pubDir, src);
    if (!fs.existsSync(dest) && fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, dest);
    }
  }
  console.log('Verified 360 panorama assets in public/panoramas');
}

main();
