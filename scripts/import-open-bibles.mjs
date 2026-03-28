import fs from "node:fs/promises";
import path from "node:path";

const COMMIT =
  "cf5da281ba9f92508e6cf8d950e031f2acb82335";
const REPO_RAW_BASE =
  "https://raw.githubusercontent.com/seven1m/open-bibles";
const README_URL = `${REPO_RAW_BASE}/${COMMIT}/README.md`;

const ROOT_DIR = process.cwd();
const BIBLES_DIR = path.join(ROOT_DIR, "bibles");
const SOURCE_DIR = path.join(BIBLES_DIR, "source");
const JSON_DIR = path.join(BIBLES_DIR, "json");
const TRANSLATIONS_PATH = path.join(BIBLES_DIR, "translations.json");

const BOOK_IDS = [
  "GEN",
  "EXO",
  "LEV",
  "NUM",
  "DEU",
  "JOS",
  "JDG",
  "RUT",
  "1SA",
  "2SA",
  "1KI",
  "2KI",
  "1CH",
  "2CH",
  "EZR",
  "NEH",
  "EST",
  "JOB",
  "PSA",
  "PRO",
  "ECC",
  "SNG",
  "ISA",
  "JER",
  "LAM",
  "EZK",
  "DAN",
  "HOS",
  "JOL",
  "AMO",
  "OBA",
  "JON",
  "MIC",
  "NAM",
  "HAB",
  "ZEP",
  "HAG",
  "ZEC",
  "MAL",
  "MAT",
  "MRK",
  "LUK",
  "JHN",
  "ACT",
  "ROM",
  "1CO",
  "2CO",
  "GAL",
  "EPH",
  "PHP",
  "COL",
  "1TH",
  "2TH",
  "1TI",
  "2TI",
  "TIT",
  "PHM",
  "HEB",
  "JAS",
  "1PE",
  "2PE",
  "1JN",
  "2JN",
  "3JN",
  "JUD",
  "REV",
];

const OSIS_TO_BOOK = {
  Gen: "GEN",
  Exod: "EXO",
  Lev: "LEV",
  Num: "NUM",
  Deut: "DEU",
  Josh: "JOS",
  Judg: "JDG",
  Ruth: "RUT",
  "1Sam": "1SA",
  "2Sam": "2SA",
  "1Kgs": "1KI",
  "2Kgs": "2KI",
  "1Chr": "1CH",
  "2Chr": "2CH",
  Ezra: "EZR",
  Neh: "NEH",
  Esth: "EST",
  Job: "JOB",
  Ps: "PSA",
  Prov: "PRO",
  Eccl: "ECC",
  Song: "SNG",
  Isa: "ISA",
  Jer: "JER",
  Lam: "LAM",
  Ezek: "EZK",
  Dan: "DAN",
  Hos: "HOS",
  Joel: "JOL",
  Amos: "AMO",
  Obad: "OBA",
  Jonah: "JON",
  Mic: "MIC",
  Nah: "NAM",
  Hab: "HAB",
  Zeph: "ZEP",
  Hag: "HAG",
  Zech: "ZEC",
  Mal: "MAL",
  Matt: "MAT",
  Mark: "MRK",
  Luke: "LUK",
  John: "JHN",
  Acts: "ACT",
  Rom: "ROM",
  "1Cor": "1CO",
  "2Cor": "2CO",
  Gal: "GAL",
  Eph: "EPH",
  Phil: "PHP",
  Col: "COL",
  "1Thess": "1TH",
  "2Thess": "2TH",
  "1Tim": "1TI",
  "2Tim": "2TI",
  Titus: "TIT",
  Phlm: "PHM",
  Heb: "HEB",
  Jas: "JAS",
  "1Pet": "1PE",
  "2Pet": "2PE",
  "1John": "1JN",
  "2John": "2JN",
  "3John": "3JN",
  Jude: "JUD",
  Rev: "REV",
};

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function ensureChapter(bookData, chapter) {
  if (!bookData.chapters[chapter]) {
    bookData.chapters[chapter] = [];
  }
  return bookData.chapters[chapter];
}

function ensureBook(books, bookId) {
  if (!books[bookId]) {
    books[bookId] = { chapters: [] };
  }
  return books[bookId];
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function stripTags(text) {
  return text.replace(/<[^>]+>/g, "");
}

function parseUsfx(xml) {
  const books = {};
  const bookRegex = /<book\b[^>]*id="([^"]+)"[^>]*>/g;
  const bookMatches = [...xml.matchAll(bookRegex)];
  for (let i = 0; i < bookMatches.length; i += 1) {
    const bookId = bookMatches[i][1].toUpperCase();
    const start = bookMatches[i].index + bookMatches[i][0].length;
    const end =
      i + 1 < bookMatches.length ? bookMatches[i + 1].index : xml.length;
    const content = xml.slice(start, end);
    const bookData = ensureBook(books, bookId);

    const chapterRegex = /<c\b[^>]*id="(\d+)"[^>]*\/>/g;
    const chapterMatches = [...content.matchAll(chapterRegex)];
    for (let i = 0; i < chapterMatches.length; i += 1) {
      const chapter = Number(chapterMatches[i][1]);
      const start = chapterMatches[i].index + chapterMatches[i][0].length;
      const end =
        i + 1 < chapterMatches.length
          ? chapterMatches[i + 1].index
          : content.length;
      const chapterContent = content.slice(start, end);
      const chapterData = ensureChapter(bookData, chapter);

      const verseRegex = /<v\b[^>]*id="(\d+)"[^>]*\/>/g;
      const verseMatches = [...chapterContent.matchAll(verseRegex)];
      for (let v = 0; v < verseMatches.length; v += 1) {
        const verse = Number(verseMatches[v][1]);
        const vStart = verseMatches[v].index + verseMatches[v][0].length;
        const vEnd =
          v + 1 < verseMatches.length
            ? verseMatches[v + 1].index
            : chapterContent.length;
        const raw = chapterContent.slice(vStart, vEnd);
        const text = normalizeWhitespace(decodeEntities(stripTags(raw)));
        if (text) {
          chapterData[verse] = text;
        }
      }
    }
  }
  return books;
}

