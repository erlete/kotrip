import { createHash } from 'crypto';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ignore from 'ignore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');
const COPILOT_OUTPUT_DIR = join(ROOT_DIR, '.github', 'instructions');
const CLAUDE_RULES_DIR = join(ROOT_DIR, '.claude', 'rules');
const GITIGNORE_PATH = join(ROOT_DIR, '.gitignore');

/**
 * Calcula un hash determinístico corto a partir de una cadena.
 */
function computeHash(str) {
  return createHash('sha256').update(str).digest('hex').substring(0, 8);
}

/**
 * Deriva un nombre de archivo legible a partir de la ruta relativa del directorio.
 *
 * Por ejemplo, `frontend/src/components/ui/button/INSTRUCTIONS.LLM.md`
 * genera el nombre `frontend-src-components-ui-button`.
 *
 * @param {string} relativePath - Ruta relativa del archivo INSTRUCTIONS.LLM.md.
 * @returns {string} Nombre derivado para el archivo de regla.
 */
function deriveRuleName(relativePath) {
  const dir = dirname(relativePath);
  return dir.replace(/[\\/]/g, '-').toLowerCase();
}

/**
 * Genera el frontmatter YAML con la directiva `paths` para una regla de Claude.
 *
 * @param {string} relativePath - Ruta relativa del archivo INSTRUCTIONS.LLM.md.
 * @returns {string} Bloque de frontmatter con el glob correspondiente.
 */
function buildClaudeFrontmatter(relativePath) {
  const dir = dirname(relativePath).replace(/\\/g, '/');
  return `---\npaths:\n  - "${dir}/**"\n---\n\n`;
}

/**
 * Carga y analiza el archivo .gitignore.
 */
async function loadGitignore() {
  try {
    const content = await readFile(GITIGNORE_PATH, 'utf-8');
    return ignore().add(content);
  } catch (err) {
    // Si .gitignore no existe, devuelve un ignore vacío
    return ignore();
  }
}

/**
 * Busca recursivamente todos los archivos que coincidan con el patrón.
 */
async function findInstructionFiles(dir, ig, basePath = ROOT_DIR) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = relative(basePath, fullPath);

    // Verifica si la ruta debe ser ignorada
    if (ig.ignores(relativePath) || ig.ignores(relativePath + '/')) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...(await findInstructionFiles(fullPath, ig, basePath)));
    } else if (entry.name === 'INSTRUCTIONS.LLM.md') {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Determina si una ruta de archivo es el archivo raíz de instrucciones de nivel superior.
 */
function isRootLevelInstructionFile(filePath, basePath) {
  const relativePath = relative(basePath, filePath);
  return relativePath === 'INSTRUCTIONS.LLM.md';
}

/**
 * Función principal para generar instrucciones de LLM.
 *
 * Para cada archivo `INSTRUCTIONS.LLM.md` encontrado en el repositorio:
 * - **Raíz**: genera `CLAUDE.md` y `.github/copilot-instructions.md`.
 * - **No raíz**: genera `.github/instructions/<hash>.instructions.md` (Copilot)
 *   y `.claude/rules/<nombre>.md` con frontmatter `paths:` (Claude Code).
 */
async function main() {
  // Carga patrones de .gitignore
  const ig = await loadGitignore();

  // Encuentra todos los archivos INSTRUCTIONS.LLM.md
  const instructionFiles = await findInstructionFiles(ROOT_DIR, ig);

  console.log(`Found ${instructionFiles.length} instruction file(s)`);

  // Asegura que los directorios de salida existen
  await mkdir(COPILOT_OUTPUT_DIR, { recursive: true });
  await mkdir(CLAUDE_RULES_DIR, { recursive: true });

  // Procesa cada archivo
  for (const filePath of instructionFiles) {
    const relativePath = relative(ROOT_DIR, filePath);
    const content = await readFile(filePath, 'utf-8');

    if (isRootLevelInstructionFile(filePath, ROOT_DIR)) {
      // Archivo raíz: genera CLAUDE.md y .github/copilot-instructions.md
      const claudePath = join(ROOT_DIR, 'CLAUDE.md');
      const copilotPath = join(ROOT_DIR, '.github', 'copilot-instructions.md');

      await mkdir(dirname(copilotPath), { recursive: true });
      await writeFile(claudePath, content, 'utf-8');
      await writeFile(copilotPath, content, 'utf-8');

      console.log(
        `Synced: ${relativePath} -> CLAUDE.md & .github/copilot-instructions.md`,
      );
    } else {
      // Archivo no raíz: genera instrucción de Copilot y regla de Claude Code
      const hash = computeHash(relativePath);
      const copilotPath = join(COPILOT_OUTPUT_DIR, `${hash}.instructions.md`);

      const ruleName = deriveRuleName(relativePath);
      const claudeRulePath = join(CLAUDE_RULES_DIR, `${ruleName}.md`);
      const claudeRuleContent = buildClaudeFrontmatter(relativePath) + content;

      await writeFile(copilotPath, content, 'utf-8');
      await writeFile(claudeRulePath, claudeRuleContent, 'utf-8');

      console.log(
        `Synced: ${relativePath} -> .github/instructions/${hash}.instructions.md & .claude/rules/${ruleName}.md`,
      );
    }
  }

  console.log('Done!');
}

// Exportar la función principal como exportación nombrada y por defecto:
export { main, main as default };

// Ejecutar la función principal en invocación directa:
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('Error during execution:', error);
    process.exit(1);
  });
}
