export interface Run {
  run_id: string;
  status: string;
  output: unknown;
  recording_url: string | null;
  screenshot_urls: string[] | null;
  downloaded_files: (string | FileInfo)[] | null;
  failure_reason: string | null;
  created_at: string;
  modified_at: string;
  queued_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  app_url: string | null;
  browser_session_id: string | null;
  step_count: number | null;
  run_type: string;
  errors: unknown[] | null;
  run_with: string | null;
  run_request: RunRequest | null;
}

export interface RunRequest {
  // Workflow fields
  workflow_id?: string;
  parameters?: Record<string, unknown>;
  // Task fields
  prompt?: string;
  url?: string;
  navigation_goal?: string;
  data_extraction_goal?: string;
  data_extraction_schema?: unknown;
  engine?: string;
  // Common fields
  title?: string;
  proxy_location?: string;
  webhook_url?: string;
  max_screenshot_scrolls?: number;
  extra_http_headers?: Record<string, string>;
  [key: string]: unknown;
}

export interface FileInfo {
  name: string;
  url: string;
  size?: number;
}

export interface TimelineEntry {
  type: 'block' | 'thought';
  block?: TimelineBlock;
  thought?: {
    thought: string;
    answer: string | null;
  };
  children: TimelineEntry[];
  created_at: string;
}

export interface TimelineBlock {
  workflow_run_block_id: string;
  block_type: string;
  label: string | null;
  status: string | null;
  output: unknown;
  failure_reason: string | null;
  url: string | null;
  navigation_goal: string | null;
  duration: number | null;
  actions: Action[];
  created_at: string;
}

export interface Action {
  action_type: string;
  status: string;
  description: string | null;
  reasoning: string | null;
  element_id: string | null;
}

export interface Artifact {
  artifact_id: string;
  artifact_type: string;
  uri: string;
  signed_url: string | null;
  created_at: string;
}
