'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  helpText?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-sm min-h-[80px] resize-y bg-background"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-sm bg-background"
        />
      )}
      {helpText && <p className="text-[11px] text-muted-foreground">{helpText}</p>}
    </div>
  );
}

export function SwitchField({
  label,
  checked,
  onChange,
  helpText,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  helpText?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="space-y-0.5">
        <Label className="text-sm">{label}</Label>
        {helpText && <p className="text-[11px] text-muted-foreground leading-tight">{helpText}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

type UpdateFn = (key: string, value: unknown) => void;

function FieldGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      {title && (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      )}
      {children}
    </div>
  );
}

export function BlockFieldSection({
  blockType,
  draft,
  update,
}: {
  blockType: string;
  draft: Record<string, unknown>;
  update: UpdateFn;
}) {
  const str = (key: string) => (draft[key] as string) || '';
  const bool = (key: string) => !!draft[key];
  const num = (key: string) => (draft[key] as number) || 0;

  return (
    <div className="space-y-5">
      {/* Label — always shown */}
      <FieldInput
        label="Label"
        value={str('label')}
        onChange={(v) => update('label', v)}
        placeholder="e.g. login_step, extract_prices"
        helpText="Unique identifier for this block"
      />

      {/* Task V2 fields */}
      {blockType === 'task_v2' && (
        <>
          <Separator />
          <FieldGroup>
            <FieldInput
              label="URL"
              value={str('url')}
              onChange={(v) => update('url', v)}
              placeholder="https://example.com"
            />
            <FieldInput
              label="Prompt"
              value={str('prompt')}
              onChange={(v) => update('prompt', v)}
              placeholder="Describe what the AI should do on this page..."
              multiline
              helpText="Use {{ parameter_name }} for dynamic values"
            />
          </FieldGroup>
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced" className="border-none">
              <AccordionTrigger className="text-xs font-medium text-muted-foreground py-2 hover:no-underline">
                Advanced Settings
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <FieldInput
                    label="Max Iterations"
                    value={String(num('max_iterations') || '')}
                    onChange={(v) => update('max_iterations', parseInt(v) || undefined)}
                    placeholder="10"
                  />
                  <FieldInput
                    label="Max Steps"
                    value={String(num('max_steps') || '')}
                    onChange={(v) => update('max_steps', parseInt(v) || undefined)}
                    placeholder="25"
                  />
                </div>
                <SwitchField
                  label="Disable Cache"
                  checked={bool('disable_cache')}
                  onChange={(v) => update('disable_cache', v)}
                />
                <FieldInput
                  label="TOTP Verification URL"
                  value={str('totp_verification_url')}
                  onChange={(v) => update('totp_verification_url', v || null)}
                  placeholder="https://..."
                />
                <FieldInput
                  label="TOTP Identifier"
                  value={str('totp_identifier')}
                  onChange={(v) => update('totp_identifier', v || null)}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}

      {/* Task / Navigation / Action fields */}
      {['task', 'navigation', 'action', 'login', 'file_download'].includes(blockType) && (
        <>
          <Separator />
          <FieldGroup>
            <FieldInput
              label="URL"
              value={str('url')}
              onChange={(v) => update('url', v)}
              placeholder="https://example.com"
            />
            <FieldInput
              label="Navigation Goal"
              value={str('navigation_goal')}
              onChange={(v) => update('navigation_goal', v)}
              placeholder="Describe the goal for the AI..."
              multiline
              helpText="What should the AI accomplish on this page?"
            />
            {blockType === 'task' && (
              <FieldInput
                label="Data Extraction Goal"
                value={str('data_extraction_goal')}
                onChange={(v) => update('data_extraction_goal', v)}
                placeholder="What data should be extracted?"
                multiline
              />
            )}
          </FieldGroup>
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced" className="border-none">
              <AccordionTrigger className="text-xs font-medium text-muted-foreground py-2 hover:no-underline">
                Advanced Settings
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <FieldInput
                    label="Max Retries"
                    value={String(num('max_retries') || '')}
                    onChange={(v) => update('max_retries', parseInt(v) || 0)}
                    placeholder="0"
                  />
                  <FieldInput
                    label="Max Steps"
                    value={String(num('max_steps_per_run') || '')}
                    onChange={(v) => update('max_steps_per_run', parseInt(v) || undefined)}
                  />
                </div>
                <SwitchField
                  label="Continue on Failure"
                  checked={bool('continue_on_failure')}
                  onChange={(v) => update('continue_on_failure', v)}
                />
                <SwitchField
                  label="Disable Cache"
                  checked={bool('disable_cache')}
                  onChange={(v) => update('disable_cache', v)}
                />
                <FieldInput
                  label="Complete Criterion"
                  value={str('complete_criterion')}
                  onChange={(v) => update('complete_criterion', v || null)}
                  multiline
                  helpText="When should this block be considered complete?"
                />
                <FieldInput
                  label="Terminate Criterion"
                  value={str('terminate_criterion')}
                  onChange={(v) => update('terminate_criterion', v || null)}
                  multiline
                  helpText="When should this block stop early?"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}

      {/* Extraction block */}
      {blockType === 'extraction' && (
        <>
          <Separator />
          <FieldGroup>
            <FieldInput
              label="URL"
              value={str('url')}
              onChange={(v) => update('url', v)}
              placeholder="https://example.com"
            />
            <FieldInput
              label="Data Extraction Goal"
              value={str('data_extraction_goal')}
              onChange={(v) => update('data_extraction_goal', v)}
              placeholder="Describe what data to extract..."
              multiline
            />
          </FieldGroup>
        </>
      )}

      {/* Text Prompt */}
      {blockType === 'text_prompt' && (
        <>
          <Separator />
          <FieldInput
            label="Prompt"
            value={str('prompt')}
            onChange={(v) => update('prompt', v)}
            placeholder="Enter the prompt..."
            multiline
          />
        </>
      )}

      {/* Code Block */}
      {blockType === 'code' && (
        <>
          <Separator />
          <FieldInput
            label="Code"
            value={str('code')}
            onChange={(v) => update('code', v)}
            placeholder="# Python code here..."
            multiline
          />
        </>
      )}

      {/* For Loop */}
      {blockType === 'for_loop' && (
        <>
          <Separator />
          <FieldGroup>
            <FieldInput
              label="Loop Over Parameter"
              value={str('loop_over_parameter_key')}
              onChange={(v) => update('loop_over_parameter_key', v)}
              placeholder="parameter_key"
              helpText="Key of the parameter to iterate over"
            />
            <SwitchField
              label="Complete if Empty"
              checked={bool('complete_if_empty')}
              onChange={(v) => update('complete_if_empty', v)}
              helpText="Mark as complete if loop value is empty"
            />
          </FieldGroup>
        </>
      )}

      {/* Conditional */}
      {blockType === 'conditional' && (
        <>
          <Separator />
          <FieldInput
            label="Condition"
            value={str('condition')}
            onChange={(v) => update('condition', v)}
            placeholder="Enter condition expression..."
            multiline
            helpText="Expression to evaluate for branching"
          />
        </>
      )}

      {/* Wait Block */}
      {blockType === 'wait' && (
        <>
          <Separator />
          <FieldInput
            label="Wait Time (seconds)"
            value={String(num('wait_sec') || '')}
            onChange={(v) => update('wait_sec', parseInt(v) || 0)}
            placeholder="5"
          />
        </>
      )}

      {/* Go to URL */}
      {blockType === 'goto_url' && (
        <>
          <Separator />
          <FieldInput
            label="URL"
            value={str('url')}
            onChange={(v) => update('url', v)}
            placeholder="https://example.com"
          />
        </>
      )}

      {/* HTTP Request */}
      {blockType === 'http_request' && (
        <>
          <Separator />
          <FieldGroup>
            <div className="grid grid-cols-[100px_1fr] gap-3">
              <FieldInput
                label="Method"
                value={str('method') || 'GET'}
                onChange={(v) => update('method', v)}
                placeholder="GET"
              />
              <FieldInput
                label="URL"
                value={str('url')}
                onChange={(v) => update('url', v)}
                placeholder="https://api.example.com/data"
              />
            </div>
            <FieldInput
              label="Timeout (seconds)"
              value={String(num('timeout') || 30)}
              onChange={(v) => update('timeout', parseInt(v) || 30)}
            />
          </FieldGroup>
        </>
      )}

      {/* Send Email */}
      {blockType === 'send_email' && (
        <>
          <Separator />
          <FieldGroup>
            <FieldInput
              label="Sender"
              value={str('sender')}
              onChange={(v) => update('sender', v)}
              placeholder="sender@example.com"
            />
            <FieldInput
              label="Subject"
              value={str('subject')}
              onChange={(v) => update('subject', v)}
              placeholder="Email subject"
            />
            <FieldInput
              label="Body"
              value={str('body')}
              onChange={(v) => update('body', v)}
              multiline
              placeholder="Email body..."
            />
          </FieldGroup>
        </>
      )}

      {/* Validation */}
      {blockType === 'validation' && (
        <>
          <Separator />
          <FieldInput
            label="Validation Criteria"
            value={str('validation_goal')}
            onChange={(v) => update('validation_goal', v)}
            placeholder="What should be validated?"
            multiline
          />
        </>
      )}

      {/* File URL Parser */}
      {['file_url_parser', 'pdf_parser'].includes(blockType) && (
        <>
          <Separator />
          <FieldInput
            label="File URL"
            value={str('file_url')}
            onChange={(v) => update('file_url', v)}
            placeholder="https://example.com/file.pdf"
          />
        </>
      )}

      {/* Common continue_on_failure — shown for types not already showing it in advanced */}
      {!['task', 'navigation', 'action', 'login', 'file_download'].includes(blockType) && (
        <>
          <Separator />
          <SwitchField
            label="Continue on Failure"
            checked={bool('continue_on_failure')}
            onChange={(v) => update('continue_on_failure', v)}
            helpText="Continue workflow even if this block fails"
          />
        </>
      )}
    </div>
  );
}
