export interface McqQuestion {
  q: string;
  options: string[];
  correct: number;
}

export interface SkillTest {
  id: string;
  skill: string;
  badgeName: string;
  description: string;
  mcq: McqQuestion[];
  practical: {
    prompt: string;
    hint: string;
    minLength: number;
    /** Keywords AI checks for a passing practical answer */
    keywords: string[];
  };
  passThreshold: number;
}

export const skillTests: SkillTest[] = [
  {
    id: "react",
    skill: "React",
    badgeName: "Verified React Developer",
    description: "Hooks, rendering, state, and component architecture",
    passThreshold: 2,
    mcq: [
      {
        q: "What is the primary purpose of `useEffect` in React?",
        options: [
          "To memoize expensive calculations",
          "To synchronize components with external systems and side effects",
          "To create context providers",
          "To replace class components entirely",
        ],
        correct: 1,
      },
      {
        q: "When does React re-render a function component?",
        options: [
          "Only when props change, never from state",
          "When state or props used in render change, or parent re-renders",
          "Only on mount and unmount",
          "When the DOM mutates directly",
        ],
        correct: 1,
      },
    ],
    practical: {
      prompt:
        "Write a short explanation (or pseudocode) for a custom `useDebouncedValue` hook that delays updating a search input value by 300ms. Mention cleanup to avoid stale updates.",
      hint: "Include useEffect, setTimeout/clearTimeout, and dependency array.",
      minLength: 80,
      keywords: ["useeffect", "timeout", "cleanup", "debounc", "dependenc"],
    },
  },
  {
    id: "typescript",
    skill: "TypeScript",
    badgeName: "Verified TypeScript Developer",
    description: "Types, generics, and safe API design",
    passThreshold: 2,
    mcq: [
      {
        q: "What does `extends` mean in a generic constraint `<T extends { id: string }>`?",
        options: [
          "T must inherit from a class",
          "T must be assignable to a type with at least an `id: string` property",
          "T is optional",
          "T is always `string`",
        ],
        correct: 1,
      },
      {
        q: "Which utility type makes all properties of T optional?",
        options: ["Partial<T>", "Pick<T, K>", "Record<K, V>", "Omit<T, K>"],
        correct: 0,
      },
    ],
    practical: {
      prompt:
        "Describe how you would type a function `fetchUser(id: string)` that returns a discriminated union: `{ ok: true, data: User } | { ok: false, error: string }`.",
      hint: "Mention union types and narrowing with `ok`.",
      minLength: 60,
      keywords: ["union", "ok", "user", "error", "narrow", "discriminat"],
    },
  },
  {
    id: "nodejs",
    skill: "Node.js",
    badgeName: "Verified Node.js Developer",
    description: "Async I/O, APIs, and backend patterns",
    passThreshold: 2,
    mcq: [
      {
        q: "In Node.js, what is the event loop primarily responsible for?",
        options: [
          "Compiling TypeScript",
          "Scheduling callback execution for async operations",
          "Managing CSS in SSR",
          "Replacing the need for promises",
        ],
        correct: 1,
      },
      {
        q: "Which approach avoids blocking the main thread when reading a large file?",
        options: [
          "fs.readFileSync in a tight loop",
          "Streams or async fs.promises.readFile",
          "Global variables",
          "Multiple while(true) loops",
        ],
        correct: 1,
      },
    ],
    practical: {
      prompt:
        "Outline how you would structure error handling in an Express route that calls an external API — include try/catch or middleware and HTTP status codes.",
      hint: "Mention async handler, 500 vs 4xx, and logging.",
      minLength: 70,
      keywords: ["express", "error", "async", "status", "middleware", "catch"],
    },
  },
  {
    id: "figma",
    skill: "UI/UX",
    badgeName: "Verified UI/UX Designer",
    description: "Accessibility, systems, and interaction design",
    passThreshold: 2,
    mcq: [
      {
        q: "Which WCAG level requires 4.5:1 contrast for normal text?",
        options: ["Level A", "Level AA", "Level AAA only", "None"],
        correct: 1,
      },
      {
        q: "What is the main benefit of design tokens in a design system?",
        options: [
          "They replace the need for developers",
          "Consistent, scalable values shared across design and code",
          "They only apply to marketing sites",
          "They increase file size intentionally",
        ],
        correct: 1,
      },
    ],
    practical: {
      prompt:
        "Describe how you would audit an existing dashboard for accessibility issues before handoff. List at least three checks you would run.",
      hint: "Contrast, keyboard focus, labels/ARIA, heading hierarchy.",
      minLength: 80,
      keywords: ["contrast", "keyboard", "focus", "aria", "screen", "audit"],
    },
  },
];

export function getSkillTest(id: string) {
  return skillTests.find((t) => t.id === id);
}
