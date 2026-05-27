import { Link } from "react-router-dom";
import { ProfileCompletenessPanel } from "../user/ProfileCompletenessPanel";

/** Sidebar widget — links checklist items to Profile Settings */
export function CompletenessWidget() {
  return (
    <div className="space-y-3">
      <ProfileCompletenessPanel />
      <Link
        to="/settings"
        className="block text-center text-xs text-[var(--color-warm)] hover:underline py-1"
      >
        Open full profile settings →
      </Link>
    </div>
  );
}
