import {
  Globe,
  MousePointerClick,
  FileSearch,
  ShieldCheck,
  MessageSquareText,
  Code,
  Repeat,
  GitBranch,
  Download,
  Upload,
  Mail,
  LogIn,
  Link2,
  Clock,
  UserCheck,
  FileText,
  Printer,
  Send,
  Braces,
  type LucideIcon,
} from 'lucide-react';

export type BlockConfig = {
  color: string;
  bg: string;
  borderColor: string;
  accent: string;
  icon: LucideIcon;
  displayName: string;
  description: string;
};

export const BLOCK_CONFIG: Record<string, BlockConfig> = {
  task_v2:       { color: 'text-blue-700', bg: 'bg-blue-50', borderColor: 'border-blue-200', accent: 'bg-blue-500', icon: Globe, displayName: 'Browser Task', description: 'Navigate and interact with a web page using AI' },
  task:          { color: 'text-blue-700', bg: 'bg-blue-50', borderColor: 'border-blue-200', accent: 'bg-blue-500', icon: Globe, displayName: 'Browser Task (v1)', description: 'Legacy browser task with navigation goal' },
  navigation:    { color: 'text-blue-700', bg: 'bg-blue-50', borderColor: 'border-blue-200', accent: 'bg-blue-500', icon: Globe, displayName: 'Navigation', description: 'Navigate to a page and perform actions' },
  action:        { color: 'text-blue-700', bg: 'bg-blue-50', borderColor: 'border-blue-200', accent: 'bg-blue-500', icon: MousePointerClick, displayName: 'Action', description: 'Click, type, or interact with page elements' },
  login:         { color: 'text-blue-700', bg: 'bg-blue-50', borderColor: 'border-blue-200', accent: 'bg-blue-500', icon: LogIn, displayName: 'Login', description: 'Authenticate into a website' },
  goto_url:      { color: 'text-blue-700', bg: 'bg-blue-50', borderColor: 'border-blue-200', accent: 'bg-blue-500', icon: Link2, displayName: 'Go to URL', description: 'Navigate the browser to a specific URL' },
  extraction:    { color: 'text-emerald-700', bg: 'bg-emerald-50', borderColor: 'border-emerald-200', accent: 'bg-emerald-500', icon: FileSearch, displayName: 'Extract Data', description: 'Extract structured data from a web page' },
  validation:    { color: 'text-amber-700', bg: 'bg-amber-50', borderColor: 'border-amber-200', accent: 'bg-amber-500', icon: ShieldCheck, displayName: 'Validation', description: 'Validate data or page state against criteria' },
  text_prompt:   { color: 'text-amber-700', bg: 'bg-amber-50', borderColor: 'border-amber-200', accent: 'bg-amber-500', icon: MessageSquareText, displayName: 'Text Prompt', description: 'Send a text prompt to the AI model' },
  code:          { color: 'text-emerald-700', bg: 'bg-emerald-50', borderColor: 'border-emerald-200', accent: 'bg-emerald-500', icon: Code, displayName: 'Code Block', description: 'Run custom Python code' },
  for_loop:      { color: 'text-purple-700', bg: 'bg-purple-50', borderColor: 'border-purple-200', accent: 'bg-purple-500', icon: Repeat, displayName: 'Loop', description: 'Repeat blocks for each item in a list' },
  conditional:   { color: 'text-orange-700', bg: 'bg-orange-50', borderColor: 'border-orange-200', accent: 'bg-orange-500', icon: GitBranch, displayName: 'Conditional', description: 'Branch workflow based on a condition' },
  file_download: { color: 'text-indigo-700', bg: 'bg-indigo-50', borderColor: 'border-indigo-200', accent: 'bg-indigo-500', icon: Download, displayName: 'File Download', description: 'Download a file from the browser' },
  file_upload:   { color: 'text-indigo-700', bg: 'bg-indigo-50', borderColor: 'border-indigo-200', accent: 'bg-indigo-500', icon: Upload, displayName: 'File Upload', description: 'Upload a file to a web page' },
  upload_to_s3:  { color: 'text-indigo-700', bg: 'bg-indigo-50', borderColor: 'border-indigo-200', accent: 'bg-indigo-500', icon: Upload, displayName: 'Upload to S3', description: 'Upload output files to Amazon S3' },
  download_to_s3:{ color: 'text-indigo-700', bg: 'bg-indigo-50', borderColor: 'border-indigo-200', accent: 'bg-indigo-500', icon: Download, displayName: 'Download from S3', description: 'Download files from Amazon S3' },
  file_url_parser:{ color: 'text-indigo-700', bg: 'bg-indigo-50', borderColor: 'border-indigo-200', accent: 'bg-indigo-500', icon: FileText, displayName: 'File Parser', description: 'Parse and extract content from a file URL' },
  pdf_parser:    { color: 'text-indigo-700', bg: 'bg-indigo-50', borderColor: 'border-indigo-200', accent: 'bg-indigo-500', icon: FileText, displayName: 'PDF Parser', description: 'Extract text and data from a PDF document' },
  send_email:    { color: 'text-pink-700', bg: 'bg-pink-50', borderColor: 'border-pink-200', accent: 'bg-pink-500', icon: Mail, displayName: 'Send Email', description: 'Send an email with results or notifications' },
  http_request:  { color: 'text-teal-700', bg: 'bg-teal-50', borderColor: 'border-teal-200', accent: 'bg-teal-500', icon: Send, displayName: 'HTTP Request', description: 'Make an HTTP API call' },
  wait:          { color: 'text-gray-700', bg: 'bg-gray-100', borderColor: 'border-gray-200', accent: 'bg-gray-400', icon: Clock, displayName: 'Wait', description: 'Pause the workflow for a set time' },
  print_page:    { color: 'text-gray-700', bg: 'bg-gray-100', borderColor: 'border-gray-200', accent: 'bg-gray-400', icon: Printer, displayName: 'Print Page', description: 'Save current page as PDF' },
  human_interaction: { color: 'text-violet-700', bg: 'bg-violet-50', borderColor: 'border-violet-200', accent: 'bg-violet-500', icon: UserCheck, displayName: 'Human Review', description: 'Pause and wait for a human to review' },
};

