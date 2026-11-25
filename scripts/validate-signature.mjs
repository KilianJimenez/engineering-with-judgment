// Signature files (signatures/<login>.yml): parsing and validation shared by the generator and the GitHub Action.
export const FIELDS = { github: 39, nombre: 80, rol: 100, fecha: 10 };
const LOGIN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const FILE = /^signatures\/([^/]+)\.yml$/;

// Minimal YAML subset: one `key: value` per line, values optionally double-quoted, `#` comments.
export function parseSignature(text) {
  const data = {};
  for (const [i, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trimEnd();
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = line.match(/^([a-z]+):(?:\s+(.*))?$/);
    if (!match) throw new Error(`línea ${i + 1}: se esperaba «clave: valor»`);
    const [, key, rawValue = ''] = match;
    if (key in data) throw new Error(`línea ${i + 1}: clave «${key}» repetida`);
    let value = rawValue.trim();
    if (value.startsWith('"')) {
      try { value = JSON.parse(value); } catch { throw new Error(`línea ${i + 1}: comillas mal cerradas`); }
    } else if (value.startsWith("'")) {
      if (!/^'.*'$/.test(value)) throw new Error(`línea ${i + 1}: comillas mal cerradas`);
      value = value.slice(1, -1).replaceAll("''", "'");
    }
    data[key] = String(value);
  }
  return data;
}

export function checkSignature(data) {
  const errors = [];
  for (const key of Object.keys(data)) if (!(key in FIELDS)) errors.push(`Clave no permitida: «${key}». Solo se admiten: ${Object.keys(FIELDS).join(', ')}.`);
  if (!data.github) errors.push('Falta el campo obligatorio «github».');
  else if (!LOGIN.test(data.github)) errors.push(`«${data.github}» no es un usuario de GitHub válido.`);
  for (const [key, max] of Object.entries(FIELDS)) {
    const value = data[key];
    if (value == null) continue;
    if (value.length > max) errors.push(`«${key}» supera ${max} caracteres.`);
    if (/[<>]|https?:|www\.|\/\//i.test(value)) errors.push(`«${key}» no puede contener HTML ni URLs.`);
    if ([...value].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) errors.push(`«${key}» contiene caracteres de control.`);
  }
  if (data.fecha && (!/^\d{4}-\d{2}-\d{2}$/.test(data.fecha) || Number.isNaN(Date.parse(`${data.fecha}T00:00:00Z`)) || new Date(`${data.fecha}T00:00:00Z`).toISOString().slice(0, 10) !== data.fecha)) {
    errors.push('«fecha» debe tener el formato AAAA-MM-DD.');
  }
  return errors;
}

/**
 * Validates a signature pull request.
 * @param {object} pr
 * @param {{ filename: string, status: string }[]} pr.files Files changed by the PR.
 * @param {string} pr.author Login of the PR author.
 * @param {string} pr.content Content of the added file.
 * @param {string[]} pr.existing Logins that have already signed (from the base branch).
 * @returns {string[]} Errors; empty when the PR can be merged.
 */
export function validateSignaturePR({ files, author, content, existing = [] }) {
  if (files.length !== 1) return [`La firma debe añadir exactamente un fichero (el PR cambia ${files.length}).`];
  const [file] = files;
  const match = file.filename.match(FILE);
  if (!match) return [`El fichero debe ser «signatures/${author}.yml» (es «${file.filename}»).`];
  if (file.status !== 'added') return ['Solo se pueden añadir firmas nuevas, no modificar ni borrar las existentes.'];
  const login = match[1];
  const errors = [];
  if (login.toLowerCase() !== author.toLowerCase()) errors.push(`El fichero debe llamarse «signatures/${author}.yml»: solo puedes firmar con tu propio usuario.`);
  if (existing.some((name) => name.toLowerCase() === login.toLowerCase())) errors.push(`«${login}» ya ha firmado el manifiesto.`);
  let data;
  try { data = parseSignature(content); } catch (error) { return [...errors, `YAML no válido: ${error.message}.`]; }
  errors.push(...checkSignature(data));
  if (data.github && data.github.toLowerCase() !== author.toLowerCase()) errors.push(`El campo «github» (${data.github}) debe ser tu usuario (${author}).`);
  return errors;
}

// CLI used by .github/workflows/firma.yml. Reads the PR only through the API: no code from the PR is executed.
async function main() {
  const { GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, PR_AUTHOR, GITHUB_OUTPUT } = process.env;
  const api = async (path, accept = 'application/vnd.github+json') => {
    const response = await fetch(path.startsWith('https:') ? path : `https://api.github.com/repos/${GITHUB_REPOSITORY}${path}`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: accept, 'X-GitHub-Api-Version': '2022-11-28' },
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${path}`);
    return accept.endsWith('raw') ? response.text() : response.json();
  };
  const files = await api(`/pulls/${PR_NUMBER}/files?per_page=100`);
  const existing = ((await api('/contents/signatures?ref=main')) ?? [])
    .filter((entry) => entry.type === 'file' && entry.name.endsWith('.yml')).map((entry) => entry.name.slice(0, -4));
  const content = files.length === 1 && files[0].status === 'added' ? await api(files[0].contents_url, 'application/vnd.github.raw') ?? '' : '';
  const errors = validateSignaturePR({ files, author: PR_AUTHOR, content, existing });
  const { appendFile } = await import('node:fs/promises');
  const report = errors.length ? errors.map((error) => `- ${error}`).join('\n') : '';
  if (GITHUB_OUTPUT) await appendFile(GITHUB_OUTPUT, `errors<<EOF_ERRORS\n${report}\nEOF_ERRORS\n`);
  if (errors.length) {
    console.error(`Firma no válida:\n${report}`);
    process.exitCode = 1;
  } else console.log(`Firma válida de ${PR_AUTHOR}.`);
}

if (process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) await main();
