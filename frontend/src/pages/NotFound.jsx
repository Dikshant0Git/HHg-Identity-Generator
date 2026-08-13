import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-goa-green-deep)] px-4">
      <div className="text-center max-w-md">
        <p className="text-mono-label text-[var(--color-hh-pink)] mb-4">
          404 — Page Not Found
        </p>
        <h1 className="heading-hero text-6xl md:text-8xl text-[var(--color-sun-gold)] mb-6">
          Lost in Goa?
        </h1>
        <p className="font-body text-[var(--color-sand-dark)] mb-8">
          This page doesn&apos;t exist. Maybe it drifted away with the tide.
        </p>
        <Link to="/" className="btn-hh btn-hh-primary">
          Back to Shore →
        </Link>
      </div>
    </div>
  );
}
