import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';
import { nanoid } from 'nanoid';

export async function logAuditEvent(params: {
  userId?: string;
  userName?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await db.insert(auditLog).values({
    id: nanoid(),
    ...params,
    details: params.details ? JSON.stringify(params.details) : null,
    createdAt: new Date(),
  });
}
