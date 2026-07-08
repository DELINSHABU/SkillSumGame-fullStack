// Server-side trust boundary: the client generates questions locally, so we
// cannot re-derive them — but we recompute every aggregate from the raw
// attempts and ignore any client-sent totals (correct/accuracy/xp/stars).
// The math itself lives in @skillsum/shared so the web app can compute the
// same optimistic result while offline.
export {
  ImplausibleSessionError,
  recomputeSession,
  type RecomputedSession,
} from '@skillsum/shared';
