"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AuthPage() {
  const [viewState, setViewState] = useState<"LOGIN" | "SIGNUP" | "FORGOT" | "RESET">("LOGIN");
  const router = useRouter();

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Signup State
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Forgot / Reset Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [containerHeight, setContainerHeight] = useState<number | "auto">("auto");
  const loginRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);
  const forgotRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let target: HTMLDivElement | null = null;
    if (viewState === "LOGIN") target = loginRef.current;
    if (viewState === "SIGNUP") target = signupRef.current;
    if (viewState === "FORGOT") target = forgotRef.current;
    if (viewState === "RESET") target = resetRef.current;

    if (target) {
      setTimeout(() => {
        if (target) setContainerHeight(target.offsetHeight);
      }, 10);
    }
  }, [viewState, loginError, signupError, forgotError, signupSuccess, forgotSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : { success: false, message: "Server did not return a valid response" };

      
      if (res.ok && data.success) {
        toast.success("Login successful!");
        localStorage.setItem("token", data.token);
        const userName = data.user?.name || "User";
        localStorage.setItem("userName", userName);
        localStorage.setItem("userRole", data.user?.role || "user");
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Login failed");
        setLoginError(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Network Error! Could not connect to server.");
      setLoginError("An error occurred. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess("");
    setIsSigningUp(true);
    
    // Validate Password Policy
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,14}$/;
    if (!passwordRegex.test(signupPassword)) {
      setSignupError("Password must be 6-14 characters long with uppercase, lowercase, number, and special character.");
      setIsSigningUp(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signupName, phone: signupPhone, email: signupEmail, password: signupPassword }),
      });
      
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : { success: false, message: "Server did not return a valid response" };

      
      if (res.ok && data.success) {
        toast.success(data.message || "Registration successful! Please login.");
        setSignupSuccess(data.message || "Registration successful! Please login.");
        setSignupName("");
        setSignupPhone("");
        setSignupEmail("");
        setSignupPassword("");
        setTimeout(() => setViewState("LOGIN"), 1500);
      } else {
        toast.error(data.message || "Registration failed");
        setSignupError(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Network Error! Could not connect to server.");
      setSignupError("An error occurred. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setIsProcessing(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : { success: false, message: "Server did not return a valid response" };

      
      if (res.ok && data.success) {
        setViewState("RESET");
      } else {
        setForgotError(data.message || "Failed to send reset email");
      }
    } catch (err) {
      setForgotError("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setIsProcessing(true);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,14}$/;
    if (!passwordRegex.test(resetNewPassword)) {
      setForgotError("Password must be 6-14 characters long with uppercase, lowercase, number, and special character.");
      setIsProcessing(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: resetOtp, newPassword: resetNewPassword }),
      });
      
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : { success: false, message: "Server did not return a valid response" };

      
      if (res.ok && data.success) {
        setForgotSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          setViewState("LOGIN");
          setForgotEmail("");
          setResetOtp("");
          setResetNewPassword("");
          setForgotSuccess("");
        }, 2000);
      } else {
        setForgotError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setForgotError("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f6fa] p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2cc17b]/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1f8f5a]/15 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10 bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_rgba(44,193,123,0.12)] p-10">
        
        {/* LOGO */}
        <div className="flex justify-center mb-8 relative w-auto mx-auto">
          <div className="relative px-8 py-4 rounded-3xl bg-[#222222] border border-[#333333] shadow-lg overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="text-6xl font-black tracking-tighter relative z-10 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm animate-text-gradient">
              Qubit
            </div>
          </div>
        </div>

        <div 
          className="overflow-hidden w-full relative transition-[height] duration-500 ease-in-out"
          style={{ height: containerHeight === "auto" ? "auto" : `${containerHeight}px` }}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out w-full items-start"
            style={{ 
              transform: `translateX(${
                viewState === "LOGIN" ? "0%" :
                viewState === "SIGNUP" ? "-100%" :
                viewState === "FORGOT" ? "-200%" :
                "-300%"
              })` 
            }}
          >
            {/* ======================= LOGIN VIEW ======================= */}
            <div className="w-full flex-shrink-0" ref={loginRef}>
              <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-800">Welcome Back</h2>
              <p className="text-sm text-gray-500 font-medium">Sign in to your portal</p>
            </div>

            {loginError && <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{loginError}</div>}
            {signupSuccess && <div className="p-4 mb-6 text-sm text-green-600 bg-green-50 rounded-xl border border-green-100">{signupSuccess}</div>}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#2cc17b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none transition-all focus:bg-white focus:border-[#2cc17b] focus:ring-4 focus:ring-[#2cc17b]/20"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#2cc17b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none transition-all focus:bg-white focus:border-[#2cc17b] focus:ring-4 focus:ring-[#2cc17b]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showLoginPassword 
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0L21 21" />
                    }
                  </svg>
                </button>
              </div>

              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setViewState("FORGOT")}
                  className="text-sm font-medium text-[#2cc17b] hover:text-[#1f8f5a] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-4 bg-gradient-to-r from-[#2cc17b] to-[#25a86a] hover:from-[#25a86a] rounded-xl text-white font-bold shadow-[0_4px_20px_rgba(44,193,123,0.3)] hover:scale-[1.02]"
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500 font-medium">
              Don't have an account?{" "}
              <button onClick={() => setViewState("SIGNUP")} className="text-[#2cc17b] hover:text-[#1f8f5a] font-bold ml-1">Sign up now</button>
            </div>
            </div>

            {/* ======================= SIGNUP VIEW ======================= */}
            <div className="w-full flex-shrink-0" ref={signupRef}>
              <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-800">Create Account</h2>
              <p className="text-sm text-gray-500 font-medium">Join our portal today</p>
            </div>

            {signupError && <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{signupError}</div>}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:bg-white focus:border-[#2cc17b] outline-none"
                />
              </div>

              <div className="relative group">
                <input
                  type="text"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="Mobile Number"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:bg-white focus:border-[#2cc17b] outline-none"
                />
              </div>

              <div className="relative group">
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:bg-white focus:border-[#2cc17b] outline-none"
                />
              </div>

              <div className="relative group">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:bg-white focus:border-[#2cc17b]"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showSignupPassword 
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0L21 21" />
                    }
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-gray-500 font-medium pl-1">
                Must be 6-14 chars: 1 uppercase, 1 lowercase, 1 number, 1 special character.
              </p>

              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full mt-4 py-4 bg-gradient-to-r from-[#2cc17b] to-[#25a86a] rounded-xl text-white font-bold shadow-[0_4px_20px_rgba(44,193,123,0.3)] hover:scale-[1.02]"
              >
                {isSigningUp ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500 font-medium">
              Already have an account?{" "}
              <button onClick={() => setViewState("LOGIN")} className="text-[#2cc17b] hover:text-[#1f8f5a] font-bold ml-1">Sign in instead</button>
            </div>
            </div>

            {/* ======================= FORGOT PASSWORD VIEW ======================= */}
            <div className="w-full flex-shrink-0" ref={forgotRef}>
              <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-800">Forgot Password?</h2>
              <p className="text-sm text-gray-500 font-medium">Enter your email to receive an OTP</p>
            </div>

            {forgotError && <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{forgotError}</div>}

            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="relative group">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:bg-white focus:border-[#2cc17b] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-2 py-4 bg-gradient-to-r from-[#2cc17b] to-[#25a86a] rounded-xl text-white font-bold shadow-[0_4px_20px_rgba(44,193,123,0.3)] hover:scale-[1.02]"
              >
                {isProcessing ? "Sending..." : "Send OTP"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500 font-medium">
              Remember your password?{" "}
              <button onClick={() => setViewState("LOGIN")} className="text-[#2cc17b] hover:text-[#1f8f5a] font-bold ml-1">Back to login</button>
            </div>
            </div>

            {/* ======================= RESET PASSWORD VIEW ======================= */}
            <div className="w-full flex-shrink-0" ref={resetRef}>
              <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-800">Reset Password</h2>
              <p className="text-sm text-gray-500 font-medium">Enter the OTP sent to {forgotEmail}</p>
            </div>

            {forgotError && <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{forgotError}</div>}
            {forgotSuccess && <div className="p-4 mb-6 text-sm text-green-600 bg-green-50 rounded-xl border border-green-100">{forgotSuccess}</div>}

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="relative group">
                <input
                  type="text"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  placeholder="6-Digit OTP"
                  required
                  maxLength={6}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 tracking-widest font-mono text-center focus:bg-white focus:border-[#2cc17b] outline-none"
                />
              </div>

              <div className="relative group">
                <input
                  type={showResetPassword ? "text" : "password"}
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:bg-white focus:border-[#2cc17b] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showResetPassword 
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0L21 21" />
                    }
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-gray-500 font-medium pl-1">
                Must be 6-14 chars: 1 uppercase, 1 lowercase, 1 number, 1 special character.
              </p>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-2 py-4 bg-gradient-to-r from-[#2cc17b] to-[#25a86a] rounded-xl text-white font-bold shadow-[0_4px_20px_rgba(44,193,123,0.3)] hover:scale-[1.02]"
              >
                {isProcessing ? "Resetting..." : "Reset Password"}
              </button>
            </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
