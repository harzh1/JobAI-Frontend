import React, { useState } from "react";
import { X, Sparkles, Send } from "../ui/AppIcons";
import { Button } from "../ui/UIComponents";

export function AICopilot({ isOpen, onClose }) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuery = () => {
    if (!prompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      setResponse(`Based on your profile... (Mock AI Response)`);
      setIsGenerating(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md">
      <div className="w-full max-w-2xl gemini-card overflow-hidden flex flex-col h-[600px] border-none">
        <div className="px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="gemini-text-gradient font-bold"><Sparkles size={18} /></div>
            <h3 className="font-medium text-sm gemini-text-gradient">JobAI Copilot</h3>
          </div>
          <Button onClick={onClose} variant="ghost" className="p-1 rounded-full text-[var(--icon-color)] hover:bg-[var(--surface-border)] transition-colors">
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto" style={{ background: "var(--page-bg)" }}>
          {response && (
            <div className="gemini-card p-5 border-none shadow-sm text-sm" style={{ background: "var(--surface-bg)" }}>
              {response}
            </div>
          )}
        </div>

        <div className="p-4" style={{ background: "var(--surface-bg)" }}>
          <div className="relative flex items-center shadow-sm rounded-3xl" style={{ border: "1px solid var(--surface-border)" }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-transparent outline-none pl-5 pr-14 py-4 text-sm resize-none rounded-3xl"
              style={{ color: "var(--text-primary)" }}
              placeholder="Ask Copilot..."
              rows={1}
            />
            <button
              onClick={handleQuery}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center gemini-bg-gradient rounded-full hover:shadow-lg transition-all"
            >
              {isGenerating ? "..." : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AICopilot;
