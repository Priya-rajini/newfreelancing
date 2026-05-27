import { Navigate } from "react-router-dom";

/** Legacy route — redirects to Community mentorship tab */
export function Mentorship() {
  return <Navigate to="/community?tab=mentorship" replace />;
}
