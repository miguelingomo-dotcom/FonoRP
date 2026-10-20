// FonoRP · importador del banco ampliado
// Contrasta dos fuentes libres de transcripción RP y deja cada palabra marcada por su estado:
//   coinciden   → Britfone y Wiktionary (RP) dan la misma transcripción según el corrector de la app
//   discrepan   → no coinciden: hay que mirarla en el EPD/LPD (lista en banco/discrepancias.md)
//   una-fuente  → Wiktionary no tiene forma RP: solo Britfone
//
// Uso:  node tools/importar.mjs [número de palabras = 500]
// Fuentes (tools/fuentes/): Britfone 3.0.1 (MIT, Jose Llarena) y frecuencia.txt (orden de wordfreq).
// Wiktionary se consulta palabra a palabra en kaikki.org (extracción de wiktextract, contenido CC BY-SA);
// las respuestas se guardan en tools/.cache para no repetir descargas.

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const Fono = require(join(ROOT, 'fono.js'));
const LIMIT = Number(process.argv[2] || 500);
const CACHE = join(ROOT, 'tools', '.cache', 'kaikki');
mkdirSync(CACHE, { recursive: true });
mkdirSync(join(ROOT, 'banco'), { recursive: true });

// Palabras gramaticales: su pronunciación RP depende de la forma débil; no entran.
const STOP = new Set(`gonna wanna gotta okay kinda sorta yeah yep nope lol the and for that you with this was are have not but from your all can has more will one about they their what which when out there been would also some were other into than them only its any how our these most could over such just very where much then those should may did because does each while through same own both under being here many again after before must might shall upon whom whose why yet onto unto per via among against without within though although whether either neither nor every another anything something nothing everything everyone someone anyone who whoever wherever whenever however herself himself itself myself ourselves themselves yourself mine ours yours hers theirs his her him she he it we us me my i is am be do done had having get got let use used`.split(/\s+/));

// ---------- Normalización a la convención de la app (EPD) ----------
const unknownFree = s => s && Fono.parse(s).unknown.length === 0 && Fono.parse(s).phonemes.length > 0;

function normBritfone(raw) {
  // "ə b ˈaʊ t" → "əbˈaʊt". Britfone separa los símbolos con espacios: se trabaja por símbolo
  // para no fundir ɪ + ə en el diptongo ɪə al juntarlos.
  const toks = raw.trim().split(/\s+/).map(t => t
    .replace(/ɛə/g, 'eə').replace(/ɛ/g, 'e').replace(/ɐ/g, 'ʌ').replace(/ɹ/g, 'r').replace(/g/g, 'ɡ'));
  const isVowelTok = t => Fono.VOWELS.has(t.replace(/^[ˈˌ]/, ''));
  return toks.map((t, i) => {
    // Convención EPD: ɪ y ʊ átonas ante vocal son /i/ y /u/ (video ˈvɪd.i.əʊ, situation ˌsɪtʃ.uˈeɪ.ʃən).
    if ((t === 'ɪ' || t === 'ʊ') && toks[i + 1] && isVowelTok(toks[i + 1])) return t === 'ɪ' ? 'i' : 'u';
    // Britfone escribe como diptongo la secuencia átona /i.ə/, /u.ə/ (experience ɪkˈspɪə.ri.əns, January ˈdʒæn.ju.ər.i).
    if (t === 'ɪə' && i > 0) return 'iə';
    if (t === 'ʊə' && i > 0) return 'uə';
    return t;
  }).join('');
}

// Convención del EPD para vocales débiles, aplicada a las dos fuentes:
// /ɪə/ y /ʊə/ átonas son las secuencias /i.ə/ y /u.ə/; /ɪ/ final átona es la /i/ de happy.
function epdWeak(form) {
  const p = Fono.parse(form);
  const stressed = new Set([...p.primary, ...p.secondary]);
  const last = p.phonemes.length - 1;
  return p.tokens.map(t => {
    if (t.pIdx === undefined || stressed.has(t.pIdx)) return t.t;
    if (t.t === 'ɪə') return 'iə';
    if (t.t === 'ʊə') return 'uə';
    if (t.t === 'ɪ' && t.pIdx === last) return 'i';
    return t.t;
  }).join('');
}

