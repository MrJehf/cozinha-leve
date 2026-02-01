
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// --- Environment Variable Loading ---
// Simple helper to load .env.local because we are running this with TSX outside of Next.js context
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf-8');
      envConfig.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
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

interface RecipeCSV {
  title: string;
  subtitle: string;
  ingredients: string[];
  calories: string;
  prep_time: string;
  steps: string;
  tags: string[];
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

// --- CSV Parsing ---

function parseCSV(filePath: string): RecipeCSV[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Normalize newlines to avoid issues with different OS encodings inside quoted strings
  const lines = content.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim() !== '');
  
  // Skip header
  // Note: We need a more robust line splitter because the "Modo de Preparo" (Steps) can contain newlines inside quotes.
  // The simple .split('\n') above breaks if there are newlines inside quotes.
  
  // Better approach: Parse the whole content string using regex
  
  const recipes: RecipeCSV[] = [];
  
  // Regex to match a full CSV line, handling quoted newlines.
  // This is tricky. A better way manually iterating characters or using a library.
  // Given we can't add libraries easily (no npm install allowed/easy), we stick to manual parsing or robust regex.
  
  // Basic Regex for Semicolon delimited: 
  // Values are either quoted strings "..." OR non-semicolon strings.
  // The global match won't work easily for lines. 
  
  // Let's assume the file is small enough to parse character by character.
  
  const parsedRows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i+1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // Skip escape
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ';' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      // End of line
      // Handle CRLF or LF
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      
      // Push last val
      currentRow.push(currentVal);
      currentVal = '';
      
      if (currentRow.length > 0) {
        // Check if empty row
        if (currentRow.length === 1 && currentRow[0].trim() === '') {
           // Skip empty lines
        } else {
           parsedRows.push(currentRow);
        }
      }
      currentRow = [];
    } else {
      currentVal += char;
    }
  }
  // Push last row if exists
  if (currentRow.length > 0 || currentVal.length > 0) {
     currentRow.push(currentVal);
     parsedRows.push(currentRow);
  }

  // Remove Header
  const dataRows = parsedRows.slice(1);
  
  dataRows.forEach((parts, index) => {
    // Expected Columns: Title;Subtitle;Ingredients;Calories;PrepTime;Steps;Tags
    if (parts.length < 7) {
      console.warn(`⚠️ Skipping row ${index + 2}: Insufficient columns. Found: ${parts.length}`);
      return;
    }

    const title = parts[0].trim();
    const subtitle = parts[1].trim();
    const ingredients = parts[2].split('|').map(i => i.trim()).filter(i => i !== '');
    
    const caloriesRaw = parts[3].trim();
    const caloriesMatch = caloriesRaw.match(/(\d+)/);
    const calories = caloriesMatch ? caloriesMatch[0] : "0";

    const prep_time = parts[4].trim();
    const steps = parts[5].trim(); // Markdown allowed
    const tags = parts[6].split('|').map(t => t.trim()).filter(t => t !== '');

    recipes.push({
      title,
      subtitle,
      ingredients,
      calories,
      prep_time,
      steps,
      tags
    });
  });

  return recipes;
}

// --- Upload Logic ---

async function uploadRecipes(filePath: string) {
  console.log(`📂 Reading recipes from ${filePath}...`);
  const recipes = parseCSV(filePath);
  console.log(`found ${recipes.length} recipes to upload.`);

  // 1. Fetch existing tags to avoid duplicate inserts or find IDs
  const { data: existingTagsData, error: tagError } = await supabase.from('tags').select('id, name');
  if (tagError) {
    console.error('❌ Failed to fetch existing tags:', tagError.message);
    process.exit(1);
  }
  
  // Map Name -> ID
  const tagMap = new Map<string, number>();
  existingTagsData?.forEach(tag => tagMap.set(tag.name.toLowerCase(), tag.id));

  for (const recipe of recipes) {
    const { title, subtitle, ingredients, calories, prep_time, steps, tags } = recipe;

    console.log(`⬆️ Uploading: ${title}`);

    // Insert Recipe
    const { data: insertedRecipe, error } = await supabase.from('recipes').insert({
      title,
      subtitle, // New Field
      ingredients,
      calories,
      prep_time,
      steps,
      thumbnail_url: 'https://placehold.co/600x400?text=Recipe+Image',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      is_highlight: false
    }).select().single();

    if (error) {
      console.error(`❌ Failed to upload ${title}:`, error.message);
      continue;
    }

    // Handle Tags
    console.log(`   🏷️ Processing tags: ${tags.join(', ')}`);
    for (const tagName of tags) {
        const normalizedTag = tagName.trim();
        const tagKey = normalizedTag.toLowerCase();
        let tagId = tagMap.get(tagKey);

        if (!tagId) {
            // Create Tag
            console.log(`      Creating new tag: ${normalizedTag}`);
            const { data: newTag, error: newTagError } = await supabase
                .from('tags')
                .insert({ name: normalizedTag })
                .select()
                .single();
            
            if (newTagError) {
                // Handle concurrent creation race condition if necessary, or just log
                console.error(`      ❌ Error creating tag ${normalizedTag}:`, newTagError.message);
                // Try fetching again maybe? or Skip
                // For simplified script, existingTags query happens once at start, so race condition possible if run in parallel.
                // Assuming single run.
                // Attempt to fetch if error was "duplicate key"
                if (newTagError.code === '23505') { // Unique violation
                    const { data: retryTag } = await supabase.from('tags').select('id').eq('name', normalizedTag).single();
                    if (retryTag) tagId = retryTag.id;
                }
            } else if (newTag) {
                tagId = newTag.id;
                tagMap.set(tagKey, newTag.id);
            }
        }

        if (tagId !== undefined && tagId !== null && insertedRecipe) {
            // Link Recipe to Tag
            const { error: linkError } = await supabase.from('recipe_tags').insert({
                recipe_id: insertedRecipe.id,
                tag_id: tagId
            });
            if (linkError) {
                 // Ignore duplicate link errors
                 if (linkError.code !== '23505') {
                    console.error(`      ❌ Error linking tag ${normalizedTag}:`, linkError.message);
                 }
            }
        }
    }

    console.log(`✅ Uploaded ${title}`);
  }
    console.log('🎉 Batch upload finished!');

}

// --- Main Execution ---

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: npx tsx scripts/upload_recipes.ts <path-to-csv>');
  process.exit(1);
}

uploadRecipes(filePath);
