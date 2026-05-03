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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-3">
            <Sparkles size={16} className="text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-sm">JobAI Copilot</h3>
          </div>
          <Button onClick={onClose} variant="ghost" className="p-1">
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 p-6 bg-gray-50/50 overflow-y-auto">
          {response && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-sm">
              {response}
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <div className="relative flex items-center">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-transparent border rounded-xl pl-4 pr-14 py-3 text-sm resize-none"
              placeholder="Ask Copilot..."
              rows={1}
            />
            <button
              onClick={handleQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
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
