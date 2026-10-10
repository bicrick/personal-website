/** Exact numbers from the published study. Demo token counts for the mini-repo are illustrative. */

export const HEADLINE = {
  naivePass: 63,
  combinedPass: 100,
  naiveCost: 0.051,
  combinedCost: 0.0016,
  costRatioLabel: '1/32',
};

export const LAYOUT = [
  { label: 'full repo (naive)', pass: 69, note: 'single-shot' },
  { label: 'only files needed', pass: 68, note: 'oracle / single-shot' },
  { label: 'skeleton + agent', pass: 92, note: 'agent loop' },
  { label: 'agent + grep', pass: 93, note: 'agent loop' },
];

export const LADDER = [
  { id: 'L0', label: 'L0 file tree', pass: 45, short: 'tree' },
  { id: 'L1', label: 'L1 +imports', pass: 61, short: 'imports' },
  { id: 'L2', label: 'L2 +signatures', pass: 57, short: 'signatures' },
  { id: 'L3', label: 'L3 +docstrings', pass: 59, short: 'docstrings' },
  { id: 'full', label: 'full code', pass: 69, short: 'full' },
];

export const LAYOUT_MODES = [
  { id: 'full', label: 'full repo', pass: 69, tokensNote: 'everything in prompt' },
  { id: 'touched', label: 'touched files', pass: 68, tokensNote: 'oracle files only' },
  { id: 'skeleton', label: 'skeleton', pass: 57, tokensNote: 'L2 signatures' },
  { id: 'skel+tools', label: 'skeleton + retrieval', pass: 92, tokensNote: 'L2 + agent loop' },
  { id: 'agentic', label: 'agentic search', pass: 93, tokensNote: 'explore on demand' },
];

export const TOOLS = {
  grep: { pass: 93, cost: 0.0085, calls: 39.2 },
  structured: { pass: 97, cost: 0.0016, calls: 9.2 },
  costFactor: '5.2x',
  callFactor: '4.3x',
};

export const VALIDATION_ERROR = {
  lines: 468,
  files: 19,
  grep: { wins: '0/3', calls: 451, tokens: 122762, turns: 25 },
  structured: { wins: '3/3', calls: 8, tokens: 9785 },
};

export const COMPACTION = [
  { id: 'none', label: 'none', pass: 93, cost: null, cache: 85 },
  { id: 'sum50', label: 'summarize @50%', pass: 79, cost: 0.0397, cache: 10 },
  { id: 'sum90', label: 'summarize @90%', pass: 88, cost: null, cache: null },
  { id: 'drop', label: 'drop old tool outputs', pass: 93, cost: 0.0143, cache: null },
];

export const CACHE = {
  summarize50: 10,
  noCompaction: 85,
};

export const HARD_TIER = {
  naive: 28,
  structuredLoop: 100,
};

export const SCOREBOARD = [
  { label: 'Combined harness', pass: 100, cost: 0.0017, highlight: true },
  { label: 'OpenCode', pass: 94, cost: 0.0043 },
  { label: 'mini-swe-agent', pass: 94, cost: 0.0031 },
  { label: 'Claude Code', pass: 91, cost: 0.0048 },
  { label: 'Naive full repo', pass: 64, cost: 0.0653 },
  { label: 'Aider (headless)', pass: 18, cost: 0.16 },
];

export const FINAL_RUNS = 125;

export const SKILL = {
  withSkill: 93,
  noSkill: 93,
  costWith: 0.008,
  costWithout: 0.0085,
  agentsMd: 91,
  steps: [
    'Find all references to the symbol',
    'Change each definition and call site',
    'Run the tests',
    'Search again for leftovers',
    'Finish only when the grader is clean',
  ],
};

/** Simplified mini-repo for demos (marshmallow-shaped ValidationError rename). */
export const MINI_REPO = {
  task: 'Rename ValidationError → SchemaError',
  label: 'simplified marshmallow-shaped snippet',
  files: [
    {
      path: 'marshmallow/exceptions.py',
      role: 'def',
      touched: true,
      imports: [],
      signature: 'class ValidationError(Exception):',
      docstring: '"""Raised when validation fails."""',
      body: `class ValidationError(Exception):
    """Raised when validation fails."""
    def __init__(self, message, field_name=None):
        self.messages = message
        self.field_name = field_name
        super().__init__(message)`,
    },
    {
      path: 'marshmallow/fields.py',
      role: 'raise',
      touched: true,
      imports: ['from .exceptions import ValidationError'],
      signature: 'def _validate(self, value):',
      docstring: '"""Validate a single field value."""',
      body: `from .exceptions import ValidationError

def _validate(self, value):
    """Validate a single field value."""
    if value is None and self.required:
        raise ValidationError("required")
    return value`,
    },
    {
      path: 'marshmallow/schema.py',
      role: 'catch',
      touched: true,
      imports: ['from .exceptions import ValidationError'],
      signature: 'def load(self, data):',
      docstring: '"""Deserialize and validate input data."""',
      body: `from .exceptions import ValidationError

def load(self, data):
    """Deserialize and validate input data."""
    try:
        return self._do_load(data)
    except ValidationError as err:
        raise err`,
    },
    {
      path: 'marshmallow/validate.py',
      role: 'ref',
      touched: true,
      imports: ['from .exceptions import ValidationError'],
      signature: 'def validate_email(value):',
      docstring: '"""Raise ValidationError on bad email."""',
      body: `from .exceptions import ValidationError

def validate_email(value):
    """Raise ValidationError on bad email."""
    if "@" not in value:
        raise ValidationError("invalid email")
    return value`,
    },
    {
      path: 'tests/test_schema.py',
      role: 'test',
      touched: true,
      imports: ['from marshmallow.exceptions import ValidationError'],
      signature: 'def test_required_missing():',
      docstring: null,
      body: `from marshmallow.exceptions import ValidationError

def test_required_missing():
    with pytest.raises(ValidationError):
        UserSchema().load({})`,
    },
    {
      path: 'docs/quickstart.rst',
      role: 'docs',
      touched: false,
      imports: [],
      signature: null,
      docstring: null,
      body: `Catch ValidationError when calling Schema.load.`,
    },
  ],
};

/** Illustrative demo token weights (not study totals). */
export function demoTokensForLevel(levelId) {
  const weights = { L0: 48, L1: 96, L2: 180, L3: 240, full: 620 };
  return weights[levelId] ?? 180;
}

export function demoTokensForLayout(modeId) {
  const weights = { full: 620, touched: 410, skeleton: 180, 'skel+tools': 220, agentic: 95 };
  return weights[modeId] ?? 200;
}