export const DEFAULT_BLOCK_CONFIG: BlockConfig = {
  color: 'text-gray-700',
  bg: 'bg-gray-100',
  borderColor: 'border-gray-200',
  accent: 'bg-gray-400',
  icon: Braces,
  displayName: 'Block',
  description: 'Generic block',
};

export function getBlockConfig(blockType: string): BlockConfig {
  return BLOCK_CONFIG[blockType] || DEFAULT_BLOCK_CONFIG;
}

export type BlockCategory = {
  label: string;
  types: string[];
};

export const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    label: 'Browser',
    types: ['task_v2', 'task', 'navigation', 'action', 'login', 'goto_url'],
  },
  {
    label: 'Data',
    types: ['extraction', 'text_prompt', 'code', 'validation'],
  },
  {
    label: 'Flow',
    types: ['for_loop', 'conditional', 'wait'],
  },
  {
    label: 'Files',
    types: ['file_download', 'file_upload', 'upload_to_s3', 'download_to_s3', 'file_url_parser', 'pdf_parser', 'print_page'],
  },
  {
    label: 'Communication',
    types: ['send_email', 'http_request'],
  },
  {
    label: 'Utility',
    types: ['human_interaction'],
  },
];

export function createDefaultBlock(blockType: string): Record<string, unknown> {
  const base: Record<string, unknown> = {
    block_type: blockType,
    label: '',
    continue_on_failure: false,
  };

  switch (blockType) {
    case 'task_v2':
      return { ...base, url: '', prompt: '' };
    case 'task':
    case 'navigation':
    case 'action':
    case 'login':
    case 'file_download':
      return { ...base, url: '', navigation_goal: '' };
    case 'extraction':
      return { ...base, url: '', data_extraction_goal: '' };
    case 'text_prompt':
      return { ...base, prompt: '' };
    case 'code':
      return { ...base, code: '' };
    case 'for_loop':
      return { ...base, loop_over_parameter_key: '', loop_blocks: [] };
    case 'conditional':
      return { ...base, condition: '', complete_blocks: [], failure_blocks: [] };
    case 'goto_url':
      return { ...base, url: '' };
    case 'wait':
      return { ...base, wait_sec: 5 };
    case 'send_email':
      return { ...base, sender: '', subject: '', body: '' };
    case 'http_request':
      return { ...base, method: 'GET', url: '', timeout: 30 };
    case 'file_upload':
    case 'upload_to_s3':
    case 'download_to_s3':
      return { ...base, path: '' };
    case 'file_url_parser':
    case 'pdf_parser':
      return { ...base, file_url: '' };
    case 'print_page':
    case 'human_interaction':
      return base;
    default:
      return base;
  }
}
