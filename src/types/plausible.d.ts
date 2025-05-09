// src/types/plausible.d.ts
interface Window {
  plausible?: {
    (event: string, options?: { 
      callback?: () => void; 
      props?: Record<string, string | number | boolean> 
    }): void;
    q?: Array<unknown>; // Using unknown instead of any
  };
}
