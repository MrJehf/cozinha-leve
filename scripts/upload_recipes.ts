import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { createClient } from '@supabase/supabase-js';

// --- Environment Variable Loading ---
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf-8');
      envConfig.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      });
      console.log('✅ Loaded .env.local');
    } else {
      console.warn('⚠️ .env.local not found');
    }
  } catch (e) {
    console.error('❌ Error loading .env.local', e);
  }
}

loadEnv();

// --- Types ---

interface RecipeYAML {
  title: string;
  subtitle: string;
  calories: string;
  prep_time: string;
  is_highlight: boolean;
  video_url: string;
  thumbnail_url: string;
  image_file: string;
  ingredients: string[];
  categories: string[];
  subcategories: string[];
  steps: string;
}

interface YAMLFile {
  receitas: RecipeYAML[];
}

// --- Supabase Client ---

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// --- Helpers ---

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.avif': 'image/avif',
  };
  return mimes[ext] || 'image/jpeg';
}

// --- Validation ---

interface ValidationError {
  recipeIndex: number;
  title: string;
  errors: string[];
}

function validateRecipe(recipe: Partial<RecipeYAML>, index: number): ValidationError | null {
  const errors: string[] = [];
  const title = recipe.title || `(sem título, índice ${index})`;

  if (!recipe.title || recipe.title.trim() === '') {
    errors.push('Campo "title" é obrigatório');
  }
  if (!recipe.subtitle || recipe.subtitle.trim() === '') {
    errors.push('Campo "subtitle" é obrigatório');
  }
  if (!recipe.calories || recipe.calories.trim() === '') {
    errors.push('Campo "calories" é obrigatório');
  }
  if (!recipe.prep_time || recipe.prep_time.trim() === '') {
    errors.push('Campo "prep_time" é obrigatório');
  }
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push('Campo "ingredients" precisa ter pelo menos 1 item');
  }
  if (!recipe.steps || recipe.steps.trim() === '') {
    errors.push('Campo "steps" é obrigatório');
  }
  if (!recipe.subcategories || recipe.subcategories.length === 0) {
    errors.push('Campo "subcategories" precisa ter pelo menos 1 item');
  }

  // Warn (not error) about missing image
  if ((!recipe.thumbnail_url || recipe.thumbnail_url.trim() === '') && 
      (!recipe.image_file || recipe.image_file.trim() === '')) {
    errors.push('⚠️  Sem imagem: nem "thumbnail_url" nem "image_file" foram preenchidos (será usado placeholder)');
  }

  if (errors.length > 0) {
    return { recipeIndex: index, title, errors };
  }
  return null;
}

// --- Image Upload ---

const STORAGE_BUCKET = 'recipe-images';

async function ensureBucketExists(): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === STORAGE_BUCKET);
  
  if (!exists) {
    console.log(`📦 Creating storage bucket "${STORAGE_BUCKET}"...`);
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
    });
    if (error) {
      console.error(`❌ Failed to create bucket: ${error.message}`);
      process.exit(1);
    }
    console.log(`✅ Bucket "${STORAGE_BUCKET}" created`);
  }
}

