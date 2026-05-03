import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// ============================================
// API Configuration
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const WORD_FILE_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const getFileExtension = (fileName = "") => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
};

const getResumeBaseName = (fileName = "") => {
  if (!fileName) return "Resume";
  return fileName.replace(/\.[^.]+$/, "") || fileName;
};

const normalizeTimestamp = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const buildResumePreviewUrl = (resumeUrl, fileName, fileType) => {
  if (!resumeUrl) return null;

  const normalizedType = (fileType || "").toLowerCase();
  const extension = getFileExtension(fileName);
  const isWordDocument =
    WORD_FILE_TYPES.has(normalizedType) ||
    extension === "doc" ||
    extension === "docx";

  if (isWordDocument) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      resumeUrl
    )}`;
  }

  return resumeUrl;
};

export const normalizeResume = (resume = {}) => {
  const id = resume.id || resume.resumeId || null;
  const fileName = resume.fileName || resume.displayName || resume.name || "Resume";
  const downloadUrl =
    resume.downloadUrl || resume.cloudinaryUrl || resume.fileUrl || null;
  const fileType = resume.mimeType || resume.fileType || "";
  const previewUrl = buildResumePreviewUrl(downloadUrl, fileName, fileType);

  return {
    ...resume,
    id,
    resumeId: id,
    fileName,
    name: resume.name || resume.displayName || getResumeBaseName(fileName),
    displayName: resume.displayName || resume.name || getResumeBaseName(fileName),
    downloadUrl,
    cloudinaryUrl: resume.cloudinaryUrl || downloadUrl,
    fileUrl: resume.fileUrl || downloadUrl,
    fileType,
    mimeType: resume.mimeType || fileType,
    uploadedAt: normalizeTimestamp(resume.uploadedAt || resume.createdAt),
    createdAt: normalizeTimestamp(resume.createdAt || resume.uploadedAt),
    previewUrl,
    canPreview: Boolean(previewUrl),
  };
};

/**
 * Get authorization header with Firebase token
 */
const getAuthHeaders = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const idToken = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  };
};

/**
 * Make authenticated API request
 */
const apiRequest = async (method, endpoint, data = null) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}${endpoint}`;

    const options = {
      method,
      headers,
    };

    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      let error = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        error = errorData.error || error;
      } catch (e) {
        error = response.statusText || error;
      }
      throw new Error(error);
    }

    try {
      const result = await response.json();
      return result;
    } catch (e) {
      throw new Error("Failed to parse API response");
    }
  } catch (error) {
    console.error(`[API] Request failed:`, error);
    throw error;
  }
};

// ============================================
// URL Parsing with LLM (Gemini via Backend API)
// ============================================

/**
 * Parse a URL and extract structured data using Gemini LLM
 * @param {string} url - The URL to parse
 * @param {string} parseType - Type of parsing: 'job', 'company', or 'general'
 * @returns {Promise<object>} Parsed structured data
 */
export const parseUrlWithLLM = async (url, parseType = "job") => {
  try {
    const result = await apiRequest("POST", "/parse-url", { url, parseType });
    return result.data;
  } catch (error) {
    console.error("URL parsing failed:", error);
    throw error;
  }
};

/**
 * Quick job link parser - extracts job details from a job posting URL
 * @param {string} jobUrl - URL of the job posting
 * @returns {Promise<object>} Structured job data with sourceUrl
 */
export const parseJobUrl = async (jobUrl) => {
  const result = await parseUrlWithLLM(jobUrl, "job");
  // Ensure the sourceUrl is always set to the original URL we parsed
  return {
    ...result,
    sourceUrl: jobUrl,
  };
};

/**
 * Parse text and extract structured data using Gemini LLM
 * @param {string} textContent - The text content to parse
 * @param {object} options - Additional options (url, title, parseType, save)
 * @returns {Promise<object>} Parsed structured data
 */
export const parseTextWithLLM = async (textContent, options = {}) => {
  try {
    const result = await apiRequest("POST", "/parse-text", {
      textContent,
      url: options.url || null,
      title: options.title || null,
      parseType: options.parseType || "job",
      save: options.save !== false,
      parsedContent: options.parsedContent || null,
    });
    return result.data;
  } catch (error) {
    console.error("Text parsing failed:", error);
    throw error;
  }
};

// ============================================
// LLM / AI Services (via Backend API)
// ============================================

/**
 * Call LLM for job analysis, resume optimization, etc.
 * This calls the backend that securely handles the LLM API call
 */
export const callLLM = async (prompt, options = {}) => {
  try {
    const result = await apiRequest("POST", "/analyze", {
      prompt,
      type: options.type || "general",
      context: options.context || {},
    });
    return result.response;
  } catch (error) {
    console.error("LLM call failed:", error);
    throw error;
  }
};

/**
 * Analyze a job description with AI
 */
export const analyzeJobDescription = async (
  jobDescription,
  userResume = null
) => {
  try {
    const result = await apiRequest("POST", "/analyze-job", {
      jobDescription,
      userResume,
    });
    return result.analysis;
  } catch (error) {
    console.error("Job analysis failed:", error);
    throw error;
  }
};

/**
 * Generate cover letter with AI
 */
