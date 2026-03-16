import fs from 'fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, '..', '..', 'src');

/**
 * Directorios que se excluyen del análisis por contener código de servidor
 * o definiciones de traducción que no deben reportarse como texto sin internacionalizar.
 */
const EXCLUDED_DIRS = [
  path.join('features', 'i18n', 'messages'),
  path.join('app', 'api'),
];

/**
 * Archivos que se excluyen del análisis por contener código de infraestructura
 * del lado del servidor que no representa texto visible para el usuario.
 */
const EXCLUDED_FILES = [
  'proxy.ts',
  'navigationRoute.ts',
  'themed-asset.ts',
  'app.config.default.ts',
  'activity-type-config.ts',
  'footer.tsx',
];

/**
 * Sufijos de archivo que se excluyen del análisis. Los archivos de esquemas de validación
 * (Zod) contienen mensajes estáticos que requieren un enfoque diferente de internacionalización.
 */
const EXCLUDED_SUFFIXES = ['.d.json.ts', '.schema.ts'];

/**
 * Recorre recursivamente un directorio en busca de archivos TypeScript (.ts, .tsx),
 * excluyendo definiciones de tipo JSON, rutas de API del servidor y archivos de esquemas.
 *
 * @param {string} dir - Ruta del directorio a recorrer.
 * @param {Array<object>} report - Lista acumulada de incidencias encontradas.
 */
function walk(dir, report) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (EXCLUDED_DIRS.some((excluded) => fullPath.endsWith(excluded)))
        continue;
      walk(fullPath, report);
    } else if (
      (file.endsWith('.tsx') || file.endsWith('.ts')) &&
      !EXCLUDED_FILES.includes(file) &&
      !EXCLUDED_SUFFIXES.some((suffix) => file.endsWith(suffix))
    ) {
      analyzeFile(fullPath, report);
    }
  }
}

/**
 * Analiza un archivo TypeScript en busca de cadenas de texto potencialmente no internacionalizadas.
 *
 * @param {string} filePath - Ruta absoluta del archivo a analizar.
 * @param {Array<object>} report - Lista acumulada de incidencias encontradas.
 */
