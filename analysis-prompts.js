/* Code-analysis extraction prompts — loaded before script.js */
(function (global) {
  'use strict';

  const SHARED_SECTIONS = [
    '=== TASK ===',
    'Analyze the image acquisition application in my local codebase (or the code/summary I provide). Produce a detailed TECHNICAL SUMMARY suitable as input for migrating or reimplementing the acquisition pipeline with the Basler Framegrabber SDK or Basler pylon SDK.',
    'Do NOT rewrite or output source code. Do NOT omit sections because information is missing — write "not found" or "unknown" and list what you searched.',
    '',
    '=== MANDATORY SECTIONS (use these exact headings) ===',
    '',
    '## 1. Application purpose',
    '- What does the program do with acquired images?',
    '- Batch/offline, continuous, triggered, or event-driven?',
    '',
    '## 2. Hardware & camera interfaces',
    '- Number of cameras and how they connect (CXP, Camera Link, GigE, USB3, etc.)',
    '- Link topology, frame grabber / interface card model if identifiable',
    '- Area scan vs line scan vs TDI; mixed setups',
    '',
    '## 3. SDK, libraries & build',
    '- Primary SDK(s) used today (e.g. Euresys, pylon, vendor SDK, GenTL producer)',
    '- Key headers, libraries, runtime dependencies',
    '- Language, OS, build system if visible',
    '',
    '## 4. Initialization & discovery sequence',
    '- Order of: library init → board/device open → camera open → applet/stream setup',
    '- Board index, serial, or discovery logic',
    '',
    '## 5. Camera & device configuration',
    '- Pixel format, width, height (per camera if different)',
    '- Exposure, gain, ROI, binning, or other GenICam-style parameters set in code',
    '- Trigger mode: free-run, software, external frame/line, encoder, enable',
    '',
    '## 6. Acquisition path — buffers, DMA & streams',
    '- Buffer count and allocation strategy (host memory, pinned, queue depth)',
    '- DMA channels vs cameras (1:1 or many:1 mapping)',
    '- Stream grabber / grab API pattern if not frame grabber DMA',
    '- Buffer size vs sensor size if they differ',
    '',
    '## 7. Triggers, timing & synchronization',
    '- Trigger sources, wiring assumptions, start/stop of acquisition',
    '- Multi-camera sync if applicable',
    '- Line-scan: encoder, line trigger, image height from lines',
    '',
    '## 8. Events, callbacks & threading model',
    '- Polling vs callbacks vs separate acquisition thread',
    '- Which thread accesses image data',
    '',
    '## 9. Acquisition loop & data flow',
    '- Wait/grab pattern, timeout values, partial frame handling',
    '- What happens to each buffer after a frame (process, copy, display, requeue)',
    '',
    '## 10. Error handling & timeouts',
    '- How errors are detected, logged, and propagated',
    '- Timeout behavior and recovery',
    '',
    '## 11. Shutdown & resource cleanup',
    '- Stop order: acquisition → buffers → handles → library',
    '- RAII, finally blocks, or manual release patterns',
    '',
    '## 12. Applet / FPGA / custom processing (if any)',
    '- Loaded applet or .hap, port mapping, on-board processing',
    '',
    '## 13. Gaps, assumptions & migration notes',
    '- Anything you could not determine from the code',
    '- Values that must be confirmed on real hardware',
    '',
    '=== OUTPUT RULES ===',
    '- Be exhaustive: prefer concrete numbers (dimensions, buffer counts, timeouts in ms) over vague descriptions.',
    '- Name concepts and SDK families even if exact API symbols are unclear.',
    '- Keep the summary self-contained so someone who has never seen the code understands the acquisition design.',
    '- Do not include confidential file paths, credentials, serial numbers, or license keys in the summary.',
    '- End with a short "Suggested Basler migration focus" bullet list (Framegrabber SDK vs pylon SDK, DMA count, applet type hints).'
  ].join('\n');

  const LLM_PREFIX = {
    chatgpt: [
      '=== ROLE ===',
      'You are a senior industrial vision engineer specializing in frame grabbers, CoaXPress, Camera Link, GenICam, DMA buffering, and SDK migration.',
      '',
      '=== REASONING MODE ===',
      'MANDATORY: Use the deepest reasoning mode available (extended thinking, deep research, or o-series reasoning). Do not answer quickly.',
      'Before writing the summary, mentally trace the full init → acquire → shutdown path for every camera and DMA/stream path.',
      'If deep reasoning is unavailable, state that at the top and mark uncertain details explicitly.',
      '',
      SHARED_SECTIONS,
      '',
      '=== FORMAT ===',
      'Use the mandatory markdown headings exactly. Under each heading use bullet lists. After section 13, add "Suggested Basler migration focus".'
    ].join('\n'),

    claude: [
      '=== ROLE ===',
      'You are a senior industrial vision engineer specializing in frame grabbers, CoaXPress, Camera Link, GenICam, DMA buffering, and SDK migration.',
      '',
      '=== REASONING MODE ===',
      'MANDATORY: Use extended thinking for the entire analysis. Map every acquisition resource (boards, cameras, buffers, threads) before writing.',
      'If extended thinking is unavailable, warn at the top that lifecycle order and buffer mapping may be incomplete.',
      '',
      SHARED_SECTIONS,
      '',
      '=== FORMAT ===',
      'Use clear markdown. Separate analysis from any optional follow-up questions. Call out uncertainties inline with "(uncertain)".'
    ].join('\n'),

    copilot: [
      '=== ROLE ===',
      'You are a senior industrial vision engineer specializing in frame grabbers, CoaXPress, Camera Link, GenICam, DMA buffering, and SDK migration.',
      '',
      '=== WORKFLOW ===',
      'MANDATORY: Do not treat this as inline autocomplete. First scan the repository structure, then open acquisition-related source files (main, grab loop, buffer setup, trigger config, shutdown).',
      'Produce a structured checklist of files/symbols reviewed, then the technical summary.',
      'If you cannot access the codebase, ask for the relevant files or a pasted summary — do not invent behavior.',
      '',
      SHARED_SECTIONS,
      '',
      '=== FORMAT ===',
      'Start with "Files reviewed:" then the mandatory sections. Use bullet lists with concrete values.'
    ].join('\n'),

    cursor: [
      '=== ROLE ===',
      'You are a senior industrial vision engineer specializing in frame grabbers, CoaXPress, Camera Link, GenICam, DMA buffering, and SDK migration.',
      '',
      '=== AGENT MODE ===',
      'MANDATORY: Run in agent mode. Search the workspace for acquisition entry points, buffer allocation, DMA/stream setup, trigger configuration, event handlers, and cleanup/shutdown code.',
      'Read relevant headers and implementation files before summarizing. Reference file paths you inspected (omit secrets).',
      'Do not emit refactored code — only the technical summary described below.',
      '',
      SHARED_SECTIONS,
      '',
      '=== FORMAT ===',
      'Begin with "Workspace scope:" listing key files examined. Then complete all mandatory sections with bullet lists.'
    ].join('\n'),

    generic: [
      '=== ROLE ===',
      'You are a senior industrial vision engineer specializing in frame grabbers, CoaXPress, Camera Link, GenICam, DMA buffering, and SDK migration.',
      '',
      '=== APPROACH ===',
      'Use the most thorough analysis available. Trace initialization, every active acquisition path, and shutdown before writing.',
      '',
      SHARED_SECTIONS,
      '',
      '=== FORMAT ===',
      'Numbered sections matching the mandatory headings. Bullet lists with concrete values.'
    ].join('\n')
  };

  function getAnalysisPrompt(llmKey) {
    const key = LLM_PREFIX[llmKey] ? llmKey : 'generic';
    return LLM_PREFIX[key];
  }

  global.ANALYSIS_PROMPTS = {
    getAnalysisPrompt: getAnalysisPrompt,
    llmKeys: ['cursor', 'chatgpt', 'claude', 'copilot', 'generic']
  };
})(typeof window !== 'undefined' ? window : globalThis);