function parseZefania(xml) {
  const books = {};
  const bookRegex =
    /<BIBLEBOOK[^>]*bnumber="(\d+)"[^>]*>([\s\S]*?)<\/BIBLEBOOK>/g;
  let bookMatch;
  while ((bookMatch = bookRegex.exec(xml))) {
    const index = Number(bookMatch[1]);
    const bookId = BOOK_IDS[index - 1];
    if (!bookId) continue;
    const bookData = ensureBook(books, bookId);
    const bookContent = bookMatch[2];

    const chapterRegex =
      /<CHAPTER[^>]*cnumber="(\d+)"[^>]*>([\s\S]*?)<\/CHAPTER>/g;
    let chapterMatch;
    while ((chapterMatch = chapterRegex.exec(bookContent))) {
      const chapter = Number(chapterMatch[1]);
      const chapterData = ensureChapter(bookData, chapter);
      const chapterContent = chapterMatch[2];
      const verseRegex =
        /<VERS[^>]*vnumber="(\d+)"[^>]*>([\s\S]*?)<\/VERS>/g;
      let verseMatch;
      while ((verseMatch = verseRegex.exec(chapterContent))) {
        const verse = Number(verseMatch[1]);
        const raw = verseMatch[2];
        const text = normalizeWhitespace(decodeEntities(stripTags(raw)));
        if (text) {
          chapterData[verse] = text;
        }
      }
    }
  }
  return books;
}

function parseOsis(xml) {
  const books = {};
  const verseRegex = /<verse\b[^>]*>/g;
  const matches = [...xml.matchAll(verseRegex)];
  for (let i = 0; i < matches.length; i += 1) {
    const tag = matches[i][0];
    if (tag.includes('eID="')) {
      continue;
    }
    const osisIdMatch = tag.match(/osisID="([^"]+)"/);
    if (!osisIdMatch) continue;
    const osisId = osisIdMatch[1];
    const [osisBook, chapterStr, verseStr] = osisId.split(".");
    const bookId = OSIS_TO_BOOK[osisBook];
    const chapter = Number(chapterStr || 0);
    const verse = Number(verseStr || 0);
    if (!bookId || !chapter || !verse) continue;

    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : xml.length;
    const raw = xml.slice(start, end);
    const text = normalizeWhitespace(decodeEntities(stripTags(raw)));
    if (!text) continue;
    const bookData = ensureBook(books, bookId);
    const chapterData = ensureChapter(bookData, chapter);
    chapterData[verse] = text;
  }
  return books;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

function parseTranslationTable(readme) {
  const lines = readme.split("\n");
  const translations = [];
  for (const line of lines) {
    if (!line.includes("eng-")) continue;
    const cleaned = line.trim().replace(/^\|/, "").replace(/\|$/, "").trim();
    if (!cleaned.startsWith("eng-")) continue;
    const parts = cleaned.split("|").map((part) => part.trim());
    const [filename, language, format, abbrev, version] = parts;
    if (!filename || !language) continue;
    translations.push({
      filename,
      language,
      format,
      abbrev,
      version,
    });
  }
  return translations;
}

function deriveId(entry) {
  if (entry.abbrev) {
    return entry.abbrev.toLowerCase();
  }
  return entry.filename.replace(/\..*$/, "").replace(/^eng-/, "");
}

async function main() {
  await fs.mkdir(SOURCE_DIR, { recursive: true });
  await fs.mkdir(JSON_DIR, { recursive: true });

  const readme = await fetchText(README_URL);
  const english = parseTranslationTable(readme);

  const translationIndex = [];

  for (const entry of english) {
    const translationId = deriveId(entry);
    const rawUrl = `${REPO_RAW_BASE}/${COMMIT}/${entry.filename}`;
    const xml = await fetchText(rawUrl);
    const sourcePath = path.join(SOURCE_DIR, entry.filename);
    await fs.writeFile(sourcePath, xml, "utf8");

    let books = {};
    if (entry.filename.endsWith(".usfx.xml")) {
      books = parseUsfx(xml);
    } else if (entry.filename.endsWith(".osis.xml")) {
      books = parseOsis(xml);
    } else if (entry.filename.endsWith(".zefania.xml")) {
      books = parseZefania(xml);
    } else {
      console.warn(`Unknown format for ${entry.filename}`);
      continue;
    }

    const payload = {
      translation: translationId,
      name: entry.version,
      language: entry.language,
      books,
    };

    await fs.writeFile(
      path.join(JSON_DIR, `${translationId}.json`),
      JSON.stringify(payload),
      "utf8",
    );

    translationIndex.push({
      id: translationId,
      label: `${translationId.toUpperCase()} - ${entry.version}`,
      name: entry.version,
      language: entry.language,
      source: entry.filename,
      format: entry.format,
    });
  }

  await fs.writeFile(
    TRANSLATIONS_PATH,
    JSON.stringify(translationIndex, null, 2),
    "utf8",
  );

  console.log(`Imported ${translationIndex.length} translations.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
