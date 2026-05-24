---
name: nature-citation
description: >-
  Add strict Nature/CNS citations to manuscript text by splitting long passages into citable
  segments, searching only accepted flagship and subjournal titles from Nature Portfolio, the
  AAAS Science family, and Cell Press, filtering by publication time range, and exporting one
  reference-manager-ready output by default. Use this skill whenever the user asks to input text and
  automatically get references, add citations to a paragraph/manuscript, find Nature-series or CNS
  support for statements, create text-to-reference correspondence, "分段引用", "自动给出引用",
  "Nature系列引用", "CNS及子刊", "支撑文献", "补引用", "找引用", or export EndNote/RIS/ENW/Zotero RDF.
---

# Nature Citation

Use this skill to turn manuscript text into a defensible citation export:

- segmented text with citation candidates for each segment
- a reference-manager import file in `.enw`, `.ris`, or Zotero `.rdf`
- conservative evidence notes explaining whether each candidate truly supports the segment

## Chinese-user operating mode

When the user writes in Chinese, asks for "Nature系列", "CNS及其子刊", "支撑文献",
"补引用", "自动给出引用", "分段引用", "导出EndNote", "RIS", "Zotero", "RDF", or provides Chinese manuscript text:

- Accept the text in Chinese, but search using English concept queries unless the topic is explicitly
  China-specific or Chinese-language scholarship.
- Return segment notes and evidence notes in Chinese by default.
- Preserve the exact source segment and translate it into one or more English search claims.
- Flag overclaiming clearly in Chinese: `强支撑`, `部分支撑`, `背景支撑`, `不建议引用为该句支撑`.
- Do not present a paper as supporting the claim merely because its title is related.

## Default scope

Interpret journal scope from the user's wording, but keep the filter strict:

- `Nature系列`: search Nature Portfolio first. Include `Nature`, `Nature [field]`,
  `Nature Communications`, `Communications [field]`, `Scientific Reports`, and `npj` journals.
- `CNS`: search `Cell`, `Nature`, and `Science` plus their major sister journals.
- `CNS及其子刊` or `CNS/sister journals`: search only accepted flagship and subjournal titles in
  Nature Portfolio, the AAAS Science family, and Cell Press.
- `只要Nature/Science/Cell正刊`: restrict to the flagship journals `Nature`, `Science`, and `Cell`.

Do not treat merely related journals as in-scope. A title is valid only if it is in the accepted
publisher-family whitelist or clearly matches the official naming pattern for that family. If the
user needs an exhaustive or submission-critical boundary, verify current official journal pages
before finalizing because journal portfolios change.

## Source hierarchy

Use sources in this order:

1. Structured bibliographic metadata: Crossref, PubMed/NCBI E-utilities, DOI metadata.
2. Publisher pages: `nature.com`, `science.org`, `cell.com`, and official journal pages.
3. Full text or abstract pages, if accessible.
4. Secondary databases such as Google Scholar, Semantic Scholar, Web of Science, or Scopus only
   as discovery aids, not as the sole support basis.

Prefer structured APIs for metadata and publisher pages for claim verification. If metadata and
publisher page disagree, preserve the DOI and journal-page facts and flag the discrepancy.

## Long-article strategy

When the input text is longer than roughly 3000 characters (about 10+ segments), the skill must
switch to a batched workflow to avoid timeout, context overflow, or incomplete results:

1. **Auto-detect length.** Count segments after segmentation. If there are more than 10 segments,
   switch to batch mode automatically.
2. **Split by section.** Prefer splitting at paragraph double-line breaks or explicit section
   headings (`Introduction`, `Results`, etc.) so each batch is a coherent unit, not arbitrary
   sentence groups.
3. **Process each batch independently.** Run the Python script once per batch using
   `--batch-size` or `--max-segments`, OR split the text externally and call the script once per
   chunk. Each call writes its own intermediate export file.
4. **Merge results at the end.** After all batches finish, combine the intermediate files into one
   final export. Deduplicate by DOI.
