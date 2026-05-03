import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Check localStorage for cached auth state to avoid loading flash
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("authUser");
    return cached ? JSON.parse(cached) : null;
  });
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false); // Start with false - no blocking!

  const ensureUserDoc = async (firebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) return;

    await setDoc(userRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preferences: {
        notifications: true,
        emailAlerts: true,
      },
    });
  };

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });

    // Create user document in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preferences: {
        notifications: true,
        emailAlerts: true,
      },
    });

    return userCredential.user;
  };

  // Sign in with email and password
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await setPersistence(auth, browserLocalPersistence);

    try {
      const userCredential = await signInWithPopup(auth, provider);
      await ensureUserDoc(userCredential.user);
      return userCredential.user;
    } catch (error) {
      // iOS Chrome and some in-app browsers block popups; fall back to redirect
      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/operation-not-supported-in-this-environment"
      ) {
        await signInWithRedirect(auth, provider);
        return null;
      }
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    localStorage.removeItem("authUser");
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  // Reset password
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
        return userDoc.data();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Don't block the app if Firestore fails
    }
    return null;
  };

  // Update user profile in Firestore
  const updateUserProfile = async (data) => {
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      );
      await fetchUserProfile(user.uid);
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Complete redirect-based sign-in if a redirect just returned
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await ensureUserDoc(result.user);
        }
      })
      .catch((error) => {
        // Missing initial state happens when sessionStorage is unavailable; surface but don't block
        if (error?.code !== "auth/no-auth-event") {
          console.error("Google redirect sign-in failed:", error);
        }
      });

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        // Cache auth state in localStorage
        if (currentUser) {
          localStorage.setItem(
            "authUser",
            JSON.stringify({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
            })
          );
          // Fetch profile in background - don't block
          fetchUserProfile(currentUser.uid).catch(console.error);
        } else {
          localStorage.removeItem("authUser");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Auth error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    logout,
    signInWithGoogle,
    resetPassword,
    updateUserProfile,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
