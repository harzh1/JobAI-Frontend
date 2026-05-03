/**
 * Firestore Database Schema for JobApp
 *
 * This file documents the complete database structure.
 * Use this as a reference when working with Firestore.
 */

export const DATABASE_SCHEMA = {
  // ============================================
  // USERS COLLECTION
  // Path: /users/{userId}
  // ============================================
  users: {
    schema: {
      uid: "string", // Firebase Auth UID
      email: "string",
      displayName: "string",
      photoURL: "string | null",
      phone: "string | null",
      headline: "string | null", // e.g., "Senior Software Engineer"
      bio: "string | null",

      location: {
        city: "string | null",
        state: "string | null",
        country: "string | null",
      },

      links: {
        linkedin: "string | null",
        github: "string | null",
        portfolio: "string | null",
        twitter: "string | null",
      },

      settings: {
        emailNotifications: "boolean",
        pushNotifications: "boolean",
        jobAlerts: "boolean",
        weeklyDigest: "boolean",
        theme: "light | dark | system",
      },

      stats: {
        totalApplications: "number",
        savedJobs: "number",
        resumeCount: "number",
        primaryResumeId: "string | null",
      },

      createdAt: "timestamp",
      updatedAt: "timestamp",
      lastLoginAt: "timestamp",
    },

    // ============================================
    // RESUMES SUBCOLLECTION
    // Path: /users/{userId}/resumes/{resumeId}
    // ============================================
    resumes: {
      schema: {
        id: "string",
        fileName: "string",
        displayName: "string",
        fileUrl: "string",
        storagePath: "string",
        fileSize: "number",
        mimeType: "string",
        isPrimary: "boolean",
        uploadedAt: "timestamp",
        updatedAt: "timestamp",
      },
    },

    // ============================================
    // SAVED JOBS SUBCOLLECTION
    // Path: /users/{userId}/savedJobs/{jobId}
    // ============================================
    savedJobs: {
      schema: {
        jobId: "string",
        savedAt: "timestamp",
        notes: "string | null",
        jobSnapshot: {
          title: "string",
          company: "string",
          location: "string",
          salary: "string | null",
          logo: "string | null",
        },
      },
    },

    // ============================================
    // APPLICATIONS SUBCOLLECTION
    // Path: /users/{userId}/applications/{applicationId}
    // ============================================
    applications: {
      schema: {
        id: "string",
        jobId: "string",
        status:
          "saved | applied | interviewing | offered | rejected | withdrawn",
        timeline: [
          {
            status: "string",
            date: "timestamp",
            notes: "string | null",
          },
        ],
        resumeId: "string | null",
        coverLetter: "string | null",
        interviews: [
          {
            type: "phone | video | onsite | technical",
            scheduledAt: "timestamp | null",
            notes: "string | null",
            completed: "boolean",
          },
        ],
        jobSnapshot: {
          title: "string",
          company: "string",
          location: "string",
          salary: "string | null",
          logo: "string | null",
          color: "string | null",
        },
        appliedAt: "timestamp",
        updatedAt: "timestamp",
      },
    },
  },

  // ============================================
  // JOBS COLLECTION
  // Path: /jobs/{jobId}
  // ============================================
  jobs: {
    schema: {
      id: "string",
      sourceUrl: "string",
      sourceDomain: "string",
      title: "string",
      company: "string",
      location: "string",
      salary: "string | null",
      type: "Full-time | Part-time | Contract | Internship",
      experienceLevel: "Entry | Mid | Senior | Lead | Director",
      experience: "string | null",
      description: "string",
      responsibilities: ["string"],
      requirements: ["string"],
      skills: ["string"],
      benefits: ["string"],
      applyUrl: "string | null",
      applyBy: "string | null",
      logo: "string | null",
      color: "string | null",
      parsedAt: "timestamp",
      updatedAt: "timestamp",
    },
  },

  // ============================================
  // ALL DETAILS COLLECTION (for auto-fill)
  // Path: /allDetails/{userId}
  // Flexible key-value pairs added through All Details page
  // ============================================
  allDetails: {
    schema: {
      userId: "string",
      details: [
        {
          key: "string", // Field name e.g., "First Name", "LinkedIn URL"
          value: "string", // Field value
          category: "string | null", // Optional: "personal", "professional", "education", "links", "legal"
        },
      ],
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },

    example: {
      userId: "abc123",
      details: [
        { key: "First Name", value: "John", category: "personal" },
        { key: "Last Name", value: "Doe", category: "personal" },
        { key: "Email", value: "john@example.com", category: "personal" },
        { key: "Phone", value: "+1-234-567-8900", category: "personal" },
        { key: "City", value: "San Francisco", category: "personal" },
        {
          key: "Current Company",
          value: "Google",
          category: "professional",
        },
        {
          key: "Current Title",
          value: "Software Engineer",
          category: "professional",
        },
        { key: "Years of Experience", value: "5", category: "professional" },
        { key: "Expected Salary", value: "$150,000", category: "professional" },
        {
          key: "LinkedIn",
          value: "https://linkedin.com/in/johndoe",
          category: "links",
        },
        {
          key: "GitHub",
          value: "https://github.com/johndoe",
          category: "links",
        },
        { key: "Portfolio", value: "https://johndoe.dev", category: "links" },
        {
          key: "Degree",
          value: "B.S. Computer Science",
          category: "education",
        },
        {
          key: "University",
          value: "Stanford University",
          category: "education",
        },
        { key: "Graduation Year", value: "2019", category: "education" },
        { key: "Work Authorization", value: "US Citizen", category: "legal" },
        { key: "Requires Sponsorship", value: "No", category: "legal" },
      ],
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
  },
};

// Application status options
export const APPLICATION_STATUSES = [
  { value: "saved", label: "Saved", color: "gray" },
  { value: "applied", label: "Applied", color: "blue" },
  { value: "interviewing", label: "Interviewing", color: "yellow" },
  { value: "offered", label: "Offered", color: "green" },
  { value: "rejected", label: "Rejected", color: "red" },
  { value: "withdrawn", label: "Withdrawn", color: "purple" },
];

// Detail categories for All Details page
export const DETAIL_CATEGORIES = [
  { value: "personal", label: "Personal Information" },
  { value: "professional", label: "Professional" },
  { value: "education", label: "Education" },
  { value: "links", label: "Links & Profiles" },
  { value: "legal", label: "Legal / Work Authorization" },
  { value: "other", label: "Other" },
];
