import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  Plus,
  Users,
  Link2,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "../components/ui/AppIcons";
import { Card, Button } from "../components/ui/UIComponents";
import { parseJobUrl } from "../utils/firebaseServices";
import { useAuth } from "../context/AuthContext";
import {
  savedJobService,
  applicationService,
  jobService,
} from "../services/database";

export default function Jobs({ setView, setSelectedJobId }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [interestedRoles, setInterestedRoles] = useState([]);
  const [roleInput, setRoleInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [parseError, setParseError] = useState(null);

  // Load saved jobs and applications from Firestore
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoadingData(true);
      const startTime = performance.now();
      try {
        // Load in parallel for speed
        const [savedJobs, apps] = await Promise.all([
          savedJobService.getAll(user.uid),
          applicationService.getAll(user.uid),
        ]);
        console.log(
          `Data loaded in ${(performance.now() - startTime).toFixed(0)}ms`
        );

        // Transform saved jobs to display format
        setJobs(
          savedJobs.map((sj) => ({
            id: sj.id,
            ...sj.jobSnapshot,
            savedAt: sj.savedAt,
            notes: sj.notes,
          }))
        );
        setApplications(apps);
      } catch (error) {
        console.error("Error loading jobs:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [user]);

  const handleApply = async (job) => {
    if (!user) return;
    let url = job.applyUrl || job.sourceUrl;

    // Fallback: fetch latest job data if URL not on the saved snapshot
    if (!url && job.id) {
      try {
        const fresh = await jobService.get(job.id);
        url = fresh?.applyUrl || fresh?.sourceUrl;
        if (url) {
          // cache URL on the client copy to avoid another fetch
          setJobs((prev) =>
            prev.map((j) =>
              j.id === job.id ? { ...j, applyUrl: url, sourceUrl: url } : j
            )
          );
        }
      } catch (err) {
        console.error("Failed to fetch job for apply URL", err);
      }
    }

    if (!url) {
      alert("No application URL available for this job.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const addRole = () => {
    if (!roleInput.trim()) return;
    setInterestedRoles([...interestedRoles, roleInput.trim()]);
    setRoleInput("");
  };

  const addJobByLink = async () => {
    if (!linkInput.trim()) return;

    // Normalize URL to handle variations (remove trailing slash, www prefix for comparison)
    const url = linkInput.trim();
    const normalizedUrl = url.replace(/\/$/, ""); // Remove trailing slash

    setIsLoading(true);
    setParseError(null);
    setParseResult(null);

    try {
      // First check if this URL has already been added to the global jobs collection
      console.log("Checking for existing job with URL:", normalizedUrl);
      const existingJob = await jobService.findBySourceUrl(normalizedUrl);
      console.log("Existing job check result:", existingJob);

      if (existingJob) {
        // Check if user already has this job saved
        const isSaved = await savedJobService.isSaved(user.uid, existingJob.id);
        if (isSaved) {
          setParseError("You have already saved this job.");
          setLinkInput("");
          setIsLoading(false);
          return;
        } else {
          // Allow re-parse for this user even if another user already added it
        }
      }

      console.log("No existing job found. Parsing URL:", normalizedUrl);
      const result = await parseJobUrl(normalizedUrl);
      console.log("Parse result:", result);
      setParseResult(result);
      setLinkInput("");
    } catch (error) {
      console.error("Failed to parse job URL:", error);
      setParseError(
        error.message || "Failed to parse the job link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeRole = (role) => {
    setInterestedRoles(interestedRoles.filter((r) => r !== role));
  };

  const handleSaveJob = async () => {
    if (!parseResult || !user) return;

    try {
      // First save to global jobs collection with all parsed fields
      const jobId = await jobService.add({
        title: parseResult.title || null,
        company: parseResult.company || null,
        companyWebsite: parseResult.companyWebsite || null,
        location: parseResult.location || null,
        type: parseResult.type || null,
        experience: parseResult.experience || null,
        salary: parseResult.salary || null,
        applyBy: parseResult.applyBy || null,
        description: parseResult.description || null,
        responsibilities: parseResult.responsibilities || [],
        requirements: parseResult.requirements || [],
        skills: parseResult.skills || [],
        tags: parseResult.skills || [],
        benefits: parseResult.benefits || [],
        applyUrl: parseResult.applyUrl || null,
        sourceUrl: parseResult.sourceUrl || null,
        logo: "💼",
        color: "bg-gray-50 text-gray-600 border-gray-100",
        referrals: [],
      });

      // Then save to user's saved jobs with snapshot
      await savedJobService.save(user.uid, {
        id: jobId,
        title: parseResult.title || null,
        company: parseResult.company || null,
        companyWebsite: parseResult.companyWebsite || null,
        location: parseResult.location || null,
        salary: parseResult.salary || null,
        type: parseResult.type || null,
        logo: "💼",
      });

      // Refresh saved jobs list
      const savedJobs = await savedJobService.getAll(user.uid);
      setJobs(
        savedJobs.map((sj) => ({
          id: sj.id,
          ...sj.jobSnapshot,
          savedAt: sj.savedAt,
          notes: sj.notes,
        }))
      );

      setParseResult(null);
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Failed to save job. Please try again.");
    }
  };

  const visibleJobs =
    interestedRoles.length > 0
      ? jobs.filter((j) =>
          interestedRoles.some(
            (r) =>
              j.title?.toLowerCase().includes(r.toLowerCase()) ||
              (j.tags || []).some((t) =>
                t.toLowerCase().includes(r.toLowerCase())
              )
          )
        )
      : jobs;

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
        <p className="text-gray-600">Loading your saved jobs...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">Recommended for you</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search jobs..."
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="relative flex-1 min-w-[220px] sm:min-w-[260px]">
            <Link2
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isLoading && addJobByLink()
              }
              placeholder="Paste job link to add"
              disabled={isLoading}
              className="pl-9 pr-28 py-2 bg-white border border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:opacity-50"
            />
            <Button
              variant="secondary"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 text-sm"
              onClick={addJobByLink}
              disabled={!linkInput.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Parse Result / Error Display */}
      {parseError && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={18} />
            <div>
              <p className="text-red-700 font-medium">
                Failed to parse job link
              </p>
              <p className="text-red-600 text-sm">{parseError}</p>
              <Button
                variant="ghost"
                className="text-red-600 text-sm mt-2 p-0 hover:text-red-800"
                onClick={() => setParseError(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </Card>
      )}

      {parseResult && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="text-green-700 font-medium mb-2">
                Job parsed successfully!
              </p>
              <div className="bg-white rounded-lg p-4 border border-green-200 space-y-4">
                {/* Title & Company */}
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {parseResult.title || (
                      <span className="text-gray-400 italic">
                        Title not available
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600">
                    {parseResult.company || (
                      <span className="text-gray-400 italic">
                        Company not available
                      </span>
                    )}
                  </p>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">📍 Location:</span>
                    <p className="font-medium text-gray-800">
                      {parseResult.location || (
                        <span className="text-gray-400 italic">
                          Not available
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">💼 Type:</span>
                    <p className="font-medium text-gray-800">
                      {parseResult.type || (
                        <span className="text-gray-400 italic">
                          Not available
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">💰 Salary:</span>
                    <p className="font-medium text-green-600">
                      {parseResult.salary || (
                        <span className="text-gray-400 italic">
                          Not available
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">⏰ Experience:</span>
                    <p className="font-medium text-gray-800">
                      {parseResult.experience || (
                        <span className="text-gray-400 italic">
                          Not available
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">📅 Apply By:</span>
                    <p className="font-medium text-gray-800">
                      {parseResult.applyBy || (
                        <span className="text-gray-400 italic">
                          Not available
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Description:
                  </p>
                  <p className="text-sm text-gray-600">
                    {parseResult.description || (
                      <span className="text-gray-400 italic">
                        Description not available
                      </span>
                    )}
                  </p>
                </div>

                {/* Responsibilities */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Responsibilities:
                  </p>
                  {parseResult.responsibilities &&
                  parseResult.responsibilities.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {parseResult.responsibilities.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Not available
                    </p>
                  )}
                </div>

                {/* Requirements */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Requirements:
                  </p>
                  {parseResult.requirements &&
                  parseResult.requirements.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {parseResult.requirements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Not available
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Skills:
                  </p>
                  {parseResult.skills && parseResult.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {parseResult.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Not available
                    </p>
                  )}
                </div>

                {/* Benefits */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Benefits:
                  </p>
                  {parseResult.benefits && parseResult.benefits.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {parseResult.benefits.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Not available
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="primary"
                  className="text-sm"
                  onClick={handleSaveJob}
                >
                  Save Job
                </Button>
                <Button
                  variant="ghost"
                  className="text-sm"
                  onClick={() => setParseResult(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {isLoading && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Loader2 className="text-blue-500 animate-spin" size={18} />
            <p className="text-blue-700">
              Parsing job link with AI... This may take a few seconds.
            </p>
          </div>
        </Card>
      )}

      {/* Preferences Section */}
      <Card className="bg-indigo-50/50 border-indigo-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-800 font-semibold text-sm mb-2 md:mb-0">
            <Filter size={16} />
            <span>Filter by Interest:</span>
          </div>
          <div className="flex-1 flex flex-wrap gap-2 items-center w-full md:w-auto">
            {interestedRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-indigo-600 rounded-full text-xs font-medium border border-indigo-200 shadow-sm"
              >
                {role}
                <Button
                  onClick={() => removeRole(role)}
                  variant="ghost"
                  className="p-0 hover:text-indigo-800"
                >
                  <X size={12} />
                </Button>
              </span>
            ))}
            <div className="flex items-center gap-2 relative flex-1 md:flex-none min-w-[140px]">
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRole()}
                placeholder="Add job title (e.g. React)..."
                className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
              <Button
                onClick={addRole}
                disabled={!roleInput.trim()}
                variant="ghost"
                className="absolute right-1 p-1 text-indigo-500"
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleJobs.length === 0 && interestedRoles.length > 0 ? (
          <div className="col-span-full py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search size={24} />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">No matches found</h3>
            <Button
              onClick={() => setInterestedRoles([])}
              variant="ghost"
              className="mt-4 text-indigo-600 text-sm font-semibold"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          visibleJobs.map((job) => (
            <Card
              key={job.id}
              className="group hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 relative flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                    job.color || "bg-gray-100"
                  } bg-opacity-50 overflow-hidden`}
                >
                  {job.companyWebsite ? (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${job.companyWebsite}&sz=128`}
                      alt={job.company}
                      className="w-8 h-8 object-contain"
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
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {job.salary}
                  </div>
                  <div className="text-xs text-gray-500">{job.type}</div>
                </div>
              </div>

              <div className="mb-4 flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {job.company} • {job.location}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {(job.tags || []).slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 mt-auto">
                <Button
                  variant="secondary"
                  className="px-3"
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setView("job-detail");
                  }}
                >
                  View Details
                </Button>
                <Button
                  onClick={() => handleApply(job)}
                  variant={
                    applications.some((a) => a.jobId === job.id)
                      ? "secondary"
                      : "primary"
                  }
                  className={`flex-1 ${
                    applications.some((a) => a.jobId === job.id)
                      ? "bg-green-50 text-green-700 border-green-200"
                      : ""
                  }`}
                  disabled={applications.some((a) => a.jobId === job.id)}
                >
                  {applications.some((a) => a.jobId === job.id)
                    ? "Applied"
                    : "Apply Now"}
                </Button>
                {(job.referrals || []).length > 0 && (
                  <Button
                    variant="secondary"
                    className="px-3"
                    onClick={() => setView("referrals")}
                  >
                    <Users size={16} />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
