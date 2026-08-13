import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import imgStudio from '../assets/imgi_2_2-47.png';


export default function Header() {
  const location = useLocation();

  const NAV_LINKS = [
    { label: 'HOME', path: '/', isInternal: true },
    { label: 'Create', path: '/create' },
    { label: 'FAQ', path: 'https://hhgoa.com', isInternal: false },
  ];

  return (
    <header
      id="hh-header"
      className="w-full py-3 px-6 md:px-12 flex items-center justify-between relative z-50 shrink-0"
      style={{ backgroundColor: 'var(--color-goa-green-deep)' }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline" id="hh-logo-link">
        <img
          src={imgStudio}
          alt="Hacker House Goa 2026"
          className="h-5 md:h-9 w-auto object-contain"
        />
      </Link>

      {/* Navigation */}
      <nav className="hidden lg:flex items-center gap-8" id="hh-nav">
        {NAV_LINKS.map((link) => (
          link.isInternal ? (
            <Link
              key={link.label}
              to={link.path}
              className={`text-mono-label font-bold text-xs tracking-widest transition-colors no-underline ${location.pathname === link.path
                  ? 'text-[var(--color-sun-gold)] border-b-2 border-[var(--color-sun-gold)] pb-1'
                  : 'text-[var(--color-cream)] hover:text-[var(--color-sun-gold)]'
                }`}
            >
              {link.label}
            </Link>
          ) : (
            <a
              key={link.label}
              href={link.path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mono-label font-bold text-xs tracking-widest text-[var(--color-cream)] hover:text-[var(--color-sun-gold)] transition-colors no-underline"
            >
              {link.label}
            </a>
          )
        ))}
      </nav>

      {/* Header CTA Buttons */}
      <div className="flex items-center gap-3">
        <Link
          to="/create"
          className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-[var(--color-sun-gold)] text-[var(--color-sun-gold)] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-sun-gold)]/10 transition-all"
          id="hh-how-it-works-button"
        >
          HOW IT WORKS
        </Link>
        <Link
          to="/create"
          className="inline-flex items-center px-5 py-2 rounded-full bg-[var(--color-hh-pink)] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-hh-pink-hot)] shadow-md transition-all"
          id="hh-cta-button"
        >
          START CREATING
        </Link>
      </div>
    </header>
  );
}
