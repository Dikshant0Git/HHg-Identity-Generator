import React, { useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { fetchPublicProfile } from '../features/participantSlice';
import { usePageReveal } from '../hooks/useGsapAnimations';
import { BUILDER_CLASSES } from '../utils/constants';

import hhLogo from '../assets/hh-logo.png';
import sunriseArt from '../assets/imgi_1_Sun rise.png';

export default function PublicProfile() {
  const { publicId } = useParams();
  const dispatch = useDispatch();
  const { profileData, profileLoading, profileError } = useSelector((s) => s.participant);
  const pageRef = useRef(null);
  usePageReveal(pageRef);

  useEffect(() => {
    if (publicId) {
      dispatch(fetchPublicProfile(publicId));
    }
  }, [publicId, dispatch]);

  const builderClassInfo = profileData?.builderClass ? BUILDER_CLASSES[profileData.builderClass.name] : BUILDER_CLASSES['CODE NOMAD'];

  return (
    <div ref={pageRef} className="min-h-screen bg-[var(--color-goa-green-deep)] flex flex-col items-center">
      
      {/* Decorative Background */}
      <div className="absolute top-0 w-full h-[50vh] overflow-hidden opacity-30 pointer-events-none">
        <img src={sunriseArt} alt="" className="w-full h-full object-cover mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-goa-green-deep)]" />
      </div>

      <div className="max-w-3xl w-full mx-auto px-4 py-12 relative z-10 flex flex-col flex-1">
        
        {/* Loading */}
        {profileLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-[var(--color-sun-gold)]">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-mono text-lg animate-pulse">VERIFYING BUILDER IDENTITY...</p>
          </div>
        )}

        {/* Error */}
        {profileError && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <h1 className="heading-section text-4xl md:text-6xl text-[var(--color-hh-pink)] mb-4 uppercase">
              Builder Not Found
            </h1>
            <p className="font-body text-[var(--color-sand)] text-lg max-w-md">
              {profileError.code === 'PARTICIPANT_NOT_FOUND'
                ? "This Builder ID has either evaporated into the Goan sun, or it never existed."
                : profileError.message || "An error occurred while retrieving this builder's data."}
            </p>
            <Link to="/" className="btn-hh btn-hh-primary mt-8">
              RETURN TO SHORE
            </Link>
          </div>
        )}

        {/* Profile */}
        {profileData && !profileLoading && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Header: Verified Status */}
            <div className="flex items-center justify-center gap-2 text-[var(--color-goa-green)] bg-[var(--color-sand)] px-4 py-2 rounded-full self-center mb-8 border-2 border-[var(--color-ink-black)] shadow-[4px_4px_0_0_var(--color-ink-black)]">
              <CheckCircle size={18} className="fill-[var(--color-goa-green)] stroke-white" />
              <span className="font-mono font-bold text-sm tracking-widest uppercase">Verified HH Goa 2026 Builder</span>
            </div>

            {/* Main Content Card */}
            <div className="bg-[var(--color-sand)] rounded-2xl border-4 border-[var(--color-ink-black)] shadow-[12px_12px_0_0_var(--color-ink-black)] overflow-hidden">
              
              {/* Top Section: Photo & Core Info */}
              <div className="p-8 md:p-12 border-b-4 border-[var(--color-ink-black)] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden bg-[var(--color-off-white)]">
                
                {/* ID Badge absolute */}
                <div className="absolute top-4 right-4 bg-[var(--color-sun-gold)] text-[var(--color-ink-black)] font-mono font-bold px-3 py-1 text-xs sm:text-sm border-2 border-[var(--color-ink-black)] transform rotate-2">
                  ID: {profileData.publicId}
                </div>

                {/* Photo */}
                <div className="relative shrink-0">
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-[var(--color-ink-black)] overflow-hidden bg-[var(--color-goa-green-dark)] shadow-[6px_6px_0_0_var(--color-ink-black)]">
                    <img src={profileData.photoUrl} alt={profileData.name} className="w-full h-full object-cover" />
                  </div>
                  <div 
                    className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full border-4 border-[var(--color-ink-black)] flex items-center justify-center text-3xl shadow-[4px_4px_0_0_var(--color-ink-black)]"
                    style={{ backgroundColor: builderClassInfo?.color || 'var(--color-hh-pink)' }}
                    title={profileData.builderClass?.name}
                  >
                    {builderClassInfo?.emoji || '🚀'}
                  </div>
                </div>

                {/* Name & Class */}
                <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                  <h1 className="heading-hero text-4xl md:text-6xl text-[var(--color-ink-black)] uppercase leading-none tracking-tight mb-2">
                    {profileData.name}
                  </h1>
                  <p className="font-mono text-lg md:text-xl font-bold uppercase tracking-widest" style={{ color: builderClassInfo?.color || 'var(--color-hh-pink)' }}>
                    {profileData.builderClass?.name || 'CODE NOMAD'}
                  </p>
                  
                  {/* Social Links */}
                  {(profileData.social?.xHandle || profileData.social?.github || profileData.social?.linkedin) && (
                    <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
                      {profileData.social.xHandle && (
                        <a href={`https://x.com/${profileData.social.xHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-ink-black)] text-white flex items-center justify-center hover:scale-110 transition-transform">
                          <svg width="18" height="18" viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/></svg>
                        </a>
                      )}
                      {profileData.social.github && (
                        <a href={`https://github.com/${profileData.social.github}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-ink-black)] text-white flex items-center justify-center hover:scale-110 transition-transform">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                        </a>
                      )}
                      {profileData.social.linkedin && (
                        <a href={`https://linkedin.com/in/${profileData.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-ink-black)] text-white flex items-center justify-center hover:scale-110 transition-transform">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section: Bio & Stack */}
              <div className="p-8 md:p-12 bg-[var(--color-sand)] flex flex-col md:flex-row gap-8">
                
                {/* Bio */}
                {profileData.social?.bio ? (
                  <div className="flex-1">
                    <p className="font-mono text-sm font-bold text-[var(--color-ink-black)] uppercase mb-3 border-b-2 border-[var(--color-ink-black)] pb-2 inline-block">
                      Builder Bio
                    </p>
                    <p className="font-body text-lg text-[var(--color-ink-black)] leading-relaxed font-medium">
                      "{profileData.social.bio}"
                    </p>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="font-mono text-sm font-bold text-[var(--color-ink-black)] uppercase mb-3 border-b-2 border-[var(--color-ink-black)] pb-2 inline-block">
                      Status
                    </p>
                    <p className="font-body text-lg text-[var(--color-ink-black)] leading-relaxed italic opacity-70">
                      Busy shipping code. No time for bios.
                    </p>
                  </div>
                )}

                {/* Stack */}
                <div className="md:w-1/3 shrink-0 border-t-4 border-[var(--color-ink-black)] md:border-t-0 md:border-l-4 pt-6 md:pt-0 md:pl-8">
                  <p className="font-mono text-sm font-bold text-[var(--color-ink-black)] uppercase mb-3">
                    Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.stack?.map((tech) => (
                      <span key={tech} className="bg-[var(--color-ink-black)] text-[var(--color-cream)] px-3 py-1 font-mono text-xs font-bold uppercase border-b-2 border-r-2 border-[var(--color-sun-gold)]">
                        {tech}
                      </span>
                    ))}
                    {!profileData.stack?.length && (
                      <span className="font-mono text-sm opacity-50">UNKNOWN</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Prompt */}
            <div className="mt-12 text-center flex flex-col items-center">
              <img src={hhLogo} alt="HH Goa" className="h-8 mb-4 opacity-70" />
              <Link to="/create" className="text-mono-small text-[var(--color-sun-gold)] hover:text-[var(--color-hh-pink)] flex items-center gap-1 transition-colors">
                WANT YOUR OWN BUILDER ID? <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
