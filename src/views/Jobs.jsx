import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  ExternalLink,
  ArrowUpRight,
  Search,
  Filter,
  X,
  Plus,
  Link2,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Sparkles,
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
  const [selectedJobId, setSelectedJobIdLocal] = useState(null);
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
        const [savedJobs, apps] = await Promise.all([
          savedJobService.getAll(user.uid),
          applicationService.getAll(user.uid),
        ]);
        console.log(
          `Data loaded in ${(performance.now() - startTime).toFixed(0)}ms`
        );

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

    if (!url && job.id) {
      try {
        const fresh = await jobService.get(job.id);
        url = fresh?.applyUrl || fresh?.sourceUrl;
        if (url) {
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

    const url = linkInput.trim();
    const normalizedUrl = url.replace(/\/$/, ""); 

    setIsLoading(true);
    setParseError(null);
    setParseResult(null);

    try {
      const existingJob = await jobService.findBySourceUrl(normalizedUrl);

      if (existingJob) {
        const isSaved = await savedJobService.isSaved(user.uid, existingJob.id);
        if (isSaved) {
          setParseError("You have already saved this job.");
          setLinkInput("");
          setIsLoading(false);
          return;
        } 
      }

      const result = await parseJobUrl(normalizedUrl);
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

  useEffect(() => {
    if (visibleJobs.length === 0) {
      setSelectedJobIdLocal(null);
      return;
    }

    const selectedStillVisible = visibleJobs.some(
      (job) => job.id === selectedJobId
    );

    if (!selectedJobId || !selectedStillVisible) {
      setSelectedJobIdLocal(visibleJobs[0].id);
    }
  }, [visibleJobs, selectedJobId]);

  const selectedJob =
    visibleJobs.find((job) => job.id === selectedJobId) || visibleJobs[0] || null;

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
      
      {/* --- AI Smart Omnibar --- */}
      {!parseResult ? (
        <div className={isLoading ? "gemini-processing-ring" : ""}>
          <Card
            noPadding={true}
            className="overflow-visible relative z-20"
          >
            <div className="p-2 sm:p-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 sm:gap-4">
                
                <div className="flex items-center gap-3 px-2 md:w-1/4 lg:w-1/5 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">AI Smart Add</h3>
                    <p className="text-[12px] text-gray-500 font-medium">Auto-extract details</p>
                  </div>
                </div>

                <div className="flex-1 relative">
                  <div className="surface-control flex items-center gap-2 p-1.5">
                    <div className="pl-3 shrink-0 text-gray-400">
                      <Link2 size={18} />
                    </div>
                    <input
                      type="url"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !isLoading && addJobByLink()}
                      placeholder="Paste URL from LinkedIn, Indeed, or company site..."
                      disabled={isLoading}
                      className="flex-1 bg-transparent outline-none text-sm px-1 py-2 text-gray-800 placeholder-gray-400 disabled:opacity-50"
                    />
                    <Button
                      onClick={addJobByLink}
                      disabled={!linkInput.trim() || isLoading}
                      className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white transition-all px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-sm"
                    >
                      {isLoading ? (
                        <><Loader2 size={16} className="animate-spin" /> <span className="hidden sm:inline">Parsing</span></>
                      ) : (
                        <>Extract <ArrowRight size={16} className="hidden sm:inline" /></>
                      )}
                    </Button>
                  </div>

                  {parseError && (
                    <div className="absolute top-full left-0 mt-2 z-30 text-[13px] text-red-700 flex items-center gap-1.5 font-medium bg-red-50/90 backdrop-blur-md px-4 py-2 rounded-xl border border-red-200 shadow-lg animate-in fade-in slide-in-from-top-2">
                      <AlertCircle size={16} className="text-red-500 shrink-0" /> 
                      {parseError}
                      <button onClick={() => setParseError(null)} className="ml-2 text-red-400 hover:text-red-700 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* --- Enterprise Ticket Parse Result Card --- */
        <Card noPadding={true} className="overflow-hidden relative z-20 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-4 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-sm text-gray-900 uppercase tracking-wide">Data Extraction Complete</span>
            </div>
            {parseResult.sourceUrl && (
              <a href={parseResult.sourceUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                View original source <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-8 justify-between">
              <div className="flex-1 w-full min-w-0">
                <h4 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                  {parseResult.title || "Unknown Title"}
                </h4>
                <div className="text-lg text-gray-600 font-medium flex items-center gap-2 mb-8">
                  <Building2 size={20} className="text-gray-400 shrink-0" />
                  <span className="truncate">{parseResult.company || "Unknown Company"}</span>
                </div>

                <div className="flex flex-wrap gap-y-6 gap-x-8 sm:gap-x-12 mb-8">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Location</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400 shrink-0"/> {parseResult.location || "Remote"}
                    </p>
                  </div>
                  <div className="hidden sm:block w-px bg-gray-100 self-stretch"></div>
                  
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Salary</p>
                    <p className="font-bold text-emerald-600 text-sm sm:text-base flex items-center gap-1.5">
                      <DollarSign size={14} className="text-emerald-500 shrink-0"/> {parseResult.salary || "Not specified"}
                    </p>
                  </div>
                  <div className="hidden sm:block w-px bg-gray-100 self-stretch"></div>
                  
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Job Type</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
                      <Briefcase size={14} className="text-gray-400 shrink-0"/> {parseResult.type || "Full-time"}
                    </p>
                  </div>
                  <div className="hidden sm:block w-px bg-gray-100 self-stretch"></div>
                  
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Experience</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400 shrink-0"/> {parseResult.experience || "Not specified"}
                    </p>
                  </div>
                  <div className="hidden sm:block w-px bg-gray-100 self-stretch"></div>

                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Apply By</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400 shrink-0"/> {parseResult.applyBy || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-2 max-h-[320px] overflow-y-auto pr-4 space-y-8">
                  {parseResult.description && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 mb-2">Description</h5>
                      <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-line">
                        {parseResult.description}
                      </p>
                    </div>
                  )}

                  {parseResult.responsibilities && parseResult.responsibilities.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 mb-3">Responsibilities</h5>
                      <ul className="space-y-2">
                        {parseResult.responsibilities.map((item, i) => (
                          <li key={i} className="text-[14px] text-gray-600 flex items-start gap-2">
                            <span className="text-indigo-400 mt-1 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parseResult.requirements && parseResult.requirements.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 mb-3">Requirements</h5>
                      <ul className="space-y-2">
                        {parseResult.requirements.map((item, i) => (
                          <li key={i} className="text-[14px] text-gray-600 flex items-start gap-2">
                            <span className="text-indigo-400 mt-1 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parseResult.skills && parseResult.skills.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 mb-3">Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {parseResult.skills.map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[13px] font-medium border border-indigo-100/50">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parseResult.benefits && parseResult.benefits.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 mb-3">Benefits</h5>
                      <ul className="space-y-2">
                        {parseResult.benefits.map((item, i) => (
                          <li key={i} className="text-[14px] text-gray-600 flex items-start gap-2">
                            <span className="text-emerald-500 mt-1 shrink-0">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setParseResult(null)} className="w-full sm:w-auto text-gray-500 hover:text-gray-900 py-2">
              Discard
            </Button>
            <Button variant="primary" onClick={handleSaveJob} className="w-full sm:w-auto px-8 py-2">
              Save
            </Button>
          </div>
        </Card>
      )}

      {/* --- Toolbar: Search & Filter --- */}
      <Card noPadding={true} className="overflow-hidden bg-white">
        <div className="p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search your jobs..."
                className="surface-control pl-9 pr-4 py-2.5 text-sm w-full outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex-1 flex flex-wrap gap-2 items-center w-full lg:w-auto justify-start lg:justify-end">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm mr-1">
              <Filter size={16} />
              <span>Skills:</span>
            </div>
            {interestedRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100 shadow-sm"
              >
                {role}
                <button
                  onClick={() => removeRole(role)}
                  className="hover:text-indigo-900 p-0.5 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <div className="flex items-center relative min-w-[160px]">
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRole()}
                placeholder="Add skill filter..."
                className="surface-control w-full pl-3 pr-8 py-2 text-sm outline-none"
              />
              <button
                onClick={addRole}
                disabled={!roleInput.trim()}
                className="absolute right-1 p-1 text-indigo-600 hover:bg-indigo-50 rounded-md disabled:opacity-50 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_500px] gap-6 items-start mt-2">
        
        {/* --- Job List --- */}
        <div className="space-y-4">
          {visibleJobs.length === 0 ? (
            <Card className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search size={24} />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">No jobs to display</h3>
              <p className="text-gray-500 text-sm mb-4">Paste a job link above to get started, or clear your filters.</p>
              {interestedRoles.length > 0 && (
                <Button onClick={() => setInterestedRoles([])} variant="secondary" className="text-sm">
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            visibleJobs.map((job) => {
              const isSelected = job.id === selectedJobId;
              const isApplied = applications.some((a) => a.jobId === job.id);

              return (
                <Card
                  key={job.id}
                  noPadding={true}
                  className={`group relative overflow-hidden rounded-[24px] border-none transition-all duration-300 ease-out hover:bg-[#f0f4f9] hover:shadow-sm ${
                    isSelected ? "bg-[#f0f4f9] shadow-sm" : "bg-white border border-[#e1e5ea]"
                  }`}
                >
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[#3846e6] rounded-r-full z-10 opacity-80" />}
                  <button
                    type="button"
                    onClick={() => setSelectedJobIdLocal(job.id)}
                    className="w-full text-left p-5 flex flex-col gap-4 relative transition-colors focus:outline-none"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-[52px] h-[52px] rounded-2xl bg-white border border-transparent group-hover:border-white group-hover:shadow-sm flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300 shadow-sm border border-[#e1e5ea]/50">
                        {job.companyWebsite ? (
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${job.companyWebsite}&sz=128`}
                            alt={job.company}
                            className="w-7 h-7 object-contain mix-blend-multiply"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextSibling) {
                                e.currentTarget.nextSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <span
                          style={{ display: job.companyWebsite ? "none" : "flex" }}
                          className="w-full h-full items-center justify-center text-xl text-[#444746]"
                        >
                          {job.logo || "💼"}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 relative z-20">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0 mt-0.5">
                            <h3 className="text-[16px] font-semibold text-[#1f1f1f] tracking-tight truncate leading-snug">
                              {job.title}
                            </h3>
                            <p className="text-[14px] text-[#444746] mt-0.5 font-normal truncate">{job.company}</p>
                          </div>
                          <div className="shrink-0 mt-1">
                            {isApplied ? (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#e6f4ea] text-[#137333] border-none text-[11px] tooltip font-bold uppercase tracking-widest relative z-30" title="Applied">
                                <CheckCircle size={14} className="mr-1 hidden sm:inline" />
                                Applied
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-[#444746] border border-[#e1e5ea] text-[11px] font-bold uppercase tracking-widest relative z-30 shadow-sm">
                                Saved
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-[#444746] pl-[68px] opacity-80">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <MapPin size={14} className="opacity-70" />
                        {/remote|hybrid/i.test(job.location || "") ? "Remote / Hybrid" : job.location || "Remote / Hybrid"}
                      </span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Briefcase size={14} className="opacity-70" />
                        {job.type || "Full-time"}
                      </span>
                    </div>
                  </button>
                </Card>
              );
            })
          )}
        </div>

        {/* --- Selected Job Detailed Preview --- */}
        <div className="lg:sticky lg:top-6">
          <Card noPadding={true} className="overflow-hidden border-none shadow-sm min-h-[400px] rounded-[32px] bg-white ring-1 ring-[#e1e5ea]">
            {selectedJob ? (
              <div className="flex flex-col h-full bg-white relative">
                {/* Decorative Liquid Glass Header Banner */}
                <div className="h-32 bg-[#f0f4f9] rounded-t-[32px] border-none relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#e8f0fe]/40 via-[#f0f4f9] to-[#f0f4f9] opacity-80"></div>
                  <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#e8f0fe] rounded-full mix-blend-multiply opacity-50 blur-3xl"></div>
                </div>
                
                <div className="px-8 pb-8 -mt-[44px] space-y-7 relative z-10">
                  <div className="flex flex-col gap-4 pb-1 border-b border-[#e1e5ea] border-opacity-60">
                    <div className="w-[88px] h-[88px] rounded-[24px] border-4 border-white bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 relative z-20">
                      {selectedJob.companyWebsite ? (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${selectedJob.companyWebsite}&sz=128`}
                          alt={selectedJob.company}
                          className="w-12 h-12 object-contain mix-blend-multiply"
                        />
                      ) : (
                        <span className="text-4xl text-[#444746]">{selectedJob.logo || "💼"}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-1 mb-2">
                      <h3 className="text-[24px] font-normal text-[#1f1f1f] leading-snug tracking-tight">
                        {selectedJob.title}
                      </h3>
                      <p className="text-[15px] text-[#3846e6] font-medium mt-1 tracking-wide">{selectedJob.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full pt-1">
                    <div className="flex flex-col gap-1 rounded-[16px] bg-white px-4 py-3 border border-[#e1e5ea] flex-1 min-w-[100px]">
                      <span className="text-[#444746] flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest opacity-80"><MapPin size={13} /> Location</span>
                      <span className="font-semibold text-[#1f1f1f] text-[14px] leading-tight">{selectedJob.location || "Remote / Hybrid"}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-[16px] bg-white px-4 py-3 border border-[#e1e5ea] flex-1 min-w-[100px]">
                      <span className="text-[#444746] flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest opacity-80"><Briefcase size={13} /> Type</span>
                      <span className="font-semibold text-[#1f1f1f] text-[14px] leading-tight">{selectedJob.type || "Full-time"}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-[16px] bg-white px-4 py-3 border border-[#e1e5ea] flex-1 min-w-[100px]">
                      <span className="text-[#444746] flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest opacity-80"><DollarSign size={13} /> Salary</span>
                      <span className="font-semibold text-[#137333] text-[14px] leading-tight">{selectedJob.salary || "Not listed"}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[15px] font-semibold text-[#1f1f1f] mb-2 tracking-tight">About the role</div>
                    <p className="text-[14px] text-[#444746] leading-relaxed font-normal">
                      {selectedJob.description || "This role is saved in your jobs list. Open full details to view the complete description and application information."}
                    </p>
                  </div>

                  {selectedJob.tags && selectedJob.tags.length > 0 && (
                    <div>
                      <div className="text-[15px] font-semibold text-[#1f1f1f] mb-3 tracking-tight">Requirements & Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.tags.map((tag) => (
                          <span key={tag} className="px-3.5 py-1.5 rounded-full bg-[#f0f4f9] text-[#1f1f1f] text-[12px] font-medium border-none tracking-wide">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#e1e5ea] border-opacity-60">
                    <button onClick={() => handleApply(selectedJob)} className="w-full sm:flex-1 py-3 px-6 flex items-center justify-center gap-2 bg-[#3846e6] hover:bg-[#3846e6]/90 text-white rounded-full font-medium transition-all text-[14px] tracking-wide border-none shadow-none">
                      <ExternalLink size={16} /> Apply Now
                    </button>
                    <button
                      onClick={() => {
                        setSelectedJobId(selectedJob.id);
                        setView("job-detail");
                      }}
                      className="w-full sm:flex-1 py-3 px-6 flex items-center justify-center gap-2 bg-[#3846e6] hover:bg-[#3846e6]/90 text-white rounded-full font-medium transition-all text-[14px] tracking-wide border-none shadow-none"
                    >
                      View full details
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 h-full flex flex-col items-center justify-center text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-300">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-gray-900 font-bold mb-1 text-lg">Select a job</h3>
                <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
                  Click any job in the list to view a quick preview here.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