export const generateCoverLetter = async (jobDetails, userProfile) => {
  try {
    const result = await apiRequest("POST", "/generate-cover-letter", {
      jobDetails,
      userProfile,
    });
    return result.coverLetter;
  } catch (error) {
    console.error("Cover letter generation failed:", error);
    throw error;
  }
};

/**
 * Get interview preparation tips
 */
export const getInterviewTips = async (jobTitle, company) => {
  try {
    const result = await apiRequest("POST", "/interview-tips", {
      jobTitle,
      company,
    });
    return result.tips;
  } catch (error) {
    console.error("Interview tips generation failed:", error);
    throw error;
  }
};

// ============================================
// Resume Management Services (via Backend API)
// ============================================

/**
 * Upload a resume file to Cloudinary
 * @param {File} file - The resume file to upload
 * @returns {Promise<object>} Upload result with resumeId and cloudinaryUrl
 */
export const uploadResume = async (file) => {
  try {
    // Convert file to base64
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const fileBuffer = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
          const result = await apiRequest("POST", "/upload-resume", {
            fileBuffer,
            fileName: file.name,
            fileType: file.type,
          });
          resolve(normalizeResume(result));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error("Resume upload failed:", error);
    throw error;
  }
};

/**
 * Get all user resumes from Cloudinary metadata
 * @returns {Promise<array>} Array of resume objects
 */
export const getUserResumes = async () => {
  try {
    const response = await apiRequest("GET", "/resumes");
    
    // Handle both array response and wrapped response
    const resumes = Array.isArray(response) ? response : response.data || [];
    return resumes
      .map((resume) => normalizeResume(resume))
      .sort((a, b) => {
        const first = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const second = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return second - first;
      });
  } catch (error) {
    console.error("Failed to fetch resumes - Full error:", error);
    throw error;
  }
};

/**
 * Delete a resume from Cloudinary
 * @param {string} resumeId - The resume document ID
 * @returns {Promise<object>} Success response
 */
export const deleteResume = async (resumeId) => {
  try {
    const result = await apiRequest("DELETE", `/resumes/${resumeId}`);
    return result;
  } catch (error) {
    console.error("Resume deletion failed:", error);
    throw error;
  }
};

// ============================================
// Firestore Data Services
// ============================================

// --- Jobs Collection ---
export const saveJob = async (userId, jobData) => {
  const jobsRef = collection(db, "users", userId, "jobs");
  return await addDoc(jobsRef, {
    ...jobData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserJobs = async (userId) => {
  const jobsRef = collection(db, "users", userId, "jobs");
  const q = query(jobsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateJob = async (userId, jobId, updates) => {
  const jobRef = doc(db, "users", userId, "jobs", jobId);
  return await updateDoc(jobRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteJob = async (userId, jobId) => {
  const jobRef = doc(db, "users", userId, "jobs", jobId);
  return await deleteDoc(jobRef);
};

// --- Applications Collection ---
export const saveApplication = async (userId, applicationData) => {
  const appsRef = collection(db, "users", userId, "applications");
  return await addDoc(appsRef, {
    ...applicationData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserApplications = async (userId, status = null) => {
  const appsRef = collection(db, "users", userId, "applications");
  let q = query(appsRef, orderBy("createdAt", "desc"));

  if (status) {
    q = query(
      appsRef,
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateApplication = async (userId, appId, updates) => {
  const appRef = doc(db, "users", userId, "applications", appId);
  return await updateDoc(appRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// --- Notes Collection ---
export const saveNote = async (userId, noteData) => {
  const notesRef = collection(db, "users", userId, "notes");
  return await addDoc(notesRef, {
    ...noteData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserNotes = async (userId) => {
  const notesRef = collection(db, "users", userId, "notes");
  const q = query(notesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateNote = async (userId, noteId, updates) => {
  const noteRef = doc(db, "users", userId, "notes", noteId);
  return await updateDoc(noteRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteNote = async (userId, noteId) => {
  const noteRef = doc(db, "users", userId, "notes", noteId);
  return await deleteDoc(noteRef);
};

// --- User Details / Preferences ---
export const saveUserDetail = async (userId, detailData) => {
  const detailsRef = collection(db, "users", userId, "details");
  return await addDoc(detailsRef, {
    ...detailData,
    createdAt: serverTimestamp(),
  });
};

export const getUserDetails = async (userId) => {
  const detailsRef = collection(db, "users", userId, "details");
  const snapshot = await getDocs(detailsRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateUserDetail = async (userId, detailId, updates) => {
  const detailRef = doc(db, "users", userId, "details", detailId);
  return await updateDoc(detailRef, updates);
};

export const deleteUserDetail = async (userId, detailId) => {
  const detailRef = doc(db, "users", userId, "details", detailId);
  return await deleteDoc(detailRef);
};

// ============================================
// Notifications Service (placeholder)
// ============================================

export const getUserNotifications = async (userId) => {
  const notifRef = collection(db, "users", userId, "notifications");
  const q = query(notifRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const markNotificationRead = async (userId, notificationId) => {
  const notifRef = doc(db, "users", userId, "notifications", notificationId);
  return await updateDoc(notifRef, { read: true });
};
