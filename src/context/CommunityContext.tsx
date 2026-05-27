import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type {
  CommunityPost,
  FeedComment,
  PostAttachment,
  PostRole,
  SkillChallenge,
  ChallengeSubmission,
  ChallengeEnrollment,
  ChallengeDifficulty,
  MentorProfile,
  MentorshipRequest,
  MyMentorSettings,
} from "../types/community";
import { extractUrls, urlsToLinkAttachments } from "../utils/feedUtils";
import { emailsMatch, isPostAuthor, normalizeEmail } from "../utils/emailUtils";

const STORAGE_KEY = "skillsync_community";

interface CommunityState {
  posts: CommunityPost[];
  challenges: SkillChallenge[];
  mentors: MentorProfile[];
  requests: MentorshipRequest[];
  myMentorSettings: Record<string, MyMentorSettings>;
}

function defaultChallenges(): SkillChallenge[] {
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  return [
    {
      id: "ch-1",
      title: "Build a Responsive Dashboard Card",
      description:
        "Create a single dashboard metric card with hover states, skeleton loading, and dark-mode support. Share your CodePen, Figma, or live link.",
      difficulty: "Easy",
      deadline: weekFromNow.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      submissions: [],
      enrollments: [],
    },
    {
      id: "ch-2",
      title: "Optimize a React List for 10k Items",
      description:
        "Demonstrate virtualization or memoization on a large list. Include before/after performance notes.",
      difficulty: "Medium",
      deadline: weekFromNow.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      submissions: [],
      enrollments: [],
    },
    {
      id: "ch-3",
      title: "Design a Freelancer Onboarding Flow",
      description:
        "Reimagine first-time freelancer onboarding in 3–5 screens. Focus on clarity, trust, and speed to first project.",
      difficulty: "Hard",
      deadline: weekFromNow.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      submissions: [],
      enrollments: [],
    },
  ];
}

function isUserEnrolled(enrollments: ChallengeEnrollment[], userEmail: string): boolean {
  const normalized = normalizeEmail(userEmail);
  if (!normalized) return false;
  return enrollments.some((e) => emailsMatch(e.userEmail, normalized));
}

function defaultMentors(): MentorProfile[] {
  return [
    {
      id: "mentor-maya",
      userEmail: "maya@skillsync.demo",
      name: "Maya Chen",
      skills: ["Figma", "Design Systems", "UX"],
      rating: 4.9,
      priceType: "paid",
      pricePerHour: 45,
      sessionType: "1:1",
      available: true,
      sessionsCompleted: 340,
    },
    {
      id: "mentor-james",
      userEmail: "james@skillsync.demo",
      name: "James Okafor",
      skills: ["React", "Node", "System Design"],
      rating: 4.8,
      priceType: "paid",
      pricePerHour: 60,
      sessionType: "1:1",
      available: true,
      sessionsCompleted: 218,
    },
    {
      id: "mentor-elena",
      userEmail: "elena@skillsync.demo",
      name: "Elena Voss",
      skills: ["Python", "LLMs", "MLOps"],
      rating: 4.7,
      priceType: "free",
      sessionType: "group",
      available: true,
      sessionsCompleted: 156,
    },
    {
      id: "mentor-sam",
      userEmail: "sam@skillsync.demo",
      name: "Sam Rivera",
      skills: ["Branding", "Copy", "Positioning"],
      rating: 4.6,
      priceType: "paid",
      pricePerHour: 40,
      sessionType: "1:1",
      available: true,
      sessionsCompleted: 92,
    },
  ];
}

function normalizeStoredState(parsed: CommunityState): CommunityState {
  const myMentorSettings: Record<string, MyMentorSettings> = {};
  for (const [key, value] of Object.entries(parsed.myMentorSettings ?? {})) {
    myMentorSettings[normalizeEmail(key)] = value;
  }

  const mentors = (parsed.mentors?.length ? parsed.mentors : defaultMentors()).map((m) => ({
    ...m,
    userEmail: normalizeEmail(m.userEmail),
  }));

  const challenges = (parsed.challenges?.length ? parsed.challenges : defaultChallenges()).map((c) => ({
    ...c,
    submissions: c.submissions ?? [],
    enrollments: (c.enrollments ?? []).map((e) => ({
      ...e,
      userEmail: normalizeEmail(e.userEmail),
    })),
    createdByEmail: c.createdByEmail ? normalizeEmail(c.createdByEmail) : undefined,
  }));

  return {
    posts: [],
    challenges,
    mentors,
    requests: parsed.requests ?? [],
    myMentorSettings,
  };
}

