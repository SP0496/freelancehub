import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PortalProvider } from './context/PortalContext'
import { ProtectedRoute } from './components/common/ProtectedRoute'

// Layouts
import { PublicLayout } from './components/layout/PublicLayout'
import { FreelancerLayout } from './components/layout/FreelancerLayout'
import { ClientLayout } from './components/layout/ClientLayout'

// Public Pages
import { LandingPage } from './pages/public/LandingPage'
import { RoleSelectPage } from './pages/public/RoleSelectPage'
import { LoginPage } from './pages/public/LoginPage'
import { RegisterPage } from './pages/public/RegisterPage'
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage'
import { TermsPage } from './pages/public/TermsPage'

// Freelancer Pages
import { FreelancerDashboard } from './pages/freelancer/FreelancerDashboard'
import { BrowseProjectsPage } from './pages/freelancer/BrowseProjectsPage'
import { ProjectDetailPage } from './pages/freelancer/ProjectDetailPage'
import { MyProposalsPage } from './pages/freelancer/MyProposalsPage'
import { ActiveContractsPage } from './pages/freelancer/ActiveContractsPage'
import { EarningsPage } from './pages/freelancer/EarningsPage'
import { MessagesPage } from './pages/freelancer/MessagesPage'
import { NotificationsPage } from './pages/freelancer/NotificationsPage'
import { PortfolioPage } from './pages/freelancer/PortfolioPage'
import { ReviewsPage } from './pages/freelancer/ReviewsPage'
import { SavedProjectsPage } from './pages/freelancer/SavedProjectsPage'
import { FreelancerProfilePage } from './pages/freelancer/FreelancerProfilePage'
import { HelpPage as FreelancerHelpPage } from './pages/freelancer/HelpPage'

// Client Pages
import { ClientDashboard } from './pages/client/ClientDashboard'
import { PostProjectPage } from './pages/client/PostProjectPage'
import { MyProjectsPage } from './pages/client/MyProjectsPage'
import { EditProjectPage } from './pages/client/EditProjectPage'
import { ProjectProposalsPage } from './pages/client/ProjectProposalsPage'
import { BrowseFreelancersPage } from './pages/client/BrowseFreelancersPage'
import { ClientContractsPage } from './pages/client/ClientContractsPage'
import { PaymentsPage } from './pages/client/PaymentsPage'
import { ClientMessagesPage } from './pages/client/ClientMessagesPage'
import { ClientNotificationsPage } from './pages/client/ClientNotificationsPage'
import { ClientReviewsPage } from './pages/client/ClientReviewsPage'
import { CompanyProfilePage } from './pages/client/CompanyProfilePage'
import { ClientHelpPage } from './pages/client/ClientHelpPage'

export const App: React.FC = () => {
  return (
    <PortalProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/select-role" element={<RoleSelectPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>

          {/* Freelancer Portal Routes */}
          <Route
            path="/freelancer"
            element={
              <ProtectedRoute requiredPortal="freelancer">
                <FreelancerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
            <Route path="dashboard" element={<FreelancerDashboard />} />
            <Route path="projects" element={<BrowseProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="proposals" element={<MyProposalsPage />} />
            <Route path="contracts" element={<ActiveContractsPage />} />
            <Route path="earnings" element={<EarningsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="saved" element={<SavedProjectsPage />} />
            <Route path="profile" element={<FreelancerProfilePage />} />
            <Route path="help" element={<FreelancerHelpPage />} />
          </Route>

          {/* Client Portal Routes */}
          <Route
            path="/client"
            element={
              <ProtectedRoute requiredPortal="client">
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="projects/new" element={<PostProjectPage />} />
            <Route path="projects" element={<MyProjectsPage />} />
            <Route path="projects/:id/edit" element={<EditProjectPage />} />
            <Route path="projects/:id/proposals" element={<ProjectProposalsPage />} />
            <Route path="freelancers" element={<BrowseFreelancersPage />} />
            <Route path="contracts" element={<ClientContractsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="messages" element={<ClientMessagesPage />} />
            <Route path="notifications" element={<ClientNotificationsPage />} />
            <Route path="reviews" element={<ClientReviewsPage />} />
            <Route path="profile" element={<CompanyProfilePage />} />
            <Route path="help" element={<ClientHelpPage />} />
          </Route>

          {/* Global Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PortalProvider>
  )
}

export default App
