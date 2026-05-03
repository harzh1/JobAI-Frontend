import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  Download,
  X,
} from "../components/ui/AppIcons";
import { Card, Button } from "../components/ui/UIComponents";
import { useAuth } from "../context/AuthContext";
import { uploadResume, getUserResumes, deleteResume } from "../utils/firebaseServices";

export default function Resumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewingResume, setViewingResume] = useState(null);
  const fileInputRef = useRef(null);

  const getResumeDownloadUrl = (resume) =>
    resume?.downloadUrl || resume?.cloudinaryUrl || resume?.fileUrl || null;

  // Load resumes from backend API
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadResumes = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const resumesData = await getUserResumes();
        setResumes(resumesData || []);
      } catch (err) {
        console.error("Error loading resumes:", err);
        setError(err.message || "Failed to load resumes");
      } finally {
        setLoading(false);
      }
    };

    loadResumes();
  }, [user]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, DOC, DOCX)
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or Word document");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await uploadResume(file);
      setResumes((currentResumes) => [result, ...currentResumes]);
      setSuccess("Resume uploaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error uploading resume:", err);
      setError(err.message || "Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteResume = async (resume) => {
    if (!confirm(`Are you sure you want to delete "${resume.fileName}"?`)) {
      return;
    }

    try {
      await deleteResume(resume.id);
      setResumes(resumes.filter(r => r.id !== resume.id));
      setSuccess("Resume deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting resume:", err);
      setError("Failed to delete resume. Please try again.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Resumes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload and manage your resume files. Store them securely in the cloud.
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Upload Resume
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
            <div className="flex-1">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </Card>
      )}

      {success && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={18} />
            <p className="text-green-700 flex-1">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-500 hover:text-green-700"
            >
              <X size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* Resumes Grid */}
      {resumes.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FileText size={24} />
          </div>
          <h3 className="text-gray-900 font-bold mb-1">No resumes uploaded</h3>
          <p className="text-gray-500 text-sm mb-4">
            Upload your first resume to get started
          </p>
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} className="mr-2" />
            Upload Resume
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className="group relative hover:shadow-lg transition-all duration-300 hover:border-gray-300"
            >
              <div className="flex items-start gap-4">
                {/* PDF Icon */}
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 flex-shrink-0">
                  <FileText size={24} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {resume.fileName.split('.')[0]}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(resume.fileSize)}
                  </p>
                  {resume.uploadedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Uploaded{" "}
                      {new Date(resume.uploadedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="secondary"
                  className="flex-1 text-sm"
                  onClick={() =>
                    resume.canPreview
                      ? setViewingResume(resume)
                      : window.open(getResumeDownloadUrl(resume), "_blank")
                  }
                >
                  <Eye size={14} className="mr-1" />
                  {resume.canPreview ? "View" : "Open"}
                </Button>
                <Button
                  variant="secondary"
                  className="px-3"
                  onClick={() => window.open(getResumeDownloadUrl(resume), "_blank")}
                  title="Download"
                >
                  <Download size={14} />
                </Button>
                <Button
                  variant="secondary"
                  className="px-3 text-red-500 hover:bg-red-50"
                  onClick={() => handleDeleteResume(resume)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingResume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {viewingResume.fileName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(viewingResume.fileSize)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.open(getResumeDownloadUrl(viewingResume), "_blank")
                  }
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
                <button
                  onClick={() => setViewingResume(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Document Viewer */}
            <div className="flex-1 bg-gray-100">
              {viewingResume.previewUrl ? (
                <iframe
                  src={`${viewingResume.previewUrl}${
                    viewingResume.previewUrl.includes("#")
                      ? ""
                      : "#toolbar=1&navpanes=0"
                  }`}
                  className="w-full h-full"
                  title={viewingResume.fileName}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <FileText size={40} className="text-gray-400 mb-3" />
                  <p className="text-gray-700 font-medium">
                    Preview is not available for this file type.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Open the resume in a new tab to view or download it.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() =>
                      window.open(getResumeDownloadUrl(viewingResume), "_blank")
                    }
                  >
                    <Download size={16} className="mr-2" />
                    Open Resume
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
