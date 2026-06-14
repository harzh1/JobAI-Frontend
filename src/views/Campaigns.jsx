import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TiptapLink from '@tiptap/extension-link';
import { useAuth } from "../context/AuthContext";
import { resumeService } from "../services/database";
import { getCampaigns, getCampaign, createCampaign, updateCampaign, updateCampaignStatus, deleteCampaign, resendCampaign, getTemplates, createTemplate, updateTemplate, deleteTemplate, getAccounts, connectAccount, updateAccount, deleteAccount, getGoogleAuthUrl, getMicrosoftAuthUrl } from "../utils/firebaseServices";
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
  LogOut,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Link as LinkIcon, RemoveFormatting, Heading1, Heading2, Undo, Redo, RotateCcw, XCircle, Edit2
} from "lucide-react";

import { Card } from "../components/ui/UIComponents";
import EmptyStateCard from "../components/ui/EmptyStateCard";
import ConfirmDialog from "../components/ui/ConfirmDialog";

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
  <div onClick={onClick} className={`bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] ${noPadding ? "" : "p-6 sm:p-8"} ${className}`}>
    {children}
  </div>
);

const LocalButton = ({ children, onClick, variant = "primary", disabled, className = "", icon: Icon, type = "button" }) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#dde3ea] dark:bg-[#333538] text-[#1f1f1f] dark:text-[#e3e3e3] hover:bg-[#c9d3e0] py-2.5 px-6 shadow-none border-none",
    secondary: "bg-[#f8fafd] text-[#1e1f20] hover:bg-[#eaf1fb] focus:ring-[#1e1f20] border border-transparent hover:border-[#d2e3fc] py-2.5 px-6",
    ghost: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-black/5 focus:ring-gray-500 py-2 px-4",
    outline: "bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-2.5 px-6 text-gray-700 shadow-sm",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500 py-2.5 px-6 border border-transparent",
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} className={className.includes("text-red") ? "text-red-500" : ""} />}
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md", hideHeader = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-300" onClick={onClose}>
      <div className={`bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white/50 w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300`} onClick={e => e.stopPropagation()}>
        {!hideHeader && (
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between shrink-0">
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        <div className={`overflow-y-auto ${hideHeader ? "" : "p-8"}`}>
          {children}
        </div>
      </div>
    </div>
  );
};