function expandParens(s) {
  // "ʃ(ə)n" → ["ʃən", "ʃn"]; como mucho tres paréntesis
  const m = s.match(/\(([^()]*)\)/);
  if (!m) return [s];
  return [...expandParens(s.replace(m[0], m[1])), ...expandParens(s.replace(m[0], ''))];
}

function normWikt(raw) {
  let s = raw.replace(/^\/|\/$/g, '').replace(/͡/g, '').replace(/\u032F/g, '')
    .replace(/a(?![ɪʊː])/g, 'æ')                       // notación británica moderna: /a/ = /æ/ del EPD
    .replace(/n̩/g, 'ən').replace(/m̩/g, 'əm')
    .replace(/ɛə|ɛː/g, 'eə').replace(/ɛ/g, 'e').replace(/ɐ/g, 'ʌ').replace(/ɹ/g, 'r').replace(/ɫ/g, 'l').replace(/g/g, 'ɡ')
    .replace(/‿/g, '').replace(/əə/g, 'ə');
  if ((s.match(/\(/g) || []).length > 3) return [];
  // Wiktionary no marca el acento en los monosílabos; la convención de la app sí lo exige.
  return expandParens(s).filter(unknownFree).map(f => {
    const p = Fono.parse(f);
    const nuclei = p.phonemes.filter(x => Fono.VOWELS.has(x)).length;
    // Sin ninguna marca: Wiktionary la omite en palabras que trata como de una sílaba (hour /aʊə/).
    return epdWeak(!p.primary.length && (nuclei === 1 || !p.secondary.length) ? 'ˈ' + f : f);
  });
}

// Britfone marca el acento sobre la vocal; para mostrarlo, se adelanta al inicio de la sílaba (ataque máximo).
const ONSETS = new Set(['pl', 'pr', 'bl', 'br', 'tr', 'dr', 'kl', 'kr', 'ɡl', 'ɡr', 'fl', 'fr', 'θr', 'ʃr', 'sp', 'st', 'sk', 'sm', 'sn', 'sl', 'sw',
  'spl', 'spr', 'str', 'skr', 'skw', 'tw', 'dw', 'kw', 'ɡw', 'pj', 'bj', 'tj', 'dj', 'kj', 'fj', 'vj', 'mj', 'nj', 'hj', 'lj', 'sj', 'spj', 'stj', 'skj']);
function moveStressToOnset(form) {
  const toks = Fono.tokenize(form).map(t => t.t);
  const out = [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t !== 'ˈ' && t !== 'ˌ') { out.push(t); continue; }
    // retroceder sobre consonantes que forman un ataque válido
    let k = out.length;
    while (k > 0 && Fono.CONSONANTS.has(out[k - 1])) {
      const cand = out.slice(k - 1).filter(x => Fono.CONSONANTS.has(x)).join('');
      const single = out.length - (k - 1) === 1;
      if (!single && !ONSETS.has(cand)) break;
      // no dejar la sílaba anterior sin vocal (p. ej. al principio de palabra)
      k--;
    }
    out.splice(k, 0, t);
  }
  return out.join('');
}

