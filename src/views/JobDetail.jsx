import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Building2,
  Sparkles,
  Loader2,
  ExternalLink,
  Check,
  FileText,
  X,
  Trash2,
} from "../components/ui/AppIcons";
import { Badge, Button, Card } from "../components/ui/UIComponents";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  jobService,
  savedJobService,
  applicationService,
  resumeService,
} from "../services/database";
import { useAuth } from "../context/AuthContext";

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col px-6 w-full text-left bg-white">
    <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
      <Icon size={14} className="text-gray-400" />
      {label}
    </div>
    <div className="text-gray-900 font-bold text-base">{value}</div>
  </div>
);

export default function JobDetail({ jobId, job: jobProp, onBack }) {
  const { user } = useAuth();
  const [job, setJob] = useState(jobProp || null);
  const [isLoading, setIsLoading] = useState(!jobProp);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isMarkingApplied, setIsMarkingApplied] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (jobProp) {
      setJob(jobProp);
      setIsLoading(false);
      return;
    }

    if (!jobId) {
      setError("No job ID provided");
      setIsLoading(false);
      return;
    }

    const loadJob = async () => {
      setIsLoading(true);
      try {
        const jobData = await jobService.get(jobId);
        if (jobData) {
          setJob(jobData);
        } else {
          setError("Job not found");
        }
      } catch (err) {
        console.error("Error loading job:", err);
        setError("Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId, jobProp]);

  // Check if already applied
  useEffect(() => {
    const checkIfApplied = async () => {
      if (!user || !job) return;
      try {
        const applications = await applicationService.getAll(user.uid);
        const applied = applications.some(
          (app) => app.jobId === (job.id || jobId)
        );
        setHasApplied(applied);
      } catch (err) {
        console.error("Error checking application status:", err);
      }
    };
    checkIfApplied();
  }, [user, job, jobId]);

  const handleApplyNow = () => {
    const url = job.applyUrl || job.sourceUrl;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("No application URL available for this job.");
    }
  };

  const openResumeModal = async () => {
    if (!user) return;
    setLoadingResumes(true);
    setShowResumeModal(true);
    try {
      const userResumes = await resumeService.getAll(user.uid);
      setResumes(userResumes);
      // Pre-select primary resume if exists
      const primary = userResumes.find((r) => r.isPrimary);
      if (primary) setSelectedResume(primary.id);
    } catch (err) {
      console.error("Error loading resumes:", err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleMarkApplied = async () => {
    if (!user || !job || !selectedResume) return;
    setIsMarkingApplied(true);
    try {
      // Create application record using centralized service
      await applicationService.create(user.uid, job, selectedResume);
      setHasApplied(true);
      setShowResumeModal(false);
      setSelectedResume(null);
    } catch (err) {
      console.error("Error marking as applied:", err);
      alert("Failed to mark as applied. Please try again.");
    } finally {
      setIsMarkingApplied(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await savedJobService.unsave(user.uid, job.id || jobId);
      await jobService.delete(job.id || jobId);
      if (onBack) onBack();
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job. Please try again.");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#3442FF] mb-4" size={32} />
        <p className="text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-600 mb-4">{error || "Job not found"}</p>
        {onBack && (
          <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
            Back to Jobs
          </Button>
        )}
      </div>
    );
  }

  const skills = job.skills || job.tags || [];
  const responsibilities = job.responsibilities || [];
  const requirements = job.requirements || [];

  return (
    <div className="space-y-6">
      {/* Back button at top left */}
      {onBack && (
        <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
          Back to Jobs
        </Button>
      )}

      <Card className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl ${
                job.color || "bg-gray-100"
              } overflow-hidden`}
            >
              {job.companyWebsite ? (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${job.companyWebsite}&sz=128`}
                  alt={job.company}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                style={{ display: job.companyWebsite ? "none" : "flex" }}
                className="w-full h-full items-center justify-center"
              >
                {job.logo || "💼"}
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-500">
                {job.company}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <Briefcase size={16} />
                  {job.type}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Building2 size={16} />
                  {job.applyBy ? "Apply by" : "Hiring"}
                  {job.applyBy ? ` ${job.applyBy}` : " immediately"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 self-start lg:sticky lg:top-4">
            <Button
              variant="primary"
              icon={ExternalLink}
              onClick={handleApplyNow}
              className="whitespace-nowrap"
            >
              Apply Now
            </Button>
            {hasApplied ? (
              <Button variant="secondary" icon={CheckCircle2} disabled>
                Applied
              </Button>
            ) : (
              <Button
                variant="secondary"
                icon={Check}
                onClick={openResumeModal}
              >
                Mark Applied
              </Button>
            )}
            <Button
              variant="secondary"
              icon={Trash2}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Resume Selection Modal */}
        {showResumeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Resume
                </h3>
                <button
                  onClick={() => {
                    setShowResumeModal(false);
                    setSelectedResume(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto">
                {loadingResumes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2
                      className="animate-spin text-[#3442FF]"
                      size={24}
                    />
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText
                      className="mx-auto text-gray-400 mb-2"
                      size={32}
                    />
                    <p className="text-gray-600">No resumes uploaded yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a resume in the Resumes section first
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resumes.map((resume) => (
                      <label
                        key={resume.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedResume === resume.id
                            ? "border-[#3442FF] bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="resume"
                          value={resume.id}
                          checked={selectedResume === resume.id}
                          onChange={() => setSelectedResume(resume.id)}
                          className="w-4 h-4 text-[#3442FF]"
                        />
                        <FileText size={20} className="text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {resume.name}
                          </p>
                          {resume.isPrimary && (
                            <span className="text-xs text-[#3442FF] font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 p-4 border-t bg-gray-50">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowResumeModal(false);
                    setSelectedResume(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  icon={isMarkingApplied ? Loader2 : Check}
                  onClick={handleMarkApplied}
                  disabled={!selectedResume || isMarkingApplied}
                >
                  {isMarkingApplied ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-t border-gray-100 mt-6 pt-6">
          <InfoTile
            icon={Clock}
            label="Required experience"
            value={job.experience || "Not specified"}
          />
          <InfoTile
            icon={Calendar}
            label="Last apply date"
            value={job.applyBy || "Open until filled"}
          />
          <InfoTile
            icon={DollarSign}
            label="Salary / CTC"
            value={job.salary || "Competitive"}
          />
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Sparkles size={16} />
            About the role
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {job.description ||
              "You will collaborate closely with product, design, and research to ship high-impact work while maintaining quality and speed."}
          </p>

          {responsibilities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                What you'll do
              </h3>
              <ul className="space-y-2">
                {responsibilities.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 mt-0.5"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Sparkles size={16} />
            Skills required
          </div>
          <Badge color="purple">Core stack</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.length === 0 ? (
            <span className="text-sm text-gray-600">
              Skills will be provided soon.
            </span>
          ) : (
            skills.map((skill) => (
              <Badge key={skill} color="gray">
                {skill}
              </Badge>
            ))
          )}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-900">Requirements</h2>
          {requirements.length === 0 ? (
            <p className="text-sm text-gray-700">
              Detailed requirements will be updated for this role.
            </p>
          ) : (
            <ul className="space-y-2">
              {requirements.map((req) => (
                <li
                  key={req}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <CheckCircle2 size={16} className="text-[#3442FF] mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete saved job?"
        description={`"${job.title}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