export function Campaigns({ campaigns, setView, isNewView, setCampaigns }) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [connecting, setConnecting] = useState(null);

  const [templates, setTemplates] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoadingCampaignData, setIsLoadingCampaignData] = useState(false);

  // Navigation
  const [viewState, setViewState] = useState(() => {
    if (isNewView) return "new-campaign";
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "campaigns";
  });
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedAccountForSettings, setSelectedAccountForSettings] = useState(null);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [showDeleteCampaignConfirm, setShowDeleteCampaignConfirm] = useState(false);

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
      if (c && (c.status === 'Active' || c.status === 'Paused')) {
        const newStatus = c.status === 'Active' ? 'Paused' : 'Active';
        await updateCampaignStatus(id, newStatus);

        if (selectedCampaign && selectedCampaign.id === id) {
          setSelectedCampaign(prev => ({ ...prev, status: newStatus }));
        }

        setCampaigns(prev => prev.map(camp => {
          if (camp.id === id) {
            return { ...camp, status: newStatus };
          }
          return camp;
        }));
      }
    } catch (error) {
      console.error("Failed to toggle campaign status", error);
    }
  };

  const handleCreateCampaign = async (campaignData) => {
    try {
      setConnecting('Launching...');
      const response = await createCampaign(campaignData);

      const newCampaign = {
        id: response.id || `campaign-${Date.now()}`,
        ...campaignData,
        status: 'Active',
        sent: 0,
        createdAt: new Date().toISOString()
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      setViewState("campaigns");
      setSelectedCampaign(newCampaign);
      setViewState("campaign-detail");
    } catch (error) {
      console.error("Failed to create campaign", error);
      alert("Failed to create campaign: " + error.message);
    } finally {
      setConnecting(null);
    }
  };

  const handleEditCampaign = async (campaignData) => {
    try {
      setConnecting('Saving...');
      await updateCampaign(selectedCampaign.id, campaignData);

      setCampaigns(prev => prev.map(camp => {
        if (camp.id === selectedCampaign.id) {
          return { ...camp, ...campaignData };
        }
        return camp;
      }));

      setSelectedCampaign(prev => ({ ...prev, ...campaignData }));
      setViewState("campaign-detail");
    } catch (error) {
      console.error("Failed to update campaign", error);
      alert("Failed to update campaign: " + error.message);
    } finally {
      setConnecting(null);
    }
  };

  const handleResendCampaign = async (id, accountId = null) => {
    try {
      await resendCampaign(id, accountId);

      if (selectedCampaign && selectedCampaign.id === id) {
        setSelectedCampaign(prev => ({ ...prev, status: 'Active', sent: 0, ...(accountId ? { accountId } : {}) }));
      }

      setCampaigns(prev => prev.map(camp => {
        if (camp.id === id) {
          return { ...camp, status: 'Active', sent: 0, ...(accountId ? { accountId } : {}) };
        }
        return camp;
      }));
    } catch (error) {
      console.error("Failed to resend campaign", error);
    }
  };

  const handleConfirmClearHistory = async () => {
    setConnecting('Clearing...');
    try {
      const campaignsWithHistory = campaigns.filter(c => c.history && c.history.length > 0);
      await Promise.all(campaignsWithHistory.map(c => updateCampaign(c.id, { history: [] })));

      setCampaigns(prev => prev.map(c => ({ ...c, history: [] })));
    } catch (error) {
      console.error("Failed to clear history", error);
      alert("Failed to clear history");
    } finally {
      setConnecting(null);
      setShowClearHistoryConfirm(false);
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


  const allHistoryEvents = useMemo(() => {
    let events = [];
    campaigns.forEach(c => {
      if (c.history) {
        c.history.forEach(h => {
          events.push({
            ...h,
            campaignName: c.name || c.title,
            campaignId: c.id
          });
        });
      }
    });
    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [campaigns]);

  // --- Routing Logic ---
  if (viewState === "campaign-detail") {
    return (
      <>
        <CampaignDetailsView
          campaign={selectedCampaign}
          templates={templates}
          resumes={resumes}
          accounts={accounts}
          onBack={() => {
            setSelectedCampaign(null);
            setViewState("campaigns");
          }}
          onToggleStatus={async (newStatus) => {
            await updateCampaignStatus(selectedCampaign.id, newStatus);
            setSelectedCampaign(prev => ({ ...prev, status: newStatus }));
            setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { ...c, status: newStatus } : c));
          }}
          onStop={() => {
            updateCampaignStatus(selectedCampaign.id, 'Stopped').then(() => {
              setSelectedCampaign(prev => ({ ...prev, status: 'Stopped' }));
              setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { ...c, status: 'Stopped' } : c));
            })
          }}
          onResend={(accountId) => handleResendCampaign(selectedCampaign.id, accountId)}
          onEdit={() => setViewState("edit-campaign")}
          onDelete={() => setShowDeleteCampaignConfirm(true)}
        />

        <ConfirmDialog
          open={showDeleteCampaignConfirm}
          title="Delete campaign?"
          description="All analytics and history will be lost. This cannot be undone."
          confirmLabel="Delete"
          onConfirm={async () => {
            try {
              await deleteCampaign(selectedCampaign.id);
              setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id));
              setSelectedCampaign(null);
              setViewState("campaigns");
            } catch (e) {
              console.error("Failed to delete campaign:", e);
              alert("Failed to delete campaign. Please try again.");
            } finally {
              setShowDeleteCampaignConfirm(false);
            }
          }}
          onCancel={() => setShowDeleteCampaignConfirm(false)}
        />
      </>
    );
  }

  if (viewState === "builder") {
    return (
      <EmailTemplateBuilder
        template={editingTemplate}
        resumes={resumes}
        accounts={accounts}
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
          if (setView) setView("campaigns"); // reset parent view if needed
        }}
        onSend={async (data) => {
          try {
            const res = await createCampaign(data);
            setCampaigns([res, ...campaigns]);
            setViewState("campaigns");
            if (setView) setView("campaigns");
          } catch (e) { console.error(e); }
        }}
      />
    );
  }

  if (viewState === "edit-campaign") {
    return (
      <NewCampaignBuilder
        initialData={selectedCampaign}
        templates={templates}
        accounts={accounts}
        resumes={resumes}
        onCancel={() => setViewState("campaign-detail")}
        onSend={handleEditCampaign}
      />
    );
  }

  return (
    <div className="flex flex-col h-full max-w-[1400px] mx-auto">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 mb-8 p-1.5 bg-[#f0f4f9] rounded-full w-fit mx-2 sm:mx-0">
        {[
          { id: 'campaigns', label: 'Active Campaigns' },
          { id: 'templates', label: 'Email Templates' },
          { id: 'accounts', label: 'Sender Accounts' },
          { id: 'history', label: 'Activity History' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewState(tab.id)}
            className={`relative px-5 py-2.5 rounded-full text-[14px] font-medium transition-colors duration-300 ${viewState === tab.id ? 'text-[#1f1f1f]' : 'text-[#444746] hover:text-[#1f1f1f] hover:bg-black/5'}`}
          >
            {viewState === tab.id && (
              <motion.div
                layoutId="campaigns-tab-active"
                className="absolute inset-0 bg-white shadow-sm border border-black/5 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {viewState === "campaigns" ? (
        <>
          <div className="flex justify-end mb-6 px-2">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-full text-sm focus:outline-none transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus:border-[#d2e3fc] focus:ring-4 focus:ring-[#eaf1fb]"
                />
              </div>
              <div className="relative w-full sm:w-auto min-w-[140px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={campaignStatusFilter}
                  onChange={(e) => setCampaignStatusFilter(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 bg-white border border-gray-100 rounded-full text-sm focus:outline-none transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus:border-[#d2e3fc] focus:ring-4 focus:ring-[#eaf1fb] appearance-none cursor-pointer font-medium"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Stopped">Stopped</option>
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
                <LocalCard key={camp.id} noPadding={true} onClick={() => { setSelectedCampaign(camp); setViewState("campaign-detail"); }} className="flex flex-col cursor-pointer group hover:ring-2 hover:ring-[#eaf1fb] transition-all duration-300 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="text-base font-bold text-gray-800 truncate tracking-tight group-hover:text-[#4285F4] transition-colors" title={title}>{title}</h3>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium flex items-center gap-1.5">
                        <Calendar size={12} className="text-gray-400" /> {formatDate(camp.createdAt || camp.date)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${camp.status === 'Active' ? 'bg-[#eaf1fb] text-[#4285F4]' :
                        camp.status === 'Paused' ? 'bg-amber-50 text-amber-600' :
                          camp.status === 'Failed' ? 'bg-red-50 text-red-600' :
                            camp.status === 'Stopped' ? 'bg-slate-100 text-slate-600' :
                              camp.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                'bg-gray-100 text-gray-600'
                      }`}>
                      {camp.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] mr-1.5 animate-pulse"></span>}
                      {camp.status}
                    </span>
                  </div>

                  <div className="bg-gray-50/50 rounded-xl p-3 mb-4 mt-1 border border-gray-100/50 group-hover:bg-[#f8fafd] transition-colors">
                    <p className="text-[13px] text-gray-700 line-clamp-1 mb-2 font-medium" title={firstTemplate?.subject || camp.subject}>
                      <span className="text-gray-400 font-normal">Subj:</span> {firstTemplate?.subject || camp.subject || "No subject"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-gray-600">
                      <span className="flex items-center gap-1"><ListTree size={12} className="text-[#9b72cb]" /> {camp.sequence?.length || 1} Steps</span>
                      {camp.dailyLimit > 0 && <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /> {camp.dailyLimit}/day</span>}
                      {(firstTemplate?.resumeId || camp.resumeId) && <span className="flex items-center gap-1 text-[#4285F4]"><Paperclip size={12} /> Attached</span>}
                    </div>
                  </div>

                  <div className="mt-auto">
                    {camp.status === 'Failed' && camp.error && (
                      <div className="mb-3 text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100/50 flex items-start gap-1.5">
                        <AlertCircle size={12} className="shrink-0 mt-0.5" />
                        <span>{camp.error}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[13px] mb-4 pb-4 border-b border-gray-100/50">
                      <div className="flex items-center gap-1.5 text-gray-500 font-medium"><Users size={14} /> Total Sent</div>
                      <div className="font-bold text-gray-800 text-sm">{camp.sent || camp.count || 0}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Opens</span>
                          <span className="text-[12px] font-bold text-[#4285F4]">{openRate}%</span>
                        </div>
                        <div className="w-full bg-blue-50/50 rounded-full h-1 overflow-hidden">
                          <div className="bg-gradient-to-r from-[#4285F4] to-[#8ab4f8] h-1 rounded-full transition-all duration-500" style={{ width: `${openRate}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Replies</span>
                          <span className="text-[12px] font-bold text-[#9b72cb]">{replyRate}%</span>
                        </div>
                        <div className="w-full bg-purple-50/50 rounded-full h-1 overflow-hidden">
                          <div className="bg-gradient-to-r from-[#9b72cb] to-[#c4a9eb] h-1 rounded-full transition-all duration-500" style={{ width: `${replyRate}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </LocalCard>
              )
            })}

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
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-full text-sm focus:outline-none transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus:border-[#d2e3fc] focus:ring-4 focus:ring-[#eaf1fb]"
                />
              </div>
              <div className="relative w-full sm:w-auto min-w-[140px]">
                <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={templateFolderFilter}
                  onChange={(e) => setTemplateFolderFilter(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 bg-white border border-gray-100 rounded-full text-sm focus:outline-none transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus:border-[#d2e3fc] focus:ring-4 focus:ring-[#eaf1fb] appearance-none cursor-pointer font-medium truncate"
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
                      <LocalCard key={template.id} noPadding className="flex flex-col hover:border-[#4285F4]/30 hover:ring-2 hover:ring-[#eaf1fb] transition-all duration-300 group">
                        <div className="p-6 flex-1 flex flex-col cursor-pointer" onClick={() => { setEditingTemplate(template); setViewState("builder"); }}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-blue-50 rounded-lg text-[#4285F4]">
                                <FileText size={18} />
                              </div>
                              <h3 className="font-bold text-gray-800 text-lg truncate tracking-tight" title={template.name}>{template.name}</h3>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mb-3 truncate"><span className="text-gray-400 font-normal">Subj:</span> {template.subject}</p>
                          <p className="text-[13px] text-gray-500 line-clamp-3 whitespace-pre-wrap flex-1 leading-relaxed">{(template.body || '').replace(/<[^>]+>/g, '')}</p>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Click to edit</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async (e) => { e.stopPropagation(); await deleteTemplate(template.id); setTemplates(templates.filter(t => t.id !== template.id)); }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
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
            {accounts.map(acc => {
              const todayStr = new Date().toISOString().split('T')[0];
              const actualUsedToday = acc.lastUsedDate === todayStr ? (acc.usedToday || 0) : 0;

              return (
              <LocalCard key={acc.id} noPadding={true} className="flex flex-col relative group border border-gray-100 hover:ring-2 hover:ring-[#eaf1fb] transition-all duration-300 w-full md:w-[min(100%,22rem)] p-5">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#eaf1fb] to-[#d2e3fc] flex items-center justify-center text-[#4285F4] font-bold text-base shrink-0 shadow-inner">
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 leading-tight text-base tracking-tight">{acc.name}</h3>
                      <p className="text-[12px] text-gray-500">{acc.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${acc.status === 'Connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {acc.status}
                  </span>
                </div>

                <div className="bg-gray-50/50 rounded-xl p-3 mb-4 border border-gray-50 space-y-2.5">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-500 font-medium">Provider</span>
                    <span className="font-bold text-gray-700 flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">
                      {acc.provider === 'Google' ? <Mail size={12} className="text-red-500" /> :
                        acc.provider === 'Microsoft' ? <Mail size={12} className="text-blue-500" /> :
                          <Server size={12} className="text-gray-500" />}
                      {acc.provider}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-500 font-medium">Total Sent</span>
                    <span className="font-bold text-gray-700">{acc.totalSent || 0} <span className="font-normal opacity-80 text-[11px]">emails</span></span>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-gray-100/80">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sending Health</span>
                      <span className="text-[12px] font-bold text-[#4285F4]">{actualUsedToday} / {acc.dailyLimit || 0}</span>
                    </div>
                    <div className="w-full bg-blue-50/50 rounded-full h-1 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#4285F4] to-[#8ab4f8] h-1 rounded-full transition-all duration-500" style={{ width: `${(actualUsedToday / (acc.dailyLimit || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <LocalButton variant="outline" onClick={() => setSelectedAccountForSettings(acc)} className="w-full text-[13px] py-1.5 px-0 h-auto">
                    <Settings2 size={14} className="mr-1.5" /> Settings
                  </LocalButton>
                  <LocalButton variant="ghost" onClick={async () => { await deleteAccount(acc.id); setAccounts(accounts.filter(a => a.id !== acc.id)); }} className="w-full text-[13px] py-1.5 px-0 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300">
                    <LogOut size={14} className="mr-1.5" /> Disconnect
                  </LocalButton>
                </div>
              </LocalCard>
            )})}
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

          <AccountSettingsModal
            isOpen={!!selectedAccountForSettings}
            account={selectedAccountForSettings}
            onClose={() => setSelectedAccountForSettings(null)}
            onSave={async (id, updates) => {
              try {
                const res = await updateAccount(id, updates);
                setAccounts(accounts.map(a => a.id === id ? res : a));
                setSelectedAccountForSettings(null);
              } catch (e) {
                console.error(e);
                alert("Failed to save settings.");
              }
            }}
          />
        </>
      ) : viewState === "history" ? (
        <>
          <div className="flex justify-end mb-6 px-2">
            {allHistoryEvents.length > 0 && (
              <LocalButton
                variant="danger"
                onClick={() => setShowClearHistoryConfirm(true)}
                disabled={connecting === 'Clearing...'}
                className="w-full sm:w-auto whitespace-nowrap"
              >
                {connecting === 'Clearing...' ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                Clear History
              </LocalButton>
            )}
          </div>

          <div className="px-2 pb-12 animate-in fade-in duration-300">
            {allHistoryEvents.length > 0 ? (
              <div className="overflow-hidden">
                <table className="w-full text-left min-w-[600px] border-collapse">
                  <thead className="text-[12px] uppercase tracking-widest text-[#444746] font-bold border-b border-gray-200/60">
                    <tr>
                      <th className="py-4 px-2 font-bold border-none">Date & Time</th>
                      <th className="py-4 px-4 font-bold border-none">Action Taken</th>
                      <th className="py-4 px-4 font-bold border-none">Campaign</th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-gray-100/50">
                    {allHistoryEvents.map((item, idx) => {
                      const isError = item.action.toLowerCase().includes('failed') || item.action.toLowerCase().includes('error');
                      const isSuccess = item.action.toLowerCase().includes('completed') || item.action.toLowerCase().includes('created');
                      const isWarning = item.action.toLowerCase().includes('paused') || item.action.toLowerCase().includes('stopped');

                      const badgeClass = isError ? 'bg-[#fce8e6] text-[#d93025]' :
                        isSuccess ? 'bg-[#e6f4ea] text-[#137333]' :
                          isWarning ? 'bg-[#fef7e0] text-[#b06000]' : 'bg-[#eaf1fb] text-[#1a73e8]';

                      return (
                        <tr key={idx} className="hover:bg-[#f8fafd] transition-colors duration-200">
                          <td className="py-4 px-6 whitespace-nowrap text-[#444746] text-[14px] w-[220px]">
                            {new Date(item.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap w-[240px]">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[12px] font-bold tracking-wide ${badgeClass}`}>
                              {item.action}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-[#1f1f1f] text-[15px] font-medium truncate">
                            {item.campaignName}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyStateCard
                icon={Clock}
                title="No activity history found"
                description="Your campaign events will appear here once you take action."
              />
            )}
          </div>
        </>
      ) : null}

      <ConfirmDialog
        open={showClearHistoryConfirm}
        title="Clear activity history?"
        description="Are you sure you want to clear all activity history? This cannot be undone."
        confirmLabel="Clear"
        onConfirm={handleConfirmClearHistory}
        onCancel={() => setShowClearHistoryConfirm(false)}
      />
    </div>
  );
}

// --- Sub-Views & Modals ---

function AccountSettingsModal({ isOpen, onClose, account, onSave }) {
  const [dailyLimit, setDailyLimit] = useState(account?.dailyLimit || 500);
  const [name, setName] = useState(account?.name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account) {
      setDailyLimit(account.dailyLimit || 500);
      setName(account.name || '');
    }
  }, [account]);

  const handleSave = async () => {
    if (!account) return;
    setSaving(true);
    await onSave(account.id, { dailyLimit: parseInt(dailyLimit) || 500, name });
    setSaving(false);
  };

  if (!account) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Settings" maxWidth="max-w-md">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] transition-all"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Daily Sending Limit</label>
          <p className="text-[13px] text-gray-500 mb-3">Maximum number of emails this account can send per day to protect your deliverability.</p>
          <input
            type="number"
            value={dailyLimit}
            onChange={e => setDailyLimit(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] transition-all"
            min="1"
            max="2000"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <LocalButton variant="ghost" onClick={onClose} className="px-5">Cancel</LocalButton>
          <LocalButton onClick={handleSave} disabled={saving} className="px-5">
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Settings2 size={16} className="mr-2" />}
            Save Settings
          </LocalButton>
        </div>
      </div>
    </Modal>
  );
}

function ConnectAccountModal({ isOpen, onClose, onConnect }) {
  const [connecting, setConnecting] = useState(null);

  const handleConnect = async (provider) => {
    setConnecting(provider);
    if (provider === 'Google') {
      try {
        const response = await getGoogleAuthUrl();
        if (response.url) {
          window.location.href = response.url;
        }
      } catch (error) {
        console.error("Failed to get Google Auth URL", error);
        alert("Failed to connect to Google. Please check your backend.");
        setConnecting(null);
      }
    } else if (provider === 'Microsoft') {
      try {
        const response = await getMicrosoftAuthUrl();
        if (response.url) {
          window.location.href = response.url;
        }
      } catch (error) {
        console.error("Failed to get Microsoft Auth URL", error);
        alert("Failed to connect to Microsoft. Please check your backend.");
        setConnecting(null);
      }
    } else {
      setTimeout(() => {
        onConnect({
          email: `new.sender.${Math.floor(Math.random() * 1000)}@${provider.toLowerCase()}.com`,
          name: "Harsh Raj",
          provider: provider,
          dailyLimit: 500
        });
        setConnecting(null);
      }, 1500);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Email Provider" maxWidth="max-w-md">
      <div className="space-y-6">
        <p className="text-sm text-gray-500 mb-6">Select your email provider to authorize sending campaigns. We use secure OAuth to connect without storing your password.</p>

        <button
          onClick={() => handleConnect('Google')}
          disabled={connecting !== null}
          className="w-full flex items-center justify-between p-5 bg-white border border-gray-100 hover:border-[#d2e3fc] hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl transition-all disabled:opacity-50 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50/50 flex items-center justify-center text-[#4285F4] border border-blue-100/50">
              <Mail size={22} />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-gray-800 text-sm tracking-tight">Google Workspace / Gmail</h4>
              <p className="text-xs text-gray-500 mt-0.5">Connect via Google OAuth</p>
            </div>
          </div>
          {connecting === 'Google' ? <Loader2 size={20} className="animate-spin text-[#4285F4]" /> : <ArrowRight size={20} className="text-gray-300 group-hover:text-[#4285F4]" />}
        </button>
      </div>
    </Modal>
  );
}

function NewCampaignBuilder({ initialData, onCancel, onSend, templates, accounts, resumes }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || initialData?.title || "",
    title: initialData?.title || initialData?.name || "",
    dailyLimit: initialData?.dailyLimit !== undefined ? initialData.dailyLimit : 50,
    accountId: initialData?.accountId || accounts[0]?.id || "",
    sequence: initialData?.sequence || [{ id: `step-${Date.now()}`, templateId: "", delayValue: 0, delayUnit: "days" }]
  });

  const [recipientMode, setRecipientMode] = useState("manual");

  const selectedAccount = useMemo(() => {
    return accounts.find(a => a.id === formData.accountId) || accounts[0] || null;
  }, [accounts, formData.accountId]);
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

  const [csvRecipients, setCsvRecipients] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          setParsedCount(0);
          setCsvRecipients([]);
          setIsParsing(false);
          return;
        }
        // Skip header row, parse each line
        const parsed = lines.slice(1).map(line => {
          const cols = line.split(',').map(c => c.trim());
          return { email: cols[0] || '', name: cols[1] || '', company: cols[2] || '' };
        }).filter(r => r.email);
        setCsvRecipients(parsed);
        setParsedCount(parsed.length);
      } catch (err) {
        console.error("CSV parse error:", err);
        setParsedCount(0);
        setCsvRecipients([]);
      }
      setIsParsing(false);
    };
    reader.readAsText(file);
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
    if (!initialData) {
      if (recipientMode === "upload" && (!uploadedFile || isParsing)) return;
      if (recipientMode === "manual" && validManualRecipientsCount === 0) {
        alert("Please add at least one valid recipient email.");
        return;
      }
    }

    const payload = {
      ...formData,
      title: formData.name,
    };

    if (!initialData) {
      payload.recipientsList = recipientMode === "manual"
        ? manualRecipients.filter(r => r.email.trim()).map(r => ({ email: r.email.trim(), name: r.name.trim(), company: r.company.trim() }))
        : csvRecipients;
      payload.recipients = recipientMode === "manual"
        ? payload.recipientsList.map(r => r.email).join(', ')
        : `${csvRecipients.length} recipients from ${uploadedFile.name}`;
      payload.recipientCount = totalRecipients;
      payload.count = totalRecipients;
    }

    onSend(payload);
  };

  const firstValidRecipient = recipientMode === 'manual' ? manualRecipients.find(r => r.email.trim()) : (csvRecipients[0] || null);
  const previewCompany = firstValidRecipient?.company || "[Company Name]";
  const previewName = firstValidRecipient?.name || "[Recipient Name]";
  const daysToComplete = formData.dailyLimit > 0 ? Math.ceil(totalRecipients / formData.dailyLimit) : 1;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden animate-in fade-in duration-300 min-h-[calc(100vh-10rem)] max-w-[1400px] mx-auto">
      <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 opacity-50"></div>
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={onCancel} className="p-2 -ml-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowRight size={22} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Configure Campaign</h2>
            <p className="text-sm text-gray-500 mt-0.5">Set up your audience, sequences, and safety limits.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <LocalButton variant="ghost" onClick={onCancel} className="text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm">Cancel</LocalButton>
          <LocalButton
            variant="primary"
            onClick={handleSubmit}
            icon={Send}
            disabled={!formData.name || formData.sequence.some(s => !s.templateId) || (!initialData && recipientMode === 'upload' && (!uploadedFile || isParsing)) || (!initialData && recipientMode === 'manual' && validManualRecipientsCount === 0)}
          >
            {initialData ? "Save Changes" : "Launch Campaign"}
          </LocalButton>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-gray-50/30">
        <div className="flex-1 lg:w-3/5 border-r border-gray-100 overflow-y-auto p-8 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight border-b border-gray-50 pb-4 mb-4">1. Campaign Setup</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Name <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] outline-none transition-all" placeholder="e.g. Q3 Startup Outreach" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sender Account <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select required value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} className="w-full pl-12 pr-10 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] appearance-none outline-none transition-all cursor-pointer truncate">
                    <option value="" disabled>Select sender...</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.email})</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">Daily Send Limit <Flame size={16} className="text-orange-400" /></label>
                <div className="relative">
                  <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required type="number" min="1" max="1000" value={formData.dailyLimit} onChange={e => setFormData({ ...formData, dailyLimit: parseInt(e.target.value) || 0 })} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] outline-none transition-all" />
                </div>
              </div>
            </div>

            {formData.dailyLimit > 0 && totalRecipients > formData.dailyLimit && (
              <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-2xl flex items-start gap-4 mt-4 animate-in fade-in">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Flame className="text-orange-500" size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-800 tracking-tight">Inbox Warmup Active</p>
                  <p className="text-sm text-orange-700 mt-1.5">Sending is automatically throttled to <strong>{formData.dailyLimit} emails/day</strong> to protect your sender reputation.</p>
                  <p className="text-xs font-bold mt-3 text-orange-800 bg-orange-100/50 inline-block px-3 py-1.5 rounded-lg border border-orange-200/50">Estimated Completion: {daysToComplete} Days</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight border-b border-gray-50 pb-4 mb-6">2. Automated Email Sequence</h3>

            <div className="space-y-5">
              {formData.sequence.map((step, index) => (
                <div key={step.id} className="relative bg-gray-50/50 border border-gray-100 rounded-2xl p-5 transition-all focus-within:ring-2 focus-within:ring-[#eaf1fb]">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100/50 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-blue-50 text-[#4285F4] text-sm font-bold flex items-center justify-center shrink-0 shadow-sm">{index + 1}</span>
                      <span className="text-sm font-bold text-gray-800">{index === 0 ? "Initial Email" : "Follow-up Email"}</span>
                    </div>
                    {index > 0 && (
                      <button type="button" onClick={() => removeSequenceStep(step.id)} className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-full p-2 shadow-sm transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {index > 0 && (
                    <div className="flex items-center gap-2.5 mb-5 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm w-fit flex-wrap">
                      <Clock size={16} className="text-[#9b72cb] ml-1" />
                      <span className="text-sm text-gray-600 font-medium">Wait</span>
                      <input type="number" min="1" value={step.delayValue} onChange={(e) => updateSequenceStep(step.id, "delayValue", parseInt(e.target.value) || 1)} className="w-16 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center outline-none focus:border-[#9b72cb] focus:ring-2 focus:ring-purple-50" />
                      <select value={step.delayUnit} onChange={(e) => updateSequenceStep(step.id, "delayUnit", e.target.value)} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#9b72cb] focus:ring-2 focus:ring-purple-50 appearance-none cursor-pointer">
                        <option value="days">Days</option>
                        <option value="hours">Hours</option>
                      </select>
                      <span className="text-sm text-gray-600 font-medium mr-1">then send:</span>
                    </div>
                  )}

                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select required value={step.templateId} onChange={e => updateSequenceStep(step.id, "templateId", e.target.value)} className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] appearance-none outline-none transition-all cursor-pointer shadow-sm">
                      <option value="" disabled>Select a template...</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Subj: {t.subject})</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addSequenceStep} className="mt-6 flex items-center gap-2 text-sm font-bold text-[#4285F4] hover:text-[#3367d6] bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-full transition-colors border border-transparent">
              <Plus size={18} /> Add Follow-up Step
            </button>
          </div>

          {initialData ? (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col h-full max-h-[500px]">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight border-b border-gray-50 pb-4 mb-6 shrink-0">3. Audience / Recipients</h3>
              <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <Users className="text-[#4285F4]" size={20} />
                    <p className="text-base font-bold text-gray-800">{initialData.recipientsList?.length || 0} Recipients Enrolled</p>
                  </div>
                  <div className="bg-blue-50 text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                    Read-Only
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4 custom-scrollbar">
                  {initialData.recipientsList?.map((rec, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-4 text-sm shadow-sm hover:border-[#d2e3fc] transition-colors">
                      <div className="w-8 h-8 rounded-full bg-blue-50/50 flex items-center justify-center text-[#4285F4] font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="truncate"><span className="text-gray-400 text-xs mr-1">Email:</span><span className="font-medium text-gray-800">{rec.email}</span></div>
                        <div className="truncate"><span className="text-gray-400 text-xs mr-1">Name:</span><span className="text-gray-700">{rec.name || '-'}</span></div>
                        <div className="truncate"><span className="text-gray-400 text-xs mr-1">Company:</span><span className="text-gray-700">{rec.company || '-'}</span></div>
                      </div>
                    </div>
                  ))}
                  {(!initialData.recipientsList || initialData.recipientsList.length === 0) && (
                    <div className="text-center text-gray-400 py-4 text-sm">No recipients found.</div>
                  )}
                </div>

                <div className="bg-blue-50/50 text-blue-800 text-xs px-4 py-3 rounded-xl border border-blue-100 flex items-start gap-2 shrink-0">
                  <AlertCircle size={14} className="shrink-0 mt-0.5 text-blue-500" />
                  <p><strong>Note:</strong> Recipient lists cannot be modified after a campaign is created. To send to new recipients, please create a new campaign.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">3. Audience / Recipients <span className="text-red-500">*</span></h3>
                <div className="flex bg-gray-50/80 p-1 rounded-xl border border-gray-100 shadow-inner">
                  <button type="button" onClick={() => setRecipientMode("manual")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${recipientMode === "manual" ? "bg-white text-[#4285F4] shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : "text-gray-500 hover:text-gray-800"}`}>Manual</button>
                  <button type="button" onClick={() => setRecipientMode("upload")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${recipientMode === "upload" ? "bg-white text-[#4285F4] shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : "text-gray-500 hover:text-gray-800"}`}>Upload CSV</button>
                </div>
              </div>

              {recipientMode === "manual" ? (
                <div className="space-y-4 bg-gray-50/30 p-6 rounded-2xl border border-gray-100/60 overflow-x-auto">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      <AlertCircle size={16} className="text-[#4285F4]" /> Enter data below. {'{{name}}'} and {'{{company}}'} will use these values dynamically.
                    </p>
                  </div>

                  {manualRecipients.map((rec) => (
                    <div key={rec.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-in fade-in slide-in-from-top-1 min-w-[500px]">
                      <div className="w-full sm:w-2/5">
                        <input required type="email" placeholder="Email address *" value={rec.email} onChange={(e) => setManualRecipients(manualRecipients.map(r => r.id === rec.id ? { ...r, email: e.target.value } : r))} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] outline-none transition-all shadow-sm" />
                      </div>
                      <div className="w-[calc(50%-0.5rem)] sm:w-1/4">
                        <input type="text" placeholder="Name" value={rec.name} onChange={(e) => setManualRecipients(manualRecipients.map(r => r.id === rec.id ? { ...r, name: e.target.value } : r))} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] outline-none transition-all shadow-sm" />
                      </div>
                      <div className="w-[calc(50%-0.5rem)] sm:w-1/4">
                        <input type="text" placeholder="Company" value={rec.company} onChange={(e) => setManualRecipients(manualRecipients.map(r => r.id === rec.id ? { ...r, company: e.target.value } : r))} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] outline-none transition-all shadow-sm" />
                      </div>
                      <button type="button" onClick={() => setManualRecipients(manualRecipients.filter(r => r.id !== rec.id))} disabled={manualRecipients.length === 1} className="w-10 h-10 flex items-center justify-center shrink-0 text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-100 shadow-sm rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 mt-2 sm:mt-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <button type="button" onClick={() => setManualRecipients([...manualRecipients, { id: Date.now(), email: "", name: "", company: "" }])} className="text-sm font-bold text-[#4285F4] hover:text-[#3367d6] flex items-center gap-2 mt-5 px-5 py-2.5 bg-white shadow-sm rounded-full transition-colors w-max border border-gray-100 hover:border-[#d2e3fc]">
                    <Plus size={16} /> Add Another Recipient
                  </button>
                </div>
              ) : (
                <div className={`border-2 border-dashed rounded-3xl p-10 transition-all text-center ${uploadedFile ? 'border-[#d2e3fc] bg-blue-50/30' : 'border-gray-200 hover:border-[#4285F4] bg-gray-50/50 hover:bg-blue-50/30'}`}>
                  {!uploadedFile ? (
                    <>
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                        <UploadCloud className="text-[#4285F4]" size={32} />
                      </div>
                      <p className="text-base font-bold text-gray-800 mb-2">Upload Excel (.xls, .xlsx) or CSV</p>
                      <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">Upload a list of recipients. Must contain <span className="font-bold text-gray-700">Email</span>, <span className="font-bold text-gray-700">Name</span>, and <span className="font-bold text-gray-700">Company Name</span> headers.</p>
                      <button type="button" onClick={handleDownloadSample} className="text-sm text-[#9b72cb] hover:text-[#7f5bb3] font-bold mb-6 inline-flex items-center gap-1.5 transition-colors"><Download size={14} /> Download Sample File (CSV)</button>
                      <div className="w-full"></div>
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition-all hover:shadow">
                        Browse Files
                        <input type="file" accept=".csv, .xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      {isParsing ? (
                        <>
                          <Loader2 size={36} className="animate-spin text-[#4285F4] mx-auto mb-5" />
                          <p className="text-base font-bold text-gray-800">Analyzing columns and extracting contacts...</p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                            <FileSpreadsheet size={32} className="text-emerald-500" />
                          </div>
                          <p className="text-lg font-bold text-gray-800 mb-2">{uploadedFile.name}</p>
                          <p className="text-sm text-emerald-700 font-bold mb-6 bg-emerald-50 border border-emerald-100 px-5 py-2 rounded-full inline-flex items-center gap-2">
                            <CheckCircle size={18} /> Successfully parsed {parsedCount} recipients!
                          </p>
                          <div className="w-full"></div>
                          <button type="button" onClick={() => { setUploadedFile(null); setParsedCount(0); }} className="text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-5 py-2 rounded-full transition-colors border border-transparent hover:border-red-100">Remove file</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANE: Live Sequence Preview */}
        <div className="w-full lg:w-2/5 bg-[#f8fafd] overflow-y-auto p-8 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-100">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 tracking-tight"><ListTree size={18} className="text-[#9b72cb]" /> Sequence Preview</h3>
            <span className="text-xs text-gray-500 font-bold bg-white px-3 py-1.5 rounded-full border border-gray-200/60 shadow-sm hidden sm:inline-block">Sample Data Applied</span>
          </div>

          <div className="flex-1 space-y-8">
            {formData.sequence.map((step, idx) => {
              const selectedTpl = templates.find(t => t.id === step.templateId);

              if (!selectedTpl && idx === 0) {
                return (
                  <div key="empty" className="bg-white border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-gray-400 h-64">
                    <History size={40} className="mb-4 opacity-50 text-blue-300" />
                    <p className="text-sm font-bold text-gray-600">No template selected.</p>
                    <p className="text-sm mt-2 text-gray-400">Select a template on the left to preview.</p>
                  </div>
                )
              }

              if (!selectedTpl) return null;

              const stepBody = selectedTpl.body.replace(/{{company}}/g, previewCompany).replace(/{{name}}/g, previewName);
              const stepSubject = selectedTpl.subject.replace(/{{company}}/g, previewCompany).replace(/{{name}}/g, previewName);

              const attachedResume = resumes.find(r => r.id === selectedTpl.resumeId);
              const resumeDisplayName = attachedResume ? (attachedResume.fileName || attachedResume.name) : selectedTpl.resumeId ? "Attached Resume" : null;

              return (
                <div key={step.id} className="relative">
                  {idx > 0 && (
                    <div className="absolute -top-8 left-8 w-[3px] h-8 bg-purple-100 flex flex-col items-center justify-center z-0">
                      <div className="absolute top-1/2 -translate-y-1/2 bg-purple-50 border border-purple-100 text-[#9b72cb] text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
                        Wait {step.delayValue} {step.delayUnit}
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden relative z-10 transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
                    <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 px-6 py-3 border-b border-gray-50 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Mail size={14} className="text-[#4285F4]" /> Step {idx + 1}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="space-y-2 mb-5 pb-5 border-b border-gray-50 text-[13px] overflow-hidden">
                        <p className="flex items-start gap-3"><span className="font-semibold text-gray-400 w-12 shrink-0">From</span> <span className="text-gray-800 truncate font-medium">{selectedAccount ? `${selectedAccount.name} <${selectedAccount.email}>` : '[No sender]'}</span></p>
                        <p className="flex items-start gap-3">
                          <span className="font-semibold text-gray-400 w-12 shrink-0">To</span>
                          <span className="text-[#4285F4] font-bold bg-[#eaf1fb] px-2.5 py-0.5 rounded-md truncate">
                            {recipientMode === 'manual' && manualRecipients[0].email
                              ? `${manualRecipients[0].name ? `${manualRecipients[0].name} ` : ''}<${manualRecipients[0].email}>${manualRecipients.length > 1 ? ` (+${manualRecipients.length - 1} more)` : ''}`
                              : '[Recipient List]'}
                          </span>
                        </p>
                        <p className="flex items-start gap-3"><span className="font-semibold text-gray-400 w-12 shrink-0">Subj</span> <span className="text-gray-800 font-bold truncate">{stepSubject}</span></p>
                        {resumeDisplayName && (
                          <p className="flex items-center gap-3 mt-3 pt-3"><Paperclip size={16} className="text-gray-400 shrink-0" /> <span className="text-[12px] bg-gray-50 text-gray-700 px-3 py-1 rounded-lg font-bold border border-gray-100 truncate">{resumeDisplayName}</span></p>
                        )}
                      </div>

                      <div className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: stepBody }} />
                        <br /><br />
                        <div className="text-gray-400 pt-4 border-t border-gray-50 mt-4 inline-block w-full">
                          <span className="font-bold text-gray-800">{selectedAccount?.name || 'Your Name'}</span><br />
                          <span className="text-[12px]">{selectedAccount?.email || ''}</span>
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

function CampaignDetailsView({ campaign, templates, resumes, accounts, onBack, onToggleStatus, onStop, onResend, onEdit, onDelete }) {
  const [showPreview, setShowPreview] = useState(false);
  const [liveCampaign, setLiveCampaign] = useState(campaign);

  useEffect(() => {
    setLiveCampaign(campaign);
  }, [campaign]);

  useEffect(() => {
    if (liveCampaign.status !== 'Active') return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const data = await getCampaign(liveCampaign.id);
        if (isMounted && data) {
          setLiveCampaign(data);
        }
      } catch (e) {
        console.error("Poll error", e);
      }
    }, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [liveCampaign.status, liveCampaign.id]);

  const recipientActivity = useMemo(() => {
    const recipients = liveCampaign.recipientsList || [];
    return recipients.map(r => {
      const safeEmailKey = r.email.replace(/\./g, ',');
      const statusObj = liveCampaign.recipientStatus?.[safeEmailKey];
      return {
        email: r.email,
        name: r.name || '',
        status: statusObj ? statusObj.status : (liveCampaign.sent > 0 ? 'Delivered' : 'Pending'),
        time: statusObj ? formatDate(statusObj.time) : (liveCampaign.createdAt ? formatDate(liveCampaign.createdAt) : 'N/A')
      };
    });
  }, [liveCampaign]);

  const senderAccount = useMemo(() => {
    if (!accounts || !liveCampaign.accountId) return null;
    return accounts.find(a => a.id === liveCampaign.accountId);
  }, [accounts, liveCampaign.accountId]);

  const openRate = liveCampaign.sent > 0 ? Math.round((parseInt(liveCampaign.opens) || 0) / parseInt(liveCampaign.sent) * 100) : 0;
  const replyRate = liveCampaign.sent > 0 ? Math.round((parseInt(liveCampaign.replies) || 0) / parseInt(liveCampaign.sent) * 100) : 0;

  const firstTemplate = templates.find(t => t.id === liveCampaign.sequence?.[0]?.templateId);
  const attachedResume = resumes.find(r => r.id === (firstTemplate?.resumeId || liveCampaign.resumeId));
  const resumeDisplayName = attachedResume ? (attachedResume.fileName || attachedResume.name) : (firstTemplate?.resumeId || liveCampaign.resumeId) ? "Attached Resume" : null;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 max-w-[1400px] mx-auto">
      <div className="px-6 md:px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b border-gray-100">
        <div className="flex items-start md:items-center gap-5">
          <button onClick={onBack} className="mt-1 md:mt-0 p-2.5 text-[#444746] hover:text-[#1f1f1f] bg-transparent hover:bg-[#f0f4f9] rounded-full transition-colors flex-shrink-0">
            <ArrowRight size={20} className="rotate-180" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h2 className="text-[28px] font-normal text-[#1f1f1f] tracking-tight leading-tight">{liveCampaign.name || liveCampaign.title}</h2>
              <span className={`inline-flex px-3 py-1 rounded-full text-[12px] font-medium tracking-wide ${liveCampaign.status === 'Active' ? 'bg-[#eaf1fb] text-[#1a73e8]' :
                  liveCampaign.status === 'Paused' ? 'bg-amber-50 text-amber-700' :
                    liveCampaign.status === 'Failed' ? 'bg-red-50 text-red-600' :
                      liveCampaign.status === 'Stopped' ? 'bg-slate-100 text-slate-600' :
                        liveCampaign.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-[#f0f4f9] text-[#444746]'
                }`}>{liveCampaign.status}</span>
            </div>
            <p className="text-[14px] text-[#444746]">Started on {formatDate(liveCampaign.createdAt || liveCampaign.date)}</p>
          </div>
        </div>

        {liveCampaign.status === 'Failed' && liveCampaign.error && (
          <div className="w-full md:w-auto px-4 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{liveCampaign.error}</span>
          </div>
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <LocalButton
            variant="ghost"
            onClick={onEdit}
            icon={Settings2}
            className="text-[#444746] hover:bg-[#f0f4f9]"
          >
            Edit Settings
          </LocalButton>

          <LocalButton
            variant="ghost"
            onClick={onDelete}
            icon={Trash2}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Delete
          </LocalButton>

          {liveCampaign.status === 'Active' && (
            <>
              <LocalButton
                variant="outline"
                onClick={onToggleStatus}
                icon={PauseCircle}
              >
                Pause Campaign
              </LocalButton>
              <LocalButton
                variant="outline"
                onClick={onStop}
                icon={XCircle}
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                Stop Campaign
              </LocalButton>
            </>
          )}
          {liveCampaign.status === 'Paused' && (
            <>
              <LocalButton
                variant="primary"
                onClick={onToggleStatus}
                icon={PlayCircle}
              >
                Resume Campaign
              </LocalButton>
              <LocalButton
                variant="outline"
                onClick={onStop}
                icon={XCircle}
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                Stop Campaign
              </LocalButton>
            </>
          )}
          {(liveCampaign.status === 'Completed' || liveCampaign.status === 'Failed' || liveCampaign.status === 'Stopped') && (
            !senderAccount && accounts?.length > 0 ? (
              <div className="flex items-center gap-2">
                <select
                  id="reassignAccount"
                  className="px-3 py-2.5 bg-white border border-gray-200 rounded-full text-[13px] font-medium outline-none text-gray-700 hover:border-gray-300 transition-colors shadow-sm cursor-pointer"
                >
                  <option value="">Select account to resend...</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.email}</option>)}
                </select>
                <LocalButton
                  variant="outline"
                  onClick={() => {
                    const val = document.getElementById('reassignAccount')?.value;
                    if (val) onResend(val);
                    else alert("Please select an account first");
                  }}
                  icon={RotateCcw}
                  className="text-[#1a73e8] border-[#1a73e8]/20 hover:bg-[#eaf1fb]"
                >
                  Resend Campaign
                </LocalButton>
              </div>
            ) : (
              <LocalButton
                variant="outline"
                onClick={() => onResend()}
                icon={RotateCcw}
                className="text-[#1a73e8] border-[#1a73e8]/20 hover:bg-[#eaf1fb]"
              >
                Resend Campaign
              </LocalButton>
            )
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">

        {/* Progress Bar Section */}
        {liveCampaign.status === 'Active' && (
          <div className="bg-white rounded-[24px] p-6 border border-blue-100 shadow-[0_2px_12px_rgba(26,115,232,0.08)] mb-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-50">
              <div
                className="h-full bg-gradient-to-r from-[#4285F4] to-[#3442FF] transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, ((liveCampaign.sent || 0) / (liveCampaign.recipientsList?.length || 1)) * 100)}%` }}
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a73e8] animate-pulse" />
                  Sending in progress...
                </h3>
                <p className="text-[14px] text-gray-600">
                  {liveCampaign.currentRecipient
                    ? <span>Currently sending to <strong className="text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{liveCampaign.currentRecipient}</strong></span>
                    : <span>Preparing next email...</span>
                  }
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-bold text-[#1a73e8] tracking-tight">{liveCampaign.sent || 0} <span className="text-[15px] font-normal text-gray-400">/ {liveCampaign.recipientsList?.length || 0}</span></p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Emails Sent</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all">
            <div>
              <p className="text-[13px] font-medium text-[#444746] mb-1">Total Sent</p>
              <h3 className="text-3xl font-normal text-[#1f1f1f] tracking-tight">{liveCampaign.sent || liveCampaign.count || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#f0f4f9] flex items-center justify-center text-[#444746] group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
          </div>
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all">
            <div>
              <p className="text-[13px] font-medium text-[#444746] mb-1">Opened</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-normal text-[#1f1f1f] tracking-tight">{liveCampaign.opens || 0}</h3>
                <span className="text-[13px] font-medium text-[#1a73e8] bg-[#eaf1fb] px-2 py-0.5 rounded-md">{openRate}% rate</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#eaf1fb] flex items-center justify-center text-[#1a73e8] group-hover:scale-110 transition-transform">
              <Eye size={20} />
            </div>
          </div>
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all">
            <div>
              <p className="text-[13px] font-medium text-[#444746] mb-1">Replies</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-normal text-[#1f1f1f] tracking-tight">{liveCampaign.replies || 0}</h3>
                <span className="text-[13px] font-medium text-[#9333ea] bg-[#f3e8ff] px-2 py-0.5 rounded-md">{replyRate}% rate</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#f3e8ff] flex items-center justify-center text-[#9333ea] group-hover:scale-110 transition-transform">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-[#f8fafd] rounded-[24px] p-6 border border-gray-100">
              <h3 className="text-[16px] font-medium text-[#1f1f1f] mb-6">Campaign Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-4 rounded-[16px] shadow-sm border border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f0f4f9] flex items-center justify-center text-[#444746]">
                      <ListTree size={16} />
                    </div>
                    <div>
                      <p className="text-[12px] text-[#444746] font-medium">Sequence</p>
                      <p className="text-[14px] font-medium text-[#1f1f1f]">{campaign.sequence?.length || 1} Steps</p>
                    </div>
                  </div>
                  <LocalButton variant="ghost" onClick={() => setShowPreview(!showPreview)} className="text-[13px] py-1.5 px-3 h-auto bg-[#f0f4f9] hover:bg-[#e1e5ea] text-[#1f1f1f]">
                    {showPreview ? "Hide" : "Preview"}
                  </LocalButton>
                </div>

                <div className="bg-white p-4 rounded-[16px] shadow-sm border border-gray-50">
                  <p className="text-[12px] text-[#444746] font-medium mb-1">Subject (Step 1)</p>
                  <p className="text-[14px] font-medium text-[#1f1f1f] line-clamp-2">{firstTemplate?.subject || campaign.subject || "Unknown"}</p>
                </div>

                {resumeDisplayName && (
                  <div className="bg-white p-4 rounded-[16px] shadow-sm border border-gray-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#eaf1fb] flex items-center justify-center text-[#1a73e8] shrink-0">
                      <Paperclip size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] text-[#444746] font-medium">Attachment</p>
                      <p className="text-[14px] font-medium text-[#1f1f1f] truncate">{resumeDisplayName}</p>
                    </div>
                  </div>
                )}

                {campaign.dailyLimit > 0 && (
                  <div className="bg-orange-50/50 p-4 rounded-[16px] shadow-sm border border-orange-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                      <Flame size={16} />
                    </div>
                    <div>
                      <p className="text-[12px] text-orange-700/70 font-medium">Warmup Limit</p>
                      <p className="text-[14px] font-medium text-orange-800">Max {campaign.dailyLimit} sends / day</p>
                    </div>
                  </div>
                )}

                <div className="bg-white p-4 rounded-[16px] shadow-sm border border-gray-50">
                  <p className="text-[12px] text-[#444746] font-medium mb-1">Sender Profile</p>
                  <p className="text-[14px] font-medium text-[#1f1f1f] truncate">{senderAccount ? `${senderAccount.name} <${senderAccount.email}>` : (campaign.accountId || 'Unknown')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-full flex flex-col overflow-hidden min-h-[400px]">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <h3 className="text-[16px] font-medium text-[#1f1f1f]">Recent Recipient Activity</h3>
                <LocalButton variant="ghost" className="text-[13px] text-[#1a73e8] hover:bg-[#eaf1fb]">View All</LocalButton>
              </div>
              <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
                {recipientActivity.length > 0 ? recipientActivity.map((log, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${log.status === 'Replied' ? 'bg-[#f3e8ff] text-[#9333ea]' :
                          log.status === 'Opened' ? 'bg-[#eaf1fb] text-[#1a73e8]' :
                            'bg-[#f0f4f9] text-[#444746]'
                        }`}>
                        {log.status === 'Replied' ? <CheckCircle size={18} /> :
                          log.status === 'Opened' ? <Eye size={18} /> :
                            <Mail size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-[#1f1f1f] truncate">{log.email}</p>
                        <p className="text-[13px] text-[#444746]">{log.name && `${log.name} · `}{log.time}</p>
                      </div>
                    </div>
                    <span className={`text-[12px] font-medium px-3 py-1 rounded-full shrink-0 ml-4 ${log.status === 'Replied' ? 'text-[#9333ea] bg-[#f3e8ff]' :
                        log.status === 'Opened' ? 'text-[#1a73e8] bg-[#eaf1fb]' :
                          'text-[#444746] bg-[#f0f4f9]'
                      }`}>
                      {log.status}
                    </span>
                  </div>
                )) : (
                  <div className="px-6 py-12 text-center text-[#444746] text-[14px]">
                    No recipient activity yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showPreview && campaign.sequence && (
          <div className="mt-10">
            <h3 className="text-[20px] font-normal text-[#1f1f1f] mb-6 tracking-tight flex items-center gap-2">
              Sequence Preview
            </h3>
            <div className="space-y-6">
              {campaign.sequence.map((step, idx) => {
                const selectedTpl = templates.find(t => t.id === step.templateId);
                if (!selectedTpl) return null;

                const sampleRecipient = campaign.recipientsList?.[0] || { name: 'Sample Name', company: 'Sample Company' };
                const stepBody = selectedTpl.body.replace(/\{\{company\}\}/gi, sampleRecipient.company || '').replace(/\{\{name\}\}/gi, sampleRecipient.name || '').replace(/\{\{first_name\}\}/gi, (sampleRecipient.name || '').split(' ')[0] || '').replace(/\{\{email\}\}/gi, sampleRecipient.email || '');
                const stepSubject = selectedTpl.subject.replace(/\{\{company\}\}/gi, sampleRecipient.company || '').replace(/\{\{name\}\}/gi, sampleRecipient.name || '').replace(/\{\{first_name\}\}/gi, (sampleRecipient.name || '').split(' ')[0] || '').replace(/\{\{email\}\}/gi, sampleRecipient.email || '');

                const attachedResumeId = selectedTpl.resumeId || campaign.resumeId;
                const attachedResumeObj = resumes.find(r => r.id === attachedResumeId);
                const resumeName = attachedResumeObj ? (attachedResumeObj.fileName || attachedResumeObj.name) : attachedResumeId ? "Attached Resume" : null;

                return (
                  <div key={step.id || idx} className="relative pl-8 border-l-[2px] border-[#e1e5ea] ml-4 animate-in slide-in-from-top-4 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="absolute -left-[9px] top-5 w-4 h-4 rounded-full bg-[#1a73e8] border-4 border-white shadow-sm"></div>
                    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between text-[12px] font-medium text-[#444746] uppercase tracking-wider">
                        <span>Step {idx + 1}</span>
                        {idx > 0 && <span className="text-[#9333ea] bg-[#f3e8ff] px-2.5 py-1 rounded-md lowercase normal-case tracking-normal">Wait {step.delayValue} {step.delayUnit}</span>}
                      </div>
                      <div className="p-6">
                        <div className="space-y-3 mb-5 pb-5 border-b border-gray-100 text-[14px]">
                          <p className="flex items-start gap-4"><span className="text-[#444746] w-12 shrink-0">From</span> <span className="text-[#1f1f1f] truncate">{senderAccount ? `${senderAccount.name} <${senderAccount.email}>` : (campaign.accountId || 'Unknown')}</span></p>
                          <p className="flex items-start gap-4"><span className="text-[#444746] w-12 shrink-0">Subj</span> <span className="text-[#1f1f1f] font-medium truncate">{stepSubject}</span></p>
                          {resumeName && (
                            <p className="flex items-center gap-4 mt-3"><Paperclip size={16} className="text-[#444746] shrink-0 w-12" /> <span className="text-[13px] bg-[#f0f4f9] text-[#1f1f1f] px-3 py-1.5 rounded-lg font-medium truncate">{resumeName}</span></p>
                          )}
                        </div>
                        <div className="text-[14px] text-[#1f1f1f] font-sans leading-relaxed" dangerouslySetInnerHTML={{ __html: stepBody }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const NavButton = ({ onClick, isActive, icon: Icon, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-all flex items-center justify-center ${isActive
        ? 'bg-[#eaf1fb] text-[#1a73e8] shadow-sm'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
  >
    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
  </button>
);

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt('URL', previousUrl || '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };



  return (
    <div className="flex flex-wrap gap-1 items-center p-2 border-b border-gray-100 bg-gray-50/50 shrink-0">
      <NavButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Bold" />
      <NavButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italic" />
      <NavButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} title="Underline" />
      <NavButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />

      <div className="w-px h-5 bg-gray-200 mx-1"></div>

      <NavButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} title="Heading 1" />
      <NavButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Heading 2" />

      <div className="w-px h-5 bg-gray-200 mx-1"></div>

      <NavButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="Bullet List" />
      <NavButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Numbered List" />

      <div className="w-px h-5 bg-gray-200 mx-1"></div>

      <NavButton onClick={toggleLink} isActive={editor.isActive('link')} icon={LinkIcon} title="Insert Link" />
      <NavButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} isActive={false} icon={RemoveFormatting} title="Clear Formatting" />

      <div className="w-px h-5 bg-gray-200 mx-1"></div>

      <NavButton onClick={() => editor.chain().focus().undo().run()} isActive={false} icon={Undo} title="Undo" />
      <NavButton onClick={() => editor.chain().focus().redo().run()} isActive={false} icon={Redo} title="Redo" />
    </div>
  );
};

const TipTapEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapLink.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-[#1a73e8] underline',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-6 text-[14px] text-gray-800 leading-relaxed bg-white [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div className="flex flex-col flex-1 h-full rounded-b-2xl bg-white overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto cursor-text border-t border-transparent bg-white" />
    </div>
  );
};

function EmailTemplateBuilder({ template, resumes, accounts, onCancel, onSave }) {
  const senderAccount = accounts?.[0] || null;
  const [formData, setFormData] = useState(template || {
    name: "",
    folder: "",
    subject: "",
    body: "",
    resumeId: ""
  });

  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (!formData.name || !formData.subject || !formData.body) {
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
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden animate-in fade-in duration-300 min-h-[calc(100vh-10rem)] max-w-[1400px] mx-auto">
      <div className="px-6 sm:px-8 py-5 border-b border-gray-50 flex justify-between items-center shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 opacity-50"></div>
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={onCancel} className="p-2 -ml-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowRight size={22} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">{template ? "Edit Template" : "New Email Template"}</h2>
            <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Configure snippet variables and default text.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <LocalButton variant="ghost" onClick={onCancel} className="text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm hidden sm:inline-flex">Cancel</LocalButton>
          <LocalButton variant="primary" onClick={handleSubmit} icon={CheckCircle}>Save Template</LocalButton>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-gray-50/30 min-h-0">
        <div className="w-full lg:w-1/2 shrink-0 flex flex-col border-r border-gray-100 overflow-y-auto bg-white p-6 sm:p-8 gap-6 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] shrink-0">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Template Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] outline-none transition-all" placeholder="e.g. Initial Outreach" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Template Folder</label>
              <div className="relative">
                <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select value={formData.folder} onChange={e => setFormData({ ...formData, folder: e.target.value })} className="w-full pl-12 pr-10 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] appearance-none outline-none transition-all cursor-pointer">
                  <option value="">No Folder (Uncategorized)</option>
                  <option value="Initial Outreach">Initial Outreach</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Recruiters">Recruiters</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Subject <span className="text-red-500">*</span></label>
              <input type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] outline-none transition-all" placeholder="e.g. Exploring Frontend Roles at {{company}}" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Attachment (Resume)</label>
              <div className="relative">
                <Paperclip className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select id="resume-select" value={formData.resumeId || ""} onChange={e => setFormData({ ...formData, resumeId: e.target.value })} className="w-full pl-12 pr-10 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-4 focus:ring-[#eaf1fb] focus:border-[#d2e3fc] appearance-none outline-none transition-all cursor-pointer">
                  <option value="">No attachment</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.fileName || r.name || 'Resume'}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden shrink-0">
            <div className="px-6 pt-6 pb-4 flex justify-between items-end border-b border-gray-50">
              <label className="block text-sm font-bold text-gray-700">Email Body <span className="text-red-500">*</span></label>
              <span className="text-xs font-bold text-[#4285F4] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Use {'{{company}}'} or {'{{name}}'}</span>
            </div>
            <div className="flex flex-col focus-within:ring-2 focus-within:ring-[#eaf1fb] transition-all rounded-b-3xl">
              <TipTapEditor
                value={formData.body}
                onChange={content => setFormData({ ...formData, body: content })}
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 shrink-0 bg-[#f8fafd] flex flex-col p-6 sm:p-8 lg:border-l lg:border-gray-100 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 tracking-tight"><Eye size={18} className="text-[#9b72cb]" /> Live Preview</h3>
            <span className="text-xs text-gray-500 font-bold bg-white px-3 py-1.5 rounded-full border border-gray-200/60 shadow-sm hidden sm:inline-block">Sample Data Applied</span>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6 mb-6 flex-1 max-h-[600px] overflow-y-auto">
            <div className="space-y-2 mb-6 pb-6 border-b border-gray-50 text-sm overflow-hidden">
              <p className="flex items-start gap-3"><span className="font-semibold text-gray-400 w-16 shrink-0">To</span> <span className="text-[#4285F4] font-bold bg-[#eaf1fb] px-2.5 py-0.5 rounded-md truncate">Example Recruiter &lt;hiring@google.com&gt;</span></p>
              <p className="flex items-start gap-3"><span className="font-semibold text-gray-400 w-16 shrink-0">Subject</span> <span className="text-gray-800 font-bold truncate">{formData.subject || <span className="text-gray-400 italic font-normal">No subject</span>}</span></p>
              {resumeDisplayName && (
                <p className="flex items-center gap-3 mt-4 pt-4"><Paperclip size={16} className="text-gray-400 shrink-0" /> <span className="text-[12px] bg-gray-50 text-gray-700 px-3 py-1 rounded-lg font-bold border border-gray-100 truncate">{resumeDisplayName}</span></p>
              )}
            </div>

            <div className="text-sm text-gray-700 font-sans leading-relaxed">
              {previewBody ? <div dangerouslySetInnerHTML={{ __html: previewBody }} /> : <span className="text-gray-400 italic">Body content will appear here...</span>}
              <br /><br />
              <div className="text-gray-400 pt-4 border-t border-gray-50 mt-4 inline-block w-full">
                <span className="font-bold text-gray-800">{senderAccount?.name || 'Your Name'}</span><br />
                <span className="text-[12px]">{senderAccount?.email || ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Campaigns;
