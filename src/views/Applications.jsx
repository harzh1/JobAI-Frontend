import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  MapPin,
  FileText,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Filter,
  Search,
  Pencil,
} from "../components/ui/AppIcons";
import { Card, Button, Badge } from "../components/ui/UIComponents";
import { useAuth } from "../context/AuthContext";
import { applicationService } from "../services/database";
import { APPLICATION_STATUSES } from "../data/databaseSchema";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    saved: { color: "bg-gray-100 text-gray-700", icon: Clock },
    applied: { color: "bg-blue-100 text-blue-700", icon: Briefcase },
    interviewing: { color: "bg-yellow-100 text-yellow-700", icon: Calendar },
    offered: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    rejected: { color: "bg-red-100 text-red-700", icon: XCircle },
    withdrawn: { color: "bg-purple-100 text-purple-700", icon: AlertCircle },
  };

  const config = statusConfig[status] || statusConfig.saved;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
    >
      <Icon size={12} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ApplicationCard = ({
  application,
  onStatusChange,
  onDelete,
  onViewJob,
  onViewResume,
  onEdit,
  expanded,
  onToggleExpand,
}) => {
  const [updating, setUpdating] = useState(false);
  const [iconError, setIconError] = useState(false);
  const job = application.jobSnapshot || {};
  const companyDomain =
    job.companyWebsite ||
    (() => {
      const url = job.applyUrl || job.sourceUrl;
      if (!url) return null;
      try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, "");
      } catch {
        return null;
      }
    })();
  const resumeName =
    application.resumeSnapshot?.name || application.resumeName || "Resume";
  const resumeUrl =
    application.resumeSnapshot?.downloadUrl ||
    application.resumeSnapshot?.cloudinaryUrl ||
    application.resumeSnapshot?.fileUrl ||
    null;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    await onStatusChange(application.id, newStatus);
    setUpdating(false);
  };

  const formatDate = (dateValue) => {
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
  };

  return (
    <Card className="group hover:shadow-lg hover:border-indigo-100 transition-all duration-300 border border-gray-100 bg-white/90">
      <div className="flex flex-col gap-2">
        {/* Header */}
        <div
          className="flex items-start justify-between cursor-pointer select-none"
          onClick={onToggleExpand}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border overflow-hidden ${
                job.color || "bg-indigo-50 border-indigo-100 text-indigo-600"
              }`}
            >
              {!iconError && companyDomain ? (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${companyDomain}&sz=128`}
                  alt={job.company}
                  className="w-8 h-8 object-contain"
                  onError={() => setIconError(true)}
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center">
                  {job.logo || <Building2 size={24} />}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
              <p className="text-sm text-gray-600 font-medium">{job.company}</p>
              {job.location && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin size={10} /> {job.location}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={application.status} />
            <button
              onClick={onToggleExpand}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            Applied {formatDate(application.appliedAt)}
          </span>
          {job.salary && (
            <span className="text-green-600 font-medium">{job.salary}</span>
          )}
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="border-t pt-4 mt-2 space-y-4">
            {/* Resume used */}
            {(application.resumeId || application.resumeSnapshot) && (
              <div className="flex flex-wrap items-center gap-3 text-sm bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 theme-dark:bg-gray-800 theme-dark:border-gray-700">
                <FileText
                  size={16}
                  className="text-indigo-600 theme-dark:text-indigo-300"
                />
                <span className="font-semibold text-gray-800 theme-dark:text-gray-100">
                  Resume:
                </span>
                <span className="font-medium text-gray-900 theme-dark:text-gray-100">
                  {resumeName}
                </span>
                {resumeUrl && resumeUrl.includes("cloudinary.com") && (
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium theme-dark:text-indigo-200 theme-dark:hover:text-indigo-100"
                      onClick={() =>
                        onViewResume?.({ name: resumeName, url: resumeUrl })
                      }
                    >
                      <FileText size={14} />
                      View
                    </button>
                    <button
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium theme-dark:text-indigo-200 theme-dark:hover:text-indigo-100"
                      onClick={() => window.open(resumeUrl, "_blank")}
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Status Update */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Update Status
              </p>
              <div className="flex flex-wrap gap-2">
                {APPLICATION_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleStatusChange(s.value)}
                    disabled={updating || application.status === s.value}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      application.status === s.value
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                    } disabled:opacity-50`}
                  >
                    {updating && application.status !== s.value ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      s.label
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {application.timeline && application.timeline.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Timeline
                </p>
                <div className="space-y-2">
                  {application.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                      <div>
                        <span className="font-medium text-gray-900">
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </span>
                        <span className="text-gray-400 ml-2">
                          {formatDate(event.date)}
                        </span>
                        {event.notes && (
                          <p className="text-gray-500 text-xs mt-0.5">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interviews */}
            {application.interviews && application.interviews.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Interviews
                </p>
                <div className="space-y-2">
                  {application.interviews.map((interview, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <Calendar size={14} className="text-indigo-500" />
                      <span className="font-medium text-gray-700">
                        {interview.type}
                      </span>
                      {interview.scheduledAt && (
                        <span className="text-gray-500">
                          {formatDate(interview.scheduledAt)}
                        </span>
                      )}
                      {interview.completed && (
                        <CheckCircle
                          size={14}
                          className="text-green-500 ml-auto"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                {application.jobId && onViewJob && (
                  <Button
                    variant="secondary"
                    className="text-sm"
                    onClick={() => onViewJob(application)}
                  >
                    <ExternalLink size={14} className="mr-1" />
                    View Job
                  </Button>
                )}
                <Button
                  variant="secondary"
                  className="text-sm"
                  onClick={() => onEdit(application)}
                >
                  <Pencil size={14} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  className="text-sm text-red-500 hover:bg-red-50"
                  onClick={() => onDelete(application.id)}
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default function Applications({ setView, setSelectedJobId }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [viewingResume, setViewingResume] = useState(null);

  // Load applications
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

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await applicationService.updateStatus(user.uid, applicationId, newStatus);
      // Refresh applications
      const apps = await applicationService.getAll(user.uid);
      setApplications(apps);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (applicationId) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      await applicationService.delete(user.uid, applicationId);
      setApplications(applications.filter((a) => a.id !== applicationId));
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleViewJob = (application) => {
    // Prefer in-app navigation when jobId is known
    if (application.jobId && setView && setSelectedJobId) {
      setSelectedJobId(application.jobId);
      setView("job-detail");
      return;
    }

    // Fallback: open source URL if present
    const sourceUrl =
      application.jobSnapshot?.sourceUrl || application.jobSnapshot?.applyUrl;
    if (sourceUrl) {
      window.open(sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesFilter = filter === "all" || app.status === filter;
    const matchesSearch =
      !searchQuery ||
      app.jobSnapshot?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      app.jobSnapshot?.company
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    interviewing: applications.filter((a) => a.status === "interviewing")
      .length,
    offered: applications.filter((a) => a.status === "offered").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track your job applications and their status
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} className="mr-2" />
          Add Application
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center py-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 font-medium">Total</p>
        </Card>
        <Card className="text-center py-4 border-blue-200 bg-blue-50/50">
          <p className="text-2xl font-bold text-blue-600">{stats.applied}</p>
          <p className="text-xs text-blue-600 font-medium">Applied</p>
        </Card>
        <Card className="text-center py-4 border-yellow-200 bg-yellow-50/50">
          <p className="text-2xl font-bold text-yellow-600">
            {stats.interviewing}
          </p>
          <p className="text-xs text-yellow-600 font-medium">Interviewing</p>
        </Card>
        <Card className="text-center py-4 border-green-200 bg-green-50/50">
          <p className="text-2xl font-bold text-green-600">{stats.offered}</p>
          <p className="text-xs text-green-600 font-medium">Offered</p>
        </Card>
        <Card className="text-center py-4 border-red-200 bg-red-50/50">
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-xs text-red-600 font-medium">Rejected</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications..."
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          >
            <option value="all">All Status</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Briefcase size={24} />
          </div>
          <h3 className="text-gray-900 font-bold mb-1">
            {applications.length === 0
              ? "No applications yet"
              : "No matching applications"}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {applications.length === 0
              ? "Start tracking your job applications"
              : "Try adjusting your filters"}
          </p>
          {applications.length === 0 && (
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Application
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onViewJob={handleViewJob}
              onViewResume={setViewingResume}
              onEdit={setEditingApplication}
              expanded={expandedId === application.id}
              onToggleExpand={() =>
                setExpandedId(
                  expandedId === application.id ? null : application.id
                )
              }
            />
          ))}
        </div>
      )}

      {/* Add Application Modal */}
      {showAddModal && (
        <AddApplicationModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (jobData) => {
            try {
              await applicationService.create(user.uid, jobData, jobData.resumeId);
              const apps = await applicationService.getAll(user.uid);
              setApplications(apps);
              setShowAddModal(false);
            } catch (error) {
              console.error("Error adding application:", error);
            }
          }}
        />
      )}

      {editingApplication && (
        <EditApplicationModal
          application={editingApplication}
          onClose={() => setEditingApplication(null)}
          onSave={async (formData) => {
            await applicationService.update(
              user.uid,
              editingApplication.id,
              formData
            );
            const apps = await applicationService.getAll(user.uid);
            setApplications(apps);
            setEditingApplication(null);
          }}
        />
      )}

      {/* Resume viewer modal */}
      {viewingResume && viewingResume.url && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {viewingResume.name || "Resume"}
                  </h3>
                  <p className="text-sm text-gray-500">Preview</p>
                </div>
              </div>
              <button
                onClick={() => setViewingResume(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe
                src={`${viewingResume.url}#toolbar=1&navpanes=0`}
                className="w-full h-full"
                title={viewingResume.name || "Resume"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getApplicationFormData(application = null) {
  const job = application?.jobSnapshot || {};
  return {
    title: job.title || "",
    company: job.company || "",
    location: job.location || "",
    salary: job.salary || "",
    sourceUrl: job.sourceUrl || "",
    status: application?.status || "applied",
    resumeId: application?.resumeId || "",
  };
}

function formatResumeOptionDate(dateValue) {
  if (!dateValue) return "";
  try {
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function ApplicationFormModal({
  title,
  submitLabel,
  initialData,
  onClose,
  onSubmit,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(() => initialData);
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

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

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!formData.title || !formData.company) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white theme-dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 theme-dark:text-gray-100 mb-4">
          {title}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 theme-dark:text-gray-300 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Software Engineer"
              className="w-full px-4 py-2 border border-gray-200 theme-dark:border-gray-700 theme-dark:bg-gray-800 theme-dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 theme-dark:text-gray-300 mb-1">
              Company *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder="e.g., Google"
              className="w-full px-4 py-2 border border-gray-200 theme-dark:border-gray-700 theme-dark:bg-gray-800 theme-dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 theme-dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g., San Francisco, CA"
              className="w-full px-4 py-2 border border-gray-200 theme-dark:border-gray-700 theme-dark:bg-gray-800 theme-dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 theme-dark:text-gray-300 mb-1">
              Salary
            </label>
            <input
              type="text"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              placeholder="e.g., $150,000/year"
              className="w-full px-4 py-2 border border-gray-200 theme-dark:border-gray-700 theme-dark:bg-gray-800 theme-dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 theme-dark:text-gray-300 mb-1">
              Job Posting URL
            </label>
            <input
              type="url"
              value={formData.sourceUrl}
              onChange={(e) =>
                setFormData({ ...formData, sourceUrl: e.target.value })
              }
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-200 theme-dark:border-gray-700 theme-dark:bg-gray-800 theme-dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 theme-dark:text-gray-300 mb-1">
              Application Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 theme-dark:border-gray-700 theme-dark:bg-gray-800 theme-dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 theme-dark:text-gray-300 mb-1">
              Resume Used
            </label>
            <select
              value={formData.resumeId}
              onChange={(e) =>
                setFormData({ ...formData, resumeId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 theme-dark:border-gray-700 theme-dark:bg-gray-800 theme-dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              <option value="">Select a resume (optional)</option>
              {resumes.map((resume) => {
                const uploadDate = formatResumeOptionDate(
                  resume.uploadedAt || resume.createdAt
                );
                return (
                  <option key={resume.id} value={resume.id}>
                    {resume.name}
                    {uploadDate ? ` (${uploadDate})` : ""}
                  </option>
                );
              })}
            </select>
            {resumes.length === 0 && (
              <p className="text-xs text-gray-500 theme-dark:text-gray-400 mt-1">
                No resumes found. Upload one in the Resumes tab.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading || !formData.title || !formData.company}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Application Modal
function AddApplicationModal({ onClose, onAdd }) {
  return (
    <ApplicationFormModal
      title="Add Application"
      submitLabel="Add Application"
      initialData={getApplicationFormData()}
      onClose={onClose}
      onSubmit={onAdd}
    />
  );
}

function EditApplicationModal({ application, onClose, onSave }) {
  return (
    <ApplicationFormModal
      title="Edit Application"
      submitLabel="Save Changes"
      initialData={getApplicationFormData(application)}
      onClose={onClose}
      onSubmit={onSave}
    />
  );
}
