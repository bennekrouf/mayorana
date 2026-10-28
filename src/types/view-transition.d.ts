// React's <ViewTransition>. Next's bundled React exports it as ViewTransition,
// but @types/react only declares it, in its experimental types, under the old
// name unstable_ViewTransition — which does not exist at runtime. This
// declares the name that does. Drop it once @types/react catches up.

/// <reference types="react/experimental" />

import type { unstable_ViewTransition } from 'react';

declare module 'react' {
  export const ViewTransition: typeof unstable_ViewTransition;
}
