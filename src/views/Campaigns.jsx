import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { resumeService } from "../services/database";
import { getCampaigns, createCampaign, updateCampaignStatus, deleteCampaign, getTemplates, createTemplate, updateTemplate, deleteTemplate, getAccounts, connectAccount, deleteAccount } from "../utils/firebaseServices";
import {
  ArrowRight,
  Clock,
  Search,
  Filter,
  X,
  Plus,
  Link2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Trash2,
  ChevronDown,
  FileText,
  Eye,
  Download,
  Mail,
  Send,
  Users,
  Type,
  Image as ImageIcon,
  Paperclip,
  Code,
  Bot,
  Scissors,
  UploadCloud,
  FileSpreadsheet,
  PauseCircle,
  PlayCircle,
  Folder,
  Flame,
  ListTree,
  Zap,
  History,
  Settings2,
  Server,
  LogOut
} from "lucide-react";

// --- Helpers ---
const formatDate = (dateMs) => {
  if (!dateMs) return "Unknown date";
  return new Date(dateMs).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// --- Local UI Wrappers (Ensures the complex UI renders perfectly) ---
const LocalCard = ({ children, className = "", noPadding = false, onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${noPadding ? "" : "p-4 sm:p-6"} ${className}`}>
    {children}
  </div>
);

const LocalButton = ({ children, onClick, variant = "primary", disabled, className = "", icon: Icon, type = "button" }) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#dde3ea] dark:bg-[#333538] text-[#1f1f1f] dark:text-[#e3e3e3] hover:bg-[#c9d3e0] py-2 px-4 shadow-none border-none",
    secondary: "bg-indigo-50 text-[#3442FF] hover:bg-indigo-100 focus:ring-[#3442FF] border border-indigo-100 py-2 px-4",
    ghost: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 py-1.5 px-3",
    outline: "bg-transparent hover:bg-black/5 py-2 px-4 border-none shadow-none text-gray-700",
    danger: "bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500 py-2 px-4 border-none",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
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

// --- Dummy Data (Since Templates & Accounts aren't in Firestore yet) ---


const INITIAL_ACCOUNTS = [
  { id: "acc1", email: "raj.harsh2001@gmail.com", name: "Harsh Raj", provider: "Google", status: "Connected", dailyLimit: 500, usedToday: 45 },
];

export function Campaigns({ campaigns, setView, isNewView, setCampaigns }) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  
  const [templates, setTemplates] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoadingCampaignData, setIsLoadingCampaignData] = useState(false);
  
  // Navigation
  const [viewState, setViewState] = useState(isNewView ? "new-campaign" : "campaigns"); 
  const [editingTemplate, setEditingTemplate] = useState(null); 
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Search & Filter
  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState("All");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateFolderFilter, setTemplateFolderFilter] = useState("All");

  // Load actual user resumes from DB
  useEffect(() => {
    if (!user) return;
    const loadResumes = async () => {
      setIsLoadingResumes(true);
      try {
        const userResumes = await resumeService.getAll(user.uid);
        setResumes(userResumes);
      } catch (error) {
        console.error("Error loading resumes:", error);
      } finally {
        setIsLoadingResumes(false);
      }
    };
    loadResumes();

    const loadCampaignData = async () => {
      setIsLoadingCampaignData(true);
      try {
        const [campsData, templatesData, accountsData] = await Promise.all([
          getCampaigns(),
          getTemplates(),
          getAccounts()
        ]);
        setCampaigns(campsData);
        setTemplates(templatesData);
        setAccounts(accountsData);
      } catch (error) {
        console.error("Error loading campaign data:", error);
      } finally {
        setIsLoadingCampaignData(false);
      }
    };
    loadCampaignData();
  }, [user]);

  // Keep internal tab sync'd with external isNewView prop changes
  useEffect(() => {
    if (isNewView) setViewState("new-campaign");
  }, [isNewView]);

  const toggleCampaignStatus = async (id) => {
    try {
      const c = campaigns.find(camp => camp.id === id);
      if (c && c.status !== 'Completed') {
        const newStatus = c.status === 'Active' ? 'Paused' : 'Active';
        await updateCampaignStatus(id, newStatus);
        
        setCampaigns(prev => prev.map(camp => {
          if (camp.id === id) {
            if (selectedCampaign && selectedCampaign.id === id) {
               setSelectedCampaign({ ...camp, status: newStatus });
            }
            return { ...camp, status: newStatus };
          }
          return camp;
        }));
      }
    } catch (error) {
      console.error("Failed to toggle campaign status", error);
    }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const firstTemplate = templates.find(t => t.id === c.sequence?.[0]?.templateId);
      const subject = firstTemplate ? firstTemplate.subject : (c.subject || "");
      const title = c.title || c.name || "";
      const matchesSearch = title.toLowerCase().includes(campaignSearch.toLowerCase()) || 
                            subject.toLowerCase().includes(campaignSearch.toLowerCase());
      const matchesStatus = campaignStatusFilter === "All" || c.status === campaignStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, campaignSearch, campaignStatusFilter, templates]);

  const uniqueTemplateFolders = useMemo(() => {
    const folders = new Set(templates.map(t => t.folder || "Uncategorized"));
    return Array.from(folders).sort();
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(templateSearch.toLowerCase()) || 
                            t.subject.toLowerCase().includes(templateSearch.toLowerCase());
      const folder = t.folder || "Uncategorized";
      const matchesFolder = templateFolderFilter === "All" || folder === templateFolderFilter;
      return matchesSearch && matchesFolder;
    });
  }, [templates, templateSearch, templateFolderFilter]);


  // --- Routing Logic ---
  if (viewState === "campaign-details" && selectedCampaign) {
    return (
      <CampaignDetailsView 
        campaign={selectedCampaign} 
        templates={templates}
        resumes={resumes}
        onBack={() => { setSelectedCampaign(null); setViewState("campaigns"); }} 
        onToggleStatus={() => toggleCampaignStatus(selectedCampaign.id)}
      />
    );
  }

  if (viewState === "builder") {
    return (
      <EmailTemplateBuilder 
        template={editingTemplate}
        resumes={resumes}
        onCancel={() => setViewState("templates")}
        onSave={async (data) => {
          try {
            if (data.id) {
              const res = await updateTemplate(data.id, data);
              setTemplates(templates.map(t => t.id === data.id ? res : t));
            } else {
              const res = await createTemplate(data);
              setTemplates([res, ...templates]);
            }
            setViewState("templates");
          } catch (e) { console.error(e); }
        }}
      />
    );
  }

  if (viewState === "new-campaign") {
    return (
      <NewCampaignBuilder 
        templates={templates}
        accounts={accounts}
        resumes={resumes}
        onCancel={() => {
            setViewState("campaigns");
            if(setView) setView("campaigns"); // reset parent view if needed
        }}
        onSend={async (data) => {
          try {
            const res = await createCampaign(data);
            setCampaigns([res, ...campaigns]);
            setViewState("campaigns");
            if(setView) setView("campaigns");
          } catch (e) { console.error(e); }
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full max-w-[1400px] mx-auto">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6 px-2">
        <button 
          onClick={() => setViewState("campaigns")} 
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${viewState === 'campaigns' ? 'border-[#3442FF] text-[#3442FF]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          Active Campaigns
        </button>
        <button 
          onClick={() => setViewState("templates")} 
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${viewState === 'templates' ? 'border-[#3442FF] text-[#3442FF]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          Email Templates
        </button>
        <button 
          onClick={() => setViewState("accounts")} 
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${viewState === 'accounts' ? 'border-[#3442FF] text-[#3442FF]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          Sender Accounts
        </button>
      </div>

      {viewState === "campaigns" ? (
        <>
          <div className="flex justify-end mb-6 px-2">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--surface-bg)] rounded-full text-sm focus:outline-none transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] border-transparent"
                />
              </div>
              <div className="relative w-full sm:w-auto min-w-[130px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={campaignStatusFilter}
                  onChange={(e) => setCampaignStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-[var(--surface-bg)] rounded-full text-sm focus:outline-none transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] border-transparent appearance-none cursor-pointer font-medium"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <LocalButton onClick={() => setViewState("new-campaign")} icon={Plus} className="w-full sm:w-auto whitespace-nowrap">
                New Campaign
              </LocalButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {filteredCampaigns.map(camp => {
              const firstTemplate = templates.find(t => t.id === camp.sequence?.[0]?.templateId);
              const openRate = camp.sent > 0 ? Math.round((parseInt(camp.opens) || 0) / parseInt(camp.sent) * 100) : 0;
              const replyRate = camp.sent > 0 ? Math.round((parseInt(camp.replies) || 0) / parseInt(camp.sent) * 100) : 0;
              const title = camp.title || camp.name || "Untitled Campaign";

              return (
              <LocalCard key={camp.id} onClick={() => { setSelectedCampaign(camp); setViewState("campaign-details"); }} className="flex flex-col hover:shadow-lg hover:border-[#3442FF]/40 transition-all duration-300 cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="text-[17px] font-extrabold text-gray-900 truncate tracking-tight group-hover:text-[#3442FF] transition-colors" title={title}>{title}</h3>
                    <p className="text-[12px] text-gray-500 mt-1 font-medium flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400"/> Started {formatDate(camp.createdAt || camp.date)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm border ${
                    camp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    camp.status === 'Paused' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {camp.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>}
                    {camp.status}
                  </span>
                </div>
                
                <div className="bg-gray-50/80 border border-gray-100 rounded-lg p-3 mb-5 mt-1">
                  <p className="text-[13px] text-gray-800 line-clamp-1 mb-2.5 font-medium" title={firstTemplate?.subject || camp.subject}>
                    <span className="text-gray-400 font-normal">Subj:</span> {firstTemplate?.subject || camp.subject || "No subject"}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-bold text-gray-500">
                    <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-sm"><ListTree size={12} className="text-[#3442FF]"/> {camp.sequence?.length || 1} Steps</span>
                    {camp.dailyLimit > 0 && <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-sm"><Flame size={12} className="text-orange-500"/> {camp.dailyLimit}/day</span>}
                    {(firstTemplate?.resumeId || camp.resumeId) && <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-sm text-[#3442FF]"><Paperclip size={12}/> Attached</span>}
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between text-[13px] mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium"><Users size={16} className="text-gray-400"/> Total Sent</div>
                    <div className="font-extrabold text-gray-900 text-[15px]">{camp.sent || camp.count || 0}</div>
                  </div>
          
                  <div className="grid grid-cols-2 gap-5">
                     <div>
                       <div className="flex justify-between items-end mb-1.5">
                         <span className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Opens</span>
                         <span className="text-[14px] font-extrabold text-[#3442FF]">{openRate}%</span>
                       </div>
                       <div className="w-full bg-indigo-50 border border-indigo-100/50 rounded-full h-1.5 overflow-hidden">
                         <div className="bg-[#3442FF] h-1.5 rounded-full transition-all duration-500" style={{ width: `${openRate}%` }}></div>
                       </div>
                       <p className="text-[11px] text-gray-500 mt-1.5 font-medium">{camp.opens || 0} opened</p>
                     </div>
                     
                     <div>
                       <div className="flex justify-between items-end mb-1.5">
                         <span className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Replies</span>
                         <span className="text-[14px] font-extrabold text-emerald-600">{replyRate}%</span>
                       </div>
                       <div className="w-full bg-emerald-50 border border-emerald-100/50 rounded-full h-1.5 overflow-hidden">
                         <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${replyRate}%` }}></div>
                       </div>
                       <p className="text-[11px] text-gray-500 mt-1.5 font-medium">{camp.replies || 0} replied</p>
                     </div>
                  </div>
                </div>
              </LocalCard>
            )})}
            
            {filteredCampaigns.length === 0 && (
               <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-gray-500">
                 <Search size={32} className="text-gray-400 mb-3" />
                 <h3 className="text-gray-900 font-bold">No campaigns found</h3>
                 <p className="text-sm">Try adjusting your search or filter criteria, or create a new campaign.</p>
               </div>
            )}
          </div>
        </>
      ) : viewState === "templates" ? (
        <>
          <div className="flex justify-end mb-6 px-2">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--surface-bg)] rounded-full text-sm focus:outline-none transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] border-transparent"
                />
              </div>
              <div className="relative w-full sm:w-auto min-w-[130px]">
                <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={templateFolderFilter}
                  onChange={(e) => setTemplateFolderFilter(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-[var(--surface-bg)] rounded-full text-sm focus:outline-none transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] border-transparent appearance-none cursor-pointer font-medium truncate"
                >
                  <option value="All">All Folders</option>
                  {uniqueTemplateFolders.map(folder => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <LocalButton onClick={() => { setEditingTemplate(null); setViewState("builder"); }} icon={Plus} className="w-full sm:w-auto whitespace-nowrap">
                New Template
              </LocalButton>
            </div>
          </div>

          <div className="space-y-8 px-2">
            {filteredTemplates.length > 0 ? (
              Object.entries(
                filteredTemplates.reduce((acc, template) => {
                  const folderName = template.folder || "Uncategorized";
                  if (!acc[folderName]) acc[folderName] = [];
                  acc[folderName].push(template);
                  return acc;
                }, {})
              ).sort(([a], [b]) => a === "Uncategorized" ? 1 : b === "Uncategorized" ? -1 : a.localeCompare(b)).map(([folderName, folderTemplates]) => (
                <div key={folderName} className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                    <Folder size={18} className={folderName === "Uncategorized" ? "text-gray-400" : "text-[#3442FF]"} />
                    <h3 className="text-[15px] font-bold text-gray-800">{folderName}</h3>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{folderTemplates.length}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {folderTemplates.map(template => (
                      <LocalCard key={template.id} noPadding className="flex flex-col hover:border-[#3442FF]/50 transition-all duration-200 group">
                        <div className="p-5 flex-1 flex flex-col cursor-pointer" onClick={() => { setEditingTemplate(template); setViewState("builder"); }}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-[#3442FF]" />
                              <h3 className="font-bold text-gray-900 truncate" title={template.name}>{template.name}</h3>
                            </div>
                          </div>
                          <p className="text-[13px] font-semibold text-gray-700 mb-2 truncate"><span className="text-gray-400 font-medium">Subject:</span> {template.subject}</p>
                          <p className="text-[13px] text-gray-500 line-clamp-3 whitespace-pre-wrap flex-1">{template.body}</p>
                        </div>
                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-medium text-gray-500">Click to edit</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={async (e) => { e.stopPropagation(); await deleteTemplate(template.id); setTemplates(templates.filter(t => t.id !== template.id)); }} 
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </LocalCard>
                    ))}
                  </div>
                </div>
              ))
            ) : (
               <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-gray-500">
                 <Search size={32} className="text-gray-400 mb-3" />
                 <h3 className="text-gray-900 font-bold">No templates found</h3>
                 <p className="text-sm">Try adjusting your search or folder filter.</p>
               </div>
            )}
          </div>
        </>
      ) : viewState === "accounts" ? (
        <>
          <div className="flex justify-end mb-6 px-2">
            <LocalButton onClick={() => setIsConnectModalOpen(true)} icon={Plus} className="w-full sm:w-auto whitespace-nowrap">
              Connect New Account
            </LocalButton>
          </div>

          <div className="flex flex-wrap gap-6 px-2 items-start">
            {accounts.map(acc => (
              <LocalCard key={acc.id} className="flex flex-col relative group border border-gray-200 hover:shadow-md transition-all duration-300 p-6 w-full md:w-[min(100%,26rem)]">
                <div className="flex items-start justify-between mb-5 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-[#3442FF] font-bold text-base shrink-0">
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight text-lg">{acc.name}</h3>
                      <p className="text-sm text-gray-500">{acc.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                    acc.status === 'Connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {acc.status}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Provider</span>
                    <span className="font-bold text-gray-700 flex items-center gap-1.5">
                      {acc.provider === 'Google' ? <Mail size={12} className="text-red-500"/> : 
                       acc.provider === 'Microsoft' ? <Mail size={12} className="text-blue-500"/> : 
                       <Server size={12} className="text-gray-500"/>}
                      {acc.provider}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Daily Limit</span>
                    <span className="font-bold text-gray-700">{acc.dailyLimit} emails</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Sending Health</span>
                      <span className="text-[12px] font-bold text-gray-700">{acc.usedToday} / {acc.dailyLimit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#3442FF] h-2 rounded-full" style={{ width: `${(acc.usedToday / acc.dailyLimit) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <LocalButton variant="outline" className="w-full text-[13px] py-2.5 h-11 text-gray-600 hover:text-gray-900 border-gray-200 rounded-full">
                    <Settings2 size={14} className="mr-1"/> Settings
                  </LocalButton>
                  <LocalButton variant="outline" onClick={async () => { await deleteAccount(acc.id); setAccounts(accounts.filter(a => a.id !== acc.id)); }} className="w-full text-[13px] py-2.5 h-11 text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200 hover:border-red-200 rounded-full">
                    <LogOut size={14} className="mr-1"/> Disconnect
                  </LocalButton>
                </div>
              </LocalCard>
            ))}
          </div>
          
          <ConnectAccountModal 
            isOpen={isConnectModalOpen} 
            onClose={() => setIsConnectModalOpen(false)} 
            onConnect={async (newAcc) => {
              try {
                const res = await connectAccount(newAcc);
                setAccounts([...accounts, res]);
                setIsConnectModalOpen(false);
              } catch (e) { console.error(e); }
            }} 
          />
        </>
      ) : null}
    </div>
  );
}

// --- Sub-Views & Modals ---

function ConnectAccountModal({ isOpen, onClose, onConnect }) {
  const [connecting, setConnecting] = useState(null);

  const handleConnect = (provider) => {
    setConnecting(provider);
    setTimeout(() => {
      onConnect({
        email: `new.sender.${Math.floor(Math.random() * 1000)}@${provider.toLowerCase()}.com`,
        name: "Harsh Raj",
        provider: provider,
        dailyLimit: provider === 'SMTP' ? 1000 : 500
      });
      setConnecting(null);
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Email Provider" maxWidth="max-w-md">
      <div className="space-y-4">
        <p className="text-[13px] text-gray-600 mb-4">Select your email provider to authorize sending campaigns. We use secure OAuth to connect without storing your password.</p>
        
        <button 
          onClick={() => handleConnect('Google')}
          disabled={connecting !== null}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md rounded-xl transition-all disabled:opacity-50 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <Mail size={20} />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-gray-900 text-sm">Google Workspace / Gmail</h4>
              <p className="text-xs text-gray-500">Connect via Google OAuth</p>
            </div>
          </div>
          {connecting === 'Google' ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <ArrowRight size={18} className="text-gray-300 group-hover:text-[#3442FF]" />}
        </button>

        <button 
          onClick={() => handleConnect('Microsoft')}
          disabled={connecting !== null}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md rounded-xl transition-all disabled:opacity-50 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Mail size={20} />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-gray-900 text-sm">Microsoft 365 / Outlook</h4>
              <p className="text-xs text-gray-500">Connect via Microsoft OAuth</p>
            </div>
          </div>
          {connecting === 'Microsoft' ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <ArrowRight size={18} className="text-gray-300 group-hover:text-[#3442FF]" />}
        </button>
      </div>
    </Modal>
  );
}

function NewCampaignBuilder({ onCancel, onSend, templates, accounts, resumes }) {
  const [formData, setFormData] = useState({ 
    name: "", 
    title: "", // Syncing with your old state
    dailyLimit: 50,
    accountId: accounts[0]?.id || "",
    sequence: [{ id: `step-${Date.now()}`, templateId: "", delayValue: 0, delayUnit: "days" }] 
  });
  
  const [recipientMode, setRecipientMode] = useState("manual"); 
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedCount, setParsedCount] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [manualRecipients, setManualRecipients] = useState([{ id: Date.now(), email: "", name: "", company: "" }]);

  const handleDownloadSample = () => {
    const csvContent = "data:text/csv;charset=utf-8,Email,Name,Company Name\nrecruiter@google.com,John Doe,Google\nhiring@startup.io,Jane Smith,Startup Inc";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_recipients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setIsParsing(true);
    setTimeout(() => {
      setParsedCount(Math.floor(Math.random() * 60) + 15);
      setIsParsing(false);
    }, 1200);
  };

  const addSequenceStep = () => {
    setFormData(prev => ({
      ...prev,
      sequence: [...prev.sequence, { id: `step-${Date.now()}`, templateId: "", delayValue: 3, delayUnit: "days" }]
    }));
  };

  const updateSequenceStep = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      sequence: prev.sequence.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeSequenceStep = (id) => {
    setFormData(prev => ({
      ...prev,
      sequence: prev.sequence.filter(s => s.id !== id)
    }));
  };

  const validManualRecipientsCount = manualRecipients.filter(r => r.email.trim()).length;
  const totalRecipients = recipientMode === "manual" ? validManualRecipientsCount : parsedCount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (recipientMode === "upload" && (!uploadedFile || isParsing)) return;
    if (!formData.name) return;
    if (formData.sequence.some(s => !s.templateId)) {
      alert("Please select a template for all steps in your sequence.");
      return;
    }
    if (recipientMode === "manual" && validManualRecipientsCount === 0) {
      alert("Please add at least one valid recipient email.");
      return;
    }

    const recipientsDisplay = recipientMode === "manual" 
        ? manualRecipients.filter(r=>r.email.trim()).map(r => r.email).join(', ') 
        : `[File: ${uploadedFile.name}]`;

    onSend({ 
      ...formData, 
      title: formData.name, // Maintain backward compatibility
      recipients: recipientsDisplay,
      recipientCount: totalRecipients,
      count: totalRecipients // Maintain backward compatibility
    });
  };

  const firstValidRecipient = recipientMode === 'manual' ? manualRecipients.find(r => r.email.trim()) : null;
  const mockCompany = firstValidRecipient?.company || "[Company Name]";
  const mockName = firstValidRecipient?.name || "[Recipient Name]";
  const daysToComplete = formData.dailyLimit > 0 ? Math.ceil(totalRecipients / formData.dailyLimit) : 1;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-200 min-h-[calc(100vh-10rem)] max-w-[1400px] mx-auto">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowRight size={20} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Configure Campaign</h2>
            <p className="text-xs text-gray-500 font-medium">Set up your audience, sequences, and safety limits.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LocalButton variant="ghost" onClick={onCancel} className="text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm">Cancel</LocalButton>
          <LocalButton 
            variant="primary" 
            onClick={handleSubmit} 
            icon={Send} 
            disabled={!formData.name || formData.sequence.some(s=>!s.templateId) || (recipientMode === 'upload' && (!uploadedFile || isParsing)) || (recipientMode === 'manual' && validManualRecipientsCount === 0)}
            className="disabled:opacity-50"
          >
            Launch Campaign
          </LocalButton>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-gray-50/30">
        <div className="flex-1 lg:w-3/5 border-r border-gray-200 overflow-y-auto p-6 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
            <h3 className="text-[15px] font-extrabold text-gray-900 border-b border-gray-100 pb-3 mb-4">1. Campaign Setup</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Campaign Name <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all" placeholder="e.g. Q3 Startup Outreach" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Sender Account <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select required value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})} className="w-full pl-10 pr-10 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] appearance-none outline-none transition-all cursor-pointer truncate">
                    <option value="" disabled>Select sender...</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.email})</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">Daily Send Limit <Flame size={14} className="text-orange-500"/></label>
                <div className="relative">
                  <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input required type="number" min="1" max="1000" value={formData.dailyLimit} onChange={e => setFormData({...formData, dailyLimit: parseInt(e.target.value) || 0})} className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all" />
                </div>
              </div>
            </div>

            {formData.dailyLimit > 0 && totalRecipients > formData.dailyLimit && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-3 mt-2 animate-in fade-in">
                 <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Flame className="text-orange-500" size={16}/>
                 </div>
                 <div>
                    <p className="text-sm font-bold text-orange-800 leading-tight">Inbox Warmup Active</p>
                    <p className="text-xs text-orange-700 mt-1">Sending is automatically throttled to <strong>{formData.dailyLimit} emails/day</strong> to protect your sender reputation.</p>
                    <p className="text-xs font-bold mt-2 text-orange-900 bg-orange-100/50 inline-block px-2 py-1 rounded">Estimated Completion: {daysToComplete} Days</p>
                 </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-[15px] font-extrabold text-gray-900 border-b border-gray-100 pb-3 mb-5">2. Automated Email Sequence</h3>
            
            <div className="space-y-4">
              {formData.sequence.map((step, index) => (
                <div key={step.id} className="relative bg-gray-50/50 border border-gray-200 rounded-xl p-4 transition-all focus-within:border-indigo-300">
                  <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-[#3442FF] text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                      <span className="text-[13px] font-bold text-gray-800">{index === 0 ? "Initial Email" : "Follow-up Email"}</span>
                    </div>
                    {index > 0 && (
                      <button type="button" onClick={() => removeSequenceStep(step.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>

                  {index > 0 && (
                    <div className="flex items-center gap-2 mb-4 bg-white p-2 rounded-lg border border-gray-100 shadow-sm w-fit flex-wrap">
                      <Clock size={14} className="text-gray-400 ml-1"/>
                      <span className="text-[13px] text-gray-600 font-medium">Wait</span>
                      <input type="number" min="1" value={step.delayValue} onChange={(e) => updateSequenceStep(step.id, "delayValue", parseInt(e.target.value) || 1)} className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[13px] text-center outline-none focus:border-[#3442FF]" />
                      <select value={step.delayUnit} onChange={(e) => updateSequenceStep(step.id, "delayUnit", e.target.value)} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[13px] outline-none focus:border-[#3442FF] appearance-none cursor-pointer">
                        <option value="days">Days</option>
                        <option value="hours">Hours</option>
                      </select>
                      <span className="text-[13px] text-gray-600 font-medium mr-1">then send:</span>
                    </div>
                  )}

                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select required value={step.templateId} onChange={e => updateSequenceStep(step.id, "templateId", e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] appearance-none outline-none transition-all cursor-pointer shadow-sm">
                      <option value="" disabled>Select a template...</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Subj: {t.subject})</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addSequenceStep} className="mt-4 flex items-center gap-1.5 text-[13px] font-bold text-[#3442FF] hover:text-[#2834b3] bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors border border-indigo-100">
              <Plus size={16} /> Add Follow-up Step
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <h3 className="text-[15px] font-extrabold text-gray-900">3. Audience / Recipients <span className="text-red-500">*</span></h3>
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button type="button" onClick={() => setRecipientMode("manual")} className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${recipientMode === "manual" ? "bg-white text-[#3442FF] shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>Manual</button>
                <button type="button" onClick={() => setRecipientMode("upload")} className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${recipientMode === "upload" ? "bg-white text-[#3442FF] shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>Upload CSV/Excel</button>
              </div>
            </div>

            {recipientMode === "manual" ? (
              <div className="space-y-3 bg-gray-50/50 p-5 rounded-xl border border-gray-200/60 overflow-x-auto">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <p className="text-[12px] text-gray-500 font-medium flex items-center gap-1.5">
                    <AlertCircle size={14}/> Enter data below. {'{{name}}'} and {'{{company}}'} will use these values dynamically.
                  </p>
                </div>

                {manualRecipients.map((rec) => (
                  <div key={rec.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 animate-in fade-in slide-in-from-top-1 min-w-[500px]">
                    <div className="w-full sm:w-2/5">
                      <input required type="email" placeholder="Email address *" value={rec.email} onChange={(e) => setManualRecipients(manualRecipients.map(r => r.id === rec.id ? { ...r, email: e.target.value } : r))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-900 focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all shadow-sm" />
                    </div>
                    <div className="w-[calc(50%-0.5rem)] sm:w-1/4">
                      <input type="text" placeholder="Name" value={rec.name} onChange={(e) => setManualRecipients(manualRecipients.map(r => r.id === rec.id ? { ...r, name: e.target.value } : r))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-900 focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all shadow-sm" />
                    </div>
                    <div className="w-[calc(50%-0.5rem)] sm:w-1/4">
                      <input type="text" placeholder="Company" value={rec.company} onChange={(e) => setManualRecipients(manualRecipients.map(r => r.id === rec.id ? { ...r, company: e.target.value } : r))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-900 focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all shadow-sm" />
                    </div>
                    <button type="button" onClick={() => setManualRecipients(manualRecipients.filter(r => r.id !== rec.id))} disabled={manualRecipients.length === 1} className="w-8 h-[38px] flex items-center justify-center shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 mt-2 sm:mt-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                <button type="button" onClick={() => setManualRecipients([...manualRecipients, { id: Date.now(), email: "", name: "", company: "" }])} className="text-[12px] font-bold text-[#3442FF] hover:text-[#2834b3] flex items-center gap-1.5 mt-4 px-3 py-2 border border-indigo-100 hover:bg-indigo-50 bg-white shadow-sm rounded-lg transition-colors w-max">
                  <Plus size={14} /> Add Another Recipient
                </button>
              </div>
            ) : (
              <div className={`border-2 border-dashed rounded-xl p-8 transition-all text-center ${uploadedFile ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200 hover:border-[#3442FF] bg-gray-50/50 hover:bg-indigo-50/30'}`}>
                {!uploadedFile ? (
                  <>
                    <UploadCloud className="mx-auto text-indigo-400 mb-3" size={36} />
                    <p className="text-[14px] font-semibold text-gray-800 mb-1">Click to upload Excel (.xls, .xlsx) or CSV</p>
                    <p className="text-[12px] text-gray-500 mb-2 max-w-sm mx-auto">Upload a list of recipients. Must contain <span className="font-bold">Email</span>, <span className="font-bold">Name</span>, and <span className="font-bold">Company Name</span> headers for variable substitution.</p>
                    <button type="button" onClick={handleDownloadSample} className="text-[12px] text-[#3442FF] hover:text-[#2834b3] font-semibold mb-4 inline-flex items-center gap-1.5 hover:underline transition-colors"><Download size={12}/> Download Sample File (CSV)</button>
                    <div className="w-full"></div>
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-all">
                      Browse Files
                      <input type="file" accept=".csv, .xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    {isParsing ? (
                      <>
                        <Loader2 size={32} className="animate-spin text-[#3442FF] mx-auto mb-4" />
                        <p className="text-[14px] font-bold text-gray-700">Analyzing columns and extracting contacts...</p>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet size={36} className="text-emerald-500 mx-auto mb-3" />
                        <p className="text-[15px] font-bold text-gray-900 mb-1">{uploadedFile.name}</p>
                        <p className="text-[14px] text-emerald-700 font-medium mb-4 bg-emerald-100 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                          <CheckCircle size={16}/> Successfully parsed {parsedCount} recipients!
                        </p>
                        <button type="button" onClick={() => { setUploadedFile(null); setParsedCount(0); }} className="text-[13px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors">Remove file</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Live Sequence Preview */}
        <div className="w-full lg:w-2/5 bg-gray-50 overflow-y-auto p-6 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2"><ListTree size={16} className="text-[#3442FF]"/> Sequence Preview</h3>
            <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm hidden sm:inline-block">Sample Data Applied</span>
          </div>
          
          <div className="flex-1 space-y-6">
            {formData.sequence.map((step, idx) => {
              const selectedTpl = templates.find(t => t.id === step.templateId);
              
              if (!selectedTpl && idx === 0) {
                 return (
                  <div key="empty" className="bg-white border border-gray-200 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center text-gray-400 h-64">
                    <History size={32} className="mb-3 opacity-50 text-indigo-400" />
                    <p className="text-sm font-medium text-gray-600">No template selected.</p>
                    <p className="text-xs mt-1">Select a template on the left to see the sequence preview.</p>
                  </div>
                 )
              }

              if (!selectedTpl) return null;

              const stepBody = selectedTpl.body.replace(/{{company}}/g, mockCompany).replace(/{{name}}/g, mockName);
              const stepSubject = selectedTpl.subject.replace(/{{company}}/g, mockCompany).replace(/{{name}}/g, mockName);
              
              const attachedResume = resumes.find(r => r.id === selectedTpl.resumeId);
              const resumeDisplayName = attachedResume ? (attachedResume.fileName || attachedResume.name) : selectedTpl.resumeId ? "Attached Resume" : null;

              return (
                <div key={step.id} className="relative">
                  {idx > 0 && (
                    <div className="absolute -top-6 left-6 w-0.5 h-6 bg-indigo-200 flex flex-col items-center justify-center z-0">
                      <div className="absolute top-1/2 -translate-y-1/2 bg-indigo-50 border border-indigo-200 text-[#3442FF] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                        Wait {step.delayValue} {step.delayUnit}
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative z-10">
                    <div className="bg-gray-50/80 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                       <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                         <Mail size={12} className="text-indigo-400"/> Step {idx + 1}
                       </span>
                    </div>

                    <div className="p-5">
                      <div className="space-y-2 mb-4 pb-4 border-b border-gray-100 text-[13px] overflow-hidden">
                        <p className="flex items-start gap-2"><span className="font-semibold text-gray-400 w-12 shrink-0">From:</span> <span className="text-gray-900 truncate">Harsh Raj &lt;raj.harsh2001@gmail.com&gt;</span></p>
                        <p className="flex items-start gap-2">
                          <span className="font-semibold text-gray-400 w-12 shrink-0">To:</span> 
                          <span className="text-gray-900 font-medium bg-indigo-50 text-[#3442FF] px-2 rounded-md truncate">
                            {recipientMode === 'manual' && manualRecipients[0].email 
                              ? `${manualRecipients[0].name ? `${manualRecipients[0].name} ` : ''}<${manualRecipients[0].email}>${manualRecipients.length > 1 ? ` (+${manualRecipients.length - 1} more)` : ''}`
                              : '[Recipient List]'}
                          </span>
                        </p>
                        <p className="flex items-start gap-2"><span className="font-semibold text-gray-400 w-12 shrink-0">Subj:</span> <span className="text-gray-900 font-bold truncate">{stepSubject}</span></p>
                        {resumeDisplayName && (
                          <p className="flex items-center gap-2 mt-2 pt-2"><Paperclip size={14} className="text-gray-400"/> <span className="text-[12px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium border border-gray-200 truncate">{resumeDisplayName}</span></p>
                        )}
                      </div>
                      
                      <div className="text-[13px] text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {stepBody}
                        <br /><br />
                        <div className="text-gray-500 pt-3 border-t border-gray-50 mt-3 inline-block">
                          --<br />
                          <span className="font-bold text-gray-900">Harsh Raj</span><br />
                          <span className="text-[11px]">Frontend Developer | View Portfolio</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignDetailsView({ campaign, templates, resumes, onBack, onToggleStatus }) {
  const mockActivity = [
    { email: "recruiter@google.com", status: "Replied", time: "2 hours ago" },
    { email: "hiring@startup.io", status: "Opened", time: "5 hours ago" },
    { email: "hr@company.com", status: "Delivered", time: "1 day ago" },
    { email: "talent@agency.net", status: "Opened", time: "1 day ago" },
  ];

  const openRate = campaign.sent > 0 ? Math.round((parseInt(campaign.opens) || 0) / parseInt(campaign.sent) * 100) : 0;
  const replyRate = campaign.sent > 0 ? Math.round((parseInt(campaign.replies) || 0) / parseInt(campaign.sent) * 100) : 0;
  
  const firstTemplate = templates.find(t => t.id === campaign.sequence?.[0]?.templateId);
  const attachedResume = resumes.find(r => r.id === (firstTemplate?.resumeId || campaign.resumeId));
  const resumeDisplayName = attachedResume ? (attachedResume.fileName || attachedResume.name) : (firstTemplate?.resumeId || campaign.resumeId) ? "Attached Resume" : null;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-200 min-h-[calc(100vh-10rem)] max-w-[1400px] mx-auto">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50 shrink-0 flex-wrap">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowRight size={20} className="rotate-180" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <h2 className="text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">{campaign.name || campaign.title}</h2>
              <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold ${
                campaign.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                campaign.status === 'Paused' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600'
              }`}>{campaign.status}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Started on {formatDate(campaign.createdAt || campaign.date)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          {campaign.status !== 'Completed' && (
            <LocalButton 
              variant={campaign.status === 'Active' ? 'outline' : 'primary'} 
              onClick={onToggleStatus} 
              icon={campaign.status === 'Active' ? PauseCircle : PlayCircle}
              className={`w-full sm:w-auto ${campaign.status === 'Active' ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
            >
              {campaign.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
            </LocalButton>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/30">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <LocalCard className="!p-5 bg-white border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 text-gray-500 mb-2 font-medium text-sm"><Users size={16} /> Total Sent</div>
            <div className="text-3xl font-extrabold text-gray-900">{campaign.sent || campaign.count || 0}</div>
          </LocalCard>
          <LocalCard className="!p-5 bg-white border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 text-[#3442FF] mb-2 font-medium text-sm"><Eye size={16} /> Opened</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">{campaign.opens || 0}</span>
              <span className="text-sm font-bold text-[#3442FF]">{openRate}% rate</span>
            </div>
          </LocalCard>
          <LocalCard className="!p-5 bg-white border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-600 mb-2 font-medium text-sm"><CheckCircle size={16} /> Replies</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">{campaign.replies || 0}</span>
              <span className="text-sm font-bold text-emerald-600">{replyRate}% rate</span>
            </div>
          </LocalCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Campaign Configuration</h3>
              <div className="space-y-5 text-sm">
                <div>
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium text-xs uppercase tracking-wider mb-1.5"><ListTree size={14}/> Sequence Overview</span>
                  <span className="text-gray-900 font-bold bg-indigo-50 text-[#3442FF] px-2 py-1 rounded inline-block">{campaign.sequence?.length || 1} Steps configured</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">Subject (Step 1)</span>
                  <span className="text-gray-900 font-medium line-clamp-2">{firstTemplate?.subject || campaign.subject || "Unknown"}</span>
                </div>
                {resumeDisplayName && (
                  <div>
                    <span className="block text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">Attachment (Step 1)</span>
                    <span className="inline-flex items-center gap-1.5 text-[#3442FF] bg-indigo-50 px-2 py-1 rounded font-medium border border-indigo-100 mt-0.5 truncate max-w-full">
                      <Paperclip size={14} className="shrink-0" /> <span className="truncate">{resumeDisplayName}</span>
                    </span>
                  </div>
                )}
                {campaign.dailyLimit > 0 && (
                  <div>
                    <span className="flex items-center gap-1.5 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1"><Flame size={14}/> Warmup Limit</span>
                    <span className="text-orange-900 bg-orange-50 font-semibold px-2 py-1 border border-orange-200 rounded inline-block">
                      Max {campaign.dailyLimit} sends / day
                    </span>
                  </div>
                )}
                <div className="break-all">
                  <span className="block text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">Sender Profile</span>
                  <span className="text-gray-900">Harsh Raj &lt;raj.harsh2001@gmail.com&gt;</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-[14px] font-bold text-gray-900">Recent Recipient Activity</h3>
                <LocalButton variant="ghost" className="text-[12px] text-[#3442FF] hover:bg-indigo-50 px-3 py-1.5 border border-transparent hover:border-indigo-100">View All</LocalButton>
              </div>
              <div className="divide-y divide-gray-100">
                {mockActivity.map((log, i) => (
                  <div key={i} className="px-4 sm:px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        log.status === 'Replied' ? 'bg-emerald-100 text-emerald-600' : 
                        log.status === 'Opened' ? 'bg-indigo-100 text-[#3442FF]' : 
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {log.status === 'Replied' ? <CheckCircle size={14} /> : 
                         log.status === 'Opened' ? <Eye size={14} /> : 
                         <Mail size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{log.email}</p>
                        <p className="text-xs text-gray-500">{log.time}</p>
                      </div>
                    </div>
                    <span className={`text-[12px] font-bold px-2.5 py-1 rounded-md shrink-0 ml-2 ${
                      log.status === 'Replied' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 
                      log.status === 'Opened' ? 'text-[#3442FF] bg-indigo-50 border border-indigo-200' : 
                      'text-gray-600 bg-gray-50 border border-gray-200'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailTemplateBuilder({ template, resumes, onCancel, onSave }) {
  const [formData, setFormData] = useState(template || { 
    name: "", 
    folder: "", 
    subject: "", 
    body: "",
    resumeId: ""
  });

  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if(!formData.name || !formData.subject || !formData.body) {
      alert("Please fill in the template name, subject, and body.");
      return;
    }
    onSave(formData);
  };

  const insertTextAtCursor = (startText, endText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.body;
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + startText + selectedText + endText + text.substring(end);
    setFormData({ ...formData, body: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startText.length, start + startText.length + selectedText.length);
    }, 0);
  };

  const handleToolbarAction = (label) => {
    switch (label) {
      case "Text Format": insertTextAtCursor("**", "**"); break;
      case "Link": 
        const url = prompt("Enter the URL:");
        if (url) insertTextAtCursor("[", `](${url})`);
        else insertTextAtCursor("[", "](https://...)");
        break;
      case "Image": insertTextAtCursor("![Alt Text](", "https://...)"); break;
      case "Attachment": 
        const attachmentDropdown = document.getElementById("resume-select");
        if (attachmentDropdown) {
          attachmentDropdown.focus();
          attachmentDropdown.classList.add("ring-4", "ring-[#3442FF]/20", "border-[#3442FF]");
          setTimeout(() => attachmentDropdown.classList.remove("ring-4", "ring-[#3442FF]/20", "border-[#3442FF]"), 1000);
        }
        break;
      case "Source Code": insertTextAtCursor("```\n", "\n```"); break;
      case "Variables": insertTextAtCursor("{{company}}"); break;
      case "Snippets": insertTextAtCursor("{{name}}"); break;
      case "Meeting Link": insertTextAtCursor("📅 [Schedule a call with me](https://calendly.com/harsh-raj)"); break;
      default: break;
    }
  };

  const previewBody = formData.body ? formData.body.replace(/{{company}}/g, "Google").replace(/{{name}}/g, "Hiring Manager") : "";
  const attachedResume = resumes.find(r => r.id === formData.resumeId);
  const resumeDisplayName = attachedResume ? (attachedResume.fileName || attachedResume.name) : formData.resumeId ? "Attached Resume" : null;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-200 min-h-[calc(100vh-10rem)] max-w-[1400px] mx-auto">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowRight size={20} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{template ? "Edit Template" : "New Email Template"}</h2>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">Configure snippet variables and default text.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LocalButton variant="ghost" onClick={onCancel} className="text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm hidden sm:inline-flex">Cancel</LocalButton>
          <LocalButton variant="primary" onClick={handleSubmit} icon={CheckCircle}>Save Template</LocalButton>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-gray-200 overflow-y-auto bg-white p-4 sm:p-6 gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Template Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all" placeholder="e.g. Initial Outreach" />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Template Folder</label>
              <div className="relative">
                <Folder className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select value={formData.folder} onChange={e => setFormData({...formData, folder: e.target.value})} className="w-full pl-10 pr-10 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] appearance-none outline-none transition-all cursor-pointer">
                  <option value="">No Folder (Uncategorized)</option>
                  <option value="Initial Outreach">Initial Outreach</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Recruiters">Recruiters</option>
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
              <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] outline-none transition-all" placeholder="e.g. Exploring Frontend Roles at {{company}}" />
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Attachment (Resume)</label>
              <div className="relative">
                <Paperclip className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select id="resume-select" value={formData.resumeId || ""} onChange={e => setFormData({...formData, resumeId: e.target.value})} className="w-full pl-10 pr-10 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#3442FF]/20 focus:border-[#3442FF] appearance-none outline-none transition-all cursor-pointer">
                  <option value="">No attachment</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.fileName || r.name || 'Resume'}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-[300px]">
            <div className="flex justify-between items-end mb-1.5">
              <label className="block text-[13px] font-bold text-gray-700">Email Body <span className="text-red-500">*</span></label>
              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Use {'{{company}}'} or {'{{name}}'}</span>
            </div>
            <div className="border border-gray-200 rounded-xl flex flex-col flex-1 overflow-hidden focus-within:border-[#3442FF] focus-within:ring-4 focus-within:ring-[#3442FF]/10 transition-shadow bg-gray-50/30">
              <div className="bg-white border-b border-gray-200 px-3 py-2 flex flex-wrap gap-1 items-center shrink-0">
                {[{ icon: Type, label: "Text Format" }, { icon: Link2, label: "Link" }, { icon: ImageIcon, label: "Image" }, { icon: Paperclip, label: "Attachment" }, { icon: Code, label: "Source Code" }, { icon: Bot, label: "Variables" }, { text: "{}", label: "Snippets" }, { icon: Scissors, label: "Cut" }, { icon: Calendar, label: "Meeting Link" }].map((tool, idx) => (
                  <button key={idx} type="button" title={tool.label} onClick={() => handleToolbarAction(tool.label)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    {tool.icon ? <tool.icon size={16} /> : <span className="text-[13px] font-mono font-bold">{tool.text}</span>}
                  </button>
                ))}
              </div>
              <textarea ref={textareaRef} value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} className="w-full flex-1 p-4 text-[14px] text-gray-800 outline-none resize-none bg-transparent" placeholder="Write your email here..." />
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-50/50 flex flex-col p-4 sm:p-6 lg:border-l lg:border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2"><Eye size={16} className="text-gray-400"/> Live Preview</h3>
            <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm hidden sm:inline-block">Sample Data Applied</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6 flex-1 max-h-[500px] overflow-y-auto">
            <div className="space-y-1.5 mb-5 pb-5 border-b border-gray-100 text-[14px] overflow-hidden">
              <p className="flex items-start gap-2"><span className="font-semibold text-gray-500 w-16 shrink-0">To:</span> <span className="text-gray-900 font-medium bg-indigo-50 text-[#3442FF] px-2 rounded-md truncate">Example Recruiter &lt;hiring@google.com&gt;</span></p>
              <p className="flex items-start gap-2"><span className="font-semibold text-gray-500 w-16 shrink-0">Subject:</span> <span className="text-gray-900 font-medium truncate">{formData.subject || <span className="text-gray-400 italic font-normal">No subject</span>}</span></p>
              {resumeDisplayName && (
                <p className="flex items-center gap-2 mt-2 pt-2"><Paperclip size={14} className="text-gray-400 shrink-0"/> <span className="text-[12px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium border border-gray-200 truncate">{resumeDisplayName}</span></p>
              )}
            </div>
            
            <div className="text-[14px] text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
              {previewBody || <span className="text-gray-400 italic">Body content will appear here...</span>}
              <br /><br />
              <div className="text-gray-500 pt-4 border-t border-gray-50 mt-4 inline-block">
                --<br />
                <span className="font-bold text-gray-900">Harsh Raj</span><br />
                <span className="text-[12px]">Frontend Developer | View Portfolio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Campaigns;
