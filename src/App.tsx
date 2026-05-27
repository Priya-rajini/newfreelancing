import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import { Landing } from "./pages/Landing";
import { Talent } from "./pages/Talent";
import { Projects } from "./pages/Projects";
import { Community } from "./pages/Community";
import { Mentorship } from "./pages/Mentorship";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Portfolio } from "./pages/Portfolio";
import { ProjectDetail } from "./pages/ProjectDetail";
import { OpenProjectDetail } from "./pages/OpenProjectDetail";
import { SmartMatch } from "./pages/ai/SmartMatch";
import { ProposalEvaluator } from "./pages/ai/ProposalEvaluator";
import { SkillVerification } from "./pages/ai/SkillVerification";
import { PostProject } from "./pages/PostProject";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageShell />}>
          <Route index element={<Landing />} />
          <Route path="talent" element={<Talent />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/open/:id" element={<OpenProjectDetail />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="community" element={<Community />} />
          <Route path="mentorship" element={<Mentorship />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="ai/smart-match" element={<SmartMatch />} />
          <Route path="ai/proposal-evaluator" element={<ProposalEvaluator />} />
          <Route path="ai/skill-verification" element={<SkillVerification />} />
          <Route path="post-project" element={<PostProject />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
