import fs from 'node:fs';
import path from 'node:path';
import toIco from 'to-ico';

const webPublic = path.join(process.cwd(), 'web', 'public');
const f16 = path.join(webPublic, 'favicon-16x16.png');
const f32 = path.join(webPublic, 'favicon-32x32.png');
const out = path.join(webPublic, 'favicon.ico');

async function run() {
  if (!fs.existsSync(f16) || !fs.existsSync(f32)) {
    console.error('Missing favicon PNGs. Expected favicon-16x16.png and favicon-32x32.png in web/public/');
    process.exit(1);
  }
  
  try {
    const ico = await toIco([fs.readFileSync(f16), fs.readFileSync(f32)]);
    fs.writeFileSync(out, ico);
    const size = fs.statSync(out).size;
    console.log(`✅ favicon.ico written (${size} bytes)`);
  } catch (error) {
    console.error('Error generating favicon.ico:', error);
    process.exit(1);
  }
}

run().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
