import React, { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  Send,
  TrendingUp,
  MessageSquare,
  Users,
  ArrowLeft,
  Loader2,
} from "../components/ui/AppIcons";
import { Card, Button, Badge } from "../components/ui/UIComponents";
import { useAuth } from "../context/AuthContext";
import { resumeService } from "../services/database";

export function Campaigns({ campaigns, setView, isNewView, setCampaigns }) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    target: "Tech Startups in SF",
    subject: "Application for Senior Engineer Role",
    body: "Dear Hiring Manager,\n\nI am writing...",
    resumeId: "",
    count: 50,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Load resumes from Firestore
  useEffect(() => {
    if (!user || !isNewView) return;

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
  }, [user, isNewView]);

  const handleSendCampaign = async () => {
    if (!campaignForm.title || !campaignForm.resumeId) return;
    setIsGenerating(true);

    setTimeout(() => {
      const newCampaign = {
        id: `camp-${Date.now()}`,
        ...campaignForm,
        date: new Date().toISOString(),
        status: "Completed",
        openRate: Math.floor(Math.random() * 40) + 10 + "%",
        replies: 0,
      };
      setCampaigns([newCampaign, ...campaigns]);
      setView("campaigns"); // Go back to list
      setIsGenerating(false);
    }, 2000);
  };

  if (isNewView) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center gap-4">
          <Button
            onClick={() => setView("campaigns")}
            variant="ghost"
            icon={ArrowLeft}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Create New Campaign
            </h2>
            <p className="text-sm text-gray-500">
              Configure your outreach settings.
            </p>
          </div>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignForm.title}
                onChange={(e) =>
                  setCampaignForm({ ...campaignForm, title: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm"
                placeholder="e.g. SF Startups"
              />
            </div>
            {/* Add other inputs here following similar pattern... */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Select Resume
              </label>
              <select
                value={campaignForm.resumeId}
                onChange={(e) =>
                  setCampaignForm({ ...campaignForm, resumeId: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm"
              >
                <option value="">-- Select a Resume --</option>
                {isLoadingResumes ? (
                  <option disabled>Loading resumes...</option>
                ) : (
                  resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fileName || r.name || "Resume"}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => setView("campaigns")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="copilot"
              onClick={handleSendCampaign}
              className="flex-[2] py-3 text-base"
              disabled={isGenerating}
            >
              {isGenerating ? "Sending..." : "Launch Campaign"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Email Campaigns</h2>
          <p className="text-sm text-gray-500 mt-1">Bulk send your resume.</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => setView("new-campaign")}
          variant="copilot"
        >
          New Campaign
        </Button>
      </div>

      {/* List of campaigns */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mb-4">
              <Mail size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No campaigns yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              You haven't created any campaigns. Automate your job applications globally.
            </p>
            <Button
              variant="primary"
              onClick={() => setView("new-campaign")}
            >
              Create First Campaign
            </Button>
          </div>
        ) : (
          campaigns.map((camp) => (
            <Card
              key={camp.id}
              className="flex flex-col md:flex-row gap-6 items-center"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Send size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{camp.title}</h4>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {camp.count}
                </div>
                <div className="text-[10px] uppercase">Sent</div>
              </div>
              <Badge color="green">Completed</Badge>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default Campaigns;
