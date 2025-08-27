import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../app/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import baseAxios from "./baseAxios";
import Logo from "../../assets/logo.png";
import { COLORS, COLOR_CLASSES } from "../../constants/colors";

// OTP login thunks (admin)
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (email: string) => {
    await baseAxios.post("/auth/send-otp", { emailId: email });
    return email;
  }
);
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }: { email: string; otp: string }) => {
    const res = await baseAxios.post("/auth/login", { emailId: email, otp });
    return res.data;
  }
);
// Executive login thunk
export const loginExecutive = createAsyncThunk(
  "auth/loginExecutive",
  async ({ username, password }: { username: string; password: string }) => {
    const res = await baseAxios.post("/executive/login", {
      username,
      password,
    });
    return res.data;
  }
);

const LoginPage = () => {
  const [persona, setPersona] = useState<"admin" | "executive">("admin");
  // Admin (OTP) state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  // Executive (password) state
  const [execUsername, setExecUsername] = useState("");
  const [password, setPassword] = useState("");
  // Shared
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, role } = useSelector((state: RootState) => state.auth);

  // Timer effect for OTP countdown
  useEffect(() => {
    let interval: number;

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setStep("email");
            toast.error("OTP expired. Please request a new one.");
            return 300; // Reset to 5 minutes
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (token && role === "admin") return <Navigate to="/admin" replace />;
  if (token && role === "user") return <Navigate to="/user" replace />;
  if (token && role === "executive")
    return <Navigate to="/executive" replace />;

  // Admin OTP workflow
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Sending OTP...");
    try {
      await dispatch(sendOtp(email)).unwrap();
      setStep("otp");
      // Start the 5-minute timer
      setTimeRemaining(300);
      setTimerActive(true);
      toast.success("OTP sent!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Failed to send OTP.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Verifying OTP...");
    try {
      const result = await dispatch(verifyOtp({ email, otp })).unwrap();
      // Stop the timer on successful verification
      setTimerActive(false);
      toast.success("Login successful!", { id: toastId });
      navigate(result.role === "admin" ? "/admin" : "/executive", {
        replace: true,
      });
    } catch (err: any) {
      toast.error(err?.message || "Invalid OTP or login failed.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    const toastId = toast.loading("Resending OTP...");
    try {
      await dispatch(sendOtp(email)).unwrap();
      setTimeRemaining(300);
      setTimerActive(true);
      setOtp("");
      toast.success("OTP sent!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend OTP.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };
  // Executive workflow
  const handleExecLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Logging in...");
    try {
       await dispatch(
        loginExecutive({ username: execUsername, password })
      ).unwrap();
      toast.success("Login successful!", { id: toastId });
      navigate("/executive", { replace: true });
    } catch (err: any) {
      toast.error(err?.message || "Invalid credentials.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${COLOR_CLASSES.gradientFull} relative overflow-hidden`}
    >
      {/* Animated Blobs */}
      <div
        className={`absolute top-0 left-0 w-80 h-80 ${COLOR_CLASSES.bgTertiary} opacity-40 rounded-full filter blur-3xl animate-blob1 -z-10`}
      />
      <div
        className={`absolute bottom-0 right-0 w-96 h-96 ${COLOR_CLASSES.bgSecondary} opacity-40 rounded-full filter blur-3xl animate-blob2 -z-10`}
      />
      <div
        className={`absolute top-1/2 left-1/2 w-96 h-96 ${COLOR_CLASSES.bgPrimary} opacity-30 rounded-full filter blur-2xl animate-blob3 -z-10`}
        style={{ transform: "translate(-50%, -50%)" }}
      />
      <div className="bg-white/90 shadow-2xl rounded-3xl px-6 xs:px-8 sm:px-12 py-10 xs:py-12 sm:py-14 w-full max-w-md flex flex-col items-center backdrop-blur-md border border-white/40 relative overflow-hidden">
        {/* Glassmorphism effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-[${COLORS.secondary}]/30 via-[${COLORS.primary}]/20 to-[${COLORS.tertiary}]/20 pointer-events-none rounded-3xl`}
        />
        <div className="mb-8 flex flex-col items-center z-10">
          <div className="rounded-full p-4 mb-3 shadow-xl border-4 border-white animate-bounce-slow">
            <img src={Logo} alt="logo" className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl xs:text-4xl font-extrabold text-gray-800 mb-2 tracking-tight drop-shadow-lg font-mono">
            Welcome Back!
          </h2>
          <p className="text-gray-500 text-base font-semibold">
            Sign in to your account
          </p>
        </div>
        {/* Persona Switcher */}
        <div className="flex gap-2 mb-8 w-full z-10">
          <button
            className={`flex-1 py-2 rounded-xl font-bold text-lg transition border-2 ${
              persona === "admin"
                ? `${COLOR_CLASSES.gradientPrimary} text-white ${COLOR_CLASSES.borderPrimary} shadow-lg scale-105`
                : `bg-white ${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.borderSecondary} hover:${COLOR_CLASSES.bgSecondary}/10`
            }`}
            onClick={() => {
              setPersona("admin");
              setStep("email");
              setOtp("");
              setEmail("");
              setExecUsername("");
              setPassword("");
              setTimerActive(false);
              setTimeRemaining(300);
            }}
            disabled={persona === "admin" || loading}
            type="button"
          >
            Admin Login
          </button>
          <button
            className={`flex-1 py-2 rounded-xl font-bold text-lg transition border-2 ${
              persona === "executive"
                ? `${COLOR_CLASSES.gradientReverse} text-white ${COLOR_CLASSES.borderTertiary} shadow-lg scale-105`
                : `bg-white ${COLOR_CLASSES.textTertiary} ${COLOR_CLASSES.borderSecondary} hover:${COLOR_CLASSES.bgTertiary}/10`
            }`}
            onClick={() => {
              setPersona("executive");
              setStep("email");
              setOtp("");
              setEmail("");
              setExecUsername("");
              setPassword("");
              setTimerActive(false);
              setTimeRemaining(300);
            }}
            disabled={persona === "executive" || loading}
            type="button"
          >
            Executive Login
          </button>
        </div>
        {/* Admin OTP Login */}
        {persona === "admin" && (
          <form
            onSubmit={step === "email" ? handleSendOtp : handleVerifyOtp}
            className="w-full flex flex-col items-center z-10"
          >
            <input
              className="border border-gray-200 rounded-xl p-3 w-full mb-5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white/70 shadow-inner text-lg font-semibold placeholder-gray-400"
              placeholder="Admin Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              disabled={step === "otp"}
            />
            {step === "otp" && (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    OTP sent to <span className="font-medium">{email}</span>
                  </p>
                  <p className="text-sm font-medium">
                    {timerActive ? (
                      <span className="text-orange-600">
                        {formatTime(timeRemaining)} Remaining
                      </span>
                    ) : (
                      <span className="text-red-600">OTP Expired</span>
                    )}
                  </p>
                </div>
                <div
                  className="flex gap-3 mb-7 w-full justify-center"
                  onPaste={(e) => {
                    const pasted = e.clipboardData
                      .getData("Text")
                      .replace(/\D/g, "")
                      .slice(0, 6);
                    setOtp(pasted);
                    setTimeout(() => {
                      const inputs =
                        document.querySelectorAll<HTMLInputElement>(
                          "[aria-label^='OTP digit']"
                        );
                      inputs.forEach((input, idx) => {
                        input.value = pasted[idx] || "";
                      });
                      if (pasted.length < 6 && inputs[pasted.length])
                        inputs[pasted.length].focus();
                    }, 0);
                    e.preventDefault();
                  }}
                >
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-12 text-center border-2 border-pink-200 rounded-xl text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/80 shadow-lg transition-all duration-150 hover:border-blue-400 focus:border-blue-500 tracking-widest"
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        let newOtp = otp.split("");
                        newOtp[i] = val;
                        setOtp(newOtp.join("").slice(0, 6));
                        if (val && e.target.nextSibling)
                          (e.target.nextSibling as HTMLInputElement).focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[i] && i > 0) {
                          const prev = (e.target as HTMLInputElement)
                            .previousSibling as HTMLInputElement;
                          if (prev) prev.focus();
                        } else if (e.key === "ArrowLeft" && i > 0) {
                          const prev = (e.target as HTMLInputElement)
                            .previousSibling as HTMLInputElement;
                          if (prev) prev.focus();
                        } else if (e.key === "ArrowRight" && i < 5) {
                          const next = (e.target as HTMLInputElement)
                            .nextSibling as HTMLInputElement;
                          if (next) next.focus();
                        }
                      }}
                      autoFocus={i === 0}
                      autoComplete="one-time-code"
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
            <button
              className="bg-gradient-to-r from-blue-600 to-pink-500 text-white font-bold px-8 py-3 rounded-xl w-full shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 text-lg tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              type="submit"
              disabled={
                loading ||
                (step === "email" && !email) ||
                (step === "otp" &&
                  (!otp || !email || otp.length !== 6 || !timerActive))
              }
            >
              <svg
                className="w-5 h-5 text-white drop-shadow"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
              {step === "email"
                ? loading
                  ? "Sending OTP..."
                  : "Send OTP"
                : loading
                ? "Verifying..."
                : "Verify & Login"}
            </button>
            {step === "otp" && (
              <div className="mt-6 flex gap-3 w-full">
                <button
                  type="button"
                  className="flex-1 text-pink-600 hover:underline text-sm font-semibold"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setTimerActive(false);
                    setTimeRemaining(300);
                  }}
                  disabled={loading}
                >
                  Change Email
                </button>
                {!timerActive && (
                  <button
                    type="button"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:scale-105 transition-all duration-200 disabled:opacity-60"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    {loading ? "Resending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            )}
          </form>
        )}
        {/* Executive Login */}
        {persona === "executive" && (
          <form
            onSubmit={handleExecLogin}
            className="w-full flex flex-col items-center z-10"
          >
            <input
              className="border border-gray-200 rounded-xl p-3 w-full mb-5 focus:outline-none focus:ring-2 focus:ring-pink-400 transition bg-white/70 shadow-inner text-lg font-semibold placeholder-gray-400"
              placeholder="Username"
              value={execUsername}
              onChange={(e) => setExecUsername(e.target.value)}
              type="text"
              autoComplete="username"
              disabled={loading}
            />
            <input
              className="border border-gray-200 rounded-xl p-3 w-full mb-7 focus:outline-none focus:ring-2 focus:ring-pink-400 transition bg-white/70 shadow-inner text-lg font-semibold placeholder-gray-400"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              className="bg-gradient-to-r from-pink-500 to-blue-600 text-white font-bold px-8 py-3 rounded-xl w-full shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 text-lg tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              type="submit"
              disabled={loading || !execUsername || !password}
            >
              <svg
                className="w-5 h-5 text-white drop-shadow"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
              {loading ? "Logging in..." : "Login as Executive"}
            </button>
          </form>
        )}
      </div>
      {/* Custom Animations */}
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-20px) scale(1.05);} }
        @keyframes blob2 { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(20px) scale(1.08);} }
        @keyframes blob3 { 0%,100%{transform:scale(1);} 50%{transform:scale(1.1);} }
        .animate-blob1 { animation: blob1 8s infinite ease-in-out; }
        .animate-blob2 { animation: blob2 10s infinite ease-in-out; }
        .animate-blob3 { animation: blob3 12s infinite ease-in-out; }
        .animate-bounce-slow { animation: bounce 2.5s infinite; }
      `}</style>
      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
    </div>
  );
};

export default LoginPage;
