export type PostRole = "freelancer" | "client";

export type AttachmentType = "image" | "link" | "file";

export interface PostAttachment {
  id: string;
  type: AttachmentType;
  url?: string;
  name?: string;
}

export interface FeedComment {
  id: string;
  authorName: string;
  role: PostRole;
  content: string;
  timestamp: number;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorEmail: string;
  role: PostRole;
  content: string;
  hashtags: string[];
  attachments: PostAttachment[];
  timestamp: number;
  likes: number;
  likedBy: string[];
  comments: FeedComment[];
}

export type ChallengeDifficulty = "Easy" | "Medium" | "Hard";

export interface ChallengeSubmission {
  id: string;
  userName: string;
  userEmail: string;
  linkOrText: string;
  likes: number;
  likedBy: string[];
  timestamp: number;
}

export interface ChallengeEnrollment {
  id: string;
  userName: string;
  userEmail: string;
  enrolledAt: number;
}

export interface SkillChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  deadline: string;
  submissions: ChallengeSubmission[];
  enrollments: ChallengeEnrollment[];
  createdByName?: string;
  createdByEmail?: string;
  createdAt?: number;
}

export type SessionType = "1:1" | "group";
export type MentorPriceType = "free" | "paid";

export interface MentorProfile {
  id: string;
  userEmail: string;
  name: string;
  skills: string[];
  rating: number;
  priceType: MentorPriceType;
  pricePerHour?: number;
  sessionType: SessionType;
  available: boolean;
  sessionsCompleted: number;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  requesterName: string;
  requesterEmail: string;
  timestamp: number;
  status: "pending" | "confirmed";
}

export interface MyMentorSettings {
  available: boolean;
  skills: string[];
  priceType: MentorPriceType;
  pricePerHour: number;
  sessionType: SessionType;
}

export type CommunityTab = "feed" | "challenges" | "mentorship";
