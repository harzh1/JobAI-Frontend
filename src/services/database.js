/**
 * Database Service - Firestore CRUD operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getUserResumes } from "../utils/firebaseServices";

// ============================================
// USER OPERATIONS
// ============================================

export const userService = {
  async getProfile(userId) {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async updateProfile(userId, data) {
    const docRef = doc(db, "users", userId);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  async updateSettings(userId, settings) {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      settings,
      updatedAt: serverTimestamp(),
    });
  },

  async initializeUser(userId, email, displayName) {
    const docRef = doc(db, "users", userId);
    const existing = await getDoc(docRef);

    if (!existing.exists()) {
      await setDoc(docRef, {
        uid: userId,
        email,
        displayName: displayName || email.split("@")[0],
        photoURL: null,
        phone: null,
        headline: null,
        bio: null,
        location: { city: null, state: null, country: null },
        links: { linkedin: null, github: null, portfolio: null, twitter: null },
        settings: {
          emailNotifications: true,
          pushNotifications: true,
          jobAlerts: true,
          weeklyDigest: false,
          theme: "system",
        },
        stats: {
          totalApplications: 0,
          savedJobs: 0,
          resumeCount: 0,
          primaryResumeId: null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        lastLoginAt: serverTimestamp(),
      });
    }
  },
};

// ============================================
// RESUME OPERATIONS
// ============================================

export const resumeService = {
  async getAll(userId) {
    void userId;
    return await getUserResumes();
  },

  async get(userId, resumeId) {
    void userId;
    const resumes = await getUserResumes();
    return resumes.find((resume) => resume.id === resumeId) || null;
  },

  async add(userId, resumeData) {
    const resumesRef = collection(db, "users", userId, "resumes");
    const docRef = await addDoc(resumesRef, {
      ...resumeData,
      createdAt: serverTimestamp(),
      uploadedAt: serverTimestamp(), // keep for backward compatibility
      updatedAt: serverTimestamp(),
    });

    // Update user stats using setDoc with merge
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        stats: {
          resumeCount: increment(1),
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return docRef.id;
  },

  async update(userId, resumeId, data) {
    const docRef = doc(db, "users", userId, "resumes", resumeId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(userId, resumeId) {
    const docRef = doc(db, "users", userId, "resumes", resumeId);
    await deleteDoc(docRef);

    // Update user stats using setDoc with merge
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        stats: {
          resumeCount: increment(-1),
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  async setPrimary(userId, resumeId) {
    const resumes = await this.getAll(userId);
    const batch = [];

    for (const resume of resumes) {
      if (resume.id !== resumeId && resume.isPrimary) {
        batch.push(this.update(userId, resume.id, { isPrimary: false }));
      }
    }

    batch.push(this.update(userId, resumeId, { isPrimary: true }));
    await Promise.all(batch);

    await userService.updateProfile(userId, {
      "stats.primaryResumeId": resumeId,
    });
  },
};

// ============================================
// JOB OPERATIONS
// ============================================

export const jobService = {
  async getAll(options = {}) {
    const jobsRef = collection(db, "jobs");
    let q = query(jobsRef, orderBy("parsedAt", "desc"));

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async get(jobId) {
    const docRef = doc(db, "jobs", jobId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async findBySourceUrl(sourceUrl) {
    if (!sourceUrl) return null;
    const jobsRef = collection(db, "jobs");
    const q = query(jobsRef, where("sourceUrl", "==", sourceUrl));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  },

  async add(jobData) {
    const jobsRef = collection(db, "jobs");
    const docRef = await addDoc(jobsRef, {
      ...jobData,
      parsedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(jobId, data) {
    const docRef = doc(db, "jobs", jobId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(jobId) {
    const docRef = doc(db, "jobs", jobId);
    await deleteDoc(docRef);
  },
};

// ============================================
// SAVED JOBS OPERATIONS
// ============================================

export const savedJobService = {
  async getAll(userId) {
    const savedRef = collection(db, "users", userId, "savedJobs");
    const q = query(savedRef, orderBy("savedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async isSaved(userId, jobId) {
    const docRef = doc(db, "users", userId, "savedJobs", jobId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  },

  async save(userId, job) {
    const docRef = doc(db, "users", userId, "savedJobs", job.id);
    await setDoc(docRef, {
      jobId: job.id,
      savedAt: serverTimestamp(),
      notes: null,
      jobSnapshot: {
        title: job.title || null,
        company: job.company || null,
        companyWebsite: job.companyWebsite || null,
        location: job.location || null,
        salary: job.salary || null,
        type: job.type || null,
        logo: job.logo || null,
        sourceUrl: job.sourceUrl || null,
        applyUrl: job.applyUrl || null,
      },
    });

    // Use setDoc with merge to safely update stats even if user doc doesn't exist
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        stats: {
          savedJobs: increment(1),
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  async unsave(userId, jobId) {
    const docRef = doc(db, "users", userId, "savedJobs", jobId);
    await deleteDoc(docRef);

    // Use setDoc with merge to safely update stats
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        stats: {
          savedJobs: increment(-1),
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  async toggle(userId, job) {
    const isSaved = await this.isSaved(userId, job.id);
    if (isSaved) {
      await this.unsave(userId, job.id);
      return false;
    } else {
      await this.save(userId, job);
      return true;
    }
  },
};

// ============================================
// APPLICATION OPERATIONS
// ============================================

const buildResumeSnapshot = async (userId, resumeId) => {
  if (!resumeId) return null;

  const resume = await resumeService.get(userId, resumeId);
  if (!resume) return null;

  return {
    id: resumeId,
    name: resume.name || resume.displayName || resume.fileName || "Resume",
    downloadUrl:
      resume.downloadUrl || resume.cloudinaryUrl || resume.fileUrl || null,
    isPrimary: !!resume.isPrimary,
  };
};

export const applicationService = {
  async getAll(userId) {
    const appsRef = collection(db, "users", userId, "applications");
    const q = query(appsRef, orderBy("appliedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async get(userId, applicationId) {
    const docRef = doc(db, "users", userId, "applications", applicationId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async create(userId, job, resumeId = null) {
    const selectedResumeId = resumeId ?? job.resumeId ?? null;
    const resumeSnapshot = await buildResumeSnapshot(userId, selectedResumeId);
    const initialStatus = job.status || "applied";

    const appsRef = collection(db, "users", userId, "applications");
    const docRef = await addDoc(appsRef, {
      jobId: job.id || null,
      status: initialStatus,
      timeline: [
        {
          status: initialStatus,
          date: new Date().toISOString(),
          notes: null,
        },
      ],
      resumeId: selectedResumeId,
      resumeSnapshot,
      coverLetter: null,
      interviews: [],
      jobSnapshot: {
        title: job.title,
        company: job.company,
        companyWebsite: job.companyWebsite || null,
        location: job.location || null,
        salary: job.salary || null,
        logo: job.logo || null,
        color: job.color || null,
        sourceUrl: job.sourceUrl || null,
        applyUrl: job.applyUrl || null,
      },
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update user stats using setDoc with merge
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        stats: {
          totalApplications: increment(1),
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return docRef.id;
  },

  async update(userId, applicationId, updates) {
    const docRef = doc(db, "users", userId, "applications", applicationId);
    const existing = await this.get(userId, applicationId);
    if (!existing) {
      throw new Error("Application not found");
    }

    const selectedResumeId =
      updates.resumeId === undefined ? existing.resumeId || null : updates.resumeId || null;
    const resumeSnapshot = await buildResumeSnapshot(userId, selectedResumeId);

    const currentJob = existing.jobSnapshot || {};
    const nextStatus = updates.status || existing.status || "applied";
    const nextTimeline =
      nextStatus !== existing.status
        ? [
            ...(existing.timeline || []),
            {
              status: nextStatus,
              date: new Date().toISOString(),
              notes: "Updated from application editor",
            },
          ]
        : existing.timeline || [];

    await updateDoc(docRef, {
      status: nextStatus,
      resumeId: selectedResumeId,
      resumeSnapshot,
      timeline: nextTimeline,
      jobSnapshot: {
        ...currentJob,
        title: updates.title || currentJob.title || null,
        company: updates.company || currentJob.company || null,
        location: updates.location || currentJob.location || null,
        salary: updates.salary || currentJob.salary || null,
        sourceUrl: updates.sourceUrl || currentJob.sourceUrl || null,
        applyUrl: currentJob.applyUrl || updates.sourceUrl || null,
      },
      updatedAt: serverTimestamp(),
    });
  },

  async updateStatus(userId, applicationId, newStatus, notes = null) {
    const docRef = doc(db, "users", userId, "applications", applicationId);
    const app = await this.get(userId, applicationId);

    const newTimeline = [
      ...(app.timeline || []),
      {
        status: newStatus,
        date: new Date().toISOString(),
        notes,
      },
    ];

    await updateDoc(docRef, {
      status: newStatus,
      timeline: newTimeline,
      updatedAt: serverTimestamp(),
    });
  },

  async addInterview(userId, applicationId, interview) {
    const docRef = doc(db, "users", userId, "applications", applicationId);
    const app = await this.get(userId, applicationId);

    const newInterviews = [
      ...(app.interviews || []),
      {
        ...interview,
        completed: false,
      },
    ];

    await updateDoc(docRef, {
      interviews: newInterviews,
      status: "interviewing",
      updatedAt: serverTimestamp(),
    });

    // Also add to timeline
    await this.updateStatus(
      userId,
      applicationId,
      "interviewing",
      `Interview scheduled: ${interview.type}`
    );
  },

  async delete(userId, applicationId) {
    const docRef = doc(db, "users", userId, "applications", applicationId);
    await deleteDoc(docRef);

    // Update user stats using setDoc with merge
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        stats: {
          totalApplications: increment(-1),
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },
};

// ============================================
// ALL DETAILS OPERATIONS (Auto-fill key-value pairs)
// ============================================

export const allDetailsService = {
  async get(userId) {
    const docRef = doc(db, "allDetails", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : { userId, details: [] };
  },

  async save(userId, details) {
    const docRef = doc(db, "allDetails", userId);
    await setDoc(
      docRef,
      {
        userId,
        details,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  async addDetail(userId, detail) {
    const current = await this.get(userId);
    const newDetails = [...(current.details || []), detail];
    await this.save(userId, newDetails);
  },

  async updateDetail(userId, index, detail) {
    const current = await this.get(userId);
    const newDetails = [...(current.details || [])];
    newDetails[index] = detail;
    await this.save(userId, newDetails);
  },

  async deleteDetail(userId, index) {
    const current = await this.get(userId);
    const newDetails = (current.details || []).filter((_, i) => i !== index);
    await this.save(userId, newDetails);
  },

  async getByCategory(userId, category) {
    const current = await this.get(userId);
    return (current.details || []).filter((d) => d.category === category);
  },
};

// ============================================
// SHARED STATS FETCHER
// ============================================

/**
 * Fetch aggregated user stats and related records in one place.
 * Returns live counts for applications and resumes, plus savedJobs from profile.
 */
export const getUserStats = async (userId) => {
  const [profile, applications, resumes] = await Promise.all([
    userService.getProfile(userId),
    applicationService.getAll(userId),
    resumeService.getAll(userId),
  ]);

  return {
    stats: {
      totalApplications:
        (applications && applications.length) ||
        profile?.stats?.totalApplications ||
        0,
      savedJobs: profile?.stats?.savedJobs || 0,
      resumeCount: (resumes && resumes.length) || profile?.stats?.resumeCount || 0,
    },
    applications: applications || [],
    resumes: resumes || [],
  };
};
