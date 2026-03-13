const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const ROOT_DIR = process.cwd();
const IMAGE_DIR = ROOT_DIR;
const OUTPUT_BASE = path.join(ROOT_DIR, 'assets', 'images');
const MARCAS_DIR = path.join(ROOT_DIR, 'MARCAS');

const CONFIG = {
    hero: { width: 1920, quality: 80, folder: 'hero', maxKB: 400 },
    projetos: { width: 1200, quality: 75, folder: 'projetos', maxKB: 300 },
    cards: { width: 800, quality: 75, folder: 'projetos', maxKB: 250 },
    thumbs: { width: 400, quality: 70, folder: 'thumbs', maxKB: 100 },
};

const RESPONSIVE_WIDTHS = [400, 800, 1200, 1600, 1920];

const IMAGE_CATEGORIES = {
    hero: ['heropc.png', 'herocel.png', 'jantar_hero.png', 'almoco_hero.png', 'fundovinho.png', 'herocel.png'],
    projetos: ['ambiente', 'sobre_restaurante', 'parmegiana', 'picadinho', 'talharim', 'Contra-filé', 'prato_', 'pizza', 'entrada', 'massa', 'carne', 'frutosdomar', 'porcaom', 'caldo', 'pizzafrita', 'sobremesa', 'vinho', 'cerveja', 'pizza_artesanal_detalhe', 'pizza_forno'],
    thumbs: ['logo.png']
};

async function ensureFolders() {
    await fs.ensureDir(path.join(OUTPUT_BASE, 'hero'));
    await fs.ensureDir(path.join(OUTPUT_BASE, 'projetos'));
    await fs.ensureDir(path.join(OUTPUT_BASE, 'thumbs'));
    await fs.ensureDir(path.join(OUTPUT_BASE, 'optimized'));
    await fs.ensureDir(path.join(OUTPUT_BASE, 'marcas'));
}

function getCategory(filename) {
    if (IMAGE_CATEGORIES.hero.some(h => filename.includes(h))) return 'hero';
    if (IMAGE_CATEGORIES.projetos.some(p => filename.includes(p))) return 'projetos';
    return 'thumbs';
}

async function processImage(filePath, filename, isMarca = false) {
    const category = isMarca ? 'thumbs' : getCategory(filename);
    const config = CONFIG[category] || CONFIG.projetos;
    const stats = { original: 0, optimized: 0, saved: 0 };

    const originalSize = (await fs.stat(filePath)).size;
    stats.original = originalSize;

    const pipeline = sharp(filePath).rotate(); 

    // Base name without extension
    const baseName = path.parse(filename).name;
    const targetFolder = isMarca ? path.join(OUTPUT_BASE, 'marcas') : path.join(OUTPUT_BASE, config.folder);
    
    // 1. Generate optimized original format (but resized)
    const ext = path.parse(filename).ext.toLowerCase();
    const finalExt = ext === '.png' ? 'png' : 'jpeg';
    
    // 2. Generate the main optimized version
    const mainOutputPath = path.join(targetFolder, `${baseName}${ext}`);
    await pipeline
        .clone()
        .resize({ width: config.width, withoutEnlargement: true })
        .toFormat(finalExt === 'png' ? 'png' : 'jpeg', { quality: config.quality, mozjpeg: true })
        .toFile(mainOutputPath);

    stats.optimized = (await fs.stat(mainOutputPath)).size;

    // 3. Generate WebP alternatives for all responsive widths
    for (const w of RESPONSIVE_WIDTHS) {
        if (w > config.width && category !== 'hero') continue;
        
        const webpPath = path.join(targetFolder, `${baseName}-${w}.webp`);
        await pipeline
            .clone()
            .resize({ width: w, withoutEnlargement: true })
            .webp({ quality: config.quality })
            .toFile(webpPath);
    }
    
    // Also generate a default webp
    const defaultWebpPath = path.join(targetFolder, `${baseName}.webp`);
    await pipeline
        .clone()
        .resize({ width: config.width, withoutEnlargement: true })
        .webp({ quality: config.quality })
        .toFile(defaultWebpPath);

    return stats;
}

async function main() {
    console.log('🚀 Iniciando otimização de imagens...');
    await ensureFolders();

    const files = await fs.readdir(IMAGE_DIR);
    const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f));
    
    const marcasFiles = (await fs.exists(MARCAS_DIR)) ? await fs.readdir(MARCAS_DIR) : [];
    const marcasImageFiles = marcasFiles.filter(f => /\.(png|jpg|jpeg)$/i.test(f));

    let totalOriginal = 0;
    let totalOptimized = 0;
    const report = [];

    console.log(`Encontradas ${imageFiles.length} imagens na raiz e ${marcasImageFiles.length} na pasta MARCAS.`);

    for (const f of imageFiles) {
        try {
            console.log(`Processando: ${f}...`);
            const s = await processImage(path.join(IMAGE_DIR, f), f);
            totalOriginal += s.original;
            totalOptimized += s.optimized;
            report.push({ name: f, ...s });
        } catch (err) {
            console.error(`Erro ao processar ${f}:`, err.message);
        }
    }

    for (const f of marcasImageFiles) {
        try {
            console.log(`Processando Marca: ${f}...`);
            const s = await processImage(path.join(MARCAS_DIR, f), f, true);
            totalOriginal += s.original;
            totalOptimized += s.optimized;
            report.push({ name: `MARCAS/${f}`, ...s });
        } catch (err) {
            console.error(`Erro ao processar Marca ${f}:`, err.message);
        }
    }

    console.log('\n--- RELATÓRIO DE PERFORMANCE ---');
    console.log(`Peso Original Total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Peso Otimizado Total: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Economia Total: ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Redução: ${(((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1)}%`);
    
    await fs.writeJson(path.join(ROOT_DIR, 'scripts', 'optimization-report.json'), {
        totalOriginal,
        totalOptimized,
        savings: totalOriginal - totalOptimized,
        percentage: ((totalOriginal - totalOptimized) / totalOriginal) * 100,
        details: report
    }, { spaces: 2 });
}

main().catch(console.error);
