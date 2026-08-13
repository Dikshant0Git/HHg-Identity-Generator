import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, ChevronRight, Loader2, Upload } from 'lucide-react';
import {
  updateFormField,
  setStack,
  setPhotoPreview,
  setPhotoUploading,
  setPhotoUrl,
  nextStep,
  prevStep,
  submitParticipant,
} from '../features/participantSlice';
import { usePageReveal } from '../hooks/useGsapAnimations';
import { STACK_SUGGESTIONS } from '../utils/constants';

export default function Create() {
  const pageRef = useRef(null);
  usePageReveal(pageRef);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formData, uploadedPhoto, currentStep, loading, error } = useSelector((state) => state.participant);
  
  const [forging, setForging] = useState(false);
  const [stackInput, setStackInput] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormField({ field: name, value }));
  };

  // Handle Photo Selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      dispatch(setPhotoPreview(previewUrl));
      
      // Simulate upload process to get a URL that passes backend Zod validation
      dispatch(setPhotoUploading(true));
      setTimeout(() => {
        // In a real scenario, upload to ImageKit/S3 here
        dispatch(setPhotoUrl('https://example.com/mock-photo.jpg'));
      }, 1000);
    }
  };

  // Stack Tags Management
  const addStackTag = (tag) => {
    if (formData.stack.length < 8 && !formData.stack.includes(tag)) {
      dispatch(setStack([...formData.stack, tag]));
    }
    setStackInput('');
  };
  
  const removeStackTag = (tagToRemove) => {
    dispatch(setStack(formData.stack.filter(tag => tag !== tagToRemove)));
  };

  const handleStackKeyDown = (e) => {
    if (e.key === 'Enter' && stackInput.trim()) {
      e.preventDefault();
      addStackTag(stackInput.trim());
    }
  };

  // Final Submission
  const handleSubmit = async () => {
    setForging(true);
    const resultAction = await dispatch(submitParticipant(formData));
    
    setTimeout(() => {
      setForging(false);
      if (submitParticipant.fulfilled.match(resultAction)) {
        const publicId = resultAction.payload.participant.publicId;
        navigate(`/preview/${publicId}`);
      }
    }, 2500); // Artificial delay to show the forging animation
  };

  // Step Content Renderers
  const renderDetailsStep = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <label className="block text-mono-label text-[var(--color-sun-gold)] mb-2">FULL NAME</label>
        <input 
          type="text" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          className="w-full bg-transparent border-b-2 border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] text-xl font-body text-[var(--color-cream)] py-2 outline-none transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-mono-label text-[var(--color-sun-gold)] mb-2">EMAIL ADDRESS</label>
        <input 
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          className="w-full bg-transparent border-b-2 border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] text-xl font-body text-[var(--color-cream)] py-2 outline-none transition-colors"
          required
        />
      </div>
    </div>
  );

  const renderPhotoStep = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--color-sand-dark)] hover:border-[var(--color-sun-gold)] transition-colors rounded-xl bg-[var(--color-goa-green-dark)] relative group cursor-pointer">
        <input 
          type="file" 
          accept="image/jpeg, image/png, image/heic"
          onChange={handlePhotoSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {uploadedPhoto.preview ? (
          <div className="flex flex-col items-center relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-sun-gold)] shadow-[4px_4px_0_0_var(--color-ink-black)] mb-4">
              <img src={uploadedPhoto.preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            {uploadedPhoto.uploading ? (
              <p className="text-mono-small text-[var(--color-sand)] flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Uploading...
              </p>
            ) : (
              <p className="text-mono-small text-[var(--color-goa-green)] flex items-center gap-1 bg-[var(--color-sand)] px-2 py-1 rounded">
                <Check size={14} /> Ready
              </p>
            )}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="text-white" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-[var(--color-goa-green)] flex items-center justify-center mb-4 text-[var(--color-sun-gold)]">
              <Upload size={24} />
            </div>
            <p className="font-display font-semibold text-lg text-[var(--color-cream)] mb-1">Upload Photo</p>
            <p className="text-mono-small text-[var(--color-sand)]">Drag & drop or click to browse</p>
            <p className="text-mono-small text-[var(--color-sand-dark)] mt-2">JPG, PNG (Max 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCustomizeStep = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <label className="block text-mono-label text-[var(--color-sun-gold)] mb-2">YOUR TECH STACK (MAX 8)</label>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.stack.map(tag => (
            <span key={tag} className="badge-hh-green flex items-center gap-1 text-sm">
              {tag}
              <button onClick={() => removeStackTag(tag)} className="hover:text-[var(--color-hh-pink)] ml-1">×</button>
            </span>
          ))}
        </div>

        <input 
          type="text" 
          value={stackInput}
          onChange={(e) => setStackInput(e.target.value)}
          onKeyDown={handleStackKeyDown}
          placeholder="Type and press Enter (e.g. React, Python)"
          className="w-full bg-transparent border-b-2 border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] font-body text-[var(--color-cream)] py-2 outline-none transition-colors mb-3"
          disabled={formData.stack.length >= 8}
        />
        
        <div className="flex flex-wrap gap-2">
          {STACK_SUGGESTIONS.filter(s => !formData.stack.includes(s)).slice(0, 8).map(suggestion => (
            <button 
              key={suggestion}
              onClick={() => addStackTag(suggestion)}
              className="text-xs font-mono border border-[var(--color-sand-dark)] text-[var(--color-sand)] hover:border-[var(--color-sun-gold)] hover:text-[var(--color-sun-gold)] px-2 py-1 rounded transition-colors"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--color-goa-green-dark)]">
        <label className="block text-mono-label text-[var(--color-sun-gold)] mb-4">SOCIALS (OPTIONAL)</label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input 
              type="text" 
              name="social.xHandle"
              value={formData.social.xHandle}
              onChange={handleChange}
              placeholder="X (Twitter) Handle"
              className="w-full bg-black/20 border border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] p-3 text-sm font-body text-[var(--color-cream)] outline-none rounded"
            />
          </div>
          <div>
            <input 
              type="text" 
              name="social.github"
              value={formData.social.github}
              onChange={handleChange}
              placeholder="GitHub Username"
              className="w-full bg-black/20 border border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] p-3 text-sm font-body text-[var(--color-cream)] outline-none rounded"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <textarea 
            name="social.bio"
            value={formData.social.bio}
            onChange={handleChange}
            placeholder="A short bio..."
            maxLength={280}
            rows={3}
            className="w-full bg-black/20 border border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] p-3 text-sm font-body text-[var(--color-cream)] outline-none rounded resize-none"
          />
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    if (currentStep === 1) return formData.name.trim() && formData.email.trim();
    if (currentStep === 2) return formData.photoUrl && !uploadedPhoto.uploading;
    if (currentStep === 3) return formData.stack.length > 0;
    return true;
  };

  if (forging) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 mb-8 relative animate-spin-slow">
          <div className="absolute inset-0 rounded-full border-4 border-t-[var(--color-hh-pink)] border-r-[var(--color-sun-gold)] border-b-[var(--color-goa-green)] border-l-[var(--color-sand)]" />
        </div>
        <h2 className="heading-section text-2xl md:text-4xl text-[var(--color-cream)] animate-pulse">
          FORGING YOUR BUILDER ID...
        </h2>
        <p className="text-mono-label text-[var(--color-sun-gold)] mt-4">
          ANALYZING STACK • ASSIGNING BUILDER CLASS
        </p>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="section-hh min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="mb-12">
          <p className="text-mono-label text-[var(--color-hh-pink)] mb-2">BUILDER ID GENERATOR</p>
          <h1 className="heading-hero text-4xl md:text-5xl text-[var(--color-cream)]">
            CREATE YOUR <span className="text-[var(--color-sun-gold)]">BUILDER ID</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Side: Steps Indicator */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            {[ 
              { num: 1, title: 'DETAILS', desc: 'Who are you?' },
              { num: 2, title: 'PHOTO', desc: 'Face reveal.' },
              { num: 3, title: 'CUSTOMIZE', desc: 'Your stack & socials.' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div key={step.num} className={`flex items-start gap-4 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono font-bold shrink-0 transition-colors
                    ${isActive ? 'border-[var(--color-sun-gold)] text-[var(--color-sun-gold)]' : 
                      isPast ? 'bg-[var(--color-goa-green)] border-[var(--color-goa-green)] text-white' : 
                      'border-[var(--color-sand-dark)] text-[var(--color-sand-dark)]'}`}
                  >
                    {isPast ? <Check size={20} /> : step.num}
                  </div>
                  <div>
                    <h3 className={`font-display font-semibold tracking-wide ${isActive ? 'text-[var(--color-cream)]' : 'text-[var(--color-sand)]'}`}>
                      {step.title}
                    </h3>
                    <p className="text-mono-small mt-1 text-[var(--color-sand-dark)]">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side: Form Content */}
          <div className="lg:w-2/3">
            <div className="card-hh p-6 md:p-10 min-h-[400px] flex flex-col justify-between relative bg-[var(--color-goa-green-deep)] overflow-hidden">
              
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-goa-green)] via-[var(--color-sun-gold)] to-[var(--color-hh-pink)]" />

              <div className="mb-8">
                {currentStep === 1 && renderDetailsStep()}
                {currentStep === 2 && renderPhotoStep()}
                {currentStep === 3 && renderCustomizeStep()}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 text-sm font-mono rounded">
                  Error: {error.message || 'Something went wrong'}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-[var(--color-goa-green-dark)] mt-auto">
                <button 
                  onClick={() => dispatch(prevStep())}
                  disabled={currentStep === 1}
                  className={`text-mono-small uppercase tracking-widest ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-[var(--color-sand)] hover:text-[var(--color-sun-gold)] transition-colors'}`}
                >
                  ← Back
                </button>
                
                {currentStep < 3 ? (
                  <button 
                    onClick={() => dispatch(nextStep())}
                    disabled={!canProceed()}
                    className="btn-hh btn-hh-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    NEXT <ChevronRight size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    disabled={!canProceed() || loading}
                    className="btn-hh btn-hh-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-[var(--color-hh-pink)] hover:bg-[var(--color-hh-pink-hot)]"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'FORGE ID'}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