// ---------- Fuentes ----------
const britfone = new Map();
for (const line of readFileSync(join(ROOT, 'tools/fuentes/britfone.main.3.0.1.csv'), 'utf8').split('\n')) {
  const m = line.match(/^([^,(]+)(?:\(\d\))?,\s*(.+)$/);
  if (!m) continue;
  const w = m[1].toLowerCase();
  const f = normBritfone(m[2]);
  if (!unknownFree(f)) continue;
  if (!britfone.has(w)) britfone.set(w, []);
  britfone.get(w).push(epdWeak(f));
}

async function wiktionaryRP(word) {
  const variantsOfWord = [word, word[0].toUpperCase() + word.slice(1)];
  for (const w of variantsOfWord) {
    // Prefijo por grafía: macOS no distingue mayúsculas en los nombres de archivo.
    const file = join(CACHE, (w === word ? 'lc_' : 'uc_') + w + '.jsonl');
    let text;
    if (existsSync(file)) text = readFileSync(file, 'utf8');
    else {
      const url = `https://kaikki.org/dictionary/English/meaning/${encodeURIComponent(w[0])}/${encodeURIComponent(w.slice(0, 2))}/${encodeURIComponent(w)}.jsonl`;
      const res = await fetch(url);
      text = res.ok ? await res.text() : '';
      writeFileSync(file, text);
    }
    if (!text.trim()) continue;
    // forms: etiquetadas como RP/UK → cuentan para coincidir y para discrepar.
    // loose: sin etiqueta de acento (pueden ser americanas) → solo cuentan si coinciden.
    const forms = new Set(), loose = new Set();
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      let e; try { e = JSON.parse(line); } catch { continue; }
      if (e.lang && e.lang !== 'English') continue;
      for (const s of e.sounds || []) {
        if (!s.ipa || !s.ipa.startsWith('/') || /[ɚɝɾ]/.test(s.ipa)) continue;   // solo formas fonémicas, sin rasgos americanos
        const tags = s.tags || [];
        if ((tags.includes('Received-Pronunciation') || tags.includes('UK')) && !tags.includes('dialectal')) { for (const f of normWikt(s.ipa)) forms.add(f); }
        else if (!tags.length) { for (const f of normWikt(s.ipa)) loose.add(f); }
      }
    }
    return { display: w, forms: [...forms], loose: [...loose] };
  }
  return { display: word, forms: [], loose: [] };
}

// ---------- Patrones (heurísticos, a partir de la grafía y la transcripción) ----------
const WEAK_UNSTRESSED = (p) => p.phonemes.some((s, i) => s === 'ə' && !p.primary.includes(i) && !p.secondary.includes(i));
function patternsFor(word, ipa) {
  const p = Fono.parse(ipa);
  const ph = p.phonemes;
  const nuclei = ph.filter(s => Fono.VOWELS.has(s)).length;
  const has = s => ph.includes(s);
  const pats = [];
  if (nuclei >= 2 && WEAK_UNSTRESSED(p)) pats.push('schwa');
  if (nuclei >= 3) pats.push('acento');
  const silent = (/^kn/.test(word) && ph[0] !== 'k') || (/^wr/.test(word) && ph[0] !== 'w') || (/mb$/.test(word) && ph.at(-1) !== 'b') ||
    (/bt/.test(word) && !has('b')) || (/^ps/.test(word) && ph[0] !== 'p') || (/stle/.test(word) && !/st/.test(ph.join(''))) ||
    (/^h/.test(word) && ph[0] !== 'h') || (/gn/.test(word) && !has('ɡ')) || (/alk|olk/.test(word) && !has('l'));
  if (silent) pats.push('mudas');
  if (/o/.test(word) && has('ʌ')) pats.push('o_ʌ');
  if (/ch/.test(word) && has('k') && !has('tʃ')) pats.push('ch_k');
  if (['θ', 'ð', 'ʃ', 'ʒ'].some(has)) pats.push('fricativas');
  if (/r(?![aeiouy])/.test(word) && !/r(?![aeiouy])/.test(word.replace(/r$/, ''))) pats.push('r_rp');
  else if (/r(?![aeiouy])/.test(word)) pats.push('r_rp');
  // -ed / -s flexivas: solo si la forma base existe (based → base, cats → cat, watches → watch)
  const baseExists = b => b.length >= 3 && britfone.has(b);
  const isEd = /[^e]ed$/.test(word) && ['t', 'd'].includes(ph.at(-1)) && (baseExists(word.slice(0, -2)) || baseExists(word.slice(0, -1)));
  const isS = /s$/.test(word) && ['s', 'z'].includes(ph.at(-1)) && (baseExists(word.slice(0, -1)) || (/es$/.test(word) && baseExists(word.slice(0, -2))));
  if (isEd || isS) pats.push('terminaciones');
  const spellingTraps = [[/ea/, 'e'], [/ou/, 'ʌ'], [/oo/, 'ʌ'], [/^wo/, 'ɪ'], [/a/, 'ɒ'], [/ei|ey/, 'iː'], [/ie/, 'e']];
  if (spellingTraps.some(([re, s]) => re.test(word) && has(s))) pats.push('grafia');
  return [...new Set(pats)];
}

function levelFor(ipa, pats) {
  const n = Fono.parse(ipa).phonemes.filter(s => Fono.VOWELS.has(s)).length;
  let lvl = n <= 2 ? 1 : n === 3 ? 2 : 3;
  if (pats.length >= 3 && lvl < 3) lvl++;
  return lvl;
}