5. **Minimize inline analysis.** For long articles, do NOT write detailed support-grade notes for
   every single segment inline. Instead:
   - Write a compact summary table (segment ID → best candidate → support grade).
   - Point the user to the HTML visualization for full browsing.
   - Only elaborate on segments where no candidate was found or evidence is contradictory.

### Quick guide for Claude

| Segments | Strategy |
|---|---|
| 1–10 | Run once, full inline analysis is fine. |
| 11–25 | Use `--batch-size 10`. Write a compact summary table. Point to HTML. |
| 26+ | Split by section. Run script per section with `--batch-size 10`. Compact summary + HTML only. |

## Workflow

### 1. Segment the text

For each input text:

- Split long text into citable segments. Prefer paragraph boundaries first, then sentence boundaries.
- Keep each segment focused on one citable idea when possible.
- Preserve original order and stable segment IDs such as `S001`, `S002`, `S003`.
- Skip obvious non-citable connective sentences unless the user asks to cite every sentence.
- For very long text, process in batches but keep a single final mapping table.
- If the input has more than about 10 segments, prefer batch mode.

Default segmentation rules:

- Use blank lines as paragraph boundaries.
- If a paragraph is longer than about 700 characters or contains multiple claims, split into sentences.
- Merge very short fragments into neighboring text unless they contain a distinct claim.
- Keep section headings as labels, not as citable segments.

### 2. Parse each segment

For each citable segment:

- Extract the core claim in one sentence.
- Identify claim type: `mechanism`, `association`, `method`, `clinical`, `epidemiology`,
  `background`, `definition`, or `review-context`.
- Identify entities, intervention/exposure, outcome, population/model, directionality, and boundary.
- Convert the claim into 2-4 English search queries:
  - one precise query with all key terms
  - one synonym query
  - one broader background query
  - one methods or model query if relevant

If the claim is too broad, split it into citable subclaims rather than searching the whole sentence.

### 3. Search candidate papers

Start with `scripts/nature_citation.py` when internet access is available:

```bash
python scripts/nature_citation.py \
  --text "PASTE MANUSCRIPT TEXT HERE" \
  --scope cns \
  --outdir /tmp/nature-citation \
  --format enw \
  --with-artifacts
```

Useful options:

- `--text-file manuscript.txt`: read long text from a file.
- `--claim "CLAIM TEXT"` or `--claim-file claims.txt`: treat each claim as a segment.
- `--doi 10.xxxx/xxxxx` or `--doi-file dois.txt`: export known DOI records after screening.
- `--scope nature`: Nature Portfolio-style journals only.
- `--scope flagship`: Nature, Science, and Cell only.
- `--from-year 2018 --to-year 2026`: constrain publication dates.
- `--rows 40`: raise for broad searches; keep top candidates manageable.
- `--per-segment 3`: number of citation candidates to keep per segment.
- `--batch-size 2`: process long text in smaller batches.
- `--max-segments 12`: cap the number of segments processed in one run.
- `--max-retries 2`: retry transient Crossref failures before skipping a query.
- `--format enw|ris|zotero-rdf`: export format. If omitted and `--output-file` is set, infer from suffix.
- `--mailto you@example.com`: use Crossref's polite pool.
- `--batch-size 10`: process segments in batches of N. Each batch writes an incremental export file.
- `--max-segments 20`: only process the first N segments. Useful for testing or section-by-section workflows.
- `--sleep 0.3`: seconds between Crossref requests. Default is 0.3; raise to 1.0 if rate-limited.

Long-article strategy:

- 1-10 segments: run normally.
- 11-25 segments: use batch mode and keep the HTML browser open for screening.
- 26+ segments: split by section or subsection first, then run each part separately if needed.
- For long texts, prefer the HTML browser for review and selection instead of relying only on inline notes.

When the topic is biomedical or PubMed-indexed, also search PubMed with journal filters and
compare results against Crossref. Use NCBI E-utilities rate limits and include `tool`/`email`
parameters if running repeated searches.

### 4. Evaluate whether each paper supports the segment

Use a conservative support scale:

