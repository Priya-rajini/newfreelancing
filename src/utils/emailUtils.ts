export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailsMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  return normalizeEmail(a) === normalizeEmail(b);
}

export function namesMatch(a: string, b: string): boolean {
  if (!a?.trim() || !b?.trim()) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** True when the signed-in user authored this post */
export function isPostAuthor(
  post: { authorEmail: string; authorName: string },
  userEmail: string,
  userName: string
): boolean {
  if (userEmail && post.authorEmail && emailsMatch(post.authorEmail, userEmail)) {
    return true;
  }
  if (userName && namesMatch(post.authorName, userName)) {
    if (!normalizeEmail(post.authorEmail)) return true;
    if (userEmail && emailsMatch(post.authorEmail, userEmail)) return true;
  }
  return false;
}
