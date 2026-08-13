/**
 * Builder class definitions — mirrored from backend builderClass.service.js
 * Used for UI display (colors, icons) on the frontend.
 * The backend is authoritative for class assignment.
 */

export const BUILDER_CLASSES = {
  'NEURAL CARTOGRAPHER': { code: 'A-07', color: 'var(--color-hh-pink)', emoji: '🧠' },
  'PACKET PHANTOM': { code: 'S-09', color: 'var(--color-sun-gold)', emoji: '👻' },
  'INTERFACE ARCHITECT': { code: 'U-03', color: 'var(--color-goa-green)', emoji: '🎨' },
  'SYSTEMS ARCHITECT': { code: 'B-04', color: 'var(--color-sun-gold)', emoji: '⚙️' },
  'PIXEL ALCHEMIST': { code: 'D-02', color: 'var(--color-hh-pink)', emoji: '✨' },
  'LOGIC FORGE': { code: 'L-05', color: 'var(--color-sun-gold-light)', emoji: '🔧' },
  'SIGNAL HUNTER': { code: 'H-08', color: 'var(--color-goa-green)', emoji: '📡' },
  'CODE NOMAD': { code: 'N-01', color: 'var(--color-sand)', emoji: '🏄' },
};

/**
 * Stack technology suggestions — used for UI autocomplete.
 * Matches backend keywords.
 */
export const STACK_SUGGESTIONS = [
  'AI', 'ML', 'Python', 'React', 'Node', 'Express', 'MongoDB',
  'TypeScript', 'JavaScript', 'Next.js', 'Vue', 'Angular', 'Go',
  'Rust', 'C++', 'Java', 'Docker', 'Kubernetes', 'PostgreSQL',
  'TailwindCSS', 'Figma', 'Design', 'UI/UX', 'ThreeJS',
  'Cybersecurity', 'Blockchain', 'Web3', 'Solidity',
  'IoT', 'Hardware', 'Embedded', 'Arduino',
  'LLM', 'PyTorch', 'TensorFlow', 'Data', 'Deep Learning',
];

/**
 * Public ID format regex — matches backend HH26-XXXXXX pattern.
 */
export const PUBLIC_ID_REGEX = /^HH26-[A-Z0-9]{6}$/;

export const isValidPublicId = (id) => PUBLIC_ID_REGEX.test(id);
