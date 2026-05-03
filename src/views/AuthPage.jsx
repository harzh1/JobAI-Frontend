import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";

export default function AuthPage() {
  const [authView, setAuthView] = useState("login"); // login, signup, forgot-password

  if (authView === "signup") {
    return <Signup onSwitchToLogin={() => setAuthView("login")} />;
  }

  if (authView === "forgot-password") {
    return <ForgotPassword onBackToLogin={() => setAuthView("login")} />;
  }

  return (
    <Login
      onSwitchToSignup={() => setAuthView("signup")}
      onForgotPassword={() => setAuthView("forgot-password")}
    />
  );
}
