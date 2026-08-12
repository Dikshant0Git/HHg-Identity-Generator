/**
 * Builder class service to deterministically generate a participant's Builder Class
 */

const CLASS_DEFINITIONS = [
  {
    name: "NEURAL CARTOGRAPHER",
    code: "A-07",
    keywords: ["ai", "ml", "machine learning", "python", "llm", "pytorch", "tensorflow", "openai", "gemini", "data", "deep learning"],
  },
  {
    name: "PACKET PHANTOM",
    code: "S-09",
    keywords: ["cybersecurity", "security", "network", "crypto", "rust", "infosec", "blockchain", "web3", "solidity"],
  },
  {
    name: "INTERFACE ARCHITECT",
    code: "U-03",
    keywords: ["react", "vue", "angular", "frontend", "next.js", "nextjs", "tailwind", "vite", "html", "web"],
  },
  {
    name: "SYSTEMS ARCHITECT",
    code: "B-04",
    keywords: ["backend", "systems", "node", "nodejs", "express", "mongo", "mongodb", "sql", "postgresql", "docker", "golang", "go", "c++", "cpp", "java", "devops"],
  },
  {
    name: "PIXEL ALCHEMIST",
    code: "D-02",
    keywords: ["design", "ui/ux", "ux", "ui", "figma", "css", "animation", "threejs", "canvas", "graphic"],
  },
  {
    name: "LOGIC FORGE",
    code: "L-05",
    keywords: ["typescript", "javascript", "algorithms", "problem solving", "cpp", "c#", "scala"],
  },
  {
    name: "SIGNAL HUNTER",
    code: "H-08",
    keywords: ["iot", "hardware", "embedded", "c", "raspberry pi", "arduino", "wireless"],
  },
];

const DEFAULT_CLASS = {
  name: "CODE NOMAD",
  code: "N-01",
};

/**
 * Generate a deterministic builder class from a participant's stack array
 */
export const generateBuilderClass = (stack = []) => {
  if (!Array.isArray(stack) || stack.length === 0) {
    return DEFAULT_CLASS;
  }

  const normalizedStack = stack.map((s) => String(s).trim().toLowerCase());

  // Count matches for each class definition
  let bestMatch = null;
  let maxScore = 0;

  for (const classDef of CLASS_DEFINITIONS) {
    let score = 0;
    for (const tech of normalizedStack) {
      if (classDef.keywords.some((kw) => tech.includes(kw) || kw.includes(tech))) {
        score++;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = { name: classDef.name, code: classDef.code };
    }
  }

  return bestMatch || DEFAULT_CLASS;
};
