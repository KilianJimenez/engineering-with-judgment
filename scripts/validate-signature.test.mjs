import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSignaturePR, parseSignature } from './validate-signature.mjs';

const valid = 'github: octocat\nnombre: Mona Lisa Octocat\nrol: "QA Engineer @ Acme: calidad"\nfecha: 2026-11-25\n';
const pr = (overrides = {}) => ({ files: [{ filename: 'firmas/octocat.yml', status: 'added' }], author: 'octocat', content: valid, existing: ['KilianJimenez'], ...overrides });

test('acepta una firma válida (usuario sin distinguir mayúsculas)', () => {
  assert.deepEqual(validateSignaturePR(pr()), []);
  assert.deepEqual(validateSignaturePR(pr({ author: 'OctoCat' })), []);
  assert.equal(parseSignature(valid).rol, 'QA Engineer @ Acme: calidad');
});

test('solo el campo github es obligatorio', () => {
  assert.deepEqual(validateSignaturePR(pr({ content: 'github: octocat\nnombre:\n' })), []);
  assert.match(validateSignaturePR(pr({ content: 'nombre: Mona\n' })).join(), /obligatorio/);
});

test('rechaza firmas de otro autor', () => {
  assert.match(validateSignaturePR(pr({ author: 'mallory' })).join(), /tu propio usuario/);
  assert.match(validateSignaturePR(pr({ content: valid.replace('github: octocat', 'github: mallory') })).join(), /debe ser tu usuario/);
});

test('rechaza varios ficheros, rutas ajenas y modificar firmas', () => {
  assert.match(validateSignaturePR(pr({ files: [{ filename: 'firmas/octocat.yml', status: 'added' }, { filename: 'README.md', status: 'modified' }] })).join(), /exactamente un fichero/);
  assert.match(validateSignaturePR(pr({ files: [{ filename: 'scripts/octocat.yml', status: 'added' }] })).join(), /firmas\/octocat\.yml/);
  assert.match(validateSignaturePR(pr({ files: [{ filename: 'firmas/octocat.yml', status: 'modified' }] })).join(), /no modificar/);
  assert.match(validateSignaturePR(pr({ existing: ['OCTOCAT'] })).join(), /ya ha firmado/);
});

test('rechaza claves extra, HTML, URLs, fechas y YAML inválidos', () => {
  assert.match(validateSignaturePR(pr({ content: `${valid}web: x\n` })).join(), /Clave no permitida/);
  assert.match(validateSignaturePR(pr({ content: valid.replace('Mona Lisa Octocat', '<b>Mona</b>') })).join(), /HTML ni URLs/);
  assert.match(validateSignaturePR(pr({ content: valid.replace('Mona Lisa Octocat', 'see https://spam.example') })).join(), /HTML ni URLs/);
  assert.match(validateSignaturePR(pr({ content: valid.replace('2026-11-25', '2026-02-30') })).join(), /AAAA-MM-DD/);
  assert.match(validateSignaturePR(pr({ content: valid.replace('Mona Lisa Octocat', 'x'.repeat(81)) })).join(), /80 caracteres/);
  assert.match(validateSignaturePR(pr({ content: '- github: octocat\n' })).join(), /YAML no válido/);
  assert.match(validateSignaturePR(pr({ content: `${valid}github: octocat\n` })).join(), /repetida/);
});
