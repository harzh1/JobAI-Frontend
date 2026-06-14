import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  linkWithCredential,
  updatePassword,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
    await ensureUserDoc(userCredential.user);
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

  // Set password for Google-only users (links email/password provider)
  const setPasswordForUser = async (newPassword) => {
    if (!auth.currentUser) throw new Error("No user signed in");
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      newPassword
    );
    await linkWithCredential(auth.currentUser, credential);
  };

  // Change password for users who already have a password provider
  const changePassword = async (currentPassword, newPassword) => {
    if (!auth.currentUser) throw new Error("No user signed in");
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  };

  // Delete user account
  const deleteAccount = async () => {
    if (!auth.currentUser) throw new Error("No user signed in");
    
    // Attempt to delete user doc from Firestore first
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid));
    } catch (error) {
      console.error("Error deleting user document:", error);
      // Proceed to delete auth user even if Firestore delete fails
    }

    // Delete user from Firebase Auth
    await deleteUser(auth.currentUser);
    
    // Clean up local state
    localStorage.removeItem("authUser");
    setUser(null);
    setUserProfile(null);
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

        if (currentUser) {
          await ensureUserDoc(currentUser);
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
          setUserProfile(null);
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
    setPasswordForUser,
    changePassword,
    deleteAccount,
    updateUserProfile,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
