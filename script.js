/* Basler Framegrabber SDK Prompt Generator — client-side only */

(function () {
  'use strict';

  const LANG_OPTIONS = [
    { value: 'en', flag: '\uD83C\uDDEC\uD83C\uDDE7', key: 'plang_en' },
    { value: 'de', flag: '\uD83C\uDDE9\uD83C\uDDEA', key: 'plang_de' },
    { value: 'ko', flag: '\uD83C\uDDF0\uD83C\uDDF7', key: 'plang_ko' },
    { value: 'zh', flag: '\uD83C\uDDE8\uD83C\uDDF3', key: 'plang_zh' },
    { value: 'ja', flag: '\uD83C\uDDEF\uD83C\uDDF5', key: 'plang_ja' },
    { value: 'vi', flag: '\uD83C\uDDFB\uD83C\uDDF3', key: 'plang_vi' }
  ];
  const DOWNLOAD_BASE = 'basler-framegrabber-sdk-prompt';
  const STORAGE_KEY = 'basler-fg-prompt-v1';
  const NOTICE_STORAGE_KEY = 'basler-fg-dismissed-notices-v1';
  let saveTimer = null;

  const HARDWARE_PRODUCTS = [
    { id: 'imaflex2-dual-100', name: 'imaFlex 2 Dual 100', hwClass: 'programmable', cofSupport: true, standardAcq: ['single_line'] },
    { id: 'imaflex-cxp12-quad', name: 'imaFlex CXP-12 Quad', hwClass: 'programmable' },
    { id: 'imaflex-cxp12-penta', name: 'imaFlex CXP-12 Penta', hwClass: 'programmable' },
    { id: 'imaworx-cxp12-quad', name: 'imaWorx CXP-12 Quad', hwClass: 'acquisition' },
    { id: 'me5-marathon-acx-qp', name: 'microEnable 5 marathon ACX-QP', hwClass: 'acquisition' },
    { id: 'me5-marathon-acl', name: 'microEnable 5 marathon ACL', hwClass: 'acquisition' },
    { id: 'me5-marathon-vcl', name: 'microEnable 5 marathon VCL', hwClass: 'programmable' },
    { id: 'me5-marathon-vclx', name: 'microEnable 5 marathon VCLx', hwClass: 'programmable' },
    { id: 'me5-marathon-vcx-qp', name: 'microEnable 5 marathon VCX-QP', hwClass: 'programmable' },
    { id: 'cxp12-ic-1c', name: 'CXP-12 Interface Card 1C', hwClass: 'interface_card' },
    { id: 'cxp12-ic-2c', name: 'CXP-12 Interface Card 2C', hwClass: 'interface_card' },
    { id: 'cxp12-ic-4c', name: 'CXP-12 Interface Card 4C', hwClass: 'interface_card' }
  ];

  const STANDARD_ACQ_APPLETS = [
    { value: 'unspec', key: 'std_acq_unspec' },
    { value: 'single_area', key: 'std_acq_single_area' },
    { value: 'single_line', key: 'std_acq_single_line' },
    { value: 'dual_area', key: 'std_acq_dual_area' },
    { value: 'dual_line', key: 'std_acq_dual_line' },
    { value: 'quad_area', key: 'std_acq_quad_area' },
    { value: 'quad_line', key: 'std_acq_quad_line' },
    { value: 'visualapplets_hap', key: 'std_acq_visualapplets_hap' }
  ];

  const FRAMEGRABBER_INTERFACES = new Set(['cxp12', 'cxp6', 'camera_link', 'cof']);
  const PYLON_INTERFACES = new Set(['gige', '5gige', '10gige', 'usb3', 'other']);

  const snippetRules = [
    {
      id: 'trigger_timing',
      labelKey: 'topic_trigger_timing',
      categoryKey: 'cat_acquisition_control',
      keywords: ['trigger', 'frame trigger', 'line trigger', 'external trigger', 'encoder', 'shaft', 'enable'],
      snippetKey: 'snippet_trigger_timing'
    },
    {
      id: 'dma_buffering',
      labelKey: 'topic_dma_buffering',
      categoryKey: 'cat_buffering',
      keywords: ['dma', 'buffer', 'ring buffer', 'host memory', 'queue', 'requeue'],
      snippetKey: 'snippet_dma_buffering'
    },
    {
      id: 'line_scan_tdi',
      labelKey: 'topic_line_scan_tdi',
      categoryKey: 'cat_camera_type',
      keywords: ['line scan', 'linescan', 'line-scan', 'tdi', 'encoder', 'line trigger'],
      snippetKey: 'snippet_line_scan_tdi'
    },
    {
      id: 'cxp_link',
      labelKey: 'topic_cxp_link',
      categoryKey: 'cat_interface',
      keywords: ['cxp', 'cxp-12', 'cxp-6', 'coaxpress', 'x1', 'x2', 'x4'],
      snippetKey: 'snippet_cxp_link'
    },
    {
      id: 'pylon_route',
      labelKey: 'topic_pylon_route',
      categoryKey: 'cat_sdk_routing',
      keywords: ['gige', '5gige', '10gige', 'usb', 'usb3', 'network stream', 'packet'],
      snippetKey: 'snippet_pylon_route'
    },
    {
      id: 'events_callbacks',
      labelKey: 'topic_events_callbacks',
      categoryKey: 'cat_acquisition_control',
      keywords: ['callback', 'event', 'interrupt', 'notification'],
      snippetKey: 'snippet_events_callbacks'
    },
    {
      id: 'applet_fpga',
      labelKey: 'topic_applet_fpga',
      categoryKey: 'cat_processing',
      keywords: ['applet', 'visualapplets', 'fpga'],
      snippetKey: 'snippet_applet_fpga'
    },
    {
      id: 'multi_camera',
      labelKey: 'topic_multi_camera',
      categoryKey: 'cat_acquisition_control',
      keywords: ['multi camera', 'multicamera', 'two cameras', '2 cameras', 'dual', 'quad', 'penta', 'synchronized'],
      snippetKey: 'snippet_multi_camera'
    },
    {
      id: 'image_correction',
      labelKey: 'topic_image_correction',
      categoryKey: 'cat_processing',
      keywords: ['flat field', 'ffc', 'gain', 'offset', 'shading'],
      snippetKey: 'snippet_image_correction'
    }
  ];

  const CHECKBOX_OPTIONS = [
    { id: 'opt_error_handling', key: 'cb_error_handling', default: true },
    { id: 'opt_timeout', key: 'cb_timeout', default: true },
    { id: 'opt_cleanup', key: 'cb_cleanup', default: true },
    { id: 'opt_buffer_alloc', key: 'cb_buffer_alloc', default: true },
    { id: 'opt_acq_start_stop', key: 'cb_acq_start_stop', default: true },
    { id: 'opt_separate_params', key: 'cb_separate_params', default: false },
    { id: 'opt_cmake', key: 'cb_cmake', default: false },
    { id: 'opt_assumptions', key: 'cb_assumptions', default: true },
    { id: 'opt_reject_pylon', key: 'cb_reject_pylon', default: true },
    { id: 'opt_doc_check', key: 'cb_doc_check', default: true },
    { id: 'opt_deep_analysis', key: 'cb_deep_analysis', default: true, locked: true },
    { id: 'opt_hallucination', key: 'cb_hallucination', default: true },
    { id: 'opt_multi_sync', key: 'cb_multi_sync', default: false },
    { id: 'opt_image_access', key: 'cb_image_access', default: true },
    { id: 'opt_buffer_requeue', key: 'cb_buffer_requeue', default: true }
  ];

  const EXAMPLE_TEXT =
    'We have an industrial image acquisition setup with two CXP-12 cameras. Each camera is connected with x2 links. Acquisition starts via an external frame trigger. Each camera should use a separate DMA channel. Images are Mono8 with 8192 pixels width and 4096 pixels height. Multiple host buffers should be used. After each received frame, the program should show simple access to the image data. Clean timeout handling, error handling, buffer requeueing, and controlled acquisition shutdown are important.';

  let currentPromptText = '';
  let uiLang = 'en';

  const $ = (id) => document.getElementById(id);

  const UI_STRINGS = {
    en: {
      site_title: 'Basler Framegrabber SDK Prompt Generator',
      site_subtitle: 'Compose high-quality LLM prompts for robust Basler acquisition code',
      privacy_label: 'Data privacy',
      privacy_text: 'All input stays local in your browser. No data is transmitted.',
      confidential_label: 'Confidentiality',
      confidential_text: 'Review the generated prompt before sharing it. Do not include confidential customer data, source code, credentials, serial numbers, license keys, or unpublished project details.',
      guidance_label: 'Guidance',
      guidance_text: 'If you already have existing acquisition code from another SDK or system, first use an AI assistant of your choice to summarize what the code does. Do not paste confidential source code unless allowed. Prefer to paste a technical summary: What is acquired? Which camera and acquisition parameters are configured? How are buffers, triggers, DMA channels, events, timeouts, and cleanup handled?',
      support_label: 'Official support',
      support_text_before: 'This tool helps you compose LLM prompts only. For help with Basler cameras, frame grabbers, SDKs, or your application, you can also contact ',
      support_link_text: 'Basler Support',
      support_text_after: '.',
      inputs_heading: 'Configuration',
      label_app_description: 'Application description',
      placeholder_app_description: 'Example: Two CXP-12 cameras, each connected with x2 links. Acquisition starts via external frame trigger. Mono8 images are transferred into host buffers through separate DMA channels. The program should show timeout handling, image access, buffer requeueing, and clean acquisition shutdown.',
      label_workflow_summary: 'Summary of existing acquisition workflow',
      help_workflow_summary: 'Optional. Describe how your existing acquisition pipeline works today—triggers, buffers, DMA, events, timeouts, and shutdown. Do not paste confidential source code. The Application description above defines the target Basler setup you want to build.',
      placeholder_workflow_summary: 'Example: Existing program opens two cameras, allocates four buffers per channel, waits on frame events with a 5 s timeout, copies image data to a queue, and requeues buffers. Shutdown stops acquisition and releases handles in reverse order.',
      label_standard_acq_applet: 'Standard acquisition applet',
      help_standard_acq: 'Standard acquisition applets ship as .dll files using names such as SingleArea, SingleLine, DualArea, DualLine, QuadArea, QuadLine.',
      help_standard_acq_imaflex2: 'imaFlex 2 Dual 100: only SingleLine is available as a standard .dll today. DualLine requires a VisualApplets .hap design.',
      help_applet_name: 'For VisualApplets .hap applets, enter the applet file name. For standard .dll applets, leave empty unless a specific build name is required.',
      warn_acquisition_hw: 'Acquisition framegrabber selected (e.g. imaWorx, marathon ACL/ACX-QP). Use standard acquisition .dll applets; VisualApplets .hap loading is for programmable framegrabbers only.',
      warn_programmable_hw: 'Programmable framegrabber selected. Supports standard acquisition .dll applets and custom VisualApplets .hap designs.',
      hw_group_programmable: 'Basler programmable framegrabbers',
      hw_group_acquisition: 'Basler acquisition framegrabbers',
      std_acq_unspec: 'Not specified',
      std_acq_single_area: 'SingleArea (one area-scan camera)',
      std_acq_single_line: 'SingleLine (one line-scan camera)',
      std_acq_dual_area: 'DualArea (two area-scan cameras)',
      std_acq_dual_line: 'DualLine (two line-scan cameras)',
      std_acq_quad_area: 'QuadArea (four area-scan cameras)',
      std_acq_quad_line: 'QuadLine (four line-scan cameras)',
      std_acq_visualapplets_hap: 'Custom VisualApplets applet (.hap)',
      applet_standard_dll: 'Standard acquisition applet (.dll)',
      applet_visualapplets_hap: 'VisualApplets applet (.hap)',
      cb_deep_analysis_locked: 'Force deep analysis / extended thinking (always enabled)',
      label_camera_count: 'Number of cameras',
      label_camera_interface: 'Camera interface',
      label_hardware: 'Basler acquisition hardware',
      label_applet_handling: 'Applet handling',
      label_applet_name: 'Applet name',
      label_pixel_type: 'Pixel type',
      label_camera_type: 'Camera type',
      label_image_width: 'Image width',
      label_image_height: 'Image height',
      label_dma_channels: 'Number of DMA channels',
      per_camera_title: 'Per-camera image configuration',
      help_per_camera_dims: 'Camera type, pixel format, and image dimensions may differ per camera.',
      label_cam_pixel_type: 'Pixel type',
      help_per_dma_dims: 'DMA buffer size and pixel format may differ from the sensor image and from other DMA channels. Host buffer count is configured per DMA channel.',
      label_dma_pixel_type: 'Pixel type',
      placeholder_optional_same_as_camera: 'optional — same as camera',
      label_cam_camera_type: 'Camera type',
      label_dma_count: 'Number of DMA channels',
      label_stream_path_count: 'Number of stream grabber paths',
      help_dma_count_separate: 'On programmable framegrabbers the number of DMA channels may differ from the number of cameras.',
      per_dma_title: 'Per-DMA buffer configuration',
      help_per_dma_dims: 'DMA buffer size may differ from the sensor image size. Host buffer count is configured per DMA channel.',
      label_dma_n: 'DMA {n}',
      label_cam_dma_width: 'DMA buffer width',
      label_cam_dma_height: 'DMA buffer height',
      label_host_buffers_per_dma: 'Host buffers',
      placeholder_optional_same_as_image: 'optional — same as image',
      warn_camera_count_mismatch: 'Text suggests {inferred} camera(s), but {selected} is selected.',
      label_camera_n: 'Camera {n}',
      label_cam_image_width: 'Image width',
      label_cam_image_height: 'Image height',
      help_dma_pylon: 'For pylon SDK routing this maps to stream grabber / buffer paths, not explicit Framegrabber SDK DMA unless supported.',
      label_trigger_mode: 'Trigger mode',
      label_programming_language: 'Programming language',
      label_operating_system: 'Operating system',
      label_target_llm: 'Target LLM',
      label_prompt_language: 'Prompt language',
      label_output_style: 'Output style',
      legend_options: 'Prompt options',
      detected_topics_title: 'Detected topics',
      no_topics_text: 'No topics detected yet. Type in the application description or workflow summary.',
      snippets_summary: 'Activated snippets',
      btn_load_example: 'Load example',
      btn_reset: 'Reset all',
      preview_heading: 'Live prompt preview',
      route_framegrabber: 'Basler Framegrabber SDK route',
      route_pylon: 'Basler pylon SDK route',
      btn_copy: 'Copy prompt',
      btn_download: 'Download prompt as .txt',
      btn_refresh: 'Refresh prompt',
      copy_success: 'Prompt copied to clipboard.',
      copy_fail: 'Could not copy. Select the preview text manually.',
      footer_text: 'Client-side only. No tracking. No external APIs.',
      footer_autosave: 'Your configuration is saved locally in this browser.',
      warn_interface_card: 'This selection is an interface card, not a programmable framegrabber. The generated prompt will route the implementation toward Basler pylon SDK instead of Basler Framegrabber SDK.',
      warn_interface_route: 'The selected camera interface is typically handled through the Basler pylon SDK, not the Basler Framegrabber SDK.',
      warn_cof: 'CoaXPress-over-Fiber is only supported on Basler framegrabbers that explicitly list CoF support (e.g. imaFlex 2 Dual 100). Verify hardware compatibility or adjust the selection.',
      warn_applet: 'Applet handling is not applicable for interface cards or pylon SDK routing.',
      hw_group_framegrabber: 'Basler framegrabbers',
      hw_group_interface_card: 'Basler interface cards',
      topic_trigger_timing: 'Trigger / Timing',
      topic_dma_buffering: 'DMA / Buffering',
      topic_line_scan_tdi: 'Line Scan / TDI',
      topic_cxp_link: 'CoaXPress Link Configuration',
      topic_pylon_route: 'pylon SDK Route',
      topic_events_callbacks: 'Events / Callbacks',
      topic_applet_fpga: 'Applet / FPGA Processing',
      topic_multi_camera: 'Multi-Camera Acquisition',
      topic_image_correction: 'Image Correction Parameters',
      cat_acquisition_control: 'Acquisition Control',
      cat_buffering: 'Buffering',
      cat_camera_type: 'Camera Type',
      cat_interface: 'Interface',
      cat_sdk_routing: 'SDK Routing',
      cat_processing: 'Processing',
      iface_cxp12: 'CXP-12', iface_cxp6: 'CXP-6', iface_camera_link: 'Camera Link',
      iface_gige: 'GigE Vision', iface_5gige: '5GigE Vision', iface_10gige: '10GigE Vision',
      iface_usb3: 'USB3 Vision', iface_cof: 'CoaXPress-over-Fiber', iface_other: 'Other',
      applet_loaded: 'Use already loaded applet', applet_load_name: 'Load applet by name',
      applet_name_avail: 'Applet name available', applet_name_na: 'Applet name not available', applet_na: 'Not applicable',
      pixel_mono8: 'Mono8', pixel_mono10: 'Mono10', pixel_mono12: 'Mono12', pixel_mono16: 'Mono16',
      pixel_bayer8: 'Bayer8', pixel_bayer10: 'Bayer10', pixel_bayer12: 'Bayer12', pixel_rgb8: 'RGB8', pixel_other: 'Other',
      cam_area: 'Area scan', cam_line: 'Line scan', cam_tdi: 'TDI', cam_unknown: 'Unknown / not specified',
      trig_free: 'Free run', trig_software: 'Software trigger', trig_frame: 'External frame trigger',
      trig_line: 'External line trigger', trig_encoder: 'Encoder / shaft trigger', trig_enable: 'Enable signal', trig_unspec: 'Not specified',
      lang_cpp17: 'C++17', lang_cpp20: 'C++20', lang_c: 'C', lang_python: 'Python', lang_pseudo: 'Pseudocode',
      os_windows: 'Windows', os_linux: 'Linux', os_unspec: 'Not specified',
      llm_chatgpt: 'ChatGPT', llm_claude: 'Claude', llm_copilot: 'Copilot', llm_cursor: 'Cursor AI', llm_generic: 'Generic LLM',
      plang_en: 'English', plang_de: 'German', plang_ko: 'Korean', plang_zh: 'Simplified Chinese', plang_ja: 'Japanese', plang_vi: 'Vietnamese',
      help_auto_acq_applet: 'On acquisition framegrabbers the standard .dll applet name is derived automatically from camera count and area scan vs. line scan (e.g. 2 area cameras → DualArea).',
      label_auto_applet_readonly: 'Applet name (auto)',
      style_minimal: 'Minimal working example', style_production: 'Robust production-style example',
      style_debug: 'Debug / diagnostic program', style_adaptation: 'Existing workflow adaptation',
      style_architecture: 'Architecture proposal', style_integration: 'Step-by-step integration plan',
      cb_error_handling: 'Force robust error handling', cb_timeout: 'Force timeout handling',
      cb_cleanup: 'Force explicit resource cleanup', cb_buffer_alloc: 'Force explicit buffer allocation',
      cb_acq_start_stop: 'Force explicit acquisition start/stop', cb_separate_params: 'Separate camera parameters from acquisition hardware parameters',
      cb_cmake: 'Include CMakeLists.txt', cb_assumptions: 'Require assumptions and TODOs',
      cb_reject_pylon: 'Reject pylon-only solution when a real framegrabber is selected',
      cb_doc_check: 'Require current documentation check', cb_deep_analysis: 'Force deep analysis / think-deeper mode',
      cb_hallucination: 'Warn about hallucinated SDK calls', cb_multi_sync: 'Include multi-camera synchronization notes',
      cb_image_access: 'Include image data access example', cb_buffer_requeue: 'Include buffer requeueing example',
      snippet_trigger_timing: 'Consider trigger configuration, trigger source, trigger mode, timing, timeout behavior, and clean acquisition start/stop.',
      snippet_dma_buffering: 'Show the buffer and DMA strategy explicitly: buffer count, allocation, queueing, requeueing, timeout, error cases, and cleanup.',
      snippet_line_scan_tdi: 'Consider line-scan or TDI-specific aspects: line trigger, encoder, image height construction from lines, timeout on missing lines, and partial frame behavior.',
      snippet_cxp_link: 'Consider CoaXPress link configuration, camera discovery, link width, data rate, board port mapping, and diagnostics.',
      snippet_pylon_route: 'If the acquisition is based on GigE Vision, 5GigE Vision, 10GigE Vision, or USB3 Vision, route the generated code request toward Basler pylon SDK instead of Basler Framegrabber SDK.',
      snippet_events_callbacks: 'Consider event-driven or callback-based image processing, but also request a robust polling or wait-based variant if required by the SDK.',
      snippet_applet_fpga: 'Consider applet loading, applet parameters, port configuration, and the separation between applet-specific logic and generic SDK acquisition code.',
      snippet_multi_camera: 'Consider multiple cameras: board-to-port mapping, separate DMA or stream channels, synchronized start, independent buffers, per-camera error handling, and clean shutdown of all streams.',
      snippet_image_correction: 'Consider camera or applet parameters for gain, offset, flat-field correction, or similar preprocessing, but mark unknown parameters as assumptions.'
    },
    ko: {
      site_title: 'Basler Framegrabber SDK 프롬프트 생성기',
      site_subtitle: '견고한 Basler 이미지 획득 코드를 위한 고품질 LLM 프롬프트 작성',
      privacy_label: '데이터 프라이버시',
      privacy_text: '모든 입력은 브라우저에만 저장됩니다. 데이터가 전송되지 않습니다.',
      confidential_label: '기밀 유지',
      confidential_text: '생성된 프롬프트를 공유하기 전에 검토하세요. 고객 기밀 데이터, 소스 코드, 자격 증명, 시리얼 번호, 라이선스 키 또는 미공개 프로젝트 세부 정보를 포함하지 마세요.',
      guidance_label: '안내',
      guidance_text: '다른 SDK나 시스템의 기존 획득 코드가 있다면, 먼저 선택한 AI 도우미로 코드가 수행하는 작업을 요약하세요. 허용되지 않는 한 기밀 소스 코드를 붙여넣지 마세요. 기술 요약을 붙여넣는 것을 권장합니다: 무엇을 획득하나요? 어떤 카메라와 획득 매개변수가 구성되어 있나요? 버퍼, 트리거, DMA 채널, 이벤트, 타임아웃 및 정리는 어떻게 처리되나요?',
      support_label: '공식 지원',
      support_text_before: '이 도구는 LLM 프롬프트 작성만 돕습니다. Basler 카메라, 프레임그래버, SDK 또는 애플리케이션 관련 도움이 필요하면 ',
      support_link_text: 'Basler Support',
      support_text_after: '에 문의할 수도 있습니다.',
      inputs_heading: '구성',
      label_app_description: '애플리케이션 설명',
      placeholder_app_description: '예: CXP-12 카메라 2대, 각각 x2 링크로 연결. 외부 프레임 트리거로 획득 시작. Mono8 이미지가 별도 DMA 채널을 통해 호스트 버퍼로 전송됨. 타임아웃 처리, 이미지 접근, 버퍼 재큐잉 및 깨끗한 획득 종료를 보여줘야 함.',
      label_workflow_summary: '기존 획득 워크플로 요약',
      help_workflow_summary: '소스 코드가 아닌 기존 코드가 수행하는 작업의 요약을 붙여넣으세요.',
      placeholder_workflow_summary: '예: 기존 프로그램이 카메라 2대를 열고, 채널당 버퍼 4개를 할당하며, 5초 타임아웃으로 프레임 이벤트를 대기하고, 이미지 데이터를 큐에 복사한 뒤 버퍼를 재큐잉합니다. 종료 시 획득을 중지하고 핸들을 역순으로 해제합니다.',
      label_standard_acq_applet: '표준 획득 애플릿',
      help_standard_acq: '표준 획득 애플릿은 SingleArea, SingleLine, DualArea, DualLine, QuadArea, QuadLine 등의 이름을 사용하는 .dll 파일로 제공됩니다.',
      help_standard_acq_imaflex2: 'imaFlex 2 Dual 100: 현재 기본 제공되는 표준 .dll은 SingleLine뿐입니다. DualLine에는 VisualApplets .hap 설계가 필요합니다.',
      help_applet_name: 'VisualApplets .hap 애플릿의 경우 애플릿 파일 이름을 입력하세요. 표준 .dll 애플릿의 경우 특정 빌드 이름이 필요하지 않으면 비워 두세요.',
      warn_acquisition_hw: 'Acquisition 프레임그래버가 선택되었습니다 (예: imaWorx, marathon ACL/ACX-QP). 표준 획득 .dll 애플릿을 사용하세요. VisualApplets .hap 로딩은 프로그래밍 가능한 프레임그래버 전용입니다.',
      warn_programmable_hw: '프로그래밍 가능한 프레임그래버가 선택되었습니다. 표준 획득 .dll 애플릿과 사용자 정의 VisualApplets .hap 설계를 지원합니다.',
      hw_group_programmable: 'Basler 프로그래밍 가능 프레임그래버',
      hw_group_acquisition: 'Basler acquisition 프레임그래버',
      std_acq_unspec: '지정되지 않음',
      std_acq_single_area: 'SingleArea (에어리어 스캔 카메라 1대)',
      std_acq_single_line: 'SingleLine (라인 스캔 카메라 1대)',
      std_acq_dual_area: 'DualArea (에어리어 스캔 카메라 2대)',
      std_acq_dual_line: 'DualLine (라인 스캔 카메라 2대)',
      std_acq_quad_area: 'QuadArea (에어리어 스캔 카메라 4대)',
      std_acq_quad_line: 'QuadLine (라인 스캔 카메라 4대)',
      std_acq_visualapplets_hap: '사용자 정의 VisualApplets 애플릿 (.hap)',
      applet_standard_dll: '표준 획득 애플릿 (.dll)',
      applet_visualapplets_hap: 'VisualApplets 애플릿 (.hap)',
      cb_deep_analysis_locked: '심층 분석 / 확장 사고 강제 (항상 활성화)',
      label_camera_count: '카메라 수', label_camera_interface: '카메라 인터페이스', label_hardware: 'Basler 획득 하드웨어',
      label_applet_handling: '애플릿 처리', label_applet_name: '애플릿 이름', label_pixel_type: '픽셀 유형', label_camera_type: '카메라 유형',
      label_image_width: '이미지 너비', label_image_height: '이미지 높이', label_dma_channels: 'DMA 채널 수',
      per_camera_title: '카메라별 이미지 구성',
      help_per_camera_dims: '카메라 유형, 픽셀 형식 및 이미지 크기는 카메라마다 다를 수 있습니다.',
      label_cam_pixel_type: '픽셀 유형',
      label_cam_camera_type: '카메라 유형',
      label_dma_count: 'DMA 채널 수',
      label_stream_path_count: '스트림 그래버 경로 수',
      help_dma_count_separate: '프로그래밍 가능 프레임그래버에서는 DMA 채널 수가 카메라 수와 다를 수 있습니다.',
      per_dma_title: 'DMA별 버퍼 구성',
      help_per_dma_dims: 'DMA 버퍼 크기와 픽셀 형식은 센서 이미지 및 다른 DMA 채널과 다를 수 있습니다. 호스트 버퍼 수는 DMA 채널마다 구성합니다.',
      label_dma_pixel_type: '픽셀 유형',
      placeholder_optional_same_as_camera: '선택 — 카메라와 동일',
      label_dma_n: 'DMA {n}',
      label_cam_dma_width: 'DMA 버퍼 너비',
      label_cam_dma_height: 'DMA 버퍼 높이',
      label_host_buffers_per_dma: '호스트 버퍼',
      help_dma_pylon: 'pylon SDK 경로의 경우 Framegrabber SDK DMA가 아닌 스트림 그래버/버퍼 경로에 해당합니다.',
      label_trigger_mode: '트리거 모드', label_programming_language: '프로그래밍 언어', label_operating_system: '운영 체제',
      label_target_llm: '대상 LLM', label_prompt_language: '프롬프트 언어', label_output_style: '출력 스타일', legend_options: '프롬프트 옵션',
      detected_topics_title: '감지된 주제', no_topics_text: '아직 감지된 주제가 없습니다. 애플리케이션 설명 또는 워크플로 요약에 입력하세요.',
      snippets_summary: '활성화된 스니펫', btn_load_example: '예제 불러오기', btn_reset: '모두 초기화',
      preview_heading: '실시간 프롬프트 미리보기', route_framegrabber: 'Basler Framegrabber SDK 경로', route_pylon: 'Basler pylon SDK 경로',
      btn_copy: '프롬프트 복사', btn_download: '프롬프트를 .txt로 다운로드', btn_refresh: '프롬프트 새로고침',
      copy_success: '프롬프트가 클립보드에 복사되었습니다.', copy_fail: '복사할 수 없습니다. 미리보기 텍스트를 직접 선택하세요.',
      footer_text: '클라이언트 전용. 추적 없음. 외부 API 없음.',
      footer_autosave: '구성은 이 브라우저에 로컬로 저장됩니다.',
      warn_interface_card: '이 선택은 프로그래밍 가능한 프레임그래버가 아닌 인터페이스 카드입니다. 생성된 프롬프트는 Basler pylon SDK로 구현을 안내합니다.',
      warn_interface_route: '선택한 카메라 인터페이스는 일반적으로 Basler Framegrabber SDK가 아닌 Basler pylon SDK를 통해 처리됩니다.',
      warn_cof: 'CoaXPress-over-Fiber는 CoF 지원이 명시된 Basler 프레임그래버(예: imaFlex 2 Dual 100)에서만 지원됩니다. 하드웨어 호환성을 확인하세요.',
      warn_applet: '인터페이스 카드 또는 pylon SDK 경로에서는 애플릿 처리가 적용되지 않습니다.',
      hw_group_framegrabber: 'Basler 프레임그래버', hw_group_interface_card: 'Basler 인터페이스 카드',
      topic_trigger_timing: '트리거 / 타이밍', topic_dma_buffering: 'DMA / 버퍼링', topic_line_scan_tdi: '라인 스캔 / TDI',
      topic_cxp_link: 'CoaXPress 링크 구성', topic_pylon_route: 'pylon SDK 경로', topic_events_callbacks: '이벤트 / 콜백',
      topic_applet_fpga: '애플릿 / FPGA 처리', topic_multi_camera: '다중 카메라 획득', topic_image_correction: '이미지 보정 매개변수',
      cat_acquisition_control: '획득 제어', cat_buffering: '버퍼링', cat_camera_type: '카메라 유형', cat_interface: '인터페이스',
      cat_sdk_routing: 'SDK 라우팅', cat_processing: '처리',
      iface_cxp12: 'CXP-12', iface_cxp6: 'CXP-6', iface_camera_link: 'Camera Link', iface_gige: 'GigE Vision',
      iface_5gige: '5GigE Vision', iface_10gige: '10GigE Vision', iface_usb3: 'USB3 Vision', iface_cof: 'CoaXPress-over-Fiber', iface_other: '기타',
      applet_loaded: '이미 로드된 애플릿 사용', applet_load_name: '이름으로 애플릿 로드', applet_name_avail: '애플릿 이름 있음',
      applet_name_na: '애플릿 이름 없음', applet_na: '해당 없음',
      pixel_mono8: 'Mono8', pixel_mono10: 'Mono10', pixel_mono12: 'Mono12', pixel_mono16: 'Mono16',
      pixel_bayer8: 'Bayer8', pixel_bayer10: 'Bayer10', pixel_bayer12: 'Bayer12', pixel_rgb8: 'RGB8', pixel_other: '기타',
      cam_area: '에어리어 스캔', cam_line: '라인 스캔', cam_tdi: 'TDI', cam_unknown: '알 수 없음 / 미지정',
      trig_free: '프리 런', trig_software: '소프트웨어 트리거', trig_frame: '외부 프레임 트리거', trig_line: '외부 라인 트리거',
      trig_encoder: '엔코더 / 샤프트 트리거', trig_enable: '인에이블 신호', trig_unspec: '미지정',
      lang_cpp17: 'C++17', lang_cpp20: 'C++20', lang_c: 'C', lang_python: 'Python', lang_pseudo: '의사코드',
      os_windows: 'Windows', os_linux: 'Linux', os_unspec: '미지정',
      llm_chatgpt: 'ChatGPT', llm_claude: 'Claude', llm_copilot: 'Copilot', llm_cursor: 'Cursor AI', llm_generic: '일반 LLM',
      plang_en: '영어', plang_de: '독일어', plang_ko: '한국어', plang_zh: '중국어 간체', plang_ja: '일본어', plang_vi: '베트남어',
      help_auto_acq_applet: 'Acquisition 프레임그래버에서는 카메라 수와 에어리어/라인 스캔에 따라 표준 .dll 애플릿 이름이 자동으로 결정됩니다 (예: 에어리어 카메라 2대 → DualArea).',
      label_auto_applet_readonly: '애플릿 이름 (자동)',
      style_minimal: '최소 동작 예제', style_production: '견고한 프로덕션 스타일 예제', style_debug: '디버그 / 진단 프로그램',
      style_adaptation: '기존 워크플로 적응', style_architecture: '아키텍처 제안', style_integration: '단계별 통합 계획',
      cb_error_handling: '견고한 오류 처리 강제', cb_timeout: '타임아웃 처리 강제', cb_cleanup: '명시적 리소스 정리 강제',
      cb_buffer_alloc: '명시적 버퍼 할당 강제', cb_acq_start_stop: '명시적 획득 시작/중지 강제',
      cb_separate_params: '카메라 매개변수와 획득 하드웨어 매개변수 분리', cb_cmake: 'CMakeLists.txt 포함',
      cb_assumptions: '가정 및 TODO 요구', cb_reject_pylon: '실제 프레임그래버 선택 시 pylon 전용 솔루션 거부',
      cb_doc_check: '최신 문서 확인 요구', cb_deep_analysis: '심층 분석 / 심층 사고 모드 강제',
      cb_hallucination: '환각 SDK 호출 경고', cb_multi_sync: '다중 카메라 동기화 참고 포함',
      cb_image_access: '이미지 데이터 접근 예제 포함', cb_buffer_requeue: '버퍼 재큐잉 예제 포함',
      snippet_trigger_timing: '트리거 구성, 트리거 소스, 트리거 모드, 타이밍, 타임아웃 동작 및 깨끗한 획득 시작/중지를 고려하세요.',
      snippet_dma_buffering: '버퍼 및 DMA 전략을 명시적으로 보여주세요: 버퍼 수, 할당, 큐잉, 재큐잉, 타임아웃, 오류 경우 및 정리.',
      snippet_line_scan_tdi: '라인 스캔 또는 TDI 관련 측면을 고려하세요: 라인 트리거, 엔코더, 라인에서의 이미지 높이 구성, 누락 라인 타임아웃 및 부분 프레임 동작.',
      snippet_cxp_link: 'CoaXPress 링크 구성, 카메라 검색, 링크 폭, 데이터 속도, 보드 포트 매핑 및 진단을 고려하세요.',
      snippet_pylon_route: 'GigE Vision, 5GigE Vision, 10GigE Vision 또는 USB3 Vision 기반 획득은 Basler Framegrabber SDK 대신 Basler pylon SDK로 라우팅하세요.',
      snippet_events_callbacks: '이벤트 기반 또는 콜백 기반 이미지 처리를 고려하되, SDK에서 필요한 경우 견고한 폴링 또는 대기 기반 변형도 요청하세요.',
      snippet_applet_fpga: '애플릿 로딩, 애플릿 매개변수, 포트 구성 및 애플릿별 로직과 일반 SDK 획득 코드의 분리를 고려하세요.',
      snippet_multi_camera: '다중 카메라를 고려하세요: 보드-포트 매핑, 별도 DMA 또는 스트림 채널, 동기화된 시작, 독립 버퍼, 카메라별 오류 처리 및 모든 스트림의 깨끗한 종료.',
      snippet_image_correction: '게인, 오프셋, 플랫 필드 보정 또는 유사한 전처리를 위한 카메라 또는 애플릿 매개변수를 고려하되, 알 수 없는 매개변수는 가정으로 표시하세요.'
    },
    zh: {
      site_title: 'Basler Framegrabber SDK 提示词生成器',
      site_subtitle: '为稳健的 Basler 图像采集代码编写高质量 LLM 提示词',
      privacy_label: '数据隐私', privacy_text: '所有输入仅保存在您的浏览器中。不会传输任何数据。',
      confidential_label: '保密提示', confidential_text: '分享前请审查生成的提示词。不要包含机密客户数据、源代码、凭据、序列号、许可证密钥或未公开的项目细节。',
      guidance_label: '使用指南', guidance_text: '如果您已有来自其他 SDK 或系统的现有采集代码，请先使用您选择的 AI 助手总结代码功能。除非允许，请勿粘贴机密源代码。建议粘贴技术摘要：采集什么？配置了哪些相机和采集参数？缓冲区、触发、DMA 通道、事件、超时和清理如何处理？',
      support_label: '官方支持',
      support_text_before: '本工具仅用于编写 LLM 提示词。如需 Basler 相机、采集卡、SDK 或应用方面的帮助，您也可以联系',
      support_link_text: 'Basler 支持',
      support_text_after: '。',
      inputs_heading: '配置', label_app_description: '应用描述',
      placeholder_app_description: '示例：两台 CXP-12 相机，各通过 x2 链路连接。通过外部帧触发开始采集。Mono8 图像通过独立 DMA 通道传输到主机缓冲区。程序应展示超时处理、图像访问、缓冲区重新入队和干净的采集关闭。',
      label_workflow_summary: '现有采集工作流摘要', help_workflow_summary: '粘贴现有代码功能的摘要，不一定是源代码本身。',
      label_camera_count: '相机数量', label_camera_interface: '相机接口', label_hardware: 'Basler 采集硬件',
      label_applet_handling: 'Applet 处理', label_applet_name: 'Applet 名称', label_pixel_type: '像素类型', label_camera_type: '相机类型',
      label_image_width: '图像宽度', label_image_height: '图像高度', label_dma_channels: 'DMA 通道数',
      per_camera_title: '每相机图像配置',
      help_per_camera_dims: '相机类型、像素格式和图像尺寸可能因相机而异。',
      label_cam_camera_type: '相机类型',
      label_cam_pixel_type: '像素类型',
      label_dma_count: 'DMA 通道数',
      label_stream_path_count: '流采集器路径数',
      help_dma_count_separate: '在可编程帧采集卡上，DMA 通道数可能与相机数量不同。',
      per_dma_title: '每 DMA 缓冲区配置',
      help_per_dma_dims: 'DMA 缓冲区大小和像素格式可能与传感器图像及其他 DMA 通道不同。主机缓冲区数量按每个 DMA 通道配置。',
      label_dma_pixel_type: '像素类型',
      placeholder_optional_same_as_camera: '可选 — 与相机相同',
      label_dma_n: 'DMA {n}',
      label_cam_dma_width: 'DMA 缓冲区宽度',
      label_cam_dma_height: 'DMA 缓冲区高度',
      label_host_buffers_per_dma: '主机缓冲区',
      help_dma_pylon: '对于 pylon SDK 路径，这对应于流采集器/缓冲区路径，而非 Framegrabber SDK DMA（除非硬件支持）。',
      label_trigger_mode: '触发模式', label_programming_language: '编程语言', label_operating_system: '操作系统',
      label_target_llm: '目标 LLM', label_prompt_language: '提示词语言', label_output_style: '输出风格', legend_options: '提示词选项',
      detected_topics_title: '检测到的主题', no_topics_text: '尚未检测到主题。请在应用描述或工作流摘要中输入。',
      snippets_summary: '已激活片段', btn_load_example: '加载示例', btn_reset: '全部重置',
      preview_heading: '实时提示词预览', route_framegrabber: 'Basler Framegrabber SDK 路径', route_pylon: 'Basler pylon SDK 路径',
      btn_copy: '复制提示词', btn_download: '下载提示词为 .txt', btn_refresh: '刷新提示词',
      copy_success: '提示词已复制到剪贴板。', copy_fail: '无法复制。请手动选择预览文本。',
      footer_text: '仅客户端。无跟踪。无外部 API。',
      footer_autosave: '您的配置会保存在本浏览器中。',
      warn_interface_card: '此选择是接口卡，而非可编程帧采集卡。生成的提示词将引导通过 Basler pylon SDK 实现。',
      warn_interface_route: '所选相机接口通常通过 Basler pylon SDK 处理，而非 Basler Framegrabber SDK。',
      warn_cof: 'CoaXPress-over-Fiber 仅在明确支持 CoF 的 Basler 帧采集卡上受支持（例如 imaFlex 2 Dual 100）。请验证硬件兼容性。',
      warn_applet: '接口卡或 pylon SDK 路径不适用 Applet 处理。',
      hw_group_framegrabber: 'Basler 帧采集卡', hw_group_interface_card: 'Basler 接口卡',
      topic_trigger_timing: '触发 / 时序', topic_dma_buffering: 'DMA / 缓冲', topic_line_scan_tdi: '线扫描 / TDI',
      topic_cxp_link: 'CoaXPress 链路配置', topic_pylon_route: 'pylon SDK 路径', topic_events_callbacks: '事件 / 回调',
      topic_applet_fpga: 'Applet / FPGA 处理', topic_multi_camera: '多相机采集', topic_image_correction: '图像校正参数',
      cat_acquisition_control: '采集控制', cat_buffering: '缓冲', cat_camera_type: '相机类型', cat_interface: '接口',
      cat_sdk_routing: 'SDK 路由', cat_processing: '处理',
      iface_cxp12: 'CXP-12', iface_cxp6: 'CXP-6', iface_camera_link: 'Camera Link', iface_gige: 'GigE Vision',
      iface_5gige: '5GigE Vision', iface_10gige: '10GigE Vision', iface_usb3: 'USB3 Vision', iface_cof: 'CoaXPress-over-Fiber', iface_other: '其他',
      applet_loaded: '使用已加载的 applet', applet_load_name: '按名称加载 applet', applet_name_avail: 'Applet 名称可用',
      applet_name_na: 'Applet 名称不可用', applet_na: '不适用',
      pixel_mono8: 'Mono8', pixel_mono10: 'Mono10', pixel_mono12: 'Mono12', pixel_mono16: 'Mono16',
      pixel_bayer8: 'Bayer8', pixel_bayer10: 'Bayer10', pixel_bayer12: 'Bayer12', pixel_rgb8: 'RGB8', pixel_other: '其他',
      cam_area: '面阵', cam_line: '线阵', cam_tdi: 'TDI', cam_unknown: '未知 / 未指定',
      trig_free: '自由运行', trig_software: '软件触发', trig_frame: '外部帧触发', trig_line: '外部行触发',
      trig_encoder: '编码器 / 轴触发', trig_enable: '使能信号', trig_unspec: '未指定',
      lang_cpp17: 'C++17', lang_cpp20: 'C++20', lang_c: 'C', lang_python: 'Python', lang_pseudo: '伪代码',
      os_windows: 'Windows', os_linux: 'Linux', os_unspec: '未指定',
      llm_chatgpt: 'ChatGPT', llm_claude: 'Claude', llm_copilot: 'Copilot', llm_cursor: 'Cursor AI', llm_generic: '通用 LLM',
      plang_en: '英语', plang_de: '德语', plang_ko: '韩语', plang_zh: '简体中文', plang_ja: '日语', plang_vi: '越南语',
      help_auto_acq_applet: '采集型帧采集卡会根据相机数量和面阵/线扫扫描类型自动推导标准 .dll 小程序名称（例如 2 台面阵相机 → DualArea）。',
      label_auto_applet_readonly: '小程序名称（自动）',
      style_minimal: '最小可运行示例', style_production: '稳健生产级示例', style_debug: '调试 / 诊断程序',
      style_adaptation: '现有工作流适配', style_architecture: '架构方案', style_integration: '分步集成计划',
      cb_error_handling: '强制稳健错误处理', cb_timeout: '强制超时处理', cb_cleanup: '强制显式资源清理',
      cb_buffer_alloc: '强制显式缓冲区分配', cb_acq_start_stop: '强制显式采集启停',
      cb_separate_params: '分离相机参数与采集硬件参数', cb_cmake: '包含 CMakeLists.txt',
      cb_assumptions: '要求假设和 TODO', cb_reject_pylon: '选择真实帧采集卡时拒绝仅 pylon 方案',
      cb_doc_check: '要求查阅当前文档', cb_deep_analysis: '强制深度分析模式',
      cb_hallucination: '警告虚构 SDK 调用', cb_multi_sync: '包含多相机同步说明',
      cb_image_access: '包含图像数据访问示例', cb_buffer_requeue: '包含缓冲区重新入队示例',
      snippet_trigger_timing: '考虑触发配置、触发源、触发模式、时序、超时行为以及干净的采集启停。',
      snippet_dma_buffering: '明确展示缓冲和 DMA 策略：缓冲区数量、分配、排队、重新入队、超时、错误情况和清理。',
      snippet_line_scan_tdi: '考虑线扫描或 TDI 特定方面：行触发、编码器、由行构建图像高度、缺失行超时和部分帧行为。',
      snippet_cxp_link: '考虑 CoaXPress 链路配置、相机发现、链路宽度、数据速率、板卡端口映射和诊断。',
      snippet_pylon_route: '若采集基于 GigE Vision、5GigE Vision、10GigE Vision 或 USB3 Vision，请将代码请求路由至 Basler pylon SDK。',
      snippet_events_callbacks: '考虑事件驱动或回调式图像处理，同时在 SDK 要求时请求稳健的轮询或等待变体。',
      snippet_applet_fpga: '考虑 applet 加载、applet 参数、端口配置，以及 applet 逻辑与通用 SDK 采集代码的分离。',
      snippet_multi_camera: '考虑多相机：板卡到端口映射、独立 DMA 或流通道、同步启动、独立缓冲区、每相机错误处理及所有流的干净关闭。',
      snippet_image_correction: '考虑增益、偏移、平场校正或类似预处理的相机或 applet 参数，未知参数标记为假设。'
    },
    ja: {
      site_title: 'Basler Framegrabber SDK プロンプトジェネレーター',
      site_subtitle: '堅牢な Basler 画像取得コード向けの高品質 LLM プロンプトを作成',
      privacy_label: 'データプライバシー', privacy_text: 'すべての入力はブラウザ内にのみ保存されます。データは送信されません。',
      confidential_label: '機密保持', confidential_text: '共有前に生成されたプロンプトを確認してください。機密の顧客データ、ソースコード、認証情報、シリアル番号、ライセンスキー、未公開のプロジェクト詳細を含めないでください。',
      guidance_label: 'ガイダンス', guidance_text: '他の SDK やシステムの既存取得コードがある場合は、まず選択した AI アシスタントでコードの動作を要約してください。許可されていない限り機密ソースコードを貼り付けないでください。技術要約の貼り付けを推奨します：何を取得するか？どのカメラと取得パラメータが構成されているか？バッファ、トリガー、DMA チャネル、イベント、タイムアウト、クリーンアップはどう処理されるか？',
      support_label: '公式サポート',
      support_text_before: 'このツールは LLM プロンプト作成の補助のみを目的としています。Basler カメラ、フレームグラバー、SDK、アプリケーションに関するご質問は、',
      support_link_text: 'Basler サポート',
      support_text_after: 'にもお問い合わせいただけます。',
      inputs_heading: '設定', label_app_description: 'アプリケーション説明',
      placeholder_app_description: '例：CXP-12 カメラ 2 台、各 x2 リンク接続。外部フレームトリガーで取得開始。Mono8 画像を別々の DMA チャネルでホストバッファに転送。タイムアウト処理、画像アクセス、バッファ再キュー、取得のクリーンシャットダウンを示すこと。',
      label_workflow_summary: '既存取得ワークフローの要約', help_workflow_summary: 'ソースコードではなく、既存コードの動作要約を貼り付けてください。',
      label_camera_count: 'カメラ数', label_camera_interface: 'カメラインターフェース', label_hardware: 'Basler 取得ハードウェア',
      label_applet_handling: 'アプレット処理', label_applet_name: 'アプレット名', label_pixel_type: 'ピクセルタイプ', label_camera_type: 'カメラタイプ',
      label_image_width: '画像幅', label_image_height: '画像高さ', label_dma_channels: 'DMA チャネル数',
      per_camera_title: 'カメラごとの画像構成',
      help_per_camera_dims: 'カメラタイプ、ピクセル形式、画像サイズはカメラごとに異なる場合があります。',
      label_cam_camera_type: 'カメラタイプ',
      label_cam_pixel_type: 'ピクセルタイプ',
      label_dma_count: 'DMA チャネル数',
      label_stream_path_count: 'ストリームグラバーパス数',
      help_dma_count_separate: 'プログラム可能フレームグラバーでは DMA チャネル数がカメラ数と異なる場合があります。',
      per_dma_title: 'DMA ごとのバッファ構成',
      help_per_dma_dims: 'DMA バッファサイズとピクセル形式はセンサー画像や他の DMA チャネルと異なる場合があります。ホストバッファ数は DMA チャネルごとに設定します。',
      label_dma_pixel_type: 'ピクセルタイプ',
      placeholder_optional_same_as_camera: '任意 — カメラと同じ',
      label_dma_n: 'DMA {n}',
      label_cam_dma_width: 'DMA バッファ幅',
      label_cam_dma_height: 'DMA バッファ高さ',
      label_host_buffers_per_dma: 'ホストバッファ',
      help_dma_pylon: 'pylon SDK ルートでは Framegrabber SDK DMA ではなくストリームグラバー/バッファパスに対応します。',
      label_trigger_mode: 'トリガーモード', label_programming_language: 'プログラミング言語', label_operating_system: 'オペレーティングシステム',
      label_target_llm: '対象 LLM', label_prompt_language: 'プロンプト言語', label_output_style: '出力スタイル', legend_options: 'プロンプトオプション',
      detected_topics_title: '検出されたトピック', no_topics_text: 'まだトピックが検出されていません。アプリケーション説明またはワークフロー要約に入力してください。',
      snippets_summary: '有効化されたスニペット', btn_load_example: '例を読み込む', btn_reset: 'すべてリセット',
      preview_heading: 'ライブプロンプトプレビュー', route_framegrabber: 'Basler Framegrabber SDK ルート', route_pylon: 'Basler pylon SDK ルート',
      btn_copy: 'プロンプトをコピー', btn_download: 'プロンプトを .txt でダウンロード', btn_refresh: 'プロンプトを更新',
      copy_success: 'プロンプトをクリップボードにコピーしました。', copy_fail: 'コピーできませんでした。プレビューテキストを手動で選択してください。',
      footer_text: 'クライアントサイドのみ。トラッキングなし。外部 API なし。',
      footer_autosave: '設定はこのブラウザにローカル保存されます。',
      warn_interface_card: 'この選択はプログラム可能なフレームグラバーではなくインターフェースカードです。生成プロンプトは Basler pylon SDK にルーティングします。',
      warn_interface_route: '選択したカメラインターフェースは通常 Basler Framegrabber SDK ではなく Basler pylon SDK で処理されます。',
      warn_cof: 'CoaXPress-over-Fiber は CoF 対応が明記された Basler フレームグラバー（例：imaFlex 2 Dual 100）でのみサポートされます。互換性を確認してください。',
      warn_applet: 'インターフェースカードまたは pylon SDK ルートではアプレット処理は適用されません。',
      hw_group_framegrabber: 'Basler フレームグラバー', hw_group_interface_card: 'Basler インターフェースカード',
      topic_trigger_timing: 'トリガー / タイミング', topic_dma_buffering: 'DMA / バッファリング', topic_line_scan_tdi: 'ラインスキャン / TDI',
      topic_cxp_link: 'CoaXPress リンク構成', topic_pylon_route: 'pylon SDK ルート', topic_events_callbacks: 'イベント / コールバック',
      topic_applet_fpga: 'アプレット / FPGA 処理', topic_multi_camera: 'マルチカメラ取得', topic_image_correction: '画像補正パラメータ',
      cat_acquisition_control: '取得制御', cat_buffering: 'バッファリング', cat_camera_type: 'カメラタイプ', cat_interface: 'インターフェース',
      cat_sdk_routing: 'SDK ルーティング', cat_processing: '処理',
      iface_cxp12: 'CXP-12', iface_cxp6: 'CXP-6', iface_camera_link: 'Camera Link', iface_gige: 'GigE Vision',
      iface_5gige: '5GigE Vision', iface_10gige: '10GigE Vision', iface_usb3: 'USB3 Vision', iface_cof: 'CoaXPress-over-Fiber', iface_other: 'その他',
      applet_loaded: '読み込み済みアプレットを使用', applet_load_name: '名前でアプレットを読み込む', applet_name_avail: 'アプレット名あり',
      applet_name_na: 'アプレット名なし', applet_na: '該当なし',
      pixel_mono8: 'Mono8', pixel_mono10: 'Mono10', pixel_mono12: 'Mono12', pixel_mono16: 'Mono16',
      pixel_bayer8: 'Bayer8', pixel_bayer10: 'Bayer10', pixel_bayer12: 'Bayer12', pixel_rgb8: 'RGB8', pixel_other: 'その他',
      cam_area: 'エリアスキャン', cam_line: 'ラインスキャン', cam_tdi: 'TDI', cam_unknown: '不明 / 未指定',
      trig_free: 'フリーラン', trig_software: 'ソフトウェアトリガー', trig_frame: '外部フレームトリガー', trig_line: '外部ライントリガー',
      trig_encoder: 'エンコーダ / シャフトトリガー', trig_enable: 'イネーブル信号', trig_unspec: '未指定',
      lang_cpp17: 'C++17', lang_cpp20: 'C++20', lang_c: 'C', lang_python: 'Python', lang_pseudo: '疑似コード',
      os_windows: 'Windows', os_linux: 'Linux', os_unspec: '未指定',
      llm_chatgpt: 'ChatGPT', llm_claude: 'Claude', llm_copilot: 'Copilot', llm_cursor: 'Cursor AI', llm_generic: '汎用 LLM',
      plang_en: '英語', plang_de: 'ドイツ語', plang_ko: '韓国語', plang_zh: '簡体字中国語', plang_ja: '日本語', plang_vi: 'ベトナム語',
      help_auto_acq_applet: 'Acquisition フレームグラバーでは、カメラ数とエリア／ラインスキャンから標準 .dll アプレット名が自動決定されます（例: エリアカメラ 2 台 → DualArea）。',
      label_auto_applet_readonly: 'アプレット名（自動）',
      style_minimal: '最小動作例', style_production: '堅牢な本番スタイル例', style_debug: 'デバッグ / 診断プログラム',
      style_adaptation: '既存ワークフロー適応', style_architecture: 'アーキテクチャ提案', style_integration: '段階的統合計画',
      cb_error_handling: '堅牢なエラー処理を強制', cb_timeout: 'タイムアウト処理を強制', cb_cleanup: '明示的リソースクリーンアップを強制',
      cb_buffer_alloc: '明示的バッファ割り当てを強制', cb_acq_start_stop: '明示的取得開始/停止を強制',
      cb_separate_params: 'カメラパラメータと取得ハードウェアパラメータを分離', cb_cmake: 'CMakeLists.txt を含める',
      cb_assumptions: '仮定と TODO を要求', cb_reject_pylon: '実フレームグラバー選択時に pylon のみの解を拒否',
      cb_doc_check: '最新ドキュメント確認を要求', cb_deep_analysis: '深い分析モードを強制',
      cb_hallucination: '幻覚 SDK 呼び出しを警告', cb_multi_sync: 'マルチカメラ同期メモを含める',
      cb_image_access: '画像データアクセス例を含める', cb_buffer_requeue: 'バッファ再キュー例を含める',
      snippet_trigger_timing: 'トリガー構成、トリガーソース、トリガーモード、タイミング、タイムアウト動作、クリーンな取得開始/停止を考慮してください。',
      snippet_dma_buffering: 'バッファと DMA 戦略を明示的に示してください：バッファ数、割り当て、キューイング、再キュー、タイムアウト、エラーケース、クリーンアップ。',
      snippet_line_scan_tdi: 'ラインスキャンまたは TDI 固有の側面を考慮：ライントリガー、エンコーダ、行からの画像高さ構築、欠損行タイムアウト、部分フレーム動作。',
      snippet_cxp_link: 'CoaXPress リンク構成、カメラ検出、リンク幅、データレート、ボードポートマッピング、診断を考慮してください。',
      snippet_pylon_route: 'GigE Vision、5GigE Vision、10GigE Vision、USB3 Vision ベースの取得は Basler pylon SDK にルーティングしてください。',
      snippet_events_callbacks: 'イベント駆動またはコールバックベースの画像処理を考慮し、SDK で必要なら堅牢なポーリングまたは待機ベースの変種も要求してください。',
      snippet_applet_fpga: 'アプレット読み込み、アプレットパラメータ、ポート構成、アプレット固有ロジックと汎用 SDK 取得コードの分離を考慮してください。',
      snippet_multi_camera: '複数カメラを考慮：ボード-ポートマッピング、独立 DMA またはストリームチャネル、同期開始、独立バッファ、カメラ別エラー処理、全ストリームのクリーンシャットダウン。',
      snippet_image_correction: 'ゲイン、オフセット、フラットフィールド補正などの前処理パラメータを考慮し、不明なパラメータは仮定としてマークしてください。'
    },
    vi: {
      site_title: 'Trình tạo Prompt Basler Framegrabber SDK',
      site_subtitle: 'Soạn prompt LLM chất lượng cao cho mã thu thập Basler mạnh mẽ',
      privacy_label: 'Quyền riêng tư dữ liệu', privacy_text: 'Mọi đầu vào chỉ lưu cục bộ trong trình duyệt. Không có dữ liệu nào được truyền đi.',
      confidential_label: 'Bảo mật', confidential_text: 'Xem lại prompt trước khi chia sẻ. Không bao gồm dữ liệu khách hàng bí mật, mã nguồn, thông tin đăng nhập, số serial, khóa license hoặc chi tiết dự án chưa công bố.',
      guidance_label: 'Hướng dẫn', guidance_text: 'Nếu bạn đã có mã thu thập từ SDK hoặc hệ thống khác, trước tiên hãy dùng trợ lý AI bạn chọn để tóm tắt mã làm gì. Không dán mã nguồn bí mật trừ khi được phép. Nên dán tóm tắt kỹ thuật: Thu thập gì? Camera và tham số thu thập nào được cấu hình? Bộ đệm, trigger, kênh DMA, sự kiện, timeout và dọn dẹp được xử lý thế nào?',
      support_label: 'Hỗ trợ chính thức',
      support_text_before: 'Công cụ này chỉ hỗ trợ soạn prompt LLM. Để được trợ giúp về camera Basler, frame grabber, SDK hoặc ứng dụng của bạn, bạn cũng có thể liên hệ ',
      support_link_text: 'Basler Support',
      support_text_after: '.',
      inputs_heading: 'Cấu hình', label_app_description: 'Mô tả ứng dụng',
      placeholder_app_description: 'Ví dụ: Hai camera CXP-12, mỗi camera kết nối x2 link. Thu thập bắt đầu bằng trigger khung ngoài. Ảnh Mono8 chuyển vào bộ đệm host qua kênh DMA riêng. Chương trình cần thể hiện xử lý timeout, truy cập ảnh, requeue bộ đệm và tắt thu thập sạch sẽ.',
      label_workflow_summary: 'Tóm tắt quy trình thu thập hiện có', help_workflow_summary: 'Dán tóm tắt những gì mã hiện có làm, không nhất thiết là mã nguồn.',
      label_camera_count: 'Số camera', label_camera_interface: 'Giao diện camera', label_hardware: 'Phần cứng thu thập Basler',
      label_applet_handling: 'Xử lý applet', label_applet_name: 'Tên applet', label_pixel_type: 'Kiểu pixel', label_camera_type: 'Loại camera',
      label_image_width: 'Chiều rộng ảnh', label_image_height: 'Chiều cao ảnh', label_dma_channels: 'Số kênh DMA',
      per_camera_title: 'Cấu hình ảnh theo từng camera',
      help_per_camera_dims: 'Loại camera, định dạng pixel và kích thước ảnh có thể khác nhau giữa các camera.',
      label_cam_camera_type: 'Loại camera',
      label_cam_pixel_type: 'Kiểu pixel',
      label_dma_count: 'Số kênh DMA',
      label_stream_path_count: 'Số đường stream grabber',
      help_dma_count_separate: 'Trên frame grabber lập trình được, số kênh DMA có thể khác số camera.',
      per_dma_title: 'Cấu hình bộ đệm theo từng DMA',
      help_per_dma_dims: 'Kích thước bộ đệm DMA và định dạng pixel có thể khác ảnh cảm biến và các kênh DMA khác. Số bộ đệm host được cấu hình cho từng kênh DMA.',
      label_dma_pixel_type: 'Kiểu pixel',
      placeholder_optional_same_as_camera: 'tùy chọn — giống camera',
      label_dma_n: 'DMA {n}',
      label_cam_dma_width: 'Chiều rộng bộ đệm DMA',
      label_cam_dma_height: 'Chiều cao bộ đệm DMA',
      label_host_buffers_per_dma: 'Bộ đệm host',
      help_dma_pylon: 'Với tuyến pylon SDK, đây là đường stream grabber/bộ đệm, không phải DMA Framegrabber SDK trừ khi phần cứng hỗ trợ.',
      label_trigger_mode: 'Chế độ trigger', label_programming_language: 'Ngôn ngữ lập trình', label_operating_system: 'Hệ điều hành',
      label_target_llm: 'LLM đích', label_prompt_language: 'Ngôn ngữ prompt', label_output_style: 'Phong cách đầu ra', legend_options: 'Tùy chọn prompt',
      detected_topics_title: 'Chủ đề phát hiện', no_topics_text: 'Chưa phát hiện chủ đề. Nhập vào mô tả ứng dụng hoặc tóm tắt quy trình.',
      snippets_summary: 'Snippet đã kích hoạt', btn_load_example: 'Tải ví dụ', btn_reset: 'Đặt lại tất cả',
      preview_heading: 'Xem trước prompt trực tiếp', route_framegrabber: 'Tuyến Basler Framegrabber SDK', route_pylon: 'Tuyến Basler pylon SDK',
      btn_copy: 'Sao chép prompt', btn_download: 'Tải prompt dạng .txt', btn_refresh: 'Làm mới prompt',
      copy_success: 'Đã sao chép prompt vào clipboard.', copy_fail: 'Không thể sao chép. Chọn văn bản xem trước thủ công.',
      footer_text: 'Chỉ phía client. Không theo dõi. Không API bên ngoài.',
      footer_autosave: 'Cấu hình được lưu cục bộ trong trình duyệt này.',
      warn_interface_card: 'Lựa chọn này là thẻ giao diện, không phải framegrabber lập trình được. Prompt sẽ hướng triển khai qua Basler pylon SDK.',
      warn_interface_route: 'Giao diện camera đã chọn thường được xử lý qua Basler pylon SDK, không phải Basler Framegrabber SDK.',
      warn_cof: 'CoaXPress-over-Fiber chỉ được hỗ trợ trên framegrabber Basler có hỗ trợ CoF rõ ràng (vd. imaFlex 2 Dual 100). Kiểm tra tương thích phần cứng.',
      warn_applet: 'Xử lý applet không áp dụng cho thẻ giao diện hoặc tuyến pylon SDK.',
      hw_group_framegrabber: 'Framegrabber Basler', hw_group_interface_card: 'Thẻ giao diện Basler',
      topic_trigger_timing: 'Trigger / Thời gian', topic_dma_buffering: 'DMA / Bộ đệm', topic_line_scan_tdi: 'Line Scan / TDI',
      topic_cxp_link: 'Cấu hình liên kết CoaXPress', topic_pylon_route: 'Tuyến pylon SDK', topic_events_callbacks: 'Sự kiện / Callback',
      topic_applet_fpga: 'Applet / Xử lý FPGA', topic_multi_camera: 'Thu thập đa camera', topic_image_correction: 'Tham số hiệu chỉnh ảnh',
      cat_acquisition_control: 'Điều khiển thu thập', cat_buffering: 'Bộ đệm', cat_camera_type: 'Loại camera', cat_interface: 'Giao diện',
      cat_sdk_routing: 'Định tuyến SDK', cat_processing: 'Xử lý',
      iface_cxp12: 'CXP-12', iface_cxp6: 'CXP-6', iface_camera_link: 'Camera Link', iface_gige: 'GigE Vision',
      iface_5gige: '5GigE Vision', iface_10gige: '10GigE Vision', iface_usb3: 'USB3 Vision', iface_cof: 'CoaXPress-over-Fiber', iface_other: 'Khác',
      applet_loaded: 'Dùng applet đã tải', applet_load_name: 'Tải applet theo tên', applet_name_avail: 'Có tên applet',
      applet_name_na: 'Không có tên applet', applet_na: 'Không áp dụng',
      pixel_mono8: 'Mono8', pixel_mono10: 'Mono10', pixel_mono12: 'Mono12', pixel_mono16: 'Mono16',
      pixel_bayer8: 'Bayer8', pixel_bayer10: 'Bayer10', pixel_bayer12: 'Bayer12', pixel_rgb8: 'RGB8', pixel_other: 'Khác',
      cam_area: 'Quét vùng', cam_line: 'Quét dòng', cam_tdi: 'TDI', cam_unknown: 'Không rõ / chưa chỉ định',
      trig_free: 'Chạy tự do', trig_software: 'Trigger phần mềm', trig_frame: 'Trigger khung ngoài', trig_line: 'Trigger dòng ngoài',
      trig_encoder: 'Trigger encoder / trục', trig_enable: 'Tín hiệu enable', trig_unspec: 'Chưa chỉ định',
      lang_cpp17: 'C++17', lang_cpp20: 'C++20', lang_c: 'C', lang_python: 'Python', lang_pseudo: 'Mã giả',
      os_windows: 'Windows', os_linux: 'Linux', os_unspec: 'Chưa chỉ định',
      llm_chatgpt: 'ChatGPT', llm_claude: 'Claude', llm_copilot: 'Copilot', llm_cursor: 'Cursor AI', llm_generic: 'LLM chung',
      plang_en: 'Tiếng Anh', plang_de: 'Tiếng Đức', plang_ko: 'Tiếng Hàn', plang_zh: 'Tiếng Trung giản thể', plang_ja: 'Tiếng Nhật', plang_vi: 'Tiếng Việt',
      help_auto_acq_applet: 'Trên framegrabber acquisition, tên applet .dll chuẩn được suy ra tự động từ số camera và quét vùng/dòng (vd. 2 camera vùng → DualArea).',
      label_auto_applet_readonly: 'Tên applet (tự động)',
      style_minimal: 'Ví dụ tối thiểu hoạt động', style_production: 'Ví dụ kiểu sản xuất mạnh', style_debug: 'Chương trình debug / chẩn đoán',
      style_adaptation: 'Thích ứng quy trình hiện có', style_architecture: 'Đề xuất kiến trúc', style_integration: 'Kế hoạch tích hợp từng bước',
      cb_error_handling: 'Bắt buộc xử lý lỗi mạnh', cb_timeout: 'Bắt buộc xử lý timeout', cb_cleanup: 'Bắt buộc dọn tài nguyên rõ ràng',
      cb_buffer_alloc: 'Bắt buộc cấp phát bộ đệm rõ ràng', cb_acq_start_stop: 'Bắt buộc start/stop thu thập rõ ràng',
      cb_separate_params: 'Tách tham số camera và phần cứng thu thập', cb_cmake: 'Bao gồm CMakeLists.txt',
      cb_assumptions: 'Yêu cầu giả định và TODO', cb_reject_pylon: 'Từ chối giải pháp chỉ pylon khi chọn framegrabber thật',
      cb_doc_check: 'Yêu cầu kiểm tra tài liệu hiện tại', cb_deep_analysis: 'Bắt buộc phân tích sâu',
      cb_hallucination: 'Cảnh báo gọi SDK ảo', cb_multi_sync: 'Bao gồm ghi chú đồng bộ đa camera',
      cb_image_access: 'Bao gồm ví dụ truy cập dữ liệu ảnh', cb_buffer_requeue: 'Bao gồm ví dụ requeue bộ đệm',
      snippet_trigger_timing: 'Xem xét cấu hình trigger, nguồn trigger, chế độ trigger, thời gian, hành vi timeout và start/stop thu thập sạch.',
      snippet_dma_buffering: 'Thể hiện rõ chiến lược bộ đệm và DMA: số bộ đệm, cấp phát, hàng đợi, requeue, timeout, lỗi và dọn dẹp.',
      snippet_line_scan_tdi: 'Xem xét khía cạnh line-scan hoặc TDI: trigger dòng, encoder, chiều cao ảnh từ dòng, timeout dòng thiếu và hành vi khung một phần.',
      snippet_cxp_link: 'Xem xét cấu hình liên kết CoaXPress, phát hiện camera, độ rộng link, tốc độ dữ liệu, ánh xạ cổng board và chẩn đoán.',
      snippet_pylon_route: 'Nếu thu thập dựa trên GigE Vision, 5GigE Vision, 10GigE Vision hoặc USB3 Vision, định tuyến yêu cầu mã tới Basler pylon SDK.',
      snippet_events_callbacks: 'Xem xét xử lý ảnh theo sự kiện hoặc callback, đồng thời yêu cầu biến thể polling hoặc chờ mạnh nếu SDK yêu cầu.',
      snippet_applet_fpga: 'Xem xét tải applet, tham số applet, cấu hình cổng và tách logic applet với mã thu thập SDK chung.',
      snippet_multi_camera: 'Xem xét nhiều camera: ánh xạ board-cổng, kênh DMA hoặc stream riêng, start đồng bộ, bộ đệm độc lập, xử lý lỗi từng camera và tắt sạch mọi stream.',
      snippet_image_correction: 'Xem xét tham số camera hoặc applet cho gain, offset, hiệu chỉnh flat-field hoặc tiền xử lý tương tự; đánh dấu tham số chưa biết là giả định.'
    },
    de: {
      site_title: 'Basler Framegrabber SDK Prompt-Generator',
      site_subtitle: 'Hochwertige LLM-Prompts für robusten Basler-Erfassungscode erstellen',
      privacy_label: 'Datenschutz',
      privacy_text: 'Alle Eingaben bleiben lokal in Ihrem Browser. Es werden keine Daten übertragen.',
      confidential_label: 'Vertraulichkeit',
      confidential_text: 'Prüfen Sie den generierten Prompt vor dem Teilen. Keine vertraulichen Kundendaten, Quellcode, Zugangsdaten, Seriennummern, Lizenzschlüssel oder unveröffentlichte Projektdetails einfügen.',
      guidance_label: 'Hinweis',
      guidance_text: 'Wenn Sie bestehenden Erfassungscode aus einem anderen SDK oder System haben, fassen Sie zuerst mit einem KI-Assistenten zusammen, was der Code tut. Keinen vertraulichen Quellcode einfügen, sofern nicht erlaubt. Bevorzugen Sie eine technische Zusammenfassung: Was wird erfasst? Welche Kamera- und Erfassungsparameter sind konfiguriert? Wie werden Puffer, Trigger, DMA-Kanäle, Events, Timeouts und Cleanup gehandhabt?',
      support_label: 'Offizieller Support',
      support_text_before: 'Dieses Tool hilft nur beim Erstellen von LLM-Prompts. Bei Fragen zu Basler-Kameras, Framegrabbern, SDKs oder Ihrer Anwendung können Sie auch ',
      support_link_text: 'Basler Support',
      support_text_after: ' kontaktieren.',
      inputs_heading: 'Konfiguration',
      label_app_description: 'Anwendungsbeschreibung',
      placeholder_app_description: 'Beispiel: Zwei CXP-12-Kameras, jeweils mit x2-Links. Erfassung startet per externem Frame-Trigger. Mono8-Bilder werden über separate DMA-Kanäle in Host-Puffer übertragen. Das Programm soll Timeout-Handling, Bildzugriff, Puffer-Requeue und sauberes Erfassungsende zeigen.',
      label_workflow_summary: 'Zusammenfassung bestehender Erfassungs-Workflow',
      help_workflow_summary: 'Optional. Beschreiben Sie, wie Ihre bestehende Erfassungs-Pipeline heute funktioniert—Trigger, Puffer, DMA, Events, Timeouts und Shutdown. Keinen vertraulichen Quellcode einfügen. Die Anwendungsbeschreibung oben definiert das Ziel-Basler-Setup.',
      placeholder_workflow_summary: 'Beispiel: Bestehendes Programm öffnet zwei Kameras, reserviert vier Puffer pro Kanal, wartet auf Frame-Events mit 5 s Timeout, kopiert Bilddaten in eine Queue und requeued Puffer. Shutdown stoppt die Erfassung und gibt Handles in umgekehrter Reihenfolge frei.',
      label_camera_count: 'Anzahl Kameras', label_camera_interface: 'Kamera-Interface', label_hardware: 'Basler-Erfassungshardware',
      label_applet_handling: 'Applet-Handling', label_applet_name: 'Applet- / .hap-Name', label_standard_acq_applet: 'Standard-Erfassungs-Applet',
      label_pixel_type: 'Pixeltyp', label_camera_type: 'Kameratyp', label_image_width: 'Bildbreite', label_image_height: 'Bildhöhe',
      label_dma_channels: 'Anzahl DMA-Kanäle',
      per_camera_title: 'Bildkonfiguration pro Kamera',
      help_per_camera_dims: 'Kameratyp, Pixelformat und Bildabmessungen können pro Kamera unterschiedlich sein.',
      label_cam_camera_type: 'Kameratyp',
      label_cam_pixel_type: 'Pixeltyp',
      label_dma_count: 'Anzahl DMA-Kanäle',
      label_stream_path_count: 'Anzahl Stream-Grabber-Pfade',
      help_dma_count_separate: 'Bei programmierbaren Framegrabbern kann die Anzahl der DMA-Kanäle von der Kameraanzahl abweichen.',
      per_dma_title: 'Pufferkonfiguration pro DMA',
      help_per_dma_dims: 'DMA-Puffergröße und Pixelformat können vom Sensorbild und von anderen DMA-Kanälen abweichen. Die Host-Pufferanzahl wird pro DMA-Kanal konfiguriert.',
      label_dma_pixel_type: 'Pixeltyp',
      placeholder_optional_same_as_camera: 'optional — wie Kamera',
      label_dma_n: 'DMA {n}',
      label_cam_dma_width: 'DMA-Pufferbreite',
      label_cam_dma_height: 'DMA-Pufferhöhe',
      label_host_buffers_per_dma: 'Host-Puffer',
      help_dma_pylon: 'Bei pylon-SDK-Route entspricht dies Stream-Grabber-/Pufferpfaden, nicht explizitem Framegrabber-SDK-DMA.',
      label_trigger_mode: 'Trigger-Modus', label_programming_language: 'Programmiersprache', label_operating_system: 'Betriebssystem',
      label_target_llm: 'Ziel-LLM', label_prompt_language: 'Prompt-Sprache', label_output_style: 'Ausgabestil', legend_options: 'Prompt-Optionen',
      detected_topics_title: 'Erkannte Themen', no_topics_text: 'Noch keine Themen erkannt. Text in Anwendungsbeschreibung oder Workflow-Zusammenfassung eingeben.',
      snippets_summary: 'Aktivierte Snippets', btn_load_example: 'Beispiel laden', btn_reset: 'Alles zurücksetzen',
      preview_heading: 'Live-Prompt-Vorschau', route_framegrabber: 'Basler Framegrabber SDK-Route', route_pylon: 'Basler pylon SDK-Route',
      btn_copy: 'Prompt kopieren', btn_download: 'Prompt als .txt herunterladen', btn_refresh: 'Prompt aktualisieren',
      copy_success: 'Prompt in Zwischenablage kopiert.', copy_fail: 'Kopieren fehlgeschlagen. Vorschau-Text manuell auswählen.',
      footer_text: 'Nur clientseitig. Kein Tracking. Keine externen APIs.',
      footer_autosave: 'Ihre Konfiguration wird lokal in diesem Browser gespeichert.',
      warn_interface_card: 'Diese Auswahl ist eine Interface-Karte, kein programmierbarer Framegrabber. Der Prompt leitet die Implementierung zum Basler pylon SDK.',
      warn_interface_route: 'Das gewählte Kamera-Interface wird typischerweise über das Basler pylon SDK abgewickelt, nicht über das Basler Framegrabber SDK.',
      warn_cof: 'CoaXPress-over-Fiber wird nur auf Basler-Framegrabbern mit expliziter CoF-Unterstützung unterstützt (z. B. imaFlex 2 Dual 100). Hardware-Kompatibilität prüfen.',
      warn_applet: 'Applet-Handling gilt nicht für Interface-Karten oder pylon-SDK-Route.',
      warn_acquisition_hw: 'Acquisition-Framegrabber gewählt (z. B. imaWorx, marathon ACL/ACX-QP). Standard-.dll-Applets; VisualApplets-.hap nur auf programmierbaren Framegrabbern.',
      hw_group_programmable: 'Basler programmierbare Framegrabber', hw_group_acquisition: 'Basler Acquisition-Framegrabber', hw_group_interface_card: 'Basler Interface-Karten',
      help_standard_acq: 'Standard-Erfassungs-Applets sind .dll-Dateien mit Namen wie SingleArea, SingleLine, DualArea, DualLine, QuadArea, QuadLine.',
      help_standard_acq_imaflex2: 'imaFlex 2 Dual 100: nur SingleLine als Standard-.dll verfügbar. DualLine erfordert VisualApplets-.hap.',
      help_applet_name: 'Bei VisualApplets-.hap den Applet-Dateinamen eingeben. Bei Standard-.dll leer lassen, sofern kein spezifischer Build-Name nötig ist.',
      help_auto_acq_applet: 'Bei Acquisition-Framegrabbern wird der Standard-.dll-Applet-Name automatisch aus Kameraanzahl und Flächen-/Linienscan abgeleitet (z. B. 2 Flächenkameras → DualArea).',
      label_auto_applet_readonly: 'Applet-Name (automatisch)',
      topic_trigger_timing: 'Trigger / Timing', topic_dma_buffering: 'DMA / Pufferung', topic_line_scan_tdi: 'Linienscan / TDI',
      topic_cxp_link: 'CoaXPress-Link-Konfiguration', topic_pylon_route: 'pylon SDK-Route', topic_events_callbacks: 'Events / Callbacks',
      topic_applet_fpga: 'Applet / FPGA-Verarbeitung', topic_multi_camera: 'Multi-Kamera-Erfassung', topic_image_correction: 'Bildkorrektur-Parameter',
      cat_acquisition_control: 'Erfassungssteuerung', cat_buffering: 'Pufferung', cat_camera_type: 'Kameratyp', cat_interface: 'Interface',
      cat_sdk_routing: 'SDK-Routing', cat_processing: 'Verarbeitung',
      iface_cxp12: 'CXP-12', iface_cxp6: 'CXP-6', iface_camera_link: 'Camera Link', iface_gige: 'GigE Vision',
      iface_5gige: '5GigE Vision', iface_10gige: '10GigE Vision', iface_usb3: 'USB3 Vision', iface_cof: 'CoaXPress-over-Fiber', iface_other: 'Sonstige',
      applet_loaded: 'Bereits geladenes Applet verwenden', applet_load_name: 'Applet nach Name laden', applet_name_avail: 'Applet-Name verfügbar',
      applet_name_na: 'Applet-Name nicht verfügbar', applet_na: 'Nicht anwendbar', applet_standard_dll: 'Standard-Erfassungs-Applet (.dll)', applet_visualapplets_hap: 'VisualApplets-Applet (.hap)',
      std_acq_unspec: 'Nicht angegeben', std_acq_single_area: 'SingleArea (eine Flächenkamera)', std_acq_single_line: 'SingleLine (eine Linienkamera)',
      std_acq_dual_area: 'DualArea (zwei Flächenkameras)', std_acq_dual_line: 'DualLine (zwei Linienkameras)',
      std_acq_quad_area: 'QuadArea (vier Flächenkameras)', std_acq_quad_line: 'QuadLine (vier Linienkameras)', std_acq_visualapplets_hap: 'Individuelles VisualApplets-Applet (.hap)',
      pixel_mono8: 'Mono8', pixel_mono10: 'Mono10', pixel_mono12: 'Mono12', pixel_mono16: 'Mono16',
      pixel_bayer8: 'Bayer8', pixel_bayer10: 'Bayer10', pixel_bayer12: 'Bayer12', pixel_rgb8: 'RGB8', pixel_other: 'Sonstige',
      cam_area: 'Flächenscan', cam_line: 'Linienscan', cam_tdi: 'TDI', cam_unknown: 'Unbekannt / nicht angegeben',
      trig_free: 'Free Run', trig_software: 'Software-Trigger', trig_frame: 'Externer Frame-Trigger', trig_line: 'Externer Line-Trigger',
      trig_encoder: 'Encoder / Wellen-Trigger', trig_enable: 'Enable-Signal', trig_unspec: 'Nicht angegeben',
      lang_cpp17: 'C++17', lang_cpp20: 'C++20', lang_c: 'C', lang_python: 'Python', lang_pseudo: 'Pseudocode',
      os_windows: 'Windows', os_linux: 'Linux', os_unspec: 'Nicht angegeben',
      llm_chatgpt: 'ChatGPT', llm_claude: 'Claude', llm_copilot: 'Copilot', llm_cursor: 'Cursor AI', llm_generic: 'Allgemeines LLM',
      plang_en: 'Englisch', plang_de: 'Deutsch', plang_ko: 'Koreanisch', plang_zh: 'Vereinfachtes Chinesisch', plang_ja: 'Japanisch', plang_vi: 'Vietnamesisch',
      style_minimal: 'Minimales lauffähiges Beispiel', style_production: 'Robustes Produktionsbeispiel', style_debug: 'Debug-/Diagnoseprogramm',
      style_adaptation: 'Anpassung bestehender Workflows', style_architecture: 'Architekturvorschlag', style_integration: 'Schrittweise Integrationsplanung',
      cb_error_handling: 'Robuste Fehlerbehandlung erzwingen', cb_timeout: 'Timeout-Handling erzwingen', cb_cleanup: 'Explizite Ressourcenfreigabe erzwingen',
      cb_buffer_alloc: 'Explizite Pufferallokation erzwingen', cb_acq_start_stop: 'Expliziten Erfassungsstart/-stopp erzwingen',
      cb_separate_params: 'Kamera- und Erfassungshardware-Parameter trennen', cb_cmake: 'CMakeLists.txt einschließen',
      cb_assumptions: 'Annahmen und TODOs verlangen', cb_reject_pylon: 'Nur-pylon-Lösung bei echtem Framegrabber ablehnen',
      cb_doc_check: 'Aktuelle Dokumentation verlangen', cb_deep_analysis_locked: 'Tiefe Analyse / Extended Thinking (immer aktiv)',
      cb_hallucination: 'Vor erfundenen SDK-Aufrufen warnen', cb_multi_sync: 'Multi-Kamera-Synchronisationshinweise einbeziehen',
      cb_image_access: 'Beispiel für Bilddatenzugriff einbeziehen', cb_buffer_requeue: 'Beispiel für Puffer-Requeueing einbeziehen',
      snippet_trigger_timing: 'Trigger-Konfiguration, Trigger-Quelle, Trigger-Modus, Timing, Timeout-Verhalten und sauberen Erfassungsstart/-stopp berücksichtigen.',
      snippet_dma_buffering: 'Puffer- und DMA-Strategie explizit zeigen: Pufferanzahl, Allokation, Queueing, Requeueing, Timeout, Fehlerfälle und Cleanup.',
      snippet_line_scan_tdi: 'Linienscan- oder TDI-spezifische Aspekte berücksichtigen: Linien-Trigger, Encoder, Bildhöhe aus Zeilen, Timeout bei fehlenden Zeilen, Teilframe-Verhalten.',
      snippet_cxp_link: 'CoaXPress-Link-Konfiguration, Kameraerkennung, Link-Breite, Datenrate, Board-Port-Mapping und Diagnose berücksichtigen.',
      snippet_pylon_route: 'Bei GigE Vision, 5GigE Vision, 10GigE Vision oder USB3 Vision die Code-Anfrage zum Basler pylon SDK routen.',
      snippet_events_callbacks: 'Event- oder Callback-basierte Bildverarbeitung berücksichtigen; bei Bedarf robuste Polling- oder Wait-Variante anfordern.',
      snippet_applet_fpga: 'Applet-Laden, Applet-Parameter, Port-Konfiguration und Trennung von Applet-Logik und generischem SDK-Erfassungscode berücksichtigen.',
      snippet_multi_camera: 'Mehrere Kameras berücksichtigen: Board-Port-Mapping, separate DMA-/Stream-Kanäle, synchroner Start, unabhängige Puffer, Fehlerbehandlung pro Kamera, sauberer Shutdown aller Streams.',
      snippet_image_correction: 'Kamera- oder Applet-Parameter für Gain, Offset, Flatfield-Korrektur o. Ä. berücksichtigen; unbekannte Parameter als Annahmen markieren.'
    }
  };

  function t(key) {
    const bucket = UI_STRINGS[uiLang] || UI_STRINGS.en;
    return bucket[key] || UI_STRINGS.en[key] || key;
  }

  function tp(key, plang) {
    const bucket = UI_STRINGS[plang] || UI_STRINGS.en;
    return bucket[key] || UI_STRINGS.en[key] || key;
  }

  function ptext(key, plang, vars) {
    const bucket = (typeof PROMPT_BODIES !== 'undefined' && PROMPT_BODIES[plang]) || PROMPT_BODIES.en;
    let text = (bucket && bucket[key] !== undefined ? bucket[key] : PROMPT_BODIES.en[key]) || key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        text = text.split('{' + k + '}').join(String(vars[k]));
      });
    }
    return text;
  }

  function getPromptLang() {
    return uiLang || 'en';
  }

  function getPromptSections(plang) {
    const lang = plang || getPromptLang();
    const sections = (typeof PROMPT_SECTIONS !== 'undefined' && PROMPT_SECTIONS[lang]) || PROMPT_SECTIONS.en;
    return sections || PROMPT_SECTIONS.en;
  }

  function formatImageSize(width, height, plang) {
    const w = (width && String(width).trim()) ? String(width).trim() : ptext('not_specified', plang);
    const h = (height && String(height).trim()) ? String(height).trim() : ptext('not_specified', plang);
    return w + ' × ' + h;
  }

  function readPerCameraConfigs() {
    const rows = document.querySelectorAll('#per-camera-fields .per-camera-row');
    return Array.from(rows).map((row) => {
      const typeEl = row.querySelector('[data-field="camera-type"]');
      return {
        cameraType: typeEl ? typeEl.value : 'area',
        pixelType: (row.querySelector('[data-field="pixel-type"]') || {}).value || 'mono8',
        imageWidth: (row.querySelector('[data-field="image-width"]') || {}).value || '',
        imageHeight: (row.querySelector('[data-field="image-height"]') || {}).value || ''
      };
    });
  }

  function readPerDmaConfigs() {
    const rows = document.querySelectorAll('#per-dma-fields .per-camera-row');
    return Array.from(rows).map((row) => ({
      pixelType: (row.querySelector('[data-field="pixel-type"]') || {}).value || '',
      dmaWidth: (row.querySelector('[data-field="dma-width"]') || {}).value || '',
      dmaHeight: (row.querySelector('[data-field="dma-height"]') || {}).value || '',
      hostBuffers: (row.querySelector('[data-field="host-buffers"]') || {}).value || '4'
    }));
  }

  function renderPerCameraFields(count, preserve) {
    const container = $('per-camera-fields');
    if (!container) return;
    const n = Math.max(1, parseInt(count, 10) || 1);
    const existing = preserve ? readPerCameraConfigs() : [];
    container.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const cfg = existing[i] || {};
      const row = document.createElement('div');
      row.className = 'per-camera-row';
      row.dataset.cameraIndex = String(i);

      const title = document.createElement('p');
      title.className = 'per-camera-row-title';
      title.textContent = t('label_camera_n').replace('{n}', String(i + 1));
      row.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'per-camera-grid';

      const typeGroup = document.createElement('div');
      typeGroup.className = 'form-group';
      const typeLabel = document.createElement('label');
      typeLabel.textContent = t('label_cam_camera_type');
      typeLabel.setAttribute('for', 'cam-' + i + '-camera-type');
      typeGroup.appendChild(typeLabel);
      typeGroup.appendChild(createCameraTypeSelect('cam-' + i + '-camera-type', cfg.cameraType || 'area'));
      grid.appendChild(typeGroup);

      const pixelGroup = document.createElement('div');
      pixelGroup.className = 'form-group';
      const pixelLabel = document.createElement('label');
      pixelLabel.textContent = t('label_cam_pixel_type');
      pixelLabel.setAttribute('for', 'cam-' + i + '-pixel-type');
      pixelGroup.appendChild(pixelLabel);
      pixelGroup.appendChild(createPixelTypeSelect('cam-' + i + '-pixel-type', cfg.pixelType || 'mono8', false));
      grid.appendChild(pixelGroup);

      [
        { field: 'image-width', label: 'label_cam_image_width', value: cfg.imageWidth || '', min: 1 },
        { field: 'image-height', label: 'label_cam_image_height', value: cfg.imageHeight || '', min: 1 }
      ].forEach((f) => {
        const group = document.createElement('div');
        group.className = 'form-group';
        const label = document.createElement('label');
        label.textContent = t(f.label);
        label.setAttribute('for', 'cam-' + i + '-' + f.field);
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'cam-' + i + '-' + f.field;
        input.dataset.field = f.field;
        input.min = String(f.min);
        if (f.value) input.value = f.value;
        group.appendChild(label);
        group.appendChild(input);
        grid.appendChild(group);
      });
      row.appendChild(grid);
      container.appendChild(row);
    }
  }

  function renderPerDmaFields(count, preserve) {
    const container = $('per-dma-fields');
    if (!container) return;
    const n = Math.max(1, parseInt(count, 10) || 1);
    const existing = preserve ? readPerDmaConfigs() : [];
    container.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const cfg = existing[i] || {};
      const row = document.createElement('div');
      row.className = 'per-camera-row';
      row.dataset.dmaIndex = String(i);

      const title = document.createElement('p');
      title.className = 'per-camera-row-title';
      title.textContent = t('label_dma_n').replace('{n}', String(i + 1));
      row.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'per-camera-grid';

      const pixelGroup = document.createElement('div');
      pixelGroup.className = 'form-group';
      const pixelLabel = document.createElement('label');
      pixelLabel.textContent = t('label_dma_pixel_type');
      pixelLabel.setAttribute('for', 'dma-' + i + '-pixel-type');
      pixelGroup.appendChild(pixelLabel);
      pixelGroup.appendChild(createPixelTypeSelect('dma-' + i + '-pixel-type', cfg.pixelType || '', true));
      grid.appendChild(pixelGroup);

      [
        { field: 'dma-width', label: 'label_cam_dma_width', value: cfg.dmaWidth || '', min: 1, optional: true },
        { field: 'dma-height', label: 'label_cam_dma_height', value: cfg.dmaHeight || '', min: 1, optional: true },
        { field: 'host-buffers', label: 'label_host_buffers_per_dma', value: cfg.hostBuffers || '4', min: 1 }
      ].forEach((f) => {
        const group = document.createElement('div');
        group.className = 'form-group';
        const label = document.createElement('label');
        label.textContent = t(f.label);
        label.setAttribute('for', 'dma-' + i + '-' + f.field);
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'dma-' + i + '-' + f.field;
        input.dataset.field = f.field;
        input.min = String(f.min);
        if (f.value) input.value = f.value;
        if (f.optional) input.placeholder = t('placeholder_optional_same_as_image');
        group.appendChild(label);
        group.appendChild(input);
        grid.appendChild(group);
      });
      row.appendChild(grid);
      container.appendChild(row);
    }
  }

  function inferCameraCountFromText(text) {
    const lower = (text || '').toLowerCase();
    const patterns = [
      [/\b(?:one|1)\s+cameras?\b|\bcameras?\s+(?:x\s*)?1\b|\bsingle\s+camera\b/, 1],
      [/\b(?:two|2|dual)\s+cameras?\b|\bcameras?\s+(?:x\s*)?2\b|\bdual\s+camera\b|\btwo\s+cxp\b/, 2],
      [/\b(?:three|3|triple)\s+cameras?\b|\bcameras?\s+(?:x\s*)?3\b/, 3],
      [/\b(?:four|4|quad)\s+cameras?\b|\bcameras?\s+(?:x\s*)?4\b|\bquad\s+camera\b/, 4],
      [/\b(?:five|5|penta)\s+cameras?\b|\bcameras?\s+(?:x\s*)?5\b/, 5],
      [/\b(?:six|6)\s+cameras?\b|\bcameras?\s+(?:x\s*)?6\b/, 6],
      [/\b(?:seven|7)\s+cameras?\b/, 7],
      [/\b(?:eight|8)\s+cameras?\b/, 8]
    ];
    for (let p = 0; p < patterns.length; p++) {
      if (patterns[p][0].test(lower)) return patterns[p][1];
    }
    if (/\bper[\s-]camera\b|\beach\s+camera\b|\bmultiple\s+cameras?\b|\bmulti[\s-]camera\b/.test(lower)) {
      return 2;
    }
    return null;
  }

  function checkCameraCountMismatch(state, topics) {
    const combined = state.appDescription + ' ' + state.workflowSummary;
    const inferred = inferCameraCountFromText(combined);
    const selected = parseInt(state.cameraCount, 10) || 1;
    const hasMultiTopic = topics.some((rule) => rule.id === 'multi_camera');
    if (inferred !== null && inferred !== selected) {
      return { show: true, inferred: inferred, selected: selected };
    }
    if (hasMultiTopic && selected < 2) {
      return { show: true, inferred: inferred || 2, selected: selected };
    }
    return { show: false };
  }

  function updateCameraCountWarning(state, topics) {
    const group = $('camera-count-group');
    const warn = $('warning-camera-count-mismatch');
    const input = $('camera-count');
    if (!group || !warn || !input) return;
    const mismatch = checkCameraCountMismatch(state, topics);
    group.classList.toggle('has-mismatch', mismatch.show);
    if (mismatch.show) {
      warn.textContent = t('warn_camera_count_mismatch')
        .replace('{inferred}', String(mismatch.inferred))
        .replace('{selected}', String(mismatch.selected));
      warn.classList.remove('hidden');
    } else {
      warn.textContent = '';
      warn.classList.add('hidden');
    }
  }

  const CAM_TYPE_VALUES = ['area', 'line', 'tdi', 'unknown'];
  const PIXEL_TYPE_VALUES = ['mono8', 'mono10', 'mono12', 'mono16', 'bayer8', 'bayer10', 'bayer12', 'rgb8', 'other'];

  function isLineScanCameraType(type) {
    return type === 'line' || type === 'tdi';
  }

  function cameraScanFamily(type) {
    return isLineScanCameraType(type) ? 'line' : 'area';
  }

  function hasMixedCameraTypes(cameraConfigs) {
    const types = (cameraConfigs || []).map((c) => c.cameraType || 'area');
    if (types.length < 2) return false;
    const families = types.map(cameraScanFamily);
    return families.some((f) => f !== families[0]);
  }

  function deriveAppletFromCameraConfigs(cameraCount, cameraConfigs) {
    const types = (cameraConfigs || []).map((c) => c.cameraType || 'area');
    if (!types.length) return deriveStandardAcqAppletKey(cameraCount, 'area');
    const families = types.map(cameraScanFamily);
    if (families.some((f) => f !== families[0])) return null;
    return deriveStandardAcqAppletKey(cameraCount, types[0]);
  }

  function createCameraTypeSelect(id, value) {
    const select = document.createElement('select');
    select.id = id;
    select.dataset.field = 'camera-type';
    CAM_TYPE_VALUES.forEach((v) => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = t('cam_' + v);
      select.appendChild(o);
    });
    select.value = value || 'area';
    return select;
  }

  function createPixelTypeSelect(id, value, optional) {
    const select = document.createElement('select');
    select.id = id;
    select.dataset.field = 'pixel-type';
    if (optional) {
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = t('placeholder_optional_same_as_camera');
      select.appendChild(empty);
    }
    PIXEL_TYPE_VALUES.forEach((v) => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = t('pixel_' + v);
      select.appendChild(o);
    });
    select.value = value || (optional ? '' : 'mono8');
    return select;
  }

  function deriveStandardAcqAppletKey(cameraCount, cameraType) {
    const count = parseInt(cameraCount, 10) || 1;
    const isLine = cameraType === 'line' || cameraType === 'tdi';
    const prefixMap = { 1: 'single', 2: 'dual', 4: 'quad' };
    const prefix = prefixMap[count];
    if (!prefix) return null;
    return prefix + '_' + (isLine ? 'line' : 'area');
  }

  function enrichState(state) {
    const hw = getHardware(state.hardware);
    const next = Object.assign({}, state);
    next.mixedCameraTypes = hasMixedCameraTypes(state.cameraConfigs);
    if (hw.hwClass === 'acquisition') {
      const key = deriveAppletFromCameraConfigs(state.cameraCount, state.cameraConfigs);
      next.appletAutoDerived = true;
      next.appletHandling = 'standard_dll';
      next.standardAcqApplet = key || 'unspec';
      next.appletName = key ? getStandardAcqDllName(key) : '';
    } else {
      next.appletAutoDerived = false;
    }
    return next;
  }

  function populateLanguageSelect(selectId) {
    const sel = $(selectId);
    if (!sel) return;
    const saved = sel.value;
    sel.innerHTML = '';
    LANG_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.flag + ' ' + t(opt.key);
      sel.appendChild(o);
    });
    if (saved && LANG_OPTIONS.some((o) => o.value === saved)) sel.value = saved;
    else sel.value = 'en';
  }

  function getHardware(id) {
    return HARDWARE_PRODUCTS.find((p) => p.id === id) || HARDWARE_PRODUCTS[0];
  }

  function computeSdkRoute(state) {
    const hw = getHardware(state.hardware);
    if (hw.hwClass === 'interface_card') return 'pylon';
    if (PYLON_INTERFACES.has(state.cameraInterface)) return 'pylon';
    if (FRAMEGRABBER_INTERFACES.has(state.cameraInterface)) {
      if (state.cameraInterface === 'cof' && !hw.cofSupport) return 'framegrabber';
      return 'framegrabber';
    }
    return 'pylon';
  }

  function isFramegrabberRoute(route) {
    return route === 'framegrabber';
  }

  function supportsVisualAppletsHap(hw) {
    return hw.hwClass === 'programmable';
  }

  function supportsStandardAcquisitionDll(hw) {
    return hw.hwClass === 'programmable' || hw.hwClass === 'acquisition';
  }

  function getStandardAcqDllName(value) {
    const map = {
      single_area: 'SingleArea',
      single_line: 'SingleLine',
      dual_area: 'DualArea',
      dual_line: 'DualLine',
      quad_area: 'QuadArea',
      quad_line: 'QuadLine'
    };
    return map[value] || null;
  }

  function buildStandardAcqPromptNote(state, hw, plang) {
    const dll = getStandardAcqDllName(state.standardAcqApplet);
    const lines = [];
    lines.push(ptext('std_all_dll', plang));
    lines.push(ptext('std_names', plang));
    if (hw.hwClass === 'acquisition') {
      if (state.mixedCameraTypes) {
        lines.push(ptext('std_mixed_camera_types', plang));
      } else {
        const primaryType = (state.cameraConfigs && state.cameraConfigs[0]) ? state.cameraConfigs[0].cameraType : 'area';
        const scan = isLineScanCameraType(primaryType) ? ptext('scan_line', plang) : ptext('scan_area', plang);
        if (dll) {
          lines.push(ptext('std_auto_derived', plang, { count: state.cameraCount, scan: scan }));
          lines.push(ptext('std_selected', plang, { name: dll }));
        } else {
          lines.push(ptext('std_auto_unsupported', plang, { count: state.cameraCount }));
        }
      }
    } else if (dll) {
      lines.push(ptext('std_selected', plang, { name: dll }));
    }
    if (hw.id === 'imaflex2-dual-100') {
      lines.push(ptext('imaflex2_single', plang));
      lines.push(ptext('imaflex2_dual_hap', plang));
    }
    if (hw.hwClass === 'programmable' && state.appletHandling === 'visualapplets_hap') {
      lines.push(ptext('hap_load', plang));
      if (state.appletName) lines.push(ptext('hap_name_val', plang, { name: state.appletName }));
    }
    if (hw.hwClass === 'acquisition') {
      lines.push(ptext('acq_only_dll', plang));
    }
    if (hw.hwClass === 'programmable' && hw.id.indexOf('imaflex') === 0) {
      lines.push(ptext('imaflex_both', plang));
    }
    return lines;
  }

  function detectTopics(text) {
    const lower = (text || '').toLowerCase();
    const found = [];
    snippetRules.forEach((rule) => {
      const hit = rule.keywords.some((kw) => lower.indexOf(kw.toLowerCase()) !== -1);
      if (hit) found.push(rule);
    });
    return found;
  }

  function labelForOption(group, value, plang) {
    const map = {
      iface: { cxp12: 'iface_cxp12', cxp6: 'iface_cxp6', camera_link: 'iface_camera_link', gige: 'iface_gige', '5gige': 'iface_5gige', '10gige': 'iface_10gige', usb3: 'iface_usb3', cof: 'iface_cof', other: 'iface_other' },
      applet: { loaded: 'applet_loaded', load_name: 'applet_load_name', name_avail: 'applet_name_avail', name_na: 'applet_name_na', na: 'applet_na', standard_dll: 'applet_standard_dll', visualapplets_hap: 'applet_visualapplets_hap' },
      stdacq: { unspec: 'std_acq_unspec', single_area: 'std_acq_single_area', single_line: 'std_acq_single_line', dual_area: 'std_acq_dual_area', dual_line: 'std_acq_dual_line', quad_area: 'std_acq_quad_area', quad_line: 'std_acq_quad_line', visualapplets_hap: 'std_acq_visualapplets_hap' },
      pixel: { mono8: 'pixel_mono8', mono10: 'pixel_mono10', mono12: 'pixel_mono12', mono16: 'pixel_mono16', bayer8: 'pixel_bayer8', bayer10: 'pixel_bayer10', bayer12: 'pixel_bayer12', rgb8: 'pixel_rgb8', other: 'pixel_other' },
      cam: { area: 'cam_area', line: 'cam_line', tdi: 'cam_tdi', unknown: 'cam_unknown' },
      trig: { free: 'trig_free', software: 'trig_software', frame: 'trig_frame', line: 'trig_line', encoder: 'trig_encoder', enable: 'trig_enable', unspec: 'trig_unspec' },
      lang: { cpp17: 'lang_cpp17', cpp20: 'lang_cpp20', c: 'lang_c', python: 'lang_python', pseudo: 'lang_pseudo' },
      os: { windows: 'os_windows', linux: 'os_linux', unspec: 'os_unspec' },
      llm: { chatgpt: 'llm_chatgpt', claude: 'llm_claude', copilot: 'llm_copilot', cursor: 'llm_cursor', generic: 'llm_generic' },
      plang: { en: 'plang_en', de: 'plang_de', ko: 'plang_ko', zh: 'plang_zh', ja: 'plang_ja', vi: 'plang_vi' },
      style: { minimal: 'style_minimal', production: 'style_production', debug: 'style_debug', adaptation: 'style_adaptation', architecture: 'style_architecture', integration: 'style_integration' }
    };
    const key = (map[group] && map[group][value]) || value;
    return plang ? tp(key, plang) : t(key);
  }

  function getFormState() {
    const opts = {};
    CHECKBOX_OPTIONS.forEach((cb) => {
      const el = $(cb.id);
      opts[cb.id] = cb.locked ? true : (el ? el.checked : cb.default);
    });
    return enrichState({
      appDescription: $('app-description').value.trim(),
      workflowSummary: $('workflow-summary').value.trim(),
      cameraCount: $('camera-count').value,
      cameraConfigs: readPerCameraConfigs(),
      dmaCount: $('dma-count').value,
      dmaConfigs: readPerDmaConfigs(),
      cameraInterface: $('camera-interface').value,
      hardware: $('hardware').value,
      appletHandling: $('applet-handling').value,
      standardAcqApplet: $('standard-acq-applet').value,
      appletName: $('applet-name').value.trim(),
      triggerMode: $('trigger-mode').value,
      programmingLanguage: $('programming-language').value,
      operatingSystem: $('operating-system').value,
      targetLlm: $('target-llm').value,
      outputStyle: $('output-style').value,
      options: opts
    });
  }

  function valOr(text, plang, fallbackKey) {
    if (text && String(text).trim()) return String(text).trim();
    return ptext(fallbackKey || 'not_specified', plang);
  }

  function generatePrompt(rawState) {
    const state = enrichState(rawState);
    const plang = getPromptLang();
    const S = getPromptSections(plang);
    const hw = getHardware(state.hardware);
    const route = computeSdkRoute(state);
    const combinedText = state.appDescription + ' ' + state.workflowSummary;
    const topics = detectTopics(combinedText);
    const isFg = route === 'framegrabber';
    const lines = [];
    const dllName = getStandardAcqDllName(state.standardAcqApplet);

    lines.push('=== ' + S.role + ' ===');
    lines.push(ptext(isFg ? 'role_fg' : 'role_pylon', plang));

    lines.push('');
    lines.push('=== ' + S.deep_analysis + ' ===');
    lines.push(ptext('deep_mandatory', plang));
    lines.push(ptext('deep_' + (state.targetLlm || 'generic'), plang));
    lines.push(ptext('deep_priority', plang));
    lines.push(ptext('hint_' + (state.targetLlm || 'generic'), plang));

    lines.push('');
    lines.push('=== ' + S.documentation + ' ===');
    if (isFg) {
      lines.push('- ' + ptext('doc_fg_1', plang));
      lines.push('- ' + ptext('doc_fg_2', plang));
      lines.push('- ' + ptext('doc_fg_3', plang));
      if (state.options.opt_reject_pylon) lines.push('- ' + ptext('doc_fg_4', plang));
      lines.push('- ' + ptext('doc_fg_5', plang));
    } else {
      lines.push('- ' + ptext('doc_pylon_1', plang));
      lines.push('- ' + ptext('doc_pylon_2', plang));
      lines.push('- ' + ptext('doc_pylon_3', plang));
      lines.push('- ' + ptext('doc_pylon_4', plang));
    }
    if (state.options.opt_doc_check) lines.push('- ' + ptext('doc_crosscheck', plang));

    lines.push('');
    lines.push('=== ' + S.app_desc + ' ===');
    lines.push(valOr(state.appDescription, plang, 'not_provided'));

    lines.push('');
    lines.push('=== ' + S.workflow + ' ===');
    lines.push(valOr(state.workflowSummary, plang, 'not_provided'));

    lines.push('');
    lines.push('=== ' + S.config + ' ===');
    lines.push(ptext('cfg_sdk_route', plang) + ': ' + ptext(isFg ? 'cfg_sdk_fg' : 'cfg_sdk_pylon', plang));
    lines.push(ptext('cfg_num_cameras', plang) + ': ' + valOr(state.cameraCount, plang, 'not_specified'));
    lines.push(ptext('cfg_hardware', plang) + ': ' + hw.name);
    const hwClassKey = hw.hwClass === 'interface_card' ? 'cfg_hw_interface_card' : (hw.hwClass === 'acquisition' ? 'cfg_hw_acquisition' : 'cfg_hw_programmable');
    lines.push(ptext('cfg_hw_class', plang) + ': ' + ptext(hwClassKey, plang));
    lines.push(ptext('cfg_interface', plang) + ': ' + labelForOption('iface', state.cameraInterface, plang));

    const cameraConfigs = (state.cameraConfigs && state.cameraConfigs.length)
      ? state.cameraConfigs
      : [{ cameraType: 'area', pixelType: 'mono8', imageWidth: '', imageHeight: '' }];
    const dmaConfigs = (state.dmaConfigs && state.dmaConfigs.length)
      ? state.dmaConfigs
      : [{ pixelType: '', dmaWidth: '', dmaHeight: '', hostBuffers: '4' }];
    const cameraCount = parseInt(state.cameraCount, 10) || 1;
    const dmaCount = parseInt(state.dmaCount, 10) || 1;
    const multiCameraConfig = cameraConfigs.length > 1 || cameraCount > 1;
    const multiDmaConfig = dmaConfigs.length > 1 || dmaCount > 1;

    if (multiCameraConfig) {
      if (state.mixedCameraTypes) {
        lines.push(ptext('note_mixed_camera_types', plang));
      }
      cameraConfigs.forEach((cfg, index) => {
        const prefix = ptext('cfg_camera_n', plang, { n: index + 1 }) + ' — ';
        lines.push(prefix + ptext('cfg_camera_type', plang) + ': ' + labelForOption('cam', cfg.cameraType || 'area', plang));
        lines.push(prefix + ptext('cfg_pixel', plang) + ': ' + labelForOption('pixel', cfg.pixelType || 'mono8', plang));
        lines.push(prefix + ptext('cfg_image_size', plang) + ': ' + formatImageSize(cfg.imageWidth, cfg.imageHeight, plang));
      });
    } else {
      const cfg = cameraConfigs[0] || {};
      lines.push(ptext('cfg_camera_type', plang) + ': ' + labelForOption('cam', cfg.cameraType || 'area', plang));
      lines.push(ptext('cfg_pixel', plang) + ': ' + labelForOption('pixel', cfg.pixelType || 'mono8', plang));
      lines.push(ptext('cfg_image_size', plang) + ': ' + formatImageSize(cfg.imageWidth, cfg.imageHeight, plang));
    }

    if (isFg) {
      lines.push(ptext('cfg_num_dma', plang) + ': ' + valOr(state.dmaCount, plang, 'not_specified'));
    } else {
      lines.push(ptext('cfg_num_stream_paths', plang) + ': ' + valOr(state.dmaCount, plang, 'not_specified'));
    }
    if (hw.hwClass === 'programmable' && cameraCount !== dmaCount) {
      lines.push(ptext('note_camera_dma_count_diff', plang));
    }
    if (multiDmaConfig || dmaCount > 1) {
      lines.push(ptext('note_image_dma_diff', plang));
      lines.push(ptext('note_pixel_dma_diff', plang));
    }
    dmaConfigs.forEach((cfg, index) => {
      const prefix = multiDmaConfig ? ptext('cfg_dma_n', plang, { n: index + 1 }) + ' — ' : '';
      const refCam = cameraConfigs[Math.min(index, cameraConfigs.length - 1)] || {};
      const dmaPixel = (cfg.pixelType && String(cfg.pixelType).trim())
        ? cfg.pixelType
        : (refCam.pixelType || 'mono8');
      lines.push(prefix + ptext('cfg_dma_pixel', plang) + ': ' + labelForOption('pixel', dmaPixel, plang));
      const dmaW = (cfg.dmaWidth && String(cfg.dmaWidth).trim()) ? cfg.dmaWidth : refCam.imageWidth;
      const dmaH = (cfg.dmaHeight && String(cfg.dmaHeight).trim()) ? cfg.dmaHeight : refCam.imageHeight;
      lines.push(prefix + ptext('cfg_dma_buffer_size', plang) + ': ' + formatImageSize(dmaW, dmaH, plang));
      lines.push(prefix + ptext('cfg_host_buffers_dma', plang) + ': ' + valOr(cfg.hostBuffers, plang, 'not_specified'));
    });
    lines.push(ptext('cfg_trigger', plang) + ': ' + labelForOption('trig', state.triggerMode, plang));
    if (isFramegrabberRoute(route)) {
      lines.push(ptext('cfg_applet_handling', plang) + ': ' + labelForOption('applet', state.appletHandling, plang));
      if (state.appletAutoDerived && dllName) {
        lines.push(ptext('cfg_auto_applet', plang) + ': ' + dllName);
      } else if (state.standardAcqApplet && state.standardAcqApplet !== 'unspec' && state.standardAcqApplet !== 'visualapplets_hap') {
        lines.push(ptext('cfg_std_applet', plang) + ': ' + (dllName || labelForOption('stdacq', state.standardAcqApplet, plang)));
      }
      if (state.appletHandling === 'visualapplets_hap' || state.standardAcqApplet === 'visualapplets_hap') {
        lines.push(ptext('cfg_hap_name', plang) + ': ' + valOr(state.appletName, plang, 'not_specified'));
      } else if (state.appletName && !state.appletAutoDerived) {
        lines.push(ptext('cfg_applet_id', plang) + ': ' + state.appletName);
      } else if (state.appletAutoDerived && dllName) {
        lines.push(ptext('cfg_applet_dll', plang) + ': ' + dllName);
      }
      lines.push('');
      buildStandardAcqPromptNote(state, hw, plang).forEach((note) => lines.push('- ' + note));
    } else {
      lines.push(ptext('cfg_applet_na', plang));
    }
    lines.push(ptext('cfg_os', plang) + ': ' + labelForOption('os', state.operatingSystem, plang));
    lines.push(ptext('cfg_lang', plang) + ': ' + labelForOption('lang', state.programmingLanguage, plang));
    lines.push(ptext('cfg_style', plang) + ': ' + labelForOption('style', state.outputStyle, plang));

    if (!isFg && !PYLON_INTERFACES.has(state.cameraInterface) && state.cameraInterface !== 'cof') {
      lines.push('');
      lines.push(ptext('note_interface_pylon', plang));
    }
    if (hw.hwClass === 'interface_card') {
      lines.push(ptext('note_interface_card', plang));
    }

    lines.push('');
    lines.push('=== ' + S.topics + ' ===');
    if (topics.length === 0) {
      lines.push(ptext('none_detected', plang));
    } else {
      topics.forEach((rule) => {
        lines.push('- ' + tp(rule.labelKey, plang) + ' [' + tp(rule.categoryKey, plang) + ']: ' + tp(rule.snippetKey, plang));
      });
    }

    lines.push('');
    lines.push('=== ' + S.output + ' ===');
    const reqs = [];
    const langLabel = labelForOption('lang', state.programmingLanguage, plang);
    reqs.push(ptext('req_complete', plang, { lang: langLabel }));
    if (state.options.opt_cmake) reqs.push(ptext('req_cmake', plang));
    if (state.options.opt_error_handling) reqs.push(ptext('req_error', plang));
    reqs.push(ptext('req_raii', plang));
    if (state.options.opt_timeout) reqs.push(ptext('req_timeout', plang));
    if (isFramegrabberRoute(route)) {
      reqs.push(ptext('req_board', plang));
      if (state.appletHandling !== 'na') {
        if (dllName && (state.appletHandling === 'standard_dll' || state.appletAutoDerived)) {
          reqs.push(ptext('req_std_dll', plang, { name: dllName }));
        } else if (state.appletHandling === 'standard_dll' || (state.standardAcqApplet && state.standardAcqApplet !== 'unspec' && state.standardAcqApplet !== 'visualapplets_hap')) {
          reqs.push(ptext('req_std_dll_generic', plang));
        }
        if (state.appletHandling === 'visualapplets_hap' || state.standardAcqApplet === 'visualapplets_hap') {
          reqs.push(ptext('req_hap', plang));
        }
        reqs.push(ptext('req_applet', plang));
      }
      reqs.push(ptext('req_ports', plang));
      if (state.options.opt_separate_params) reqs.push(ptext('req_separate', plang));
      if (state.options.opt_buffer_alloc) reqs.push(ptext('req_buffers', plang));
      reqs.push(ptext('req_dma', plang));
    } else {
      reqs.push(ptext('req_device', plang));
      reqs.push(ptext('req_stream', plang));
      if (state.options.opt_buffer_alloc) reqs.push(ptext('req_pylon_buf', plang));
    }
    if (state.options.opt_acq_start_stop) reqs.push(ptext('req_acq', plang));
    reqs.push(ptext('req_loop', plang));
    if (state.options.opt_image_access) reqs.push(ptext('req_image', plang));
    if (state.options.opt_buffer_requeue) {
      reqs.push(ptext(isFg ? 'req_requeue_fg' : 'req_requeue_pylon', plang));
    }
    reqs.push(ptext('req_shutdown', plang));
    if (state.options.opt_assumptions) reqs.push(ptext('req_assumptions', plang));
    if (state.options.opt_hallucination) reqs.push(ptext('req_no_hallucinate', plang));
    if (state.programmingLanguage !== 'pseudo') reqs.push(ptext('req_no_pseudo', plang));
    if (state.programmingLanguage !== 'pseudo' && state.outputStyle !== 'architecture') {
      reqs.push(ptext('req_no_arch', plang));
    }
    if (state.options.opt_multi_sync) reqs.push(ptext('req_multi_sync', plang));
    reqs.forEach((r) => lines.push('- ' + r));

    lines.push('');
    lines.push('=== ' + S.warning + ' ===');
    lines.push(ptext('warning_final', plang));

    return { text: lines.join('\n'), route, topics, hw };
  }

  function populateSelect(selectId, options, group) {
    const sel = $(selectId);
    sel.innerHTML = '';
    options.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = labelForOption(group, opt.value);
      sel.appendChild(o);
    });
  }

  function populateHardwareSelect() {
    const sel = $('hardware');
    const current = sel.value;
    sel.innerHTML = '';
    const groups = [
      { key: 'programmable', labelKey: 'hw_group_programmable' },
      { key: 'acquisition', labelKey: 'hw_group_acquisition' },
      { key: 'interface_card', labelKey: 'hw_group_interface_card' }
    ];
    groups.forEach((g) => {
      const og = document.createElement('optgroup');
      og.label = t(g.labelKey);
      HARDWARE_PRODUCTS.filter((p) => p.hwClass === g.key).forEach((p) => {
        const o = document.createElement('option');
        o.value = p.id;
        o.textContent = p.name;
        og.appendChild(o);
      });
      if (og.children.length) sel.appendChild(og);
    });
    if (current && getHardware(current)) sel.value = current;
  }

  function populateStandardAcqSelect(hw) {
    const sel = $('standard-acq-applet');
    const saved = sel.value || 'unspec';
    sel.innerHTML = '';
    let options = STANDARD_ACQ_APPLETS;
    if (hw && hw.id === 'imaflex2-dual-100') {
      options = STANDARD_ACQ_APPLETS.filter((o) => ['unspec', 'single_line', 'visualapplets_hap'].indexOf(o.value) !== -1);
    }
    options.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = t(opt.key);
      sel.appendChild(o);
    });
    if (options.some((o) => o.value === saved)) sel.value = saved;
    else sel.value = 'unspec';
  }

  function buildCheckboxes() {
    const container = $('checkbox-container');
    container.innerHTML = '';
    CHECKBOX_OPTIONS.forEach((cb) => {
      const label = document.createElement('label');
      label.className = 'checkbox-item';
      label.htmlFor = cb.id;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = cb.id;
      input.checked = cb.default;
      if (cb.locked) {
        input.checked = true;
        input.disabled = true;
      }
      label.appendChild(input);
      const span = document.createElement('span');
      span.id = 'lbl-' + cb.id;
      span.textContent = t(cb.locked ? 'cb_deep_analysis_locked' : cb.key);
      label.appendChild(span);
      container.appendChild(label);
    });
  }

  function getSupportUrl() {
    const locale = uiLang === 'de' ? 'de' : 'en';
    return 'https://www.baslerweb.com/' + locale + '/support/contact';
  }

  function applySupportNotice() {
    const el = $('support-text');
    if (!el) return;
    const url = getSupportUrl();
    el.innerHTML =
      t('support_text_before') +
      '<a href="' + url + '" rel="noopener noreferrer" target="_blank">' + t('support_link_text') + '</a>' +
      t('support_text_after');
  }

  function applyStaticLabels() {
    const ids = [
      'site-title', 'site-subtitle', 'privacy-label', 'privacy-text', 'confidential-label', 'confidential-text',
      'guidance-label', 'guidance-text', 'support-label', 'inputs-heading', 'label-app-description', 'label-workflow-summary',
      'help-workflow-summary', 'label-camera-count', 'label-camera-interface', 'label-hardware',
      'label-applet-handling', 'label-applet-name', 'label-standard-acq-applet',
      'per-camera-title', 'help-per-camera-dims',
      'label-dma-count', 'help-dma-count-separate',
      'per-dma-title', 'help-per-dma-dims',
      'label-trigger-mode', 'label-programming-language', 'label-operating-system', 'label-target-llm',
      'label-output-style', 'legend-options', 'detected-topics-title', 'no-topics-text',
      'snippets-summary', 'btn-load-example', 'btn-reset', 'preview-heading', 'btn-copy', 'btn-download',
      'btn-refresh', 'footer-text', 'footer-autosave'
    ];
    const keys = [
      'site_title', 'site_subtitle', 'privacy_label', 'privacy_text', 'confidential_label', 'confidential_text',
      'guidance_label', 'guidance_text', 'support_label', 'inputs_heading', 'label_app_description', 'label_workflow_summary',
      'help_workflow_summary', 'label_camera_count', 'label_camera_interface', 'label_hardware',
      'label_applet_handling', 'label_applet_name', 'label_standard_acq_applet',
      'per_camera_title', 'help_per_camera_dims',
      'label_dma_count', 'help_dma_count_separate',
      'per_dma_title', 'help_per_dma_dims',
      'label_trigger_mode', 'label_programming_language', 'label_operating_system', 'label_target_llm',
      'label_output_style', 'legend_options', 'detected_topics_title', 'no_topics_text',
      'snippets_summary', 'btn_load_example', 'btn_reset', 'preview_heading', 'btn_copy', 'btn_download',
      'btn_refresh', 'footer_text', 'footer_autosave'
    ];
    ids.forEach((id, i) => {
      const el = $(id);
      if (!el) return;
      if (id === 'privacy-text' || id === 'confidential-text' || id === 'guidance-text') el.textContent = t(keys[i]);
      else el.textContent = t(keys[i]);
    });
    $('app-description').placeholder = t('placeholder_app_description');
    const wf = $('workflow-summary');
    if (wf) wf.placeholder = t('placeholder_workflow_summary');
    const helpPerCam = $('help-per-camera-dims');
    if (helpPerCam) helpPerCam.textContent = t('help_per_camera_dims');
    const helpPerDma = $('help-per-dma-dims');
    if (helpPerDma) helpPerDma.textContent = t('help_per_dma_dims');
    const helpDmaSeparate = $('help-dma-count-separate');
    if (helpDmaSeparate) helpDmaSeparate.textContent = t('help_dma_count_separate');
    const helpApplet = $('help-applet-name');
    if (helpApplet) helpApplet.textContent = t('help_applet_name');
    const helpAutoAcq = $('help-auto-acq-applet');
    if (helpAutoAcq) helpAutoAcq.textContent = t('help_auto_acq_applet');
    applySupportNotice();
    CHECKBOX_OPTIONS.forEach((cb) => {
      const lbl = $('lbl-' + cb.id);
      if (lbl) lbl.textContent = t(cb.locked ? 'cb_deep_analysis_locked' : cb.key);
    });
    document.documentElement.lang = uiLang;
  }

  function refreshDropdownLabels() {
    const saved = {
      iface: $('camera-interface').value,
      applet: $('applet-handling').value,
      trig: $('trigger-mode').value,
      lang: $('programming-language').value,
      os: $('operating-system').value,
      llm: $('target-llm').value,
      style: $('output-style').value,
      stdacq: $('standard-acq-applet').value,
      hw: $('hardware').value
    };

    populateSelect('camera-interface', [
      { value: 'cxp12' }, { value: 'cxp6' }, { value: 'camera_link' }, { value: 'gige' },
      { value: '5gige' }, { value: '10gige' }, { value: 'usb3' }, { value: 'cof' }, { value: 'other' }
    ], 'iface');
    populateSelect('applet-handling', [
      { value: 'standard_dll' }, { value: 'visualapplets_hap' }, { value: 'loaded' },
      { value: 'load_name' }, { value: 'name_avail' }, { value: 'name_na' }, { value: 'na' }
    ], 'applet');
    populateSelect('trigger-mode', [
      { value: 'free' }, { value: 'software' }, { value: 'frame' }, { value: 'line' },
      { value: 'encoder' }, { value: 'enable' }, { value: 'unspec' }
    ], 'trig');
    populateSelect('programming-language', [
      { value: 'cpp17' }, { value: 'cpp20' }, { value: 'c' }, { value: 'python' }, { value: 'pseudo' }
    ], 'lang');
    populateSelect('operating-system', [{ value: 'windows' }, { value: 'linux' }, { value: 'unspec' }], 'os');
    populateSelect('target-llm', [
      { value: 'chatgpt' }, { value: 'claude' }, { value: 'copilot' }, { value: 'cursor' }, { value: 'generic' }
    ], 'llm');
    populateSelect('output-style', [
      { value: 'minimal' }, { value: 'production' }, { value: 'debug' },
      { value: 'adaptation' }, { value: 'architecture' }, { value: 'integration' }
    ], 'style');
    populateHardwareSelect();
    populateStandardAcqSelect(getHardware(saved.hw));

    $('camera-interface').value = saved.iface || 'cxp12';
    $('applet-handling').value = saved.applet || 'standard_dll';
    $('trigger-mode').value = saved.trig || 'unspec';
    $('programming-language').value = saved.lang || 'cpp17';
    $('operating-system').value = saved.os || 'windows';
    $('target-llm').value = saved.llm || 'generic';
    $('output-style').value = saved.style || 'production';
    $('hardware').value = saved.hw || 'imaflex-cxp12-quad';
    $('standard-acq-applet').value = saved.stdacq || 'unspec';
  }

  function updateWarnings(state, route, hw) {
    const cardWarn = $('warning-interface-card');
    const ifaceWarn = $('warning-interface-route');
    const cofWarn = $('warning-cof');
    const appletWarn = $('warning-applet');
    const acqHwWarn = $('warning-acquisition-hw');

    const isCard = hw.hwClass === 'interface_card';
    cardWarn.textContent = t('warn_interface_card');
    cardWarn.classList.toggle('hidden', !isCard);

    const ifacePylon = PYLON_INTERFACES.has(state.cameraInterface);
    ifaceWarn.textContent = t('warn_interface_route');
    ifaceWarn.classList.toggle('hidden', !ifacePylon);

    const cofInvalid = state.cameraInterface === 'cof' && !hw.cofSupport;
    cofWarn.textContent = t('warn_cof');
    cofWarn.classList.toggle('hidden', !cofInvalid);

    const fgRoute = isFramegrabberRoute(route);
    appletWarn.textContent = t('warn_applet');
    appletWarn.classList.toggle('hidden', fgRoute);

    acqHwWarn.textContent = t('warn_acquisition_hw');
    acqHwWarn.classList.toggle('hidden', !(fgRoute && hw.hwClass === 'acquisition'));

    const appletSel = $('applet-handling');
    const appletName = $('applet-name');
    const stdAcqSel = $('standard-acq-applet');
    const stdAcqHelp = $('help-standard-acq');
    const imaflex2Help = $('help-standard-acq-imaflex2');

    if (!fgRoute) {
      appletSel.value = 'na';
      appletSel.disabled = true;
      stdAcqSel.disabled = true;
      appletName.disabled = true;
      stdAcqHelp.classList.add('hidden');
      if (imaflex2Help) imaflex2Help.classList.add('hidden');
    } else {
      appletSel.disabled = false;
      stdAcqSel.disabled = false;
      stdAcqHelp.textContent = t('help_standard_acq');
      stdAcqHelp.classList.remove('hidden');

      if (hw.hwClass === 'acquisition') {
        if (appletSel.value === 'visualapplets_hap') appletSel.value = 'standard_dll';
        Array.from(appletSel.options).forEach((opt) => {
          if (opt.value === 'visualapplets_hap') opt.disabled = true;
        });
        const key = deriveAppletFromCameraConfigs(state.cameraCount, state.cameraConfigs);
        const dll = key ? getStandardAcqDllName(key) : '';
        stdAcqSel.disabled = true;
        if (key) stdAcqSel.value = key;
        appletName.value = dll;
        appletName.readOnly = true;
        $('label-applet-name').textContent = t('label_auto_applet_readonly');
        const helpAuto = $('help-auto-acq-applet');
        if (helpAuto) helpAuto.classList.remove('hidden');
      } else {
        stdAcqSel.disabled = false;
        appletName.readOnly = false;
        $('label-applet-name').textContent = t('label_applet_name');
        const helpAuto = $('help-auto-acq-applet');
        if (helpAuto) helpAuto.classList.add('hidden');
        Array.from(appletSel.options).forEach((opt) => {
          opt.disabled = false;
        });
      }

      populateStandardAcqSelect(hw);
      if (hw.id === 'imaflex2-dual-100' && imaflex2Help) {
        imaflex2Help.textContent = t('help_standard_acq_imaflex2');
        imaflex2Help.classList.remove('hidden');
      } else if (imaflex2Help) {
        imaflex2Help.classList.add('hidden');
      }

      const useHap = appletSel.value === 'visualapplets_hap' || stdAcqSel.value === 'visualapplets_hap';
      const useStd = appletSel.value === 'standard_dll';
      appletName.disabled = !useHap && !useStd && appletSel.value !== 'load_name' && appletSel.value !== 'name_avail';
      if (hw.hwClass !== 'programmable') {
        Array.from(stdAcqSel.options).forEach((opt) => {
          if (opt.value === 'visualapplets_hap') opt.disabled = true;
        });
      }
    }

    const dmaHelp = $('help-dma-pylon');
    if (dmaHelp) {
      if (route === 'pylon') {
        dmaHelp.textContent = t('help_dma_pylon');
        dmaHelp.classList.remove('hidden');
      } else {
        dmaHelp.classList.add('hidden');
      }
    }

    const dmaCountLabel = $('label-dma-count');
    const helpDmaSeparate = $('help-dma-count-separate');
    if (dmaCountLabel) {
      dmaCountLabel.textContent = route === 'pylon' ? t('label_stream_path_count') : t('label_dma_count');
    }
    if (helpDmaSeparate) {
      const showSeparateHelp = fgRoute && hw.hwClass === 'programmable';
      helpDmaSeparate.classList.toggle('hidden', !showSeparateHelp);
    }
  }

  function renderTopics(topics) {
    const tags = $('detected-tags');
    const none = $('no-topics-text');
    tags.innerHTML = '';
    if (!topics.length) {
      none.classList.remove('hidden');
      return;
    }
    none.classList.add('hidden');
    topics.forEach((rule) => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t(rule.labelKey);
      span.title = t(rule.categoryKey);
      tags.appendChild(span);
    });
  }

  function renderSnippets(topics) {
    const list = $('activated-snippets');
    list.innerHTML = '';
    topics.forEach((rule) => {
      const li = document.createElement('li');
      li.innerHTML = '<strong>' + t(rule.labelKey) + '</strong>: ' + t(rule.snippetKey);
      list.appendChild(li);
    });
  }

  function updatePreview() {
    const state = getFormState();
    const result = generatePrompt(state);
    currentPromptText = result.text;
    $('prompt-preview').textContent = currentPromptText;

    const badge = $('sdk-route-badge');
    if (result.route === 'framegrabber') {
      badge.textContent = t('route_framegrabber');
      badge.className = 'route-badge route-framegrabber';
    } else {
      badge.textContent = t('route_pylon');
      badge.className = 'route-badge route-pylon';
    }

    const combined = state.appDescription + ' ' + state.workflowSummary;
    const topics = detectTopics(combined);
    renderTopics(topics);
    renderSnippets(topics);
    updateWarnings(state, result.route, result.hw);
    updateCameraCountWarning(state, topics);
    schedulePersistState();
  }

  function collectPersistedState() {
    const state = getFormState();
    return {
      uiLang,
      appDescription: state.appDescription,
      workflowSummary: state.workflowSummary,
      cameraCount: state.cameraCount,
      cameraConfigs: state.cameraConfigs,
      dmaCount: state.dmaCount,
      dmaUserSet: !!$('dma-count').dataset.userSet,
      dmaConfigs: state.dmaConfigs,
      cameraInterface: state.cameraInterface,
      hardware: state.hardware,
      appletHandling: state.appletHandling,
      standardAcqApplet: state.standardAcqApplet,
      appletName: state.appletName,
      triggerMode: state.triggerMode,
      programmingLanguage: state.programmingLanguage,
      operatingSystem: state.operatingSystem,
      targetLlm: state.targetLlm,
      outputStyle: state.outputStyle,
      options: state.options
    };
  }

  function applyCameraConfigs(configs) {
    const rows = document.querySelectorAll('#per-camera-fields .per-camera-row');
    configs.forEach((cfg, i) => {
      const row = rows[i];
      if (!row || !cfg) return;
      [
        ['camera-type', cfg.cameraType],
        ['pixel-type', cfg.pixelType],
        ['image-width', cfg.imageWidth],
        ['image-height', cfg.imageHeight]
      ].forEach(([field, value]) => {
        if (value == null || value === '') return;
        const el = row.querySelector('[data-field="' + field + '"]');
        if (el) el.value = value;
      });
    });
  }

  function applyDmaConfigs(configs) {
    const rows = document.querySelectorAll('#per-dma-fields .per-camera-row');
    configs.forEach((cfg, i) => {
      const row = rows[i];
      if (!row || !cfg) return;
      [
        ['pixel-type', cfg.pixelType],
        ['dma-width', cfg.dmaWidth],
        ['dma-height', cfg.dmaHeight],
        ['host-buffers', cfg.hostBuffers]
      ].forEach(([field, value]) => {
        if (value == null) return;
        const el = row.querySelector('[data-field="' + field + '"]');
        if (el) el.value = value;
      });
    });
  }

  function applyPersistedState(data) {
    if (!data || typeof data !== 'object') return false;

    if (data.uiLang && LANG_OPTIONS.some((o) => o.value === data.uiLang)) {
      uiLang = data.uiLang;
      $('ui-language').value = uiLang;
    }
    applyStaticLabels();
    populateLanguageSelect('ui-language');

    $('app-description').value = data.appDescription || '';
    $('workflow-summary').value = data.workflowSummary || '';
    $('camera-count').value = data.cameraCount || '1';
    if (data.dmaUserSet) {
      $('dma-count').dataset.userSet = '1';
    } else {
      delete $('dma-count').dataset.userSet;
    }
    $('dma-count').value = data.dmaCount || $('camera-count').value;

    renderPerCameraFields($('camera-count').value, false);
    renderPerDmaFields($('dma-count').value, false);

    if (Array.isArray(data.cameraConfigs)) {
      applyCameraConfigs(data.cameraConfigs);
    }
    if (Array.isArray(data.dmaConfigs)) {
      applyDmaConfigs(data.dmaConfigs);
    }

    $('camera-interface').value = data.cameraInterface || $('camera-interface').value;
    $('hardware').value = data.hardware || 'imaflex-cxp12-quad';
    populateStandardAcqSelect(getHardware($('hardware').value));
    $('applet-handling').value = data.appletHandling || 'standard_dll';
    $('standard-acq-applet').value = data.standardAcqApplet || 'unspec';
    $('applet-name').value = data.appletName || '';
    $('trigger-mode').value = data.triggerMode || $('trigger-mode').value;
    $('programming-language').value = data.programmingLanguage || $('programming-language').value;
    $('operating-system').value = data.operatingSystem || $('operating-system').value;
    $('target-llm').value = data.targetLlm || $('target-llm').value;
    $('output-style').value = data.outputStyle || $('output-style').value;

    if (data.options && typeof data.options === 'object') {
      CHECKBOX_OPTIONS.forEach((cb) => {
        const el = $(cb.id);
        if (!el) return;
        if (cb.locked) {
          el.checked = true;
          el.disabled = true;
        } else if (typeof data.options[cb.id] === 'boolean') {
          el.checked = data.options[cb.id];
        }
      });
    }

    refreshDropdownLabels();
    return true;
  }

  function restorePersistedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      return applyPersistedState(JSON.parse(raw));
    } catch (e) {
      return false;
    }
  }

  function schedulePersistState() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collectPersistedState()));
      } catch (e) { /* private mode or quota */ }
    }, 300);
  }

  function clearPersistedState() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }
  }

  function loadDismissedNotices() {
    try {
      const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveDismissedNotices(ids) {
    try {
      localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(ids));
    } catch (e) { /* ignore */ }
  }

  function getDownloadFilename() {
    const suffix = uiLang === 'en' ? '' : '-' + uiLang;
    return DOWNLOAD_BASE + suffix + '.txt';
  }

  function copyPrompt() {
    const status = $('copy-status');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentPromptText).then(() => {
        status.textContent = t('copy_success');
      }).catch(() => {
        status.textContent = t('copy_fail');
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = currentPromptText;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        status.textContent = t('copy_success');
      } catch (e) {
        status.textContent = t('copy_fail');
      }
      document.body.removeChild(ta);
    }
  }

  function downloadPrompt() {
    const blob = new Blob([currentPromptText], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = getDownloadFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  function loadExample() {
    $('app-description').value = EXAMPLE_TEXT;
    $('workflow-summary').value = '';
    $('camera-count').value = '2';
    $('dma-count').value = '2';
    delete $('dma-count').dataset.userSet;
    renderPerCameraFields(2, false);
    renderPerDmaFields(2, false);
    const camRows = document.querySelectorAll('#per-camera-fields .per-camera-row');
    if (camRows[0]) {
      camRows[0].querySelector('[data-field="camera-type"]').value = 'area';
      camRows[0].querySelector('[data-field="pixel-type"]').value = 'mono8';
      camRows[0].querySelector('[data-field="image-width"]').value = '8192';
      camRows[0].querySelector('[data-field="image-height"]').value = '4096';
    }
    if (camRows[1]) {
      camRows[1].querySelector('[data-field="camera-type"]').value = 'area';
      camRows[1].querySelector('[data-field="pixel-type"]').value = 'mono8';
      camRows[1].querySelector('[data-field="image-width"]').value = '8192';
      camRows[1].querySelector('[data-field="image-height"]').value = '4096';
    }
    const dmaRows = document.querySelectorAll('#per-dma-fields .per-camera-row');
    dmaRows.forEach((row) => {
      row.querySelector('[data-field="pixel-type"]').value = '';
      row.querySelector('[data-field="dma-width"]').value = '8192';
      row.querySelector('[data-field="dma-height"]').value = '4096';
      row.querySelector('[data-field="host-buffers"]').value = '4';
    });
    $('camera-interface').value = 'cxp12';
    $('hardware').value = 'imaflex-cxp12-quad';
    $('applet-handling').value = 'standard_dll';
    $('standard-acq-applet').value = 'dual_area';
    $('applet-name').value = '';
    $('trigger-mode').value = 'frame';
    $('programming-language').value = 'cpp17';
    $('operating-system').value = 'windows';
    $('target-llm').value = 'cursor';
    $('output-style').value = 'production';
    CHECKBOX_OPTIONS.forEach((cb) => {
      const el = $(cb.id);
      if (el) {
        el.checked = cb.locked ? true : cb.default;
        if (cb.locked) el.disabled = true;
      }
    });
    updatePreview();
  }

  function resetAll() {
    $('prompt-form').reset();
    $('camera-count').value = '1';
    $('dma-count').value = '1';
    delete $('dma-count').dataset.userSet;
    renderPerCameraFields(1, false);
    renderPerDmaFields(1, false);
    $('hardware').value = 'imaflex-cxp12-quad';
    $('applet-handling').value = 'standard_dll';
    $('standard-acq-applet').value = 'unspec';
    CHECKBOX_OPTIONS.forEach((cb) => {
      const el = $(cb.id);
      if (el) {
        el.checked = cb.locked ? true : cb.default;
        if (cb.locked) el.disabled = true;
      }
    });
    $('copy-status').textContent = '';
    populateStandardAcqSelect(getHardware('imaflex-cxp12-quad'));
    clearPersistedState();
    updatePreview();
  }

  function initDismissNotices() {
    const dismissed = new Set(loadDismissedNotices());
    document.querySelectorAll('.dismissible-notice').forEach((notice) => {
      const id = notice.dataset.noticeId;
      if (id && dismissed.has(id)) notice.classList.add('hidden');
    });

    document.querySelectorAll('.notice-dismiss').forEach((btn) => {
      btn.addEventListener('click', () => {
        const notice = btn.closest('.dismissible-notice');
        if (!notice) return;
        notice.classList.add('hidden');
        const id = notice.dataset.noticeId;
        if (!id) return;
        const ids = loadDismissedNotices();
        if (!ids.includes(id)) {
          ids.push(id);
          saveDismissedNotices(ids);
        }
      });
    });
  }

  function bindEvents() {
    const form = $('prompt-form');
    form.addEventListener('input', updatePreview);
    form.addEventListener('change', updatePreview);

    $('camera-count').addEventListener('change', () => {
      renderPerCameraFields($('camera-count').value, true);
      if (!$('dma-count').dataset.userSet) {
        $('dma-count').value = $('camera-count').value;
      }
      renderPerDmaFields($('dma-count').value, true);
      updatePreview();
    });

    $('dma-count').addEventListener('change', () => {
      $('dma-count').dataset.userSet = '1';
      renderPerDmaFields($('dma-count').value, true);
      updatePreview();
    });

    $('hardware').addEventListener('change', () => {
      populateStandardAcqSelect(getHardware($('hardware').value));
    });

    $('ui-language').addEventListener('change', (e) => {
      uiLang = e.target.value;
      applyStaticLabels();
      populateLanguageSelect('ui-language');
      renderPerCameraFields($('camera-count').value, true);
      renderPerDmaFields($('dma-count').value, true);
      refreshDropdownLabels();
      updatePreview();
    });

    $('btn-copy').addEventListener('click', copyPrompt);
    $('btn-download').addEventListener('click', downloadPrompt);
    $('btn-refresh').addEventListener('click', updatePreview);
    $('target-llm').addEventListener('change', updatePreview);
    $('output-style').addEventListener('change', updatePreview);
    $('btn-load-example').addEventListener('click', loadExample);
    $('btn-reset').addEventListener('click', resetAll);
  }

  function init() {
    populateLanguageSelect('ui-language');
    buildCheckboxes();
    refreshDropdownLabels();
    $('hardware').value = 'imaflex-cxp12-quad';
    $('applet-handling').value = 'standard_dll';
    $('ui-language').value = 'en';
    uiLang = 'en';
    applyStaticLabels();
    renderPerCameraFields($('camera-count').value, false);
    renderPerDmaFields($('dma-count').value, false);
    initDismissNotices();
    bindEvents();
    if (!restorePersistedState()) {
      populateStandardAcqSelect(getHardware('imaflex-cxp12-quad'));
    }
    updatePreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }


})();
