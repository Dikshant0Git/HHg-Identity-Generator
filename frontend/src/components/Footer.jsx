import React from 'react';
import { useLocation } from 'react-router-dom';
import footerStrip from '../assets/home-footer-strip.png';

export default function Footer() {
  const location = useLocation();

  // Hide footer on home page since main-home-background.png has integrated footer
  if (location.pathname === '/') {
    return null;
  }

  return (
    <footer id="hh-footer" className="w-full shrink-0 relative z-30">
      {/* Sand Footer Strip Image */}
      <div className="w-full overflow-hidden">
        <img
          src={footerStrip}
          alt="HH Goa 2026 — Less Noise. More Signal. #FRAMEINGOA. Built by Builders. For Builders."
          className="w-full h-auto max-h-[16vh] object-cover object-top block"
          loading="eager"
        />
      </div>
    </footer>
  );
}
