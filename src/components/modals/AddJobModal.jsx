import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Link2,
  ExternalLink,
  Calendar,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Plus,
  FileText,
  Shield,
  ChevronDown,
  ChevronUp,
  Tag,
} from "../ui/AppIcons";
import { useAuth } from "../../context/AuthContext";
import { jobService, savedJobService } from "../../services/database";

const JOB_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
];

const SKILL_SUGGESTIONS = [
  "React", "TypeScript", "Node.js", "Python", "JavaScript",
  "Next.js", "AWS", "SQL", "Docker", "Tailwind CSS",
];

const INPUT_CLS =
  "w-full pl-11 pr-4 py-3 bg-[#f8fafc] dark:bg-[#131314] border border-[#e1e5ea] dark:border-[#333538] rounded-xl text-sm text-[var(--text-primary)] placeholder-gray-400 focus:bg-white dark:focus:bg-[#1e1f20] focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all";

const ICON_CLS = "absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none";

export default function AddJobModal({ isOpen, onClose, onJobAdded }) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [experience, setExperience] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [applyBy, setApplyBy] = useState("");
  const [description, setDescription] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [showMore, setShowMore] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const addSkill = (val) => {
    const raw = (val !== undefined ? val : skillInput).trim();
    if (!raw) return;
    const newSkills = raw.split(",").map((s) => s.trim()).filter((s) => s && !skills.includes(s));
    if (newSkills.length) setSkills((p) => [...p, ...newSkills]);
    setSkillInput("");
  };

  const reset = () => {
    setTitle(""); setCompany(""); setCompanyWebsite(""); setLocation("");
    setType("Full-time"); setSalary(""); setExperience(""); setApplyUrl("");
    setApplyBy(""); setDescription(""); setSkillInput(""); setSkills([]);
    setResponsibilitiesText(""); setRequirementsText(""); setBenefitsText("");
    setShowMore(false); setError(null);
  };

  const close = () => { reset(); onClose(); };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!title.trim() || !company.trim()) { setError("Job Title and Company are required."); return; }
    if (!user) { setError("You must be logged in."); return; }

    setIsSubmitting(true);
    setError(null);

    try {
      let cleanWeb = companyWebsite.trim();
      if (cleanWeb) cleanWeb = cleanWeb.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
      else cleanWeb = null;

      let url = applyUrl.trim();
      if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;

      const parseLines = (text) => text.split("\n").map((s) => s.trim().replace(/^[-*•]\s*/, "")).filter(Boolean);

      const payload = {
        title: title.trim(), company: company.trim(), companyWebsite: cleanWeb,
        location: location.trim() || "Remote", type: type || "Full-time",
        experience: experience.trim() || null, salary: salary.trim() || null,
        applyBy: applyBy.trim() || null, description: description.trim() || null,
        responsibilities: parseLines(responsibilitiesText),
        requirements: parseLines(requirementsText),
        skills, tags: skills, benefits: parseLines(benefitsText),
        applyUrl: url || null, sourceUrl: url || null,
        logo: "💼", color: "bg-gray-50 text-gray-600 border-gray-100", referrals: [],
      };

      const jobId = await jobService.add(payload);
      await savedJobService.save(user.uid, {
        id: jobId, title: payload.title, company: payload.company,
        companyWebsite: payload.companyWebsite, location: payload.location,
        salary: payload.salary, type: payload.type, logo: payload.logo,
        sourceUrl: payload.sourceUrl, applyUrl: payload.applyUrl,
        tags: payload.tags, description: payload.description, experience: payload.experience,
      });

      if (onJobAdded) await onJobAdded(jobId);
      close();
    } catch (err) {
      console.error("Error creating job:", err);
      setError(err.message || "Failed to save job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200" onClick={close}>
      <div
        className="bg-white dark:bg-[#1e1f20] text-[var(--text-primary)] rounded-3xl shadow-2xl border border-[#e1e5ea] dark:border-[#333538] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-[#e1e5ea]/60 dark:border-[#333538]/60 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Add Job Manually</h3>
            <p className="text-sm text-[var(--muted)] mt-0.5">Track a job opportunity you found</p>
          </div>
          <button type="button" onClick={close} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#333538] rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form body — scrollbar hidden */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-3 text-sm font-medium text-red-700 dark:text-red-400">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          {/* Row 1: Title + Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className={ICON_CLS} size={17} />
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" className={INPUT_CLS} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className={ICON_CLS} size={17} />
                <input type="text" required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Stripe, Google" className={INPUT_CLS} />
              </div>
            </div>
          </div>

          {/* Row 2: Website + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Company Website</label>
              <div className="relative">
                <Link2 className={ICON_CLS} size={17} />
                <input type="text" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="e.g. stripe.com" className={INPUT_CLS} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Location</label>
              <div className="relative">
                <MapPin className={ICON_CLS} size={17} />
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, San Francisco" className={INPUT_CLS} />
              </div>
            </div>
          </div>

          {/* Row 3: Type + Salary + Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Job Type</label>
              <div className="relative">
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full pl-4 pr-9 py-3 bg-[#f8fafc] dark:bg-[#131314] border border-[#e1e5ea] dark:border-[#333538] rounded-xl text-sm text-[var(--text-primary)] appearance-none focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all cursor-pointer">
                  {JOB_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Salary</label>
              <div className="relative">
                <DollarSign className={ICON_CLS} size={17} />
                <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. $130k - $160k" className={INPUT_CLS} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Experience</label>
              <div className="relative">
                <Clock className={ICON_CLS} size={17} />
                <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 3-5 years" className={INPUT_CLS} />
              </div>
            </div>
          </div>

          {/* Row 4: Apply URL + Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Job / Apply Link</label>
              <div className="relative">
                <ExternalLink className={ICON_CLS} size={17} />
                <input type="url" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} placeholder="https://company.com/jobs/..." className={INPUT_CLS} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Apply By / Deadline</label>
              <div className="relative">
                <Calendar className={ICON_CLS} size={17} />
                <input type="text" value={applyBy} onChange={(e) => setApplyBy(e.target.value)} placeholder="e.g. Rolling, Oct 31, 2026" className={INPUT_CLS} />
              </div>
            </div>
          </div>

          {/* Skills & Tags */}
          <div className="space-y-3 pt-3 border-t border-[#e1e5ea]/40 dark:border-[#333538]/40">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Skills & Tech Stack</label>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3442FF]/10 text-[#3442FF] dark:bg-[#3442FF]/20 dark:text-[#a8c7fa] rounded-lg text-xs font-bold">
                    {s}
                    <button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))} className="hover:bg-[#3442FF]/20 rounded-md p-0.5 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Tag className={ICON_CLS} size={17} />
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); } }}
                  placeholder="Type skill & press Enter or comma" className={INPUT_CLS} />
              </div>
              <button type="button" onClick={() => addSkill()} disabled={!skillInput.trim()} className="px-4 py-3 bg-[#3442FF]/10 hover:bg-[#3442FF]/20 text-[#3442FF] dark:text-[#a8c7fa] rounded-xl text-sm font-bold disabled:opacity-40 shrink-0 transition-colors">
                <Plus size={16} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-[var(--muted)] mr-0.5">Suggestions:</span>
              {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 6).map((s) => (
                <button key={s} type="button" onClick={() => addSkill(s)} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 hover:bg-gray-200 dark:bg-[#131314] dark:hover:bg-[#25272a] text-gray-500 dark:text-gray-400 transition-colors">
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="pt-3 border-t border-[#e1e5ea]/40 dark:border-[#333538]/40">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Paste or write an overview of the role..."
              className="w-full p-4 bg-[#f8fafc] dark:bg-[#131314] border border-[#e1e5ea] dark:border-[#333538] rounded-xl text-sm text-[var(--text-primary)] placeholder-gray-400 focus:bg-white dark:focus:bg-[#1e1f20] focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all resize-y" />
          </div>

          {/* Collapsible: Responsibilities, Requirements & Benefits */}
          <div className="border-t border-[#e1e5ea]/40 dark:border-[#333538]/40 pt-3">
            <button type="button" onClick={() => setShowMore(!showMore)} className="flex items-center justify-between w-full py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text-primary)] transition-colors">
              <span>Responsibilities, Requirements & Benefits (Optional)</span>
              {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showMore && (
              <div className="space-y-5 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Responsibilities</label>
                  <textarea rows={3} value={responsibilitiesText} onChange={(e) => setResponsibilitiesText(e.target.value)} placeholder="• Design and implement scalable services&#10;• Collaborate with frontend engineers"
                    className="w-full p-4 bg-[#f8fafc] dark:bg-[#131314] border border-[#e1e5ea] dark:border-[#333538] rounded-xl text-sm text-[var(--text-primary)] placeholder-gray-400 focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Requirements</label>
                  <textarea rows={3} value={requirementsText} onChange={(e) => setRequirementsText(e.target.value)} placeholder="• 3+ years experience with React&#10;• Strong CS fundamentals"
                    className="w-full p-4 bg-[#f8fafc] dark:bg-[#131314] border border-[#e1e5ea] dark:border-[#333538] rounded-xl text-sm text-[var(--text-primary)] placeholder-gray-400 focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Benefits & Perks</label>
                  <textarea rows={2} value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} placeholder="• Health, dental & vision&#10;• Remote work flexibility"
                    className="w-full p-4 bg-[#f8fafc] dark:bg-[#131314] border border-[#e1e5ea] dark:border-[#333538] rounded-xl text-sm text-[var(--text-primary)] placeholder-gray-400 focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all resize-y" />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#e1e5ea]/60 dark:border-[#333538]/60 flex items-center justify-end gap-3 shrink-0">
          <button type="button" onClick={close} disabled={isSubmitting} className="px-6 py-2.5 rounded-full text-sm font-semibold text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[#333538] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting || !title.trim() || !company.trim()}
            className="px-7 py-2.5 bg-[#3442FF] hover:bg-[#2834b3] text-white rounded-full text-sm font-bold shadow-md shadow-[#3442FF]/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2">
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><CheckCircle size={16} /> Save Job</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
