import type { Detection } from './types';

export type View = 'meet' | 'detecting' | 'idle';

export function selectView(
  detection: Detection | null | undefined,
  meetUrl: string | null | undefined
): View {
  if (meetUrl) return 'meet';
  if (detection) return 'detecting';
  return 'idle';
}
