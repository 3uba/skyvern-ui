'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';

// Reuse the same run detail page — just redirect to /runs/[runId]
export default function WorkflowRunDetailPage({
  params,
}: {
  params: Promise<{ workflowId: string; runId: string }>;
}) {
  const { runId } = use(params);
  redirect(`/runs/${runId}`);
}
