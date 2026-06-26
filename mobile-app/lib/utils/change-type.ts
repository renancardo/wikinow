import type { ChangeType } from '@/types/recent-change';
import type { StreamChangeType } from '@/types/stream-recent-change';

export const EXTERNAL_CHANGE_TYPES: Record<StreamChangeType, ChangeType> = {
  edit: 'edit',
  new: 'new',
  log: 'log',
  categorize: 'log',
};
