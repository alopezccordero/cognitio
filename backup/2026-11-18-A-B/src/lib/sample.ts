// Sample room content for the GUI candidates. Authors, venues and titles are
// invented placeholders — real records will come from OpenAlex / Semantic Scholar.

export type Member = {
  id: string
  name: string
  initials: string
  color: string // presence color, used by every candidate
  sprite: string // which mascot pose represents them
  status: 'reading' | 'annotating' | 'voting' | 'idle'
  where?: string
}

export type Paper = {
  id: string
  title: string
  authors: string
  year: number
  venue: string
  citations: number
  summary: string
  cluster: 'data' | 'models' | 'eval' | 'speech'
  annotations: { by: string; text: string }[]
}

export type Gap = {
  id: string
  title: string
  detail: string
  sources: string[] // paper ids
  votes: string[] // member ids
  stated: boolean // true = a paper says it outright, false = inferred by the AI
}

export const room = {
  name: 'Code-switched speech recognition',
  area: 'Automatic speech recognition for Spanish–English code-switching',
  created: 'Nov 12',
  owner: 'ana',
  searched: { source: 'OpenAlex', hits: 214, kept: 18 },
}

export const members: Member[] = [
  { id: 'ana', name: 'Ana Ríos', initials: 'AR', color: '#74DDEA', sprite: 'nib-r2c2', status: 'annotating', where: 'p3' },
  { id: 'marcus', name: 'Marcus Tran', initials: 'MT', color: '#F6C445', sprite: 'tuft-r2c3', status: 'reading', where: 'p1' },
  { id: 'priya', name: 'Priya Shah', initials: 'PS', color: '#EE8FA8', sprite: 'nib-r2c4', status: 'voting', where: 'g2' },
  { id: 'diego', name: 'Diego Luna', initials: 'DL', color: '#9BE38B', sprite: 'tuft-r1c6', status: 'idle' },
  { id: 'you', name: 'You', initials: 'YO', color: '#B7A6FF', sprite: 'nib-r1c0', status: 'reading', where: 'p2' },
]

export const papers: Paper[] = [
  {
    id: 'p1',
    title: 'Switch-point modeling for bilingual end-to-end ASR',
    authors: 'Herrera, Okafor, Lin',
    year: 2024,
    venue: 'Interspeech',
    citations: 87,
    cluster: 'models',
    summary:
      'Adds a language-boundary token to a conformer model so it predicts where speakers switch. Cuts word error at switch points by about a fifth on Miami Bangor.',
    annotations: [
      { by: 'marcus', text: 'Boundary token idea is cheap to try on our data.' },
      { by: 'ana', text: 'They only test intra-sentential switches — see section 5.' },
    ],
  },
  {
    id: 'p2',
    title: 'A survey of code-switching corpora for speech',
    authors: 'Delgado, Varga',
    year: 2023,
    venue: 'Computational Linguistics',
    citations: 212,
    cluster: 'data',
    summary:
      'Catalogs 31 code-switched speech corpora. Spanish–English sets come almost entirely from Miami and Puerto Rico; the authors call out border-region speech as missing.',
    annotations: [{ by: 'priya', text: 'Table 2 is the best map of what exists.' }],
  },
  {
    id: 'p3',
    title: 'Evaluating ASR beyond WER: switch-aware metrics',
    authors: 'Moreau, Banerjee, Sato',
    year: 2024,
    venue: 'ACL',
    citations: 41,
    cluster: 'eval',
    summary:
      'Argues word error rate hides failures at language boundaries and proposes a point-of-interest error rate. Shows two models with equal WER differ 2× at switches.',
    annotations: [
      { by: 'ana', text: 'Use PIER for our eval section.' },
      { by: 'diego', text: 'Their code is on GitHub, MIT license.' },
      { by: 'ana', text: 'No children or elderly speakers in any test set.' },
    ],
  },
  {
    id: 'p4',
    title: 'Small models, mixed languages: on-device bilingual recognition',
    authors: 'Ibarra, Koenig',
    year: 2025,
    venue: 'ICASSP',
    citations: 12,
    cluster: 'models',
    summary:
      'Distills a 600M-parameter model to 95M for phones. Accuracy holds on monolingual speech but drops sharply once utterances switch language.',
    annotations: [],
  },
  {
    id: 'p5',
    title: 'Prosody at the switch: pitch and timing in bilingual speech',
    authors: 'Navarro, Price',
    year: 2022,
    venue: 'Speech Communication',
    citations: 58,
    cluster: 'speech',
    summary:
      'Finds speakers often pause or reset pitch right before switching. A linguistics study — no recognition system uses these cues yet.',
    annotations: [{ by: 'marcus', text: 'Could be a cheap feature for the boundary token.' }],
  },
  {
    id: 'p6',
    title: 'Synthetic code-switched text for language model fusion',
    authors: 'Chen, Abara, Duval',
    year: 2023,
    venue: 'EMNLP',
    citations: 96,
    cluster: 'data',
    summary:
      'Generates mixed-language text with translation and alignment rules, then fuses an LM trained on it. Helps when real transcripts are scarce.',
    annotations: [],
  },
]

export const gaps: Gap[] = [
  {
    id: 'g1',
    title: 'No corpus of border-region Spanish–English speech',
    detail:
      'Every Spanish–English set in the survey comes from Miami or Puerto Rico. Rio Grande Valley and other border varieties are absent.',
    sources: ['p2', 'p6'],
    votes: ['ana', 'priya', 'diego', 'you'],
    stated: true,
  },
  {
    id: 'g2',
    title: 'Small on-device models break at switch points',
    detail:
      'Distilled models keep monolingual accuracy but nobody has tried switch-aware training under 100M parameters.',
    sources: ['p4', 'p1'],
    votes: ['marcus', 'priya'],
    stated: false,
  },
  {
    id: 'g3',
    title: 'Prosodic cues are unused by recognizers',
    detail:
      'Pauses and pitch resets predict switches, but no ASR system in the set feeds them to the model.',
    sources: ['p5', 'p1'],
    votes: ['marcus'],
    stated: false,
  },
  {
    id: 'g4',
    title: 'Children and older speakers are missing from test sets',
    detail: 'All evaluation sets reviewed use adult speakers aged roughly 18–45.',
    sources: ['p3'],
    votes: ['ana', 'you'],
    stated: true,
  },
]

export const chat = [
  { from: 'you', text: 'Find the main papers on code-switched ASR for Spanish and English.' },
  {
    from: 'ai',
    tool: 'search_openalex("code-switching speech recognition Spanish English", since 2020)',
    text: 'I found 214 papers and kept the 18 most cited and most on-topic. Six are pinned to the room so far. They fall into four groups: data, models, evaluation and speech science.',
  },
  { from: 'priya', text: 'Which gaps do the papers state outright?' },
  {
    from: 'ai',
    tool: 'read_records(room.papers, field="limitations")',
    text: 'Two are stated outright: no border-region corpus (Delgado & Varga) and no children or older speakers in test sets (Moreau et al.). Two more I inferred from what nobody tested.',
  },
]

export const byId = <T extends { id: string }>(xs: T[], id: string) => xs.find((x) => x.id === id)!