// Grafías americanas: fuera cuando Britfone tiene la británica (color → colour, center → centre).
// Las de -ize se quedan: también son grafía británica válida.
function britishSpelling(w) {
  const subs = [[/or(s?)$/, 'our$1'], [/er(s?)$/, 're$1'], [/yze(s|d)?$/, 'yse$1'], [/eled$/, 'elled'], [/eling$/, 'elling'],
    [/ense$/, 'ence'], [/og(s?)$/, 'ogue$1'], [/ior(s?)$/, 'iour$1'], [/ors?$/, m => m.replace('or', 'our')]];
  for (const [re, rep] of subs) { const b = w.replace(re, rep); if (b !== w && britfone.has(b)) return b; }
  return null;
}
// Nombre propio: la página con mayúscula de Wiktionary es un nombre (pos "name") y la de minúscula
// apenas tiene acepciones (manchester, alexander), así que bill, turkey o china se quedan.
function senseCount(word) {
  const file = join(CACHE, 'lc_' + word + '.jsonl');
  if (!existsSync(file)) return 0;
  return readFileSync(file, 'utf8').split('\n').reduce((n, l) => {
    if (!l.trim()) return n;
    try { const e = JSON.parse(l); return e.lang === 'English' ? n + (e.senses || []).length : n; } catch { return n; }
  }, 0);
}
async function isProperNoun(word) {
  const W = word[0].toUpperCase() + word.slice(1);
  const file = join(CACHE, 'uc_' + W + '.jsonl');
  let text;
  if (existsSync(file)) text = readFileSync(file, 'utf8');
  else {
    const res = await fetch(`https://kaikki.org/dictionary/English/meaning/${encodeURIComponent(W[0])}/${encodeURIComponent(W.slice(0, 2))}/${encodeURIComponent(W)}.jsonl`);
    text = res.ok ? await res.text() : '';
    writeFileSync(file, text);
  }
  const isName = text.split('\n').some(l => { if (!l.trim()) return false; try { const e = JSON.parse(l); return e.lang === 'English' && e.pos === 'name'; } catch { return false; } });
  return isName && senseCount(word) <= 2;
}

// ---------- Construcción ----------
const sameForm = (a, b) => Fono.check(a, { ipa: b, variants: [] }).correct;
// /əl/ y /l̩/ finales son variantes que el EPD admite por igual: se comparan como iguales.
const canon = f => f.replace(/l̩/g, 'əl');
const agrees = (f, forms) => Fono.check(canon(f), { ipa: canon(forms[0]), variants: forms.slice(1).map(canon) }).correct;
const NAMES_OK = new Set('january february march april may june july august september october november december monday tuesday wednesday thursday friday saturday sunday'.split(' '));
const dedupe = forms => forms.reduce((acc, f) => (acc.some(g => sameForm(f, g)) ? acc : [...acc, f]), []);

const freq = readFileSync(join(ROOT, 'tools/fuentes/frecuencia.txt'), 'utf8').split('\n').filter(Boolean);

