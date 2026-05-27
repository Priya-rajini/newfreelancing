import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { CursorGlow } from "../ui/CursorGlow";

export function PageShell() {
  const location = useLocation();
  const hideNav = false;

  return (
    <div className="noise min-h-screen">
      <CursorGlow />
      {!hideNav && <Navbar />}
      <main key={location.pathname} className="page-enter">
        <Outlet />
      </main>
    </div>
  );
}
