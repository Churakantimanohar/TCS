#!/usr/bin/env node
/**
 * Robust PDF Ingest Script for TCS NQT Mock
 * ----------------------------------------
 * Extracts MCQ style questions from PDFs into pooled JSON grouped by category.
 * Heuristics attempt to handle:
 *   - Different question number formats: 1)  1.  Q1.  12 -
 *   - Option formats: A) A. (A) [A] a)
 *   - Inline multiple options on one line
 *   - Section heading based category inference
 *   - Fallback keyword heuristics
 *
 * Run:
 *   node scripts/ingest/pdf-ingest.mjs --src ./pdf-source --out public/sample-data/questions.generated.json
 */

import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

// ---------------- CLI ARGS ----------------
const args = process.argv.slice(2);
function getArg(name, def) {
  const eq = args.find(a => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=')[1];
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
  return def;
}
const SRC_DIR = getArg('src', './pdf-source');
const OUT_FILE = getArg('out', 'public/sample-data/questions.generated.json');

if (!fs.existsSync(SRC_DIR)) {
  console.error(`Source directory '${SRC_DIR}' not found.`);
  process.exit(1);
}

// --------------- REGEX HEURISTICS ---------------
const QUESTION_REGEX = /^(?:Q\.?\s*)?(\d{1,3})\s*[).:\-]\s*(.+)$/; // 12) text | 12. text | Q12. text
const OPTION_REGEX = /^(?:\(|\[)?([A-Da-d])(?:\)|\])?\s*[).:\-]?\s*(.+)$/; // (A) text | A) text | a. text

const CATEGORY_HINTS = [
  { key: 'verbal', match: /English|Verbal|Sentence|Synonym|Antonym/i },
  { key: 'reasoning', match: /Reasoning|Logical|Puzzle|Sequence|Analogy|Direction|Seating/i },
  { key: 'numerical', match: /Aptitude|Quant|Numerical|Math|Ratio|Interest|Probability|Percent/i },
  { key: 'advanced_qr', match: /Advanced Quant|Calculus|Integral|Derivative|Matrix|Vector|Bayes|Limit|Combinatorics/i },
  { key: 'advanced_coding', match: /Coding|Program|Algorithm|Function|Code|Pseudo/i },
];

function inferCategory(stem, explicit) {
  if (explicit) return explicit; // section heading override
  const lower = stem.toLowerCase();
  if (/sort|array|string|linked list|tree|graph|stack|queue/.test(lower)) return 'advanced_coding';
  if (/integral|derivative|matrix|vector|limit|probability|bayes|gcd|lcm/.test(lower)) return 'advanced_qr';
  if (/percent|ratio|interest|simple|compound|profit|loss|average|sum|difference|speed|distance|time/.test(lower)) return 'numerical';
  if (/series|pattern|direction|seating|analogy|venn|puzzle|relation|syllogism|blood relation/.test(lower)) return 'reasoning';
  return 'verbal';
}

function splitInlineOptions(line) {
  // split on two+ spaces before A/B/C tokens to reduce false positives
  const candidates = line.split(/(?=\b[\(\[]?[A-Da-d][).:\-]?\s+)/g).map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const c of candidates) {
    const m = c.match(OPTION_REGEX);
    if (m) out.push(m[2].trim());
  }
  return out.length >= 2 ? out : [];
}

const generated = {
  verbal: [],
  reasoning: [],
  numerical: [],
  advanced_qr: [],
  advanced_coding: [],
};
const seen = new Set();
let autoCounter = 0;

async function processPdf(filePath) {
  const buf = fs.readFileSync(filePath);
  const data = await pdfParse(buf);
  const lines = data.text
    .replace(/\u00A0/g, ' ')
    .split(/\r?\n/)
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  let current = null;
  let currentSectionCat = null;
  for (const raw of lines) {
    // Heading detection
    for (const h of CATEGORY_HINTS) {
      if (h.match.test(raw)) {
        currentSectionCat = h.key;
        break;
      }
    }

    const qMatch = raw.match(QUESTION_REGEX);
    if (qMatch) {
      if (current && current.options.length >= 2) finalize(current);
      current = { stem: qMatch[2].trim(), options: [], sectionCat: currentSectionCat };
      continue;
    }
    if (!current) continue;

    const optMatch = raw.match(OPTION_REGEX);
    if (optMatch) {
      current.options.push(optMatch[2].trim());
      continue;
    }
    const inline = splitInlineOptions(raw);
    if (inline.length) {
      current.options.push(...inline);
      continue;
    }
    // Long multi-line stems: append if no options yet
    if (current.options.length === 0 && raw.length < 400) {
      current.stem += ' ' + raw;
    }
  }
  if (current && current.options.length >= 2) finalize(current);
}

function finalize(q) {
  const normStem = q.stem.replace(/\s+/g, ' ').trim();
  if (!normStem) return;
  const key = normStem.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  const cat = inferCategory(normStem, q.sectionCat);
  generated[cat].push({
    id: `gen_${cat}_${++autoCounter}`,
    question: normStem,
    options: q.options.slice(0, 4),
  });
}

async function main() {
  const files = fs.readdirSync(SRC_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  if (!files.length) console.warn('No PDF files in', SRC_DIR);
  for (const f of files) {
    const full = path.join(SRC_DIR, f);
    console.log('Processing', full);
    try { await processPdf(full); } catch (e) { console.error('Failed', f, e.message); }
  }
  const outPath = path.resolve(OUT_FILE);
  fs.writeFileSync(outPath, JSON.stringify(generated, null, 2));
  console.log('\nGenerated question pools written to', outPath);
  console.log('Counts per category:', Object.fromEntries(Object.entries(generated).map(([k,v]) => [k, v.length])));
  const total = Object.values(generated).reduce((a,b)=>a+b.length,0);
  if (total === 0) {
    console.log('\nAll zero: heuristics failed to match. Try these tweaks:');
    console.log('- Open one PDF, copy some question lines, and adjust QUESTION_REGEX.');
    console.log('- Sometimes numbers are followed by multiple spaces or unusual punctuation.');
    console.log('- Enable debug by adding console.log lines inside the loop.');
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