// Descarga previa en paralelo (6 a la vez) de las candidatas que aún no están en caché.
{
  const pending = freq.filter(w => !STOP.has(w) && britfone.has(w)).slice(0, Math.ceil(LIMIT * 1.35))
    .filter(w => !existsSync(join(CACHE, 'lc_' + w + '.jsonl')));
  let i = 0, done = 0;
  const worker = async () => { while (i < pending.length) { const w = pending[i++]; try { await wiktionaryRP(w); } catch { /* se reintenta en la pasada principal */ } if (++done % 200 === 0) console.log(`  descargadas ${done}/${pending.length}…`); } };
  if (pending.length) { console.log(`Descargando ${pending.length} entradas de Wiktionary…`); await Promise.all(Array.from({ length: 6 }, worker)); }
}
const out = [], conflicts = [];
let checked = 0;
for (const word of freq) {
  if (out.length >= LIMIT) break;
  if (STOP.has(word) || !britfone.has(word) || britishSpelling(word)) continue;
  const bForms = britfone.get(word);
  const pats = patternsFor(word, bForms[0]);
  if (!pats.length) continue;
  checked++;
  const wk = await wiktionaryRP(word);
  // Nombres propios (sin página en minúscula): fuera, salvo meses y días.
  if (wk.display !== word && !NAMES_OK.has(word)) continue;
  if (!NAMES_OK.has(word) && await isProperNoun(word)) continue;
  const agreeing = [...wk.forms, ...wk.loose].filter(f => agrees(f, bForms));
  let estado, ipa, variants;
  if (agreeing.length) {
    estado = 'coinciden';
    ipa = agreeing[0];
    variants = dedupe([...agreeing.slice(1), ...bForms.map(moveStressToOnset)]).filter(f => !sameForm(f, ipa));
  } else if (wk.forms.length) {
    estado = 'discrepan';
    ipa = moveStressToOnset(bForms[0]);
    variants = dedupe(bForms.slice(1).map(moveStressToOnset)).filter(f => !sameForm(f, ipa));
    conflicts.push({ word: wk.display, britfone: bForms.map(moveStressToOnset), wiktionary: wk.forms });
  } else {
    estado = 'una-fuente';
    ipa = moveStressToOnset(bForms[0]);
    variants = dedupe(bForms.slice(1).map(moveStressToOnset)).filter(f => !sameForm(f, ipa));
  }
  const finalPats = patternsFor(word, ipa);
  out.push({ word: wk.display, ipa, variants, patterns: finalPats.length ? finalPats : pats, level: levelFor(ipa, pats), note: '', estado,
    fuentes: { britfone: bForms, wiktionary: agreeing.length ? agreeing : wk.forms } });
  if (out.length % 50 === 0) console.log(`  ${out.length} palabras…`);
}

const base = JSON.parse(readFileSync(join(ROOT, 'words.json'), 'utf8'));
const count = e => out.filter(w => w.estado === e).length;
writeFileSync(join(ROOT, 'banco', 'candidatas.json'), JSON.stringify({
  meta: {
    descripcion: 'Banco ampliado SIN REVISAR. Generado por tools/importar.mjs contrastando Britfone y Wiktionary (RP).',
    fuentes: ['Britfone 3.0.1 (MIT, Jose Llarena)', 'Wiktionary vía kaikki.org/wiktextract (CC BY-SA)', 'Orden por frecuencia: wordfreq'],
    generado: new Date().toISOString().slice(0, 10),
    estados: { coinciden: count('coinciden'), discrepan: count('discrepan'), 'una-fuente': count('una-fuente') },
  },
  patterns: base.patterns,
  words: out,
}, null, 1).replace(/\n {2,}/g, ' ').replace(/\n \}/g, ' }').replace(/\[\n /g, '[').replace(/\n\]/g, ']'));

const cam = w => `[EPD/Cambridge](https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(w.toLowerCase())})`;
writeFileSync(join(ROOT, 'banco', 'discrepancias.md'),
  `# Palabras para revisar\n\n${conflicts.length} palabras en las que Britfone y Wiktionary (RP) no coinciden según el corrector de FonoRP. ` +
  `Comprueba cada una en el EPD o el LPD y apunta la buena.\n\n| Palabra | Britfone | Wiktionary RP | Comprobar |\n|---|---|---|---|\n` +
  conflicts.map(c => `| ${c.word} | ${c.britfone.map(f => `/${f}/`).join(' · ')} | ${c.wiktionary.map(f => `/${f}/`).join(' · ')} | ${cam(c.word)} |`).join('\n') + '\n' +
  `\n## Solo Britfone\n\n${count('una-fuente')} palabras sin forma RP en Wiktionary. Están en el banco ampliado como «sin revisar»; ` +
  `son las de más riesgo después de las discrepancias.\n\n| Palabra | Britfone | Comprobar |\n|---|---|---|\n` +
  out.filter(w => w.estado === 'una-fuente').map(w => `| ${w.word} | /${w.ipa}/${w.variants.length ? ' · ' + w.variants.map(v => `/${v}/`).join(' · ') : ''} | ${cam(w.word)} |`).join('\n') + '\n');

console.log(`\nRevisadas ${checked} candidatas → ${out.length} palabras: ${count('coinciden')} coinciden, ${count('discrepan')} discrepan, ${count('una-fuente')} solo Britfone.`);
