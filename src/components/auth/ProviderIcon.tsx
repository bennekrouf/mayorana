import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

/** Microsoft's four squares, in their colours. */
export function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 23 23" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}

/** The logo for a Firebase sign-in provider. */
export function ProviderIcon({
  provider,
  className,
}: {
  provider: 'google' | 'github' | 'microsoft';
  className?: string;
}) {
  if (provider === 'google') return <FcGoogle className={className} aria-hidden />;
  if (provider === 'github') return <FaGithub className={className} aria-hidden />;
  return <MicrosoftIcon className={className} />;
}
