import type { PostAttachment } from "../types/community";

const HASHTAG_REGEX = /#[\w-]+/gi;
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

export function extractHashtags(text: string): string[] {
  const matches = text.match(HASHTAG_REGEX) ?? [];
  return [...new Set(matches.map((h) => h.toLowerCase()))];
}

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) ?? [];
  return [...new Set(matches)];
}

/** Text remaining after stripping hashtags and URLs */
export function getMeaningfulContent(text: string): string {
  return text.replace(HASHTAG_REGEX, "").replace(URL_REGEX, "").replace(/\s+/g, " ").trim();
}

export function validatePostContent(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return "Please add meaningful content";
  const meaningful = getMeaningfulContent(trimmed);
  if (meaningful.length < 10) return "Please add meaningful content";
  return null;
}

export function urlsToLinkAttachments(urls: string[], existing: PostAttachment[]): PostAttachment[] {
  const existingUrls = new Set(
    existing.filter((a) => a.type === "link" && a.url).map((a) => a.url!.toLowerCase())
  );
  return urls
    .filter((url) => !existingUrls.has(url.toLowerCase()))
    .map((url) => ({
      id: `link-${url}`,
      type: "link" as const,
      url,
    }));
}

export function formatHashtag(tag: string) {
  return tag.startsWith("#") ? tag : `#${tag}`;
}

export function hostnameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