- `strong support`: the paper directly tests the same relationship/mechanism/method and the result supports the segment.
- `partial support`: the paper supports part of the segment, a related model, or a narrower condition.
- `background support`: the paper supports field context, not the specific claim.
- `contradictory/limiting`: the paper conflicts with or narrows the claim.
- `metadata-only candidate`: title/metadata suggest relevance, but abstract/full text has not been checked.

Never cite a `metadata-only candidate` as support without checking the abstract or publisher page.
If a paper is a review, label it as review/context and avoid using it as primary evidence for an
experimental claim when primary articles are available.

### 5. Export reference-manager file

Default behavior:

- write one reference-manager file
- support publication time filters with `--from-year` and `--to-year`
- for long or ambiguous texts, use `--with-artifacts` so the HTML browser is available

Default file:

- `references.enw`: EndNote tagged export

Optional:

- `references.ris`: if the user requests RIS instead of ENW
- `references.rdf`: if the user requests Zotero RDF
- review artifacts only when explicitly requested

If the user asks to choose the download format, treat `ENW`, `RIS`, and `Zotero RDF` as the
supported options and return only one export file unless they explicitly ask for multiple formats.

Do not invent missing fields. If DOI, pages, volume, or issue are missing, leave them absent rather
than fabricating them.

### 6. Optional review artifacts

Generate review artifacts (HTML/TSV/JSON/report) for long or ambiguous runs. They are the primary
way the user browses, filters, and selects candidates:

- Use `--with-artifacts` when the text is long, the query is broad, or the user needs manual curation.
- Report the HTML visualization path prominently in your final answer when artifacts are enabled.
- Generate TSV/JSON/report alongside the HTML so the user has multiple views.

### 7. Report results

Unless the user asks for a different format, return:

```text
交互式引用浏览器
- [absolute path to citation_visualization.html]  ← 在浏览器中打开此文件，可筛选/选择/下载引用

检索范围
- [Nature Portfolio / Science family / Cell Press / flagship only, plus date limits]

分段引用对应关系
S001: [source segment]
  - [Author, year, title, journal, DOI]
  - 支撑等级: [strong/partial/background/limiting/metadata-only]
  - 插入建议: [e.g. after sentence / after clause]

导出文件
- [absolute path to references.enw / references.ris / references.rdf]

风险和缺口
- [missing full-text check, contradictory evidence, no direct CNS literature, etc.]
```

Put the HTML browser path FIRST in the report, above everything else, so the user can immediately
open and browse candidates. If no suitable CNS/Nature-series paper exists, say so plainly and
suggest the best nearby options from non-CNS literature only if the user wants broader coverage.

If the text is long, mention the batch strategy used, especially when you limited the run with
`--batch-size` or `--max-segments`.

## Search quality rules

- Prefer precision over volume. A useful answer is usually 3-8 candidates, not 50 loosely related papers.
- Use exact phrase searches only for distinctive terms; otherwise use concept terms and synonyms.
- Check journal identity. Many journals contain the word "nature" but are not Nature Portfolio journals.
- Treat citation count as a tie-breaker, not evidence of support.
- Capture retractions, corrections, and expressions of concern when visible in Crossref or publisher metadata.
- Date-sensitive topics require current searching and explicit search date.
- For medical, clinical, or safety claims, search current literature and state that citations do not replace
  clinical guidance or systematic review.

## Related files

| File | Open when |
|---|---|
| [references/search-strategy.md](references/search-strategy.md) | You need help translating a manuscript claim into search queries and support grades |
| [references/journal-scope.md](references/journal-scope.md) | You need the default Nature/CNS journal-family boundary and official source notes |
| [references/ris-endnote.md](references/ris-endnote.md) | You need RIS, EndNote, or Zotero RDF export guidance |
| [scripts/nature_citation.py](scripts/nature_citation.py) | You need to segment text, search Crossref, export ENW/RIS/RDF, and generate HTML |

## Source notes

This skill is based on public bibliographic APIs and official publisher/import documentation:
Crossref REST API and filters, NCBI E-utilities, EndNote RIS import options, Nature Portfolio,
AAAS Science journals, and Cell Press portfolio descriptions. Verify pages at use time when exact
journal coverage or current import behavior matters.
