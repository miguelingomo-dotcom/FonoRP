// FonoRP · cotejo con el Cambridge Dictionary (pronunciación UK)
// Descarga la página de cada palabra de words.json y del banco, extrae las transcripciones UK
// y las compara con las nuestras usando el corrector de la app (fono.js).
//
// Uso:  node tools/cambridge.mjs
// Salida: banco/cambridge.json (datos del cotejo).
// Si existe banco/revision-cambridge.json (cambios revisados: palabra → { despues: { ipa, variants } }),
// se aplica a banco/candidatas.json antes de cotejar, y cada palabra del banco queda con un campo `cambridge`:
//   coincide         → Cambridge da la forma principal o una variante
//   corregida        → forma principal cambiada tras la revisión
//   ampliada         → se añadieron las formas de Cambridge como variantes (vocal débil, otra variante RP)
//   revisada-a-mano  → Cambridge no tiene entrada propia (comparativos, irregulares) y se comprobó a mano
//   distinta         → pendiente de revisar
// Las páginas se guardan en tools/.cache/cambridge para no repetir descargas.

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const Fono = require(join(ROOT, 'fono.js'));
const CACHE = join(ROOT, 'tools', '.cache', 'cambridge');
mkdirSync(CACHE, { recursive: true });

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function page(word) {
  const file = join(CACHE, word + '.html');
  if (existsSync(file)) return readFileSync(file, 'utf8');
  for (let tries = 0; tries < 3; tries++) {
    try {
      const res = await fetch(`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status >= 500) { await sleep(5000 * (tries + 1)); continue; }
      // Cambridge redirige a la portada (o a la búsqueda) cuando no tiene la palabra.
      const text = res.ok && /\/dictionary\/english\/[^/?#]+/.test(res.url) ? await res.text() : '';
      writeFileSync(file, text);
      await sleep(300);
      return text;
    } catch { await sleep(3000); }
  }
  return '';
}

// "ˈprez.<span class="sp dsp">ə</span>nt" → ["ˈprez.ənt", "ˈprez.nt"]: el sonido volado es opcional.
// <sup>r</sup> y la r volada son la r de enlace: no suena ante consonante ni en la cita.
function expandIPA(html) {
  html = html.replace(/<sup>[^<]*<\/sup>/g, '').replace(/<span class="sp dsp">r<\/span>/g, '');
  const m = html.match(/<span class="sp dsp">([^<]*)<\/span>/);
  if (!m) return [html.replace(/<[^>]+>/g, '')];
  return [...expandIPA(html.replace(m[0], m[1])), ...expandIPA(html.replace(m[0], ''))];
}

function toApp(raw) {
  let s = raw.replace(/[\/·\s]/g, '').replace(/g/g, 'ɡ');
  const p = Fono.parse(s);
  if (p.unknown.length || !p.phonemes.length) return null;
  // Cambridge no marca el acento en los monosílabos (ni en iron /aɪən/, choir /kwaɪə/); la app lo exige.
  if (!p.primary.length && !p.secondary.length) s = 'ˈ' + s;
  return s;
}

// Solo las pronunciaciones UK de la entrada de la palabra (no las de la caja "pointer" ni las de modismos).
function ukForms(html, word) {
  const full = [], reduced = [];
  const blocks = html.split(/<div class="pos-header dpos-h">/).slice(1);
  for (const b of blocks) {
    const hw = (b.match(/<span class="hw dhw">([^<]*)<\/span>/) || [])[1];
    if (!hw || hw.toLowerCase() !== word.toLowerCase()) continue;
    const uk = b.match(/<span class="uk dpron-i ?">([\s\S]*?)<\/span>\s*(?:<span class="us dpron-i|<\/div>)/);
    if (!uk) continue;
    for (const m of uk[1].matchAll(/<span class="ipa dipa[^"]*">((?:[^<]|<span class="sp dsp">[^<]*<\/span>|<sup>[^<]*<\/sup>)*)<\/span>/g)) {
      const forms = expandIPA(m[1]).map(toApp).filter(Boolean);
      if (forms[0]) full.push(forms[0]);
      reduced.push(...forms.slice(1));
    }
  }
  return { full, reduced };
}

const canon = f => f.replace(/l̩/g, 'əl');
const matches = (f, forms) => forms.length > 0 &&
  Fono.check(canon(f), { ipa: canon(forms[0]), variants: forms.slice(1).map(canon) }).correct;
const dedupe = forms => forms.reduce((acc, f) => (acc.some(g => matches(f, [g])) ? acc : [...acc, f]), []);

// ---------- Palabras ----------
const W = JSON.parse(readFileSync(join(ROOT, 'words.json'), 'utf8'));
const BANCO = join(ROOT, 'banco', 'candidatas.json');
const banco = JSON.parse(readFileSync(BANCO, 'utf8'));
const REV = join(ROOT, 'banco', 'revision-cambridge.json');
const revision = existsSync(REV) ? JSON.parse(readFileSync(REV, 'utf8')) : {};
for (const e of banco.words) {
  const r = revision[e.word];
  if (r) { e.ipa = r.despues.ipa; e.variants = r.despues.variants; }
}
// Sin entrada propia en Cambridge (o con un lema engañoso, como says → say) y comprobadas a mano.
const REVISADAS_A_MANO = new Set(['says', 'heard', 'meant', 'forgot', 'forgotten', 'longer', 'larger', 'largest', 'smaller',
  'younger', 'stronger', 'faster', 'earlier', 'sharing', 'wondering', 'featuring', 'entering']);
const items = [
  ...W.words.map(e => ({ src: 'app', e })),
  ...banco.words.map(e => ({ src: 'banco', e })),
];
const unique = [...new Set(items.map(i => i.e.word.toLowerCase()))];

let done = 0;
const queue = unique.filter(w => !existsSync(join(CACHE, w + '.html')));
async function worker() {
  while (queue.length) {
    const w = queue.shift();
    await page(w);
    if (++done % 50 === 0) console.log(`  descargadas ${done}/${unique.length}`);
    await sleep(400);
  }
}
console.log(`Cambridge: ${unique.length} palabras, ${queue.length} por descargar`);
await Promise.all([worker(), worker(), worker()]);

// ---------- Formas flexionadas ----------
// Cambridge manda years, called o talking a la entrada del lema. Se construye la forma con el lema
// y la terminación que pide la regla (s/z/ɪz, t/d/ɪd, ɪŋ), sin aceptar otra alternativa.
const SIBILANT = new Set(['s', 'z', 'ʃ', 'ʒ', 'tʃ', 'dʒ']);
const VOICELESS = new Set(['p', 't', 'k', 'f', 'θ', 's', 'ʃ', 'tʃ']);
function lemmas(w) {
  // Primero el lema más largo: rates → rate antes que rat, died → die antes que di.
  const c = [];
  if (/ies$/.test(w)) c.push([w.slice(0, -3) + 'y', 's']);
  if (/s$/.test(w) && !/ss$/.test(w)) c.push([w.slice(0, -1), 's']);
  if (/es$/.test(w)) c.push([w.slice(0, -2), 's']);
  if (/ied$/.test(w)) c.push([w.slice(0, -3) + 'y', 'ed']);
  if (/ed$/.test(w)) c.push([w.slice(0, -1), 'ed'], [w.slice(0, -2), 'ed']);
  if (/(.)\1ed$/.test(w)) c.push([w.slice(0, -3), 'ed']);
  if (/ing$/.test(w)) c.push([w.slice(0, -3) + 'e', 'ing'], [w.slice(0, -3), 'ing']);
  if (/(.)\1ing$/.test(w)) c.push([w.slice(0, -4), 'ing']);
  return c.filter(([l]) => l.length >= 3);
}
function inflect(form, suf) {
  const last = Fono.parse(form).phonemes.at(-1);
  if (suf === 's') return form + (SIBILANT.has(last) ? 'ɪz' : VOICELESS.has(last) ? 's' : 'z');
  if (suf === 'ed') return form + (last === 't' || last === 'd' ? 'ɪd' : VOICELESS.has(last) ? 't' : 'd');
  // -ing tras /ə/ o /ɪə/... final: vuelve la r (offering /ˈɒf.ər.ɪŋ/); no se intenta adivinar.
  return Fono.VOWELS.has(last) && /[əɪʊe]ə$|ə$|ɜː$|ɑː$|ɔː$/.test(form) ? null : form + 'ɪŋ';
}
async function viaLemma(word) {
  for (const [lemma, suf] of lemmas(word.toLowerCase())) {
    const html = await page(lemma);
    const { full, reduced } = ukForms(html, lemma);
    if (!full.length) continue;
    const f = full.map(x => inflect(x, suf)).filter(Boolean);
    if (f.length) return { full: f, reduced: reduced.map(x => inflect(x, suf)).filter(Boolean), lemma };
  }
  return null;
}

const out = [];
for (const { src, e } of items) {
  const html = await page(e.word.toLowerCase());
  let { full, reduced } = ukForms(html, e.word), lemma = null;
  if (!full.length) {
    const v = await viaLemma(e.word);
    if (v) ({ full, reduced, lemma } = v);
  }
  const cam = dedupe(full), camAll = dedupe([...full, ...reduced]);
  let estado;
  if (!camAll.length) estado = 'sin-entrada';
  else if (matches(e.ipa, camAll)) estado = 'ok';
  else if ((e.variants || []).some(v => matches(v, camAll))) estado = 'ok-variante';  // Cambridge da como buena una variante, no la principal
  else estado = 'distinta';
  // Variantes nuestras que Cambridge no recoge (no tienen por qué estar mal: el EPD es más amplio).
  const sinApoyo = (e.variants || []).filter(v => !matches(v, camAll));
  out.push({ src, word: e.word, ipa: e.ipa, variants: e.variants || [], estadoBanco: e.estado, lemma, cambridge: cam, cambridgeReducidas: dedupe(reduced).filter(f => !cam.some(g => matches(f, [g]))), estado, sinApoyo });
}
writeFileSync(join(ROOT, 'banco', 'cambridge.json'), JSON.stringify(out, null, 1));

const result = new Map(out.filter(o => o.src === 'banco').map(o => [o.word, o.estado]));
for (const e of banco.words) {
  const r = revision[e.word], st = result.get(e.word);
  e.cambridge = r ? (r.tipo === 'manual' ? 'corregida' : 'ampliada')
    : st === 'ok' || st === 'ok-variante' ? 'coincide'
    : REVISADAS_A_MANO.has(e.word) ? 'revisada-a-mano' : 'distinta';
}
const tally = {};
for (const e of banco.words) tally[e.cambridge] = (tally[e.cambridge] || 0) + 1;
banco.meta.cambridge = tally;
banco.meta.fuentes = [...new Set([...banco.meta.fuentes, 'Cotejo con el Cambridge Dictionary (UK), tools/cambridge.mjs'])];
// Mismo formato compacto que tools/importar.mjs
writeFileSync(BANCO, JSON.stringify(banco, null, 1).replace(/\n {2,}/g, ' ').replace(/\n \}/g, ' }').replace(/\[\n /g, '[').replace(/\n\]/g, ']'));
console.log('banco · cambridge:', Object.entries(tally).map(([k, n]) => `${k}: ${n}`).join(' · '));

const count = (src, k) => out.filter(o => o.src === src && o.estado === k).length;
for (const src of ['app', 'banco']) {
  console.log(src, ['ok', 'ok-variante', 'distinta', 'sin-entrada'].map(k => `${k}: ${count(src, k)}`).join(' · '));
}
