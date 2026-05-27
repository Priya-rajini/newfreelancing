import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './context/UserContext'
import { ProjectProvider } from './context/ProjectContext'
import { TalentProvider } from './context/TalentContext'
import { CommunityProvider } from './context/CommunityContext'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
    <UserProvider>
      <CommunityProvider>
        <TalentProvider>
          <ProjectProvider>
            <App />
          </ProjectProvider>
        </TalentProvider>
      </CommunityProvider>
    </UserProvider>
    </ToastProvider>
  </StrictMode>,
)