function analyzeFile(filePath, report) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');

  let inBlockComment = false;
  let prevLineThrowOrError = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Rastrear comentarios multilínea (/* ... */ y /** ... */)
    if (inBlockComment) {
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      return;
    }
    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) {
        inBlockComment = true;
      }
      return;
    }

    // Omitir comentarios de una línea
    if (trimmed.startsWith('//')) return;

    // Omitir directivas ('use client', 'use server', etc.)
    if (/^(['"])use (client|server|strict)\1;?$/.test(trimmed)) return;

    // Omitir importaciones
    if (trimmed.startsWith('import')) return;

    // Omitir cadenas ya traducidas (incluyendo alias comunes: t, c, routesT, tRoutes)
    if (
      /\bt\(\s*['"]/.test(trimmed) ||
      /\bc\(\s*['"]/.test(trimmed) ||
      /\w+T\(\s*['"]/.test(trimmed) ||
      /t\w+\(\s*['"]/.test(trimmed)
    ) {
      return;
    }

    // Omitir sentencias de consola (console.log, console.error, console.warn, etc.)
    if (/console\.\w+\(/.test(trimmed)) {
      prevLineThrowOrError = true;
      return;
    }

    // Omitir errores de desarrollador (throw new Error, super(), Error())
    if (
      /throw\s+new\s+\w*Error\s*\(/.test(trimmed) ||
      /new\s+\w*Error\s*\(/.test(trimmed) ||
      /super\s*\(/.test(trimmed)
    ) {
      prevLineThrowOrError = true;
      return;
    }

    // Omitir cadenas de argumento en contextos multilínea de throw/Error o console.*
    if (prevLineThrowOrError && /^['"`]/.test(trimmed)) {
      prevLineThrowOrError =
        trimmed.endsWith(',') || trimmed.endsWith('(') || trimmed.endsWith('+');
      return;
    }
    prevLineThrowOrError = false;

    // Omitir cabeceras HTTP y tokens de autenticación
    if (/Authorization|Bearer|Refresh/.test(trimmed)) return;

    // Omitir valores de color (oklch, hsl, rgb, hex)
    if (/oklch\(|hsl\(|rgb\(|#[0-9a-fA-F]{3,8}/.test(trimmed)) return;

    // Omitir declaraciones de fuentes tipográficas
    if (/fontFamily|font-family/.test(trimmed)) return;

    // Omitir datos de rutas SVG (atributo d=)
    if (/\bd=["']/.test(trimmed)) return;

    // Omitir validaciones de variables de entorno
    if (/process\.env|\.env\b/.test(trimmed)) return;

    // Omitir atributos HTML técnicos no traducibles
    if (
      /\brel=["']/.test(trimmed) ||
      /\ballow=["']/.test(trimmed) ||
      /\bstyle=\{/.test(trimmed) ||
      /\bstyle:\s/.test(trimmed)
    ) {
      return;
    }

    // Omitir setAttribute con atributos técnicos
    if (/\.setAttribute\(\s*['"]rel['"]/.test(trimmed)) return;

    // Omitir propiedades rel en objetos JavaScript (no solo JSX)
    if (/\brel:\s*['"]/.test(trimmed)) return;

    // Omitir llamadas a startsWith/endsWith con caracteres técnicos (rutas, fragmentos)
    if (/\.startsWith\(['"][/#.]/.test(trimmed)) return;

    // Omitir comparaciones .includes() contra cadenas de API/protocolo
    if (/\.includes\(\s*['"]/.test(trimmed) && !/[áéíóúñÁÉÍÓÚÑ]/.test(trimmed))
      return;

    // Omitir retornos con objetos de propiedades vacías (e.g. { password: '', repeatPassword: '' })
    if (/:\s*['"]["']/.test(trimmed) && /return\s*\{/.test(trimmed)) return;

    // Buscar literales de cadena que contengan letras
    const matches = trimmed.match(
      /(['"`])([^'"`]*[A-Za-zÁÉÍÓÚáéíóúÑñ][^'"`]*)\1/g,
    );

    if (!matches) return;

    matches.forEach((match) => {
      const value = match.slice(1, -1);

      // Ignorar cadenas de una sola palabra (se requieren al menos dos palabras separadas por espacio)
      if (!value.includes(' ')) return;

      // Ignorar propiedades técnicas de atributos HTML/JSX
      if (
        trimmed.includes('className=') ||
        trimmed.includes('id=') ||
        trimmed.includes('href=') ||
        trimmed.includes('src=') ||
        trimmed.includes('variant=') ||
        trimmed.includes('type=')
      ) {
        return;
      }

      // Ignorar patrones de formato de tiempo abreviados (e.g. `${h}h ${m}m ${sec}s`)
      if (/\$\{.*\}[hms]\b/.test(value)) return;

      // Ignorar comparaciones de igualdad (no son texto visible para el usuario)
      if (/===\s*['"`]/.test(trimmed) && /['"`]\s*===/.test(trimmed)) return;

      // Ignorar patrones de formato numérico (e.g. `${val.toFixed(2)} %`, `${val.slice(0, 16)}...`)
      if (/\$\{.*\.(toFixed|slice|round)\(/.test(value)) return;

      // Ignorar interpolaciones de variables sin texto visible para el usuario
      if (/^\$\{.*\}\s*\$\{.*\}$/.test(value)) return;

      // Ignorar cadenas que son únicamente interpolaciones y separadores técnicos
      if (/^[\s${}./\-#]*$/.test(value.replace(/\$\{[^}]*\}/g, ''))) return;

      // Ignorar construcción de rutas de archivo (contienen / y extensiones)
      if (/\$\{.*\}\/.*\.\$\{/.test(value)) return;

      // Ignorar prefijos de log entre corchetes (e.g. `[VNC] POST /vnc ...`)
      if (/^\[.*\]/.test(value)) return;

      // Ignorar operadores de consulta y separadores técnicos
      if (/\.includes\(/.test(trimmed) && /op\s*===/.test(trimmed)) return;

      // Ignorar separadores puros (e.g. ' / ', ' : ') y separadores con interpolación
      if (/^[\s/:,|\\>·•->]+$/.test(value)) return;
      if (
        /^[:\s-]+\$\{/.test(value) &&
        !/[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,}/.test(value.replace(/\$\{[^}]*\}/g, ''))
      )
        return;

      // Ignorar cadenas con solo símbolos Unicode no alfabéticos (e.g. ' ▲', ' ▼')
      if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(value)) return;

      // Ignorar cadenas que contienen secuencias de escape Unicode sin texto legible
      if (/^[\s\\u0-9A-Fa-f]+$/.test(value)) return;

      // Ignorar llamadas a .join() con separadores técnicos
      if (/\.join\(\s*['"`]/.test(trimmed) && value.length <= 5) return;

      // Ignorar cadenas que contienen código JavaScript (falso positivo de regex cruzado)
      if (/\.\w+\(.*=>.*\)/.test(value)) return;

      // Ignorar clases CSS (cadenas con palabras separadas por guiones o espacios típicas de Tailwind/CSS)
      if (/^[\w-]+([\s]+[\w-]+)*$/.test(value) && value.includes('-')) return;

      // Ignorar cadenas que cruzan límites de expresiones (falsos positivos del regex)
      if (/===\s*['"`].*\breturn\b/.test(value)) return;

      // Ignorar acceso a estilos CSS módulos (e.g. styles[`lockInfo--${variant}`])
      if (/styles\[/.test(trimmed) && /\$\{/.test(value)) return;

      report.push({
        file: path.relative(path.join(__dirname, '../..'), filePath),
        line: index + 1,
        text: value,
        sourceLine: line,
      });
    });
  });
}

/**
 * Función principal del módulo.
 *
 * @remarks Recorre el directorio fuente buscando cadenas de texto potencialmente no internacionalizadas
 * y genera un informe con las coincidencias encontradas en formato estilo tsc.
 */
async function main() {
  const report = [];
  walk(SRC_DIR, report);

  // Imprimir cada incidencia en formato estilo tsc
  for (const entry of report) {
    console.log(
      `${entry.file}:${entry.line} - warning: Potential hardcoded string found.`,
    );
    console.log();
    console.log(`${entry.line} ${entry.sourceLine.trimEnd()}`);
    console.log(`  ${'~'.repeat(entry.text.length + 2)}`);
    console.log();
  }

  // Construir resumen: conteo por archivo (con número de primera línea)
  const fileMap = new Map();
  for (const entry of report) {
    if (!fileMap.has(entry.file)) {
      fileMap.set(entry.file, { count: 0, firstLine: entry.line });
    }
    fileMap.get(entry.file).count++;
  }

  const totalErrors = report.length;
  const totalFiles = fileMap.size;

  console.log(
    `Found ${totalErrors} potential hardcoded strings in ${totalFiles} files.`,
  );
  console.log();
  console.log('Warnings  Files');

  for (const [file, { count, firstLine }] of fileMap) {
    console.log(`     ${String(count).padStart(3)}  ${file}:${firstLine}`);
  }
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
