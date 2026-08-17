import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import { usePageReveal } from '../hooks/useGsapAnimations';
import mainHomeBg from '../assets/simple-background.png';
import mobileBackground from '../assets/simple-background.png';
import imgHackerHouse from '../assets/imgi_3_Hacker house.png';
import imgGoaHindi from '../assets/imgi_4_goa_hindi.png';

export default function Home() {
  const pageRef = useRef(null);
  usePageReveal(pageRef);

  return (
    <div 
      ref={pageRef} 
      className="w-full h-screen flex flex-col justify-between overflow-hidden relative"
    >
      <img src={mainHomeBg} alt="Background" className="absolute inset-0 w-full h-full object-fill z-0 hidden lg:block" />
      <img src={mobileBackground} alt="Background Mobile" className="absolute inset-0 w-full h-full object-fill z-0 block lg:hidden" />
      {/* Main Hero Container — Single desktop page layout */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-6 relative z-10 pt-24 pb-6 lg:py-10 lg:pt-28">
        
        {/* Left Side: Content & Typography */}
        <div className="flex-1 max-w-2xl flex flex-col justify-center z-20 pb-16 lg:pb-24">
          
          {/* Hero Banner Title: HACKER HOUSE + गोवा Sticker */}
          <div className="relative mb-3 pt-1">
            <div className="relative inline-block w-full max-w-xl">
              <img 
                src={imgHackerHouse} 
                alt="HACKER HOUSE" 
                className="w-full h-auto object-contain drop-shadow-md" 
              />
              {/* Overlapping Goa Hindi sticker */}
              <img 
                src={imgGoaHindi} 
                alt="गोवा" 
                className="absolute top-[68%] left-[55%] -translate-y-1/2 -translate-x-1/2 w-[16%] sm:w-[20%] h-auto object-contain drop-shadow-lg z-10 pointer-events-none transform -rotate-9"
              />
            </div>
          </div>

          {/* Location / Date Subline & Horizontal Divider */}
          <div className="w-full max-w-xl mb-4">
            <div className="flex items-center justify-between font-mono text-xs sm:text-sm text-[var(--color-sand)] tracking-widest uppercase font-semibold mb-2">
              <span>GOA, INDIA &nbsp;&bull;&nbsp; 28–31 OCT 2026</span>
              <span className="text-[var(--color-sun-gold)] text-base font-bold">2026</span>
            </div>
            
            {/* Divider line with center palm motif */}
            <div className="relative flex items-center justify-center w-full my-2">
              <div className="w-full border-t border-[var(--color-sun-gold)]/60" />
              <span className="absolute bg-[var(--color-goa-green-deep)]/90 px-2 text-[var(--color-sun-gold)] text-sm rounded-full">
                🌴
              </span>
            </div>
          </div>

          {/* Tagline & Copy */}
          <div className="mb-6">
            <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-[var(--color-cream)] tracking-wide uppercase leading-tight mb-2">
              Your Frame. Your Vibe. <br />
              Your Mark.
            </h2>
            <p className="font-body text-[var(--color-sand-dark)] text-sm sm:text-base max-w-lg leading-relaxed">
              Create your official HH Goa 2026 Builder ID in seconds and join the builder&apos;s tribe.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Link 
              to="/create" 
              className="px-6 py-3.5 rounded-full bg-[var(--color-hh-pink)] text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[var(--color-hh-pink-hot)] shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
              id="home-start-creating"
            >
              <span>START CREATING</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Features Row */}
          <div className="flex flex-wrap items-center gap-6 text-mono-small text-[var(--color-sand)] pt-2 border-t border-white/10 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full border border-[var(--color-sun-gold)] flex items-center justify-center text-[var(--color-sun-gold)] shrink-0 bg-black/30">
                <Download size={14} />
              </span>
              <div className="flex flex-col uppercase leading-tight font-mono text-[10px] tracking-wider">
                <span className="text-[var(--color-sand-dark)]">DOWNLOAD</span>
                <span className="font-bold text-[var(--color-cream)]">HIGH QUALITY</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full border border-[var(--color-sun-gold)] flex items-center justify-center text-[var(--color-sun-gold)] shrink-0 bg-black/30">
                <svg width="12" height="12" viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
                </svg>
              </span>
              <div className="flex flex-col uppercase leading-tight font-mono text-[10px] tracking-wider">
                <span className="text-[var(--color-sand-dark)]">SHARE TO X</span>
                <span className="font-bold text-[var(--color-cream)]">IN ONE CLICK</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full border border-[var(--color-sun-gold)] flex items-center justify-center text-[var(--color-sun-gold)] text-sm shrink-0 leading-none bg-black/30">
                🌴
              </span>
              <div className="flex flex-col uppercase leading-tight font-mono text-[10px] tracking-wider">
                <span className="text-[var(--color-sand-dark)]">BE PART OF</span>
                <span className="font-bold text-[var(--color-hh-pink)]">#FRAMEINGOA</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
