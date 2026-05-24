import React, { useState, useEffect } from "react";
import {
  Briefcase,
  TrendingUp,
  FileText,
  Sparkles,
  Loader2,
} from "../components/ui/AppIcons";
import { Card, Button, Badge } from "../components/ui/UIComponents";
import { useAuth } from "../context/AuthContext";
import { getUserStats } from "../services/database";

export default function Dashboard({ setShowAIModal, setView }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    savedJobs: 0,
    resumeCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const { stats: fetchedStats, applications: apps } = await getUserStats(
          user.uid
        );
        setApplications(apps);
        setStats(fetchedStats);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter out rejected and withdrawn applications for active count
  const activeApplications = applications.filter(
    (app) => app.status !== "rejected" && app.status !== "withdrawn"
  );

  // Calculate response rate (applications with interviews / total active applications)
  const interviewedCount = activeApplications.filter(
    (app) =>
      app.status === "interviewing" ||
      app.status === "offer" ||
      app.status === "accepted"
  ).length;
  const responseRate =
    activeApplications.length > 0
      ? Math.round((interviewedCount / activeApplications.length) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#3442FF] mb-4" size={32} />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Main Column */}
      <div className="flex-1 min-w-0 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full">
                <Briefcase size={20} />
              </div>
              {activeApplications.length > 0 && (
                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>
            <div>
              <div className="text-3xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                {activeApplications.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Active Applications
              </div>
            </div>
          </Card>
          <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-full">
                <TrendingUp size={20} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                {responseRate}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Response Rate
              </div>
            </div>
          </Card>
          <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-full">
                <FileText size={20} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                {stats.resumeCount || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Resumes Uploaded
              </div>
            </div>
          </Card>
        </div>



        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 tracking-tight">
              Recent Applications
            </h3>
            <Button
              variant="ghost"
              className="text-[#3442FF] text-sm font-bold hover:bg-[#3442FF]/10 px-4 py-2 rounded-full"
              onClick={() => setView?.("applications")}
            >
              View All
            </Button>
          </div>
          <Card noPadding className="overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] ring-1 ring-[#e1e5ea] dark:ring-[#333538]/50 border-none rounded-[32px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-[#f0f4f9]/50 dark:bg-[#1e1f20]/50 text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest border-b border-[#e1e5ea] dark:border-[#333538]/50">
                  <tr>
                    <th className="px-6 py-5">Company</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e5ea] dark:divide-[#333538]/50">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-[var(--muted)] font-medium">
                        No applications yet. Start exploring jobs!
                      </td>
                    </tr>
                  ) : (
                    applications.slice(0, 5).map((app) => {
                      const job = app.jobSnapshot || {};
                      const companyDomain = job.companyWebsite || (() => {
                        const url = job.applyUrl || job.sourceUrl;
                        if (!url) return null;
                        try {
                          return new URL(url).hostname.replace(/^www\./, "");
                        } catch {
                          return null;
                        }
                      })();

                      return (
                        <tr key={app.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden bg-white dark:bg-[#282a2c] shadow-sm`}>
                                {companyDomain ? (
                                  <img
                                    src={`https://www.google.com/s2/favicons?domain=${companyDomain}&sz=128`}
                                    alt={job.company || "Company"}
                                    className="w-6 h-6 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <span style={{ display: companyDomain ? "none" : "flex" }} className="w-full h-full items-center justify-center font-bold text-[var(--muted)]">
                                  {job.logo || "??"}
                                </span>
                              </div>
                              <span className="font-bold text-[var(--text-primary)] text-[15px]">
                                {job.company || "Unknown Company"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[15px] text-[var(--muted)] font-medium">
                            {job.title || "Unknown Role"}
                          </td>
                          <td className="px-6 py-4 text-[14px] text-[var(--muted)] font-medium">
                            {app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Badge color={app.status === "applied" ? "blue" : app.status === "interviewing" ? "purple" : app.status === "offer" ? "green" : app.status === "accepted" ? "green" : app.status === "rejected" ? "red" : app.status === "withdrawn" ? "gray" : "blue"}>
                              {app.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Right Rail */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-[var(--surface-bg)] z-0"></div>
          {/* Subtle gemini gradient block behind */}
          <div className="absolute top-0 left-0 right-0 h-1 gemini-bg-gradient z-0"></div>
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-[#f0f4f9] dark:bg-[#1e1f20] rounded-full text-[#3442FF]">
                <div className="gemini-text-gradient"><Sparkles size={18} /></div>
              </div>
              <div>
                <h3 className="font-bold text-[15px] text-[var(--text-primary)]">Copilot Insight</h3>
                <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-medium">
                  Your profile matches 95% with the new
                  <strong className="text-[var(--text-primary)] font-bold"> Senior Frontend </strong>
                  role at Nebula AI.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowAIModal?.(true)}
              variant="copilot"
              className="w-full text-sm py-2.5 rounded-full"
            >
              <div className="gemini-text-gradient brightness-200 contrast-150 font-bold">View Opportunity</div>
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-4 tracking-tight">
            Recommended Actions
          </h3>
          <ul className="space-y-4">
            {/* List items... */}
            <li className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full border-2 border-[#e1e5ea] dark:border-[#333538] flex-shrink-0 mt-0.5 hover:border-[#3442FF] cursor-pointer transition-colors" />
              <div>
                <p className="text-[14px] font-bold text-[var(--text-primary)]">
                  Review resume for "Backend" roles
                </p>
                <p className="text-[13px] text-[var(--muted)] mt-1 font-medium">
                  Increase match score by 15%
                </p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
