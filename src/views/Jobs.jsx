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
  FileText,
  Shield,
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
        <Loader2 className="animate-spin text-[#3442FF] mb-4" size={32} />
        <p className="text-gray-600">Loading your saved jobs...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
        {/* --- AI Smart Omnibar --- */}
      {!parseResult ? (
        <div className={`relative group w-full z-20 ${isLoading ? "gemini-processing-ring" : ""}`}>
          {/* Glowing background effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3442FF]/40 via-[#a8c7fa]/40 to-[#3442FF]/40 rounded-[36px] blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
          
          {/* Main Input Container */}
          <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-[var(--surface-bg)] rounded-[32px] p-2 pl-4 md:pl-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-transparent ring-1 ring-[#e1e5ea] dark:ring-[#333538]/50">
            
            {/* Branding Section */}
            <div className="flex items-center gap-3 pr-4 border-b md:border-b-0 md:border-r border-[#e1e5ea]/50 dark:border-[#333538]/50 py-2 md:py-0">
              <div className="text-[#3442FF] animate-pulse">
                <Sparkles size={24} weight="fill" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[15px] font-bold text-[var(--text-primary)] leading-tight">AI Smart Add</h3>
                <p className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Auto-Extract</p>
              </div>
            </div>

            {/* Input Section */}
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center pl-2 md:pl-4 pr-2 py-2 md:py-0 gap-2 sm:gap-0">
              <div className="flex items-center flex-1">
                <Link2 size={18} className="text-gray-400 shrink-0 ml-2 sm:ml-0" />
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isLoading && addJobByLink()}
                  placeholder="Paste URL from LinkedIn, Indeed, or company site..."
                  disabled={isLoading}
                  className="w-full bg-transparent outline-none text-[15px] px-3 py-3 text-[var(--text-primary)] placeholder-gray-400 disabled:opacity-50"
                />
              </div>
              
              <button
                onClick={addJobByLink}
                disabled={!linkInput.trim() || isLoading}
                className="shrink-0 bg-[#3442FF] hover:bg-[#3442FF]/90 text-white rounded-[24px] px-6 py-3 sm:py-2.5 text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-[#3442FF] active:scale-95 ml-auto w-full sm:w-auto"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> <span>Parsing...</span></>
                ) : (
                  <>Extract <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {parseError && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-30 text-[13px] text-red-700 flex items-center gap-1.5 font-bold bg-[#fce8e6] px-5 py-2.5 rounded-full border border-red-200/50 shadow-lg animate-in fade-in slide-in-from-top-2 dark:bg-[#f28b82] dark:text-[#3f0f0a] dark:border-transparent">
              <AlertCircle size={16} className="shrink-0" /> 
              {parseError}
              <button onClick={() => setParseError(null)} className="ml-3 opacity-70 hover:opacity-100 transition-opacity">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* --- Parse Result Module --- */
        <div className="relative z-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[var(--surface-bg)] rounded-[32px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] ring-1 ring-[#e1e5ea] dark:ring-[#333538]/50 flex flex-col">
            
            {/* Header */}
            <div className="px-6 md:px-8 py-5 border-b border-[#e1e5ea]/60 dark:border-[#333538]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#e8f0fe] to-transparent dark:from-[#a8c7fa]/10">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-extrabold text-[13px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Data Extracted Successfully</span>
              </div>
              {parseResult.sourceUrl && (
                <a href={parseResult.sourceUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[var(--muted)] hover:text-[#3442FF] flex items-center gap-1.5 transition-colors bg-[#f0f4f9] dark:bg-[#1e1f20] ring-1 ring-[#e1e5ea] dark:ring-[#333538] px-4 py-2 rounded-full hover:shadow-sm">
                  View original source <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Body */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-8 justify-between">
                <div className="flex-1 w-full min-w-0">
                  <h4 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3 leading-tight">
                    {parseResult.title || "Unknown Title"}
                  </h4>
                  <div className="text-lg text-[var(--muted)] font-bold flex items-center gap-2 mb-8">
                    <Building2 size={20} className="shrink-0" />
                    <span className="truncate">{parseResult.company || "Unknown Company"}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                    <div>
                      <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2 opacity-80">Location</p>
                      <p className="font-bold text-[var(--text-primary)] text-sm md:text-base flex items-start gap-1.5">
                        <MapPin size={16} className="text-[#3442FF] shrink-0 mt-0.5"/> 
                        <span className="leading-snug">{parseResult.location || "Remote"}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2 opacity-80">Salary</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm md:text-base flex items-start gap-1.5">
                        <DollarSign size={16} className="shrink-0 mt-0.5"/> 
                        <span className="leading-snug">{parseResult.salary || "Not specified"}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2 opacity-80">Job Type</p>
                      <p className="font-bold text-[var(--text-primary)] text-sm md:text-base flex items-start gap-1.5">
                        <Briefcase size={16} className="text-[#3442FF] shrink-0 mt-0.5"/> 
                        <span className="leading-snug">{parseResult.type || "Full-time"}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2 opacity-80">Experience</p>
                      <p className="font-bold text-[var(--text-primary)] text-sm md:text-base flex items-start gap-1.5">
                        <Clock size={16} className="text-[#3442FF] shrink-0 mt-0.5"/> 
                        <span className="leading-snug">{parseResult.experience || "Not specified"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#e1e5ea]/60 dark:border-[#333538]/60 pt-6 mt-4 max-h-[360px] overflow-y-auto pr-4 space-y-8 custom-scrollbar">
                    {parseResult.description && (
                      <div>
                        <h5 className="text-[15px] font-extrabold text-[var(--text-primary)] mb-3 flex items-center gap-2"><FileText size={18} className="text-[#3442FF]"/> Description</h5>
                        <p className="text-[15px] text-[var(--muted)] leading-relaxed whitespace-pre-line font-medium">
                          {parseResult.description}
                        </p>
                      </div>
                    )}

                    {parseResult.responsibilities && parseResult.responsibilities.length > 0 && (
                      <div>
                        <h5 className="text-[15px] font-extrabold text-[var(--text-primary)] mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-emerald-500"/> Responsibilities</h5>
                        <ul className="space-y-3">
                          {parseResult.responsibilities.map((item, i) => (
                            <li key={i} className="text-[15px] text-[var(--muted)] font-medium flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3442FF] mt-2 shrink-0"></span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {parseResult.requirements && parseResult.requirements.length > 0 && (
                      <div>
                        <h5 className="text-[15px] font-extrabold text-[var(--text-primary)] mb-4 flex items-center gap-2"><Shield size={18} className="text-rose-500"/> Requirements</h5>
                        <ul className="space-y-3">
                          {parseResult.requirements.map((item, i) => (
                            <li key={i} className="text-[15px] text-[var(--muted)] font-medium flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {parseResult.skills && parseResult.skills.length > 0 && (
                      <div>
                        <h5 className="text-[15px] font-extrabold text-[var(--text-primary)] mb-4 flex items-center gap-2"><Sparkles size={18} className="text-[#3442FF]"/> Skills</h5>
                        <div className="flex flex-wrap gap-2.5">
                          {parseResult.skills.map((skill, i) => (
                            <span key={i} className="px-4 py-1.5 bg-[#3442FF]/10 text-[#3442FF] rounded-xl text-[14px] font-bold border border-transparent dark:bg-[#3442FF]/20">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {parseResult.benefits && parseResult.benefits.length > 0 && (
                      <div>
                        <h5 className="text-[15px] font-extrabold text-[var(--text-primary)] mb-4 flex items-center gap-2"><Sparkles size={18} className="text-emerald-500"/> Benefits</h5>
                        <ul className="space-y-3">
                          {parseResult.benefits.map((item, i) => (
                            <li key={i} className="text-[15px] text-[var(--muted)] font-medium flex items-start gap-3">
                              <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#e1e5ea]/60 dark:border-[#333538]/60 bg-[#f0f4f9]/30 dark:bg-transparent">
              <button onClick={() => setParseResult(null)} className="w-full sm:w-auto text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[#e1e5ea]/30 dark:hover:bg-[#333538]/50 px-6 py-2.5 rounded-full font-bold transition-all text-sm">
                Discard
              </button>
              <button onClick={handleSaveJob} className="w-full sm:w-auto px-8 py-2.5 bg-[#3442FF] hover:bg-[#3442FF]/90 text-white rounded-full font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Save Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Toolbar: Search & Filter --- */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between px-2">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search your jobs..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-bg)] rounded-full text-sm focus:outline-none transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] border-transparent text-[var(--text-primary)]"
            />
          </div>
        </div>
        
        <div className="flex-1 flex flex-wrap gap-2 items-center w-full lg:w-auto justify-start lg:justify-end">
          <div className="flex items-center gap-2 text-[var(--muted)] font-medium text-sm mr-1">
            <Filter size={16} />
            <span>Skills:</span>
          </div>
          {interestedRoles.map((role) => (
            <span
              key={role}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3442FF]/10 text-[#3442FF] rounded-lg text-xs font-bold border border-transparent shadow-sm dark:bg-[#3442FF]/20"
            >
              {role}
              <button
                onClick={() => removeRole(role)}
                className="hover:bg-[#3442FF]/20 p-0.5 rounded-md transition-colors"
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
              className="w-full pl-4 pr-10 py-2.5 bg-[var(--surface-bg)] rounded-full text-sm focus:outline-none transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] border-transparent text-[var(--text-primary)]"
            />
            <button
              onClick={addRole}
              disabled={!roleInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#3442FF] hover:bg-[#3442FF]/10 rounded-full disabled:opacity-50 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_500px] gap-6 items-start">
        
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
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[#3442FF] rounded-r-full z-10 opacity-80" />}
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
                      <p className="text-[15px] text-[#3442FF] font-medium mt-1 tracking-wide">{selectedJob.company}</p>
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
                    <button onClick={() => handleApply(selectedJob)} className="w-full sm:flex-1 py-3 px-6 flex items-center justify-center gap-2 bg-[#3442FF] hover:bg-[#3442FF]/90 text-white rounded-full font-medium transition-all text-[14px] tracking-wide border-none shadow-none">
                      <ExternalLink size={16} /> Apply Now
                    </button>
                    <button
                      onClick={() => {
                        setSelectedJobId(selectedJob.id);
                        setView("job-detail");
                      }}
                      className="w-full sm:flex-1 py-3 px-6 flex items-center justify-center gap-2 bg-[#3442FF] hover:bg-[#3442FF]/90 text-white rounded-full font-medium transition-all text-[14px] tracking-wide border-none shadow-none"
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