async function uploadImage(imageFilePath: string, recipeSlug: string): Promise<string | null> {
  if (!fs.existsSync(imageFilePath)) {
    console.warn(`   ⚠️  Image file not found: ${imageFilePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(imageFilePath);
  const ext = path.extname(imageFilePath);
  const storagePath = `${recipeSlug}${ext}`;
  const mimeType = getMimeType(imageFilePath);

  // Check if file already exists and remove it
  const { data: existingFiles } = await supabase.storage.from(STORAGE_BUCKET).list('', {
    search: recipeSlug
  });
  
  if (existingFiles && existingFiles.length > 0) {
    const matchingFile = existingFiles.find(f => f.name.startsWith(recipeSlug));
    if (matchingFile) {
      await supabase.storage.from(STORAGE_BUCKET).remove([matchingFile.name]);
    }
  }

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, fileBuffer, {
    contentType: mimeType,
    upsert: true
  });

  if (error) {
    console.error(`   ❌ Failed to upload image: ${error.message}`);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return urlData.publicUrl;
}

// --- YAML Parsing ---

function parseYAML(filePath: string): RecipeYAML[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = yaml.load(content) as YAMLFile;

  if (!parsed || !parsed.receitas || !Array.isArray(parsed.receitas)) {
    console.error('❌ YAML inválido: precisa ter um array "receitas" na raiz');
    process.exit(1);
  }

  return parsed.receitas.map((r: any) => ({
    title: (r.title || '').trim(),
    subtitle: (r.subtitle || '').trim(),
    calories: (r.calories || '').trim(),
    prep_time: (r.prep_time || '').trim(),
    is_highlight: r.is_highlight === true,
    video_url: (r.video_url || '').trim(),
    thumbnail_url: (r.thumbnail_url || '').trim(),
    image_file: (r.image_file || '').trim(),
    ingredients: Array.isArray(r.ingredients) ? r.ingredients.map((i: string) => (i || '').trim()).filter((i: string) => i !== '') : [],
    categories: Array.isArray(r.categories) ? r.categories.map((c: string) => (c || '').trim()).filter((c: string) => c !== '') : [],
    subcategories: Array.isArray(r.subcategories) ? r.subcategories.map((s: string) => (s || '').trim()).filter((s: string) => s !== '') : [],
    steps: (r.steps || '').trim(),
  }));
}

// --- Upload Logic ---

async function uploadRecipes(filePath: string, dryRun: boolean) {
  console.log(`\n📂 Reading recipes from ${filePath}...`);
  const recipes = parseYAML(filePath);
  console.log(`📊 Found ${recipes.length} recipes\n`);

  // --- Validation Phase ---
  console.log('🔍 Validating all recipes...\n');
  const validationErrors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  for (let i = 0; i < recipes.length; i++) {
    const result = validateRecipe(recipes[i], i + 1);
    if (result) {
      // Separate warnings from hard errors
      const hardErrors = result.errors.filter(e => !e.startsWith('⚠️'));
      const warningErrors = result.errors.filter(e => e.startsWith('⚠️'));
      
      if (hardErrors.length > 0) {
        validationErrors.push({ ...result, errors: hardErrors });
      }
      if (warningErrors.length > 0) {
        warnings.push({ ...result, errors: warningErrors });
      }
    }
  }

  // Show warnings
  if (warnings.length > 0) {
    console.log('⚠️  Avisos:');
    for (const w of warnings) {
      console.log(`   Receita #${w.recipeIndex} "${w.title}":`);
      w.errors.forEach(e => console.log(`     ${e}`));
    }
    console.log('');
  }

  // Stop on hard errors
  if (validationErrors.length > 0) {
    console.error('❌ Erros de validação encontrados:\n');
    for (const ve of validationErrors) {
      console.error(`   Receita #${ve.recipeIndex} "${ve.title}":`);
      ve.errors.forEach(e => console.error(`     - ${e}`));
    }
    console.error(`\n❌ ${validationErrors.length} receita(s) com erros. Corrija e tente novamente.`);
    process.exit(1);
  }

  console.log('✅ Todas as receitas são válidas!\n');

  if (dryRun) {
    console.log('🧪 [DRY RUN] Resumo das receitas que seriam enviadas:\n');
    for (const recipe of recipes) {
      console.log(`   📝 "${recipe.title}"`);
      console.log(`      Subtítulo: ${recipe.subtitle}`);
      console.log(`      Calorias: ${recipe.calories} | Tempo: ${recipe.prep_time}`);
      console.log(`      Ingredientes: ${recipe.ingredients.length} itens`);
      console.log(`      Categorias: ${recipe.categories.join(', ') || '(nenhuma)'}`);
      console.log(`      Subcategorias: ${recipe.subcategories.join(', ')}`);
      console.log(`      Destaque: ${recipe.is_highlight ? 'Sim' : 'Não'}`);
      console.log(`      Imagem: ${recipe.thumbnail_url || recipe.image_file || '(placeholder)'}`);
      console.log(`      Steps: ${recipe.steps.length} caracteres de markdown`);
      console.log('');
    }
    console.log(`🧪 [DRY RUN] ${recipes.length} receitas validadas com sucesso. Nenhum dado foi enviado.`);
    return;
  }

  // --- Upload Phase ---

  // Check if any recipe has image_file, if so ensure bucket exists
  const hasImageFiles = recipes.some(r => r.image_file);
  if (hasImageFiles) {
    await ensureBucketExists();
  }

  // Resolve images directory (relative to the YAML file)
  const yamlDir = path.dirname(path.resolve(filePath));
  const imagesDir = path.join(yamlDir, 'images');

  // Fetch existing categories
  const { data: existingCatsData, error: catFetchError } = await supabase.from('categories').select('id, name');
  if (catFetchError) {
    console.error('❌ Failed to fetch categories:', catFetchError.message);
    process.exit(1);
  }
  const catMap = new Map<string, number>();
  existingCatsData?.forEach(cat => catMap.set(cat.name.toLowerCase(), cat.id));

  // Fetch existing subcategories
  const { data: existingSubsData, error: subFetchError } = await supabase.from('subcategories').select('id, name');
  if (subFetchError) {
    console.error('❌ Failed to fetch subcategories:', subFetchError.message);
    process.exit(1);
  }
  const subMap = new Map<string, number>();
  existingSubsData?.forEach(sub => subMap.set(sub.name.toLowerCase(), sub.id));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const { title, subtitle, calories, prep_time, is_highlight, video_url, ingredients, steps } = recipe;

    console.log(`\n[${i + 1}/${recipes.length}] ⬆️  Uploading: "${title}"`);

    // --- Resolve thumbnail URL ---
    let finalThumbnailUrl = recipe.thumbnail_url;

    if (!finalThumbnailUrl && recipe.image_file) {
      const imagePath = path.join(imagesDir, recipe.image_file);
      const slug = slugify(title);
      console.log(`   🖼️  Uploading image: ${recipe.image_file}`);
      const uploadedUrl = await uploadImage(imagePath, slug);
      if (uploadedUrl) {
        finalThumbnailUrl = uploadedUrl;
        console.log(`   ✅ Image URL: ${uploadedUrl}`);
      }
    }

    if (!finalThumbnailUrl) {
      finalThumbnailUrl = 'https://placehold.co/600x400?text=' + encodeURIComponent(title);
    }

    // --- Insert Recipe ---
    const { data: insertedRecipe, error: insertError } = await supabase.from('recipes').insert({
      title,
      subtitle,
      ingredients,
      calories,
      prep_time,
      steps,
      thumbnail_url: finalThumbnailUrl,
      video_url: video_url || null,
      is_highlight
    }).select().single();

    if (insertError) {
      console.error(`   ❌ Failed to upload recipe: ${insertError.message}`);
      errorCount++;
      continue;
    }

    const recipeId = insertedRecipe.id;

    // --- Link Categories ---
    if (recipe.categories.length > 0) {
      console.log(`   📁 Categories: ${recipe.categories.join(', ')}`);
      for (const catName of recipe.categories) {
        const catKey = catName.toLowerCase();
        const catId = catMap.get(catKey);

        if (!catId) {
          console.warn(`   ⚠️  Category "${catName}" not found in database — skipping`);
          continue;
        }

        const { error: linkError } = await supabase.from('recipe_categories').insert({
          recipe_id: recipeId,
          category_id: catId
        });
        if (linkError && linkError.code !== '23505') {
          console.error(`   ❌ Error linking category "${catName}": ${linkError.message}`);
        }
      }
    }

    // --- Link Subcategories ---
    if (recipe.subcategories.length > 0) {
      console.log(`   🏷️  Subcategories: ${recipe.subcategories.join(', ')}`);
      for (const subName of recipe.subcategories) {
        const subKey = subName.toLowerCase();
        let subId = subMap.get(subKey);

        if (!subId) {
          // Create new subcategory
          console.log(`      ➕ Creating subcategory: "${subName}"`);
          const { data: newSub, error: newSubError } = await supabase
            .from('subcategories')
            .insert({ name: subName })
            .select()
            .single();

          if (newSubError) {
            if (newSubError.code === '23505') {
              // Already exists (race condition), fetch it
              const { data: retrySub } = await supabase
                .from('subcategories')
                .select('id')
                .eq('name', subName)
                .single();
              if (retrySub) subId = retrySub.id;
            } else {
              console.error(`      ❌ Error creating subcategory "${subName}": ${newSubError.message}`);
              continue;
            }
          } else if (newSub) {
            subId = newSub.id;
            subMap.set(subKey, newSub.id);
          }
        }

        if (subId !== undefined && subId !== null) {
          const { error: linkError } = await supabase.from('recipe_subcategories').insert({
            recipe_id: recipeId,
            subcategory_id: subId
          });
          if (linkError && linkError.code !== '23505') {
            console.error(`      ❌ Error linking subcategory "${subName}": ${linkError.message}`);
          }
        }
      }
    }

    console.log(`   ✅ Done: "${title}" (ID: ${recipeId})`);
    successCount++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🎉 Upload finalizado!`);
  console.log(`   ✅ Sucesso: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   ❌ Erros: ${errorCount}`);
  }
  console.log('='.repeat(60) + '\n');
}

// --- Main Execution ---

const args = process.argv.slice(2);
const filePath = args.find(a => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');

if (!filePath) {
  console.log(`
╔══════════════════════════════════════════════════════╗
║       Upload em Massa de Receitas - Cozinha Leve     ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Uso:                                                ║
║    npx tsx scripts/upload_recipes.ts <arquivo.yaml>  ║
║                                                      ║
║  Opções:                                             ║
║    --dry-run   Valida sem enviar ao banco             ║
║                                                      ║
║  Exemplo:                                            ║
║    npx tsx scripts/upload_recipes.ts \\               ║
║      scripts/receitas.yaml --dry-run                 ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

uploadRecipes(filePath, dryRun);