function loadState(): CommunityState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as CommunityState;
      return normalizeStoredState(parsed);
    } catch {
      /* fall through */
    }
  }
  return {
    posts: [],
    challenges: defaultChallenges(),
    mentors: defaultMentors(),
    requests: [],
    myMentorSettings: {},
  };
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface CommunityContextType {
  posts: CommunityPost[];
  challenges: SkillChallenge[];
  mentors: MentorProfile[];
  requests: MentorshipRequest[];
  getMyMentorSettings: (userEmail: string) => MyMentorSettings | null;
  createPost: (
    content: string,
    hashtags: string[],
    attachments: PostAttachment[],
    authorName: string,
    authorEmail: string,
    role: PostRole
  ) => void;
  deletePost: (postId: string, userEmail: string, authorName?: string) => boolean;
  toggleLikePost: (postId: string, userEmail: string) => void;
  addComment: (postId: string, content: string, authorName: string, authorEmail: string, role: PostRole) => void;
  createChallenge: (
    title: string,
    description: string,
    difficulty: ChallengeDifficulty,
    deadlineIso: string,
    authorName: string,
    authorEmail: string
  ) => string | null;
  deleteChallenge: (challengeId: string, userEmail: string, authorName?: string) => boolean;
  enrollInChallenge: (challengeId: string, userName: string, userEmail: string) => string | null;
  withdrawFromChallenge: (challengeId: string, userEmail: string) => string | null;
  isEnrolledInChallenge: (challengeId: string, userEmail: string) => boolean;
  hasSubmittedToChallenge: (challengeId: string, userEmail: string) => boolean;
  addSubmission: (
    challengeId: string,
    linkOrText: string,
    userName: string,
    userEmail: string
  ) => string | null;
  toggleLikeSubmission: (challengeId: string, submissionId: string, userEmail: string) => void;
  getTopSubmission: (challengeId: string) => ChallengeSubmission | null;
  updateMyMentorSettings: (email: string, settings: MyMentorSettings, name: string) => string | null;
  requestMentorship: (mentorId: string, requesterName: string, requesterEmail: string) => string | null;
  getTrendingTags: () => { tag: string; count: number }[];
  getTopMentors: () => MentorProfile[];
  pendingRequestForMentor: (mentorId: string, requesterEmail: string) => boolean;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CommunityState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const syncMentorFromSettings = useCallback((email: string, settings: MyMentorSettings, name: string) => {
    const normalizedEmail = normalizeEmail(email);
    setState((prev) => {
      const mentors = [...prev.mentors];
      const idx = mentors.findIndex((m) => emailsMatch(m.userEmail, normalizedEmail));
      if (settings.available) {
        const profile: MentorProfile = {
          id: idx >= 0 ? mentors[idx].id : `mentor-${uid()}`,
          userEmail: normalizedEmail,
          name,
          skills: settings.skills,
          rating: idx >= 0 ? mentors[idx].rating : 4.5,
          priceType: settings.priceType,
          pricePerHour: settings.pricePerHour,
          sessionType: settings.sessionType,
          available: true,
          sessionsCompleted: idx >= 0 ? mentors[idx].sessionsCompleted : 0,
        };
        if (idx >= 0) mentors[idx] = profile;
        else mentors.push(profile);
      } else if (idx >= 0) {
        mentors[idx] = { ...mentors[idx], available: false };
      }
      return {
        ...prev,
        mentors,
        myMentorSettings: { ...prev.myMentorSettings, [normalizedEmail]: settings },
      };
    });
  }, []);

  const createPost = useCallback(
    (
      content: string,
      hashtags: string[],
      attachments: PostAttachment[],
      authorName: string,
      authorEmail: string,
      role: PostRole
    ) => {
      const trimmed = content.trim();
      const detectedUrls = extractUrls(trimmed);
      const linkFromContent = urlsToLinkAttachments(detectedUrls, attachments);
      const seenUrls = new Set<string>();
      const mergedAttachments: PostAttachment[] = [];

      for (const a of [...attachments, ...linkFromContent]) {
        if (a.type === "link" && a.url) {
          const key = a.url.toLowerCase();
          if (seenUrls.has(key)) continue;
          seenUrls.add(key);
        }
        mergedAttachments.push({ ...a, id: uid() });
      }

      const post: CommunityPost = {
        id: uid(),
        authorName,
        authorEmail: normalizeEmail(authorEmail),
        role,
        content: trimmed,
        hashtags,
        attachments: mergedAttachments,
        timestamp: Date.now(),
        likes: 0,
        likedBy: [],
        comments: [],
      };
      setState((prev) => ({ ...prev, posts: [post, ...prev.posts] }));
    },
    []
  );

  const deletePost = useCallback((postId: string, userEmail: string, authorName?: string): boolean => {
    let removed = false;
    setState((prev) => {
      const post = prev.posts.find((p) => p.id === postId);
      if (!post) return prev;
      if (!isPostAuthor(post, userEmail, authorName ?? "")) return prev;
      removed = true;
      return { ...prev, posts: prev.posts.filter((p) => p.id !== postId) };
    });
    return removed;
  }, []);

  const toggleLikePost = useCallback((postId: string, userEmail: string) => {
    if (!userEmail) return;
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => {
        if (p.id !== postId) return p;
        const liked = p.likedBy.includes(userEmail);
        return {
          ...p,
          likedBy: liked ? p.likedBy.filter((e) => e !== userEmail) : [...p.likedBy, userEmail],
          likes: liked ? p.likes - 1 : p.likes + 1,
        };
      }),
    }));
  }, []);

  const addComment = useCallback(
    (postId: string, content: string, authorName: string, _authorEmail: string, role: PostRole) => {
      const comment: FeedComment = {
        id: uid(),
        authorName,
        role,
        content: content.trim(),
        timestamp: Date.now(),
      };
      setState((prev) => ({
        ...prev,
        posts: prev.posts.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
        ),
      }));
    },
    []
  );

  const formatChallengeDeadline = (deadlineIso: string): string | null => {
    const d = new Date(deadlineIso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const createChallenge = useCallback(
    (
      title: string,
      description: string,
      difficulty: ChallengeDifficulty,
      deadlineIso: string,
      authorName: string,
      authorEmail: string
    ): string | null => {
      const normalized = normalizeEmail(authorEmail);
      if (!normalized) return "Please sign in from the Dashboard to post a challenge.";
      const trimmedTitle = title.trim();
      const trimmedDesc = description.trim();
      if (trimmedTitle.length < 5) return "Title must be at least 5 characters.";
      if (trimmedDesc.length < 20) return "Description must be at least 20 characters.";
      const deadline = formatChallengeDeadline(deadlineIso);
      if (!deadline) return "Please choose a valid deadline date.";
      const deadlineDate = new Date(deadlineIso);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) return "Deadline must be today or in the future.";

      const challenge: SkillChallenge = {
        id: uid(),
        title: trimmedTitle,
        description: trimmedDesc,
        difficulty,
        deadline,
        submissions: [],
        enrollments: [],
        createdByName: authorName.trim() || "Community member",
        createdByEmail: normalized,
        createdAt: Date.now(),
      };
      setState((prev) => ({ ...prev, challenges: [challenge, ...prev.challenges] }));
      return null;
    },
    []
  );

  const deleteChallenge = useCallback((challengeId: string, userEmail: string, authorName?: string): boolean => {
    const normalized = normalizeEmail(userEmail);
    let removed = false;
    setState((prev) => {
      const challenge = prev.challenges.find((c) => c.id === challengeId);
      if (!challenge) return prev;
      const emailMatch = normalized && emailsMatch(challenge.createdByEmail ?? "", normalized);
      const legacyNameMatch =
        !challenge.createdByEmail &&
        !!authorName?.trim() &&
        challenge.createdByName?.trim() === authorName.trim();
      if (!emailMatch && !legacyNameMatch) return prev;
      removed = true;
      return { ...prev, challenges: prev.challenges.filter((c) => c.id !== challengeId) };
    });
    return removed;
  }, []);

  const enrollInChallenge = useCallback(
    (challengeId: string, userName: string, userEmail: string): string | null => {
      const normalized = normalizeEmail(userEmail);
      if (!normalized) return "Please sign in to enroll in challenges.";
      const trimmedName = userName.trim() || "Participant";
      let error: string | null = null;
      setState((prev) => {
        const challenge = prev.challenges.find((c) => c.id === challengeId);
        if (!challenge) {
          error = "Challenge not found.";
          return prev;
        }
        if (isUserEnrolled(challenge.enrollments, normalized)) {
          error = "You are already enrolled in this challenge.";
          return prev;
        }
        const enrollment: ChallengeEnrollment = {
          id: uid(),
          userName: trimmedName,
          userEmail: normalized,
          enrolledAt: Date.now(),
        };
        return {
          ...prev,
          challenges: prev.challenges.map((c) =>
            c.id === challengeId ? { ...c, enrollments: [enrollment, ...c.enrollments] } : c
          ),
        };
      });
      return error;
    },
    []
  );

  const withdrawFromChallenge = useCallback((challengeId: string, userEmail: string): string | null => {
    const normalized = normalizeEmail(userEmail);
    if (!normalized) return "Please sign in to manage enrollment.";
    let error: string | null = null;
    setState((prev) => {
      const challenge = prev.challenges.find((c) => c.id === challengeId);
      if (!challenge) {
        error = "Challenge not found.";
        return prev;
      }
      if (!isUserEnrolled(challenge.enrollments, normalized)) {
        error = "You are not enrolled in this challenge.";
        return prev;
      }
      return {
        ...prev,
        challenges: prev.challenges.map((c) =>
          c.id === challengeId
            ? {
                ...c,
                enrollments: c.enrollments.filter((e) => !emailsMatch(e.userEmail, normalized)),
              }
            : c
        ),
      };
    });
    return error;
  }, []);

  const isEnrolledInChallenge = useCallback(
    (challengeId: string, userEmail: string): boolean => {
      const challenge = state.challenges.find((c) => c.id === challengeId);
      return challenge ? isUserEnrolled(challenge.enrollments, userEmail) : false;
    },
    [state.challenges]
  );

  const hasSubmittedToChallenge = useCallback(
    (challengeId: string, userEmail: string): boolean => {
      const normalized = normalizeEmail(userEmail);
      if (!normalized) return false;
      const challenge = state.challenges.find((c) => c.id === challengeId);
      return challenge?.submissions.some((s) => emailsMatch(s.userEmail, normalized)) ?? false;
    },
    [state.challenges]
  );

  const addSubmission = useCallback(
    (challengeId: string, linkOrText: string, userName: string, userEmail: string): string | null => {
      const normalized = normalizeEmail(userEmail);
      if (!normalized) return "Please sign in to submit your work.";
      const trimmed = linkOrText.trim();
      if (trimmed.length < 5) return "Submission must be at least 5 characters.";
      let error: string | null = null;
      setState((prev) => {
        const challenge = prev.challenges.find((c) => c.id === challengeId);
        if (!challenge) {
          error = "Challenge not found.";
          return prev;
        }
        if (!isUserEnrolled(challenge.enrollments, normalized)) {
          error = "Enroll in this challenge before submitting your work.";
          return prev;
        }
        if (challenge.submissions.some((s) => emailsMatch(s.userEmail, normalized))) {
          error = "You have already submitted for this challenge.";
          return prev;
        }
        const submission: ChallengeSubmission = {
          id: uid(),
          userName: userName.trim() || "Participant",
          userEmail: normalized,
          linkOrText: trimmed,
          likes: 0,
          likedBy: [],
          timestamp: Date.now(),
        };
        return {
          ...prev,
          challenges: prev.challenges.map((c) =>
            c.id === challengeId ? { ...c, submissions: [submission, ...c.submissions] } : c
          ),
        };
      });
      return error;
    },
    []
  );

  const toggleLikeSubmission = useCallback(
    (challengeId: string, submissionId: string, userEmail: string) => {
      if (!userEmail) return;
      setState((prev) => ({
        ...prev,
        challenges: prev.challenges.map((c) => {
          if (c.id !== challengeId) return c;
          return {
            ...c,
            submissions: c.submissions.map((s) => {
              if (s.id !== submissionId) return s;
              const liked = s.likedBy.includes(userEmail);
              return {
                ...s,
                likedBy: liked ? s.likedBy.filter((e) => e !== userEmail) : [...s.likedBy, userEmail],
                likes: liked ? s.likes - 1 : s.likes + 1,
              };
            }),
          };
        }),
      }));
    },
    []
  );

  const getTopSubmission = useCallback(
    (challengeId: string): ChallengeSubmission | null => {
      const challenge = state.challenges.find((c) => c.id === challengeId);
      if (!challenge?.submissions.length) return null;
      return challenge.submissions.reduce((best, s) => (s.likes > best.likes ? s : best));
    },
    [state.challenges]
  );

  const updateMyMentorSettings = useCallback(
    (email: string, settings: MyMentorSettings, name: string): string | null => {
      const normalized = normalizeEmail(email);
      if (!normalized) {
        return "Please sign in from the Dashboard before saving your mentor profile.";
      }
      if (settings.available && settings.skills.length === 0) {
        return "Add at least one skill when you're available for mentorship.";
      }
      syncMentorFromSettings(normalized, settings, name.trim() || "Mentor");
      return null;
    },
    [syncMentorFromSettings]
  );

  const requestMentorship = useCallback(
    (mentorId: string, requesterName: string, requesterEmail: string): string | null => {
      const mentor = state.mentors.find((m) => m.id === mentorId);
      if (!mentor) return "Mentor not found.";
      if (!mentor.available) return "This mentor is not available.";
      if (mentor.userEmail === requesterEmail) return "You cannot request yourself.";
      const exists = state.requests.some(
        (r) => r.mentorId === mentorId && r.requesterEmail === requesterEmail && r.status === "pending"
      );
      if (exists) return "You already have a pending request.";

      const request: MentorshipRequest = {
        id: uid(),
        mentorId,
        mentorName: mentor.name,
        requesterName,
        requesterEmail,
        timestamp: Date.now(),
        status: "confirmed",
      };
      setState((prev) => ({ ...prev, requests: [request, ...prev.requests] }));
      return null;
    },
    [state.mentors, state.requests]
  );

  const getTrendingTags = useCallback((): { tag: string; count: number }[] => {
    const counts: Record<string, number> = {};
    for (const post of state.posts) {
      for (const tag of post.hashtags ?? []) {
        const key = tag.startsWith("#") ? tag : `#${tag}`;
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [state.posts]);

  const getTopMentors = useCallback((): MentorProfile[] => {
    return [...state.mentors]
      .filter((m) => m.available)
      .sort((a, b) => b.rating - a.rating || b.sessionsCompleted - a.sessionsCompleted)
      .slice(0, 3);
  }, [state.mentors]);

  const pendingRequestForMentor = useCallback(
    (mentorId: string, requesterEmail: string) =>
      state.requests.some(
        (r) => r.mentorId === mentorId && r.requesterEmail === requesterEmail
      ),
    [state.requests]
  );

  const value = useMemo(
    () => ({
      posts: state.posts,
      challenges: state.challenges,
      mentors: state.mentors.filter((m) => m.available),
      requests: state.requests,
      getMyMentorSettings: (userEmail: string) => {
        const key = normalizeEmail(userEmail);
        return key ? state.myMentorSettings[key] ?? null : null;
      },
      createPost,
      deletePost,
      toggleLikePost,
      addComment,
      createChallenge,
      deleteChallenge,
      enrollInChallenge,
      withdrawFromChallenge,
      isEnrolledInChallenge,
      hasSubmittedToChallenge,
      addSubmission,
      toggleLikeSubmission,
      getTopSubmission,
      updateMyMentorSettings,
      requestMentorship,
      getTrendingTags,
      getTopMentors,
      pendingRequestForMentor,
    }),
    [
      state,
      createPost,
      deletePost,
      toggleLikePost,
      addComment,
      createChallenge,
      deleteChallenge,
      enrollInChallenge,
      withdrawFromChallenge,
      isEnrolledInChallenge,
      hasSubmittedToChallenge,
      addSubmission,
      toggleLikeSubmission,
      getTopSubmission,
      updateMyMentorSettings,
      requestMentorship,
      getTrendingTags,
      getTopMentors,
      pendingRequestForMentor,
    ]
  );

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}
