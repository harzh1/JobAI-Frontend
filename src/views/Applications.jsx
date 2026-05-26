import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Briefcase,
  DollarSign,
  Link2,
  Eye,
  Edit3
} from "../components/ui/AppIcons";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { applicationService } from "../services/database";
import { APPLICATION_STATUSES } from "../data/databaseSchema";

// --- Constants & Data ---
const BOARD_COLUMNS = [
  { key: "applied", label: "Applied", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200", icon: CheckCircle },
  { key: "interviewing", label: "Interviewing", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" },
  { key: "offered", label: "Offered", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
  { key: "rejected", label: "Rejected", color: "text-red-600", bg: "bg-red-100", border: "border-red-200" },
  { key: "withdrawn", label: "Withdrawn", color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200" },
];

const STATUS_OPTIONS = APPLICATION_STATUSES.map((status) => status.value).filter(s => s !== "saved");

// --- Helper Functions ---
function formatDate(dateValue) {
  if (!dateValue) return "Unknown";
  try {
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

function getApplicationFormData(application = null) {
  const job = application?.jobSnapshot || {};
  return {
    title: job.title || "",
    company: job.company || "",
    companyWebsite: job.companyWebsite || "",
    location: job.location || "",
    salary: job.salary || "",
    sourceUrl: job.sourceUrl || job.applyUrl || "",
    status: application?.status || "applied",
    resumeId: application?.resumeId || "",
  };
}

function formatResumeOptionDate(dateValue) {
  if (!dateValue) return "";
  try {
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

// --- UI Components ---
const Button = ({ children, onClick, variant = "primary", disabled, className = "", icon: Icon, type = "button" }) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#dde3ea] dark:bg-[#333538] text-[#1f1f1f] dark:text-[#e3e3e3] hover:bg-[#c9d3e0] py-2 px-4 shadow-none border-none",
    outline: "bg-gray-100/80 hover:bg-gray-200/80 py-2 px-4 border-none shadow-none text-gray-700",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={16} className={className.includes("text-red") ? "text-red-500" : ""} />}
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md", hideHeader = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`} onClick={e => e.stopPropagation()}>
        {!hideHeader && (
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        )}
        <div className={`overflow-y-auto ${hideHeader ? "" : "p-6"}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main Application Component ---
export default function Applications({ setView, setSelectedJobId }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [viewingResume, setViewingResume] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const loadApplications = async () => {
      try {
        const apps = await applicationService.getAll(user.uid);
        setApplications(apps);
      } catch (error) {
        console.error("Error loading applications:", error);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [user]);

  const refreshApplications = async () => {
    if (!user) return;
    const apps = await applicationService.getAll(user.uid);
    setApplications(apps);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setApplications(apps => apps.map(app => {
        if (app.id === applicationId) {
          const updated = { ...app, status: newStatus, updatedAt: new Date() };
          if (viewingApp?.id === applicationId) setViewingApp(updated);
          return updated;
        }
        return app;
      }));
      await applicationService.updateStatus(user.uid, applicationId, newStatus);
      await refreshApplications();
    } catch (error) {
      console.error("Error updating status:", error);
      refreshApplications();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await applicationService.delete(user.uid, deleteTarget);
      setApplications((current) => current.filter((app) => app.id !== deleteTarget));
      if (viewingApp?.id === deleteTarget) setViewingApp(null);
    } catch (error) {
      console.error("Error deleting application:", error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const job = app.jobSnapshot || {};
      const matchesSearch =
        !searchQuery ||
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [applications, searchQuery]);

  const openJobDetail = (app) => {
    const jobId = app?.jobId || app?.jobSnapshot?.id || null;

    if (jobId) {
      setSelectedJobId(jobId);
      setView("job-detail");
      return;
    }

    const fallbackUrl = app?.jobSnapshot?.sourceUrl || app?.jobSnapshot?.applyUrl || null;
    if (fallbackUrl) {
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    }
  };

  const openResume = (app) => {
    const resumeUrl =
      app?.resumeSnapshot?.downloadUrl || app?.resumeSnapshot?.url || null;

    if (resumeUrl) {
      setViewingResume({
        url: resumeUrl,
        downloadUrl: resumeUrl,
        name: app?.resumeSnapshot?.name || "Resume",
        fileName: app?.resumeSnapshot?.name || "Resume.pdf",
        fileSize: app?.resumeSnapshot?.fileSize || 0,
        previewUrl: resumeUrl,
        canPreview: true,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-slate-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applications..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface-bg)] rounded-full text-sm focus:outline-none transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] border-transparent"
            />
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)} icon={Plus}>
            Add
          </Button>
        </div>
      </div>

      {/* Kanban Board Layout without visible scrollbars */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-5 h-full items-start min-w-max">
          {BOARD_COLUMNS.map(column => {
            const columnApps = filteredApplications
              .filter(app => app.status === column.key)
              .sort((a, b) => {
                const aDate = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : new Date(a.updatedAt || 0).getTime();
                const bDate = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : new Date(b.updatedAt || 0).getTime();
                return bDate - aDate;
              });

            return (
              <div key={column.key} className="w-[320px] shrink-0 flex flex-col h-full max-h-full">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${column.bg.replace('100', '400')}`} />
                    <h3 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">{column.label}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.bg} ${column.color}`}>
                    {columnApps.length}
                  </span>
                </div>

                {/* Column Dropzone / Cards Area without backgrounds */}
                <div 
                  className={`flex-1 overflow-y-auto flex flex-col gap-3 min-h-[150px] transition-all p-1 pb-4 rounded-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${dragOverCol === column.key ? 'bg-[#3442FF]/5 border border-[#3442FF]/30' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverCol(column.key);
                  }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverCol(null);
                    const appId = e.dataTransfer.getData("appId");
                    if (appId) handleStatusChange(appId, column.key);
                  }}
                >
                  {columnApps.length === 0 ? (
                    <div className="h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm font-medium pointer-events-none">Drop here</div>
                  ) : (
                    columnApps.map(app => (
                      <KanbanCard 
                        key={app.id} 
                        application={app} 
                        onClick={() => setViewingApp(app)}
                        onViewJob={() => openJobDetail(app)}
                        onViewResume={() => openResume(app)}
                        onDelete={() => setDeleteTarget(app.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <ApplicationFormModal
          title="Add Application"
          submitLabel="Add Application"
          initialData={getApplicationFormData()}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (jobData) => {
            await applicationService.create(user.uid, jobData, jobData.resumeId);
            await refreshApplications();
            setShowAddModal(false);
          }}
        />
      )}

      {editingApplication && (
        <ApplicationFormModal
          title="Edit Application"
          submitLabel="Save Changes"
          initialData={getApplicationFormData(editingApplication)}
          onClose={() => setEditingApplication(null)}
          onSubmit={async (formData) => {
            await applicationService.update(user.uid, editingApplication.id, formData);
            await refreshApplications();
            setEditingApplication(null);
            setViewingApp(null);
          }}
        />
      )}

      <AppDetailsModal 
        app={viewingApp} 
        isOpen={!!viewingApp} 
        onClose={() => setViewingApp(null)}
        onStatusChange={handleStatusChange}
        onEdit={() => {
          setEditingApplication(viewingApp);
          setViewingApp(null);
        }}
        onViewJob={() => openJobDetail(viewingApp)}
        onViewResume={() => openResume(viewingApp)}
        onDelete={() => setDeleteTarget(viewingApp?.id)}
      />

      {/* Resume Viewer Modal */}
      {viewingResume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-[13px]">
                    {viewingResume.fileName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(viewingResume.fileSize)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.open(viewingResume.downloadUrl, "_blank", "noopener,noreferrer")
                  }
                  className="px-2 py-1 text-[12px]"
                >
                  <Download size={14} className="mr-1" />
                  Download
                </Button>
                <button
                  onClick={() => setViewingResume(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Document Viewer */}
            <div className="flex-1 bg-gray-100">
              {viewingResume.previewUrl ? (
                <iframe
                  src={`${viewingResume.previewUrl}${
                    viewingResume.previewUrl.includes("#")
                      ? ""
                      : "#toolbar=1&navpanes=0"
                  }`}
                  className="w-full h-full"
                  title={viewingResume.fileName}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <FileText size={32} className="text-gray-400 mb-2" />
                  <p className="text-gray-700 font-medium text-[13px]">
                    Preview is not available for this file type.
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Open the resume in a new tab to view or download it.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-3 px-2 py-1 text-[12px]"
                    onClick={() =>
                      window.open(viewingResume.downloadUrl, "_blank", "noopener,noreferrer")
                    }
                  >
                    <Download size={14} className="mr-1" />
                    Open Resume
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete application?"
        description="This action will permanently remove this application."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// --- Kanban Card Component ---
function KanbanCard({ application, onClick, onViewJob, onViewResume, onDelete }) {
  const job = application.jobSnapshot || {};
  const resumeName = application.resumeSnapshot?.name || application.resumeName || null;
  const sourceUrl = job.sourceUrl || job.applyUrl || null;
  const jobId = application.jobId || job.id || null;
  const resumeUrl = application.resumeSnapshot?.downloadUrl || application.resumeSnapshot?.url || null;
  
  const companyDomain = job.companyWebsite || (() => {
    if (!sourceUrl) return null;
    try { return new URL(sourceUrl).hostname.replace(/^www\./, ""); } catch { return null; }
  })();

  const dateValue = application.updatedAt?.toDate ? application.updatedAt.toDate() : new Date(application.updatedAt || Date.now());
  const timeAgo = Math.round((Date.now() - dateValue.getTime()) / 86400000);
  const timeStr = timeAgo === 0 ? "Today" : `${timeAgo}d`;

  return (
    <div 
      draggable
      onDragStart={(e) => e.dataTransfer.setData("appId", application.id)}
      onClick={onClick}
      className="group bg-[var(--surface-bg)] rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 p-4 relative cursor-grab active:cursor-grabbing flex flex-col gap-3 border-transparent border"
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Delete Application"
      >
        <Trash2 size={14} />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#f0f4f9] flex items-center justify-center overflow-hidden shrink-0 border-none">
          {companyDomain ? (
            <img src={`https://www.google.com/s2/favicons?domain=${companyDomain}&sz=128`} alt={job.company} className="w-7 h-7 object-contain mix-blend-multiply" />
          ) : (
            <Building2 size={18} className="text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0 pt-0.5 pr-6">
          <h4 className="text-[15px] font-bold text-[#1f1f1f] leading-tight truncate mb-1" title={job.title}>
            {job.title || "Untitled Role"}
          </h4>
          <p className="text-[13px] font-medium text-[#444746] truncate">{job.company || "Unknown Company"}</p>
        </div>
      </div>
      
      {job.location && (
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#f0f4f9] text-[#444746] text-[11px] font-semibold tracking-wide border-none">
            <MapPin size={10} className="opacity-70" /> {job.location}
          </span>
        </div>
      )}

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2 flex-wrap text-gray-400">
          {resumeUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewResume?.();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-transparent bg-[#f0f4f9] text-[#444746] transition-colors hover:bg-[#e1e5ea]"
              title={resumeName ? `View ${resumeName}` : "View resume"}
            >
              <Eye size={14} />
            </button>
          )}
          {jobId || sourceUrl ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewJob?.();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-transparent bg-[#f0f4f9] text-[#444746] transition-colors hover:bg-[#e1e5ea]"
              title="View job"
            >
              <ExternalLink size={14} />
            </button>
          ) : null}
        </div>
        <span className="text-[12px] font-semibold text-[#444746] shrink-0 flex items-center gap-1.5 opacity-80">
          <Clock size={12} /> {timeStr}
        </span>
      </div>
    </div>
  );
}

// --- App Details Modal ---
function AppDetailsModal({ app, isOpen, onClose, onStatusChange, onEdit, onViewJob, onViewResume, onDelete }) {
  if (!isOpen || !app) return null;

  const job = app.jobSnapshot || {};
  const currentStatusCol = BOARD_COLUMNS.find(c => c.key === app.status) || BOARD_COLUMNS[0];
  const StatusIcon = currentStatusCol.icon || Briefcase;
  
  const resumeName = app.resumeSnapshot?.name || app.resumeName || null;
  const jobId = app.jobId || app.jobSnapshot?.id || null;
  const sourceUrl = job.sourceUrl || job.applyUrl || null;
  const resumeUrl = app.resumeSnapshot?.downloadUrl || app.resumeSnapshot?.url || null;
  const companyDomain = job.companyWebsite || (() => {
    if (!sourceUrl) return null;
    try { return new URL(sourceUrl).hostname.replace(/^www\./, ""); } catch { return null; }
  })();

  const timeline = app.timeline || [{ status: app.status, date: app.updatedAt }];

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader maxWidth="max-w-[42rem]">
      <div className="p-6 md:p-8 bg-white text-gray-900 relative rounded-[28px]">
        {/* Close Button overlay */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-2 text-[#444746] hover:text-[#1f1f1f] bg-transparent hover:bg-[#f0f4f9] rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="flex items-start gap-4 mb-8 pr-12">
          <div className="w-[52px] h-[52px] rounded-2xl bg-[#f0f4f9] flex items-center justify-center shrink-0">
            {companyDomain ? (
              <img src={`https://www.google.com/s2/favicons?domain=${companyDomain}&sz=128`} alt={job.company} className="w-7 h-7 object-contain mix-blend-multiply" />
            ) : (
              <Building2 size={24} className="text-[#444746]" />
            )}
          </div>
          <div className="flex-1 mt-0.5">
            <h2 className="text-[22px] font-normal text-[#1f1f1f] tracking-tight leading-snug mb-1">{job.title || "Untitled Role"}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p className="text-[14px] font-normal text-[#444746]">{job.company || "Unknown Company"}</p>
              <div className="hidden sm:block w-[3px] h-[3px] rounded-full bg-[#c4c7c5]"></div>
              <div className="flex items-center gap-1.5 text-[13px] text-[#444746] font-normal">
                <Clock size={14} className="opacity-70" />
                Applied {formatDate(app.createdAt || app.updatedAt)}
              </div>
            </div>
            <div className="mt-3">
               <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium tracking-wide ${currentStatusCol.bg} ${currentStatusCol.color}`}>
                  <StatusIcon size={12} /> {currentStatusCol.label}
               </div>
            </div>
          </div>
        </div>

        {/* Resume Strip */}
        <div className="bg-[#f0f4f9] rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 transition-colors hover:bg-[#e1e5ea] cursor-pointer" onClick={() => onViewResume?.()}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <FileText size={18} className="text-[#1f1f1f]" />
            </div>
            <div>
              <div className="text-[12px] text-[#444746] font-medium mb-0.5">Attached Resume</div>
              <div className="text-[14px] font-medium text-[#1f1f1f]">{resumeName || "Not provided"}</div>
            </div>
          </div>
          {resumeName && resumeUrl && (
            <div className="flex items-center gap-2 text-[14px] font-medium text-[#1f1f1f]">
              <span className="hidden sm:inline-block">View</span> <Eye size={16} />
            </div>
          )}
        </div>

        {/* Update Status Buttons */}
        <div className="mb-8 pl-1">
          <h4 className="text-[12px] font-medium text-[#444746] uppercase tracking-wider mb-4">Stage</h4>
          <div className="flex flex-wrap gap-2">
            {BOARD_COLUMNS.map(col => (
              <button
                key={col.key}
                onClick={() => onStatusChange(app.id, col.key)}
                className={`px-5 py-2 rounded-full text-[14px] transition-all duration-200 font-medium tracking-wide border-none
                  ${app.status === col.key 
                    ? "bg-[#dde3ea] text-[#1f1f1f]" 
                    : "bg-transparent text-[#444746] hover:bg-[#f0f4f9]"
                  }`}
              >
                {col.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Timeline */}
        <div className="mb-10 pl-1 overflow-hidden w-full">
          <h4 className="text-[12px] font-medium text-[#444746] uppercase tracking-wider mb-5">Timeline</h4>
          <div className="flex items-start overflow-x-auto pb-2 w-full gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {timeline
              .sort((a, b) => {
                const aTime = a.date?.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime();
                const bTime = b.date?.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime();
                return aTime - bTime;
              })
              .map((event, index, arr) => (
              <div key={index} className="relative flex flex-col min-w-[120px] shrink-0">
                {/* Connecting Line */}
                {index !== arr.length - 1 && (
                  <div className="absolute top-[6px] left-[14px] w-[calc(100%-4px)] h-[2px] bg-[#e1e5ea]" />
                )}
                {/* Dot */}
                <div className="w-3 h-3 rounded-full bg-[#dde3ea] shrink-0 mb-3 relative z-10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1f1f1f]"></div>
                </div>
                {/* Label & Date */}
                <span className="font-medium text-[#1f1f1f] capitalize text-[13px] leading-tight mb-0.5">{event.status}</span>
                <span className="text-[#444746] text-[12px]">{formatDate(event.date)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap items-center gap-2 pl-1">
          <button onClick={() => onViewJob?.()} disabled={!jobId && !sourceUrl} className="flex items-center gap-2 py-2.5 px-5 rounded-full text-[#1f1f1f] bg-transparent hover:bg-[#f0f4f9] transition-colors border-none font-medium text-[14px]" title="View Job" >
            <ExternalLink size={16} /> View Job
          </button>
          <button onClick={onEdit} className="flex items-center gap-2 py-2.5 px-5 rounded-full text-[#1f1f1f] bg-transparent hover:bg-[#f0f4f9] transition-colors border-none font-medium text-[14px]">
            <Edit3 size={16}/> Edit
          </button>
          <button onClick={onDelete} className="flex items-center gap-2 py-2.5 px-5 rounded-full text-[#d93025] bg-transparent hover:bg-[#fce8e6] transition-colors border-none font-medium text-[14px] ml-auto">
            <Trash2 size={16}/> Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// --- Application Form Modal (Modern UI) ---
function ApplicationFormModal({ title, submitLabel, initialData, onClose, onSubmit }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(() => initialData);
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);

  useEffect(() => { setFormData(initialData); }, [initialData]);

  useEffect(() => {
    const loadResumes = async () => {
      if (!user) return;
      try {
        const { resumeService } = await import("../services/database");
        const userResumes = await resumeService.getAll(user.uid);
        setResumes(userResumes);
      } catch (error) {
        console.error("Error loading resumes:", error);
      }
    };
    loadResumes();
  }, [user]);

  const handleSubmit = async (event) => {
    event?.preventDefault?.();
    if (!formData.title || !formData.company) return;
    setLoading(true);
    try { await onSubmit(formData); } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={title} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:bg-white focus:ring-4 focus:ring-[#3442FF]/10 focus:border-[#3442FF] transition-all outline-none" placeholder="e.g. Senior Product Designer" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Company Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:bg-white focus:ring-4 focus:ring-[#3442FF]/10 focus:border-[#3442FF] transition-all outline-none" placeholder="e.g. Google" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Company Website</label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={formData.companyWebsite || ""} onChange={e => setFormData({...formData, companyWebsite: e.target.value})} className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:bg-white focus:ring-4 focus:ring-[#3442FF]/10 focus:border-[#3442FF] transition-all outline-none" placeholder="google.com" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={formData.location || ""} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:bg-white focus:ring-4 focus:ring-[#3442FF]/10 focus:border-[#3442FF] transition-all outline-none" placeholder="Remote, NYC..." />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Salary / Compensation</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={formData.salary || ""} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:bg-white focus:ring-4 focus:ring-[#3442FF]/10 focus:border-[#3442FF] transition-all outline-none" placeholder="$120k - $150k" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Job Posting URL</label>
          <div className="relative">
            <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="url" value={formData.sourceUrl || ""} onChange={e => setFormData({...formData, sourceUrl: e.target.value})} className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:bg-white focus:ring-4 focus:ring-[#3442FF]/10 focus:border-[#3442FF] transition-all outline-none" placeholder="https://..." />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-[#f8fafc] border border-gray-200/80 rounded-xl mt-2">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Resume Used</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select value={formData.resumeId || ""} onChange={e => setFormData({...formData, resumeId: e.target.value})} className="w-full pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:ring-4 focus:ring-[#3442FF]/10 focus:border-[#3442FF] appearance-none transition-all outline-none shadow-sm cursor-pointer">
                <option value="">Select a resume...</option>
                {resumes.map((resume) => {
                  const uploadDate = formatResumeOptionDate(resume.uploadedAt || resume.createdAt);
                  return (
                    <option key={resume.id} value={resume.id}>
                      {resume.name} {uploadDate ? `(${uploadDate})` : ""}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {resumes.length === 0 && <p className="mt-1.5 text-xs text-gray-500">No resumes found. Upload one in the Resumes tab.</p>}
          </div>
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Current Status</label>
            <div className="relative">
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-900 focus:ring-4 focus:ring-[#3442FF]/10 focus:border-[#3442FF] appearance-none transition-all outline-none shadow-sm cursor-pointer">
                {BOARD_COLUMNS.map(col => <option key={col.key} value={col.key}>{col.label}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="pt-2 flex gap-3 mt-4">
          <Button variant="ghost" onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading} className="flex-1 bg-[#3442FF] hover:bg-[#2834b3] text-white py-3 rounded-xl font-bold shadow-md shadow-[#3442FF]/20 disabled:opacity-70">
            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
