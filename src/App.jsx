import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import AICopilot from "./components/modals/AICopilot.jsx";
import Dashboard from "./views/Dashboard";
import Jobs from "./views/Jobs";
import Campaigns from "./views/Campaigns.jsx";
import Notes from "./views/Notes";
import JobDetail from "./views/JobDetail";
import UserProfile from "./views/UserProfile";
import AllDetails from "./views/AllDetails";
import AuthPage from "./views/AuthPage";
import Resumes from "./views/Resumes";
import Applications from "./views/Applications";

const VIEW_PATHS = {
  dashboard: "/",
  jobs: "/jobs",
  campaigns: "/campaigns",
  "new-campaign": "/campaigns/new",
  notes: "/notes",
  "all-details": "/all-details",
  "user-profile": "/profile",
  resumes: "/resumes",
  tracker: "/applications",
  referrals: "/network",
};

const getRouteStateFromPath = (pathname) => {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath.startsWith("/jobs/")) {
    const jobId = decodeURIComponent(normalizedPath.slice("/jobs/".length));
    return {
      view: jobId ? "job-detail" : "jobs",
      selectedJobId: jobId || null,
    };
  }

  const matchedView = Object.entries(VIEW_PATHS).find(
    ([, path]) => path === normalizedPath
  )?.[0];

  return {
    view: matchedView || "dashboard",
    selectedJobId: null,
  };
};

const getPathForView = (view, selectedJobId) => {
  if (view === "job-detail") {
    return selectedJobId ? `/jobs/${encodeURIComponent(selectedJobId)}` : "/jobs";
  }

  return VIEW_PATHS[view] || VIEW_PATHS.dashboard;
};

function AppContent() {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [routeState, setRouteState] = useState(() =>
    getRouteStateFromPath(window.location.pathname)
  );
  const { view, selectedJobId } = routeState;
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // Data State - views now manage their own data from Firestore
  const [campaigns, setCampaigns] = useState([]);
  const [notes, setNotes] = useState([]);

  const setView = (nextView) => {
    setRouteState((current) => ({
      ...current,
      view: nextView,
    }));
  };

  const setSelectedJobId = (jobId) => {
    setRouteState((current) => ({
      ...current,
      selectedJobId: jobId,
    }));
  };

  useEffect(() => {
    const handlePopState = () => {
      setRouteState(getRouteStateFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const nextPath = getPathForView(view, selectedJobId);
    const currentPath =
      window.location.pathname.replace(/\/+$/, "") || "/";

    if (currentPath !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
  }, [view, selectedJobId]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [view, selectedJobId]);

  return (
    <div
      className={`min-h-screen font-sans flex overflow-hidden theme-${resolvedTheme}`}
      style={{ background: "var(--page-bg)", color: "var(--text-primary)" }}
    >
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        view={view.startsWith("new-") ? "campaigns" : view}
        setView={setView}
        isSidebarOpen={isMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
        user={user}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <Header
          view={view}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          setShowAIModal={setShowAIModal}
        />

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="max-w-7xl mx-auto">
            {view === "dashboard" && (
              <Dashboard setShowAIModal={setShowAIModal} setView={setView} />
            )}

            {view === "jobs" && (
              <Jobs setView={setView} setSelectedJobId={setSelectedJobId} />
            )}

            {view === "job-detail" && (
              <JobDetail
                jobId={selectedJobId}
                onBack={() => {
                  setSelectedJobId(null);
                  setView("jobs");
                }}
              />
            )}

            {(view === "campaigns" || view === "new-campaign") && (
              <Campaigns
                campaigns={campaigns}
                setCampaigns={setCampaigns}
                setView={setView}
                isNewView={view === "new-campaign"}
              />
            )}

            {view === "notes" && <Notes notes={notes} setNotes={setNotes} />}

            {view === "all-details" && <AllDetails />}

            {view === "user-profile" && <UserProfile onLogout={logout} />}

            {view === "resumes" && <Resumes />}

            {view === "tracker" && (
              <Applications
                setView={setView}
                setSelectedJobId={setSelectedJobId}
              />
            )}
          </div>
        </div>
      </main>

      <AICopilot isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AuthenticatedApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return <AppContent />;
}
