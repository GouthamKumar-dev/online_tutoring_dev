import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../app/store";
import { useNavigate } from "react-router-dom";
import {
  sendStudentOtp,
  verifyStudentOtp,
} from "../../features/auth/authSlice";
import { COLORS, COLOR_CLASSES } from "../../constants/colors";

const StudentLoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await dispatch(sendStudentOtp(email)).unwrap();
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await dispatch(verifyStudentOtp({ emailId: email, otp })).unwrap();
      navigate("/student/profile");
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      await dispatch(sendStudentOtp(email)).unwrap();
      setError("OTP sent successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[${COLORS.primary}] to-[${COLORS.tertiary}] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center">
            <img
              className="mx-auto h-12 w-12"
              src="/src/assets/logo_tutor.png"
              alt="Online Tutoring"
            />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome Back!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your learning dashboard
            </p>
          </div>

          {step === "email" ? (
            <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 ${COLOR_CLASSES.focusRingPrimary} ${COLOR_CLASSES.borderPrimary} focus:z-10 sm:text-sm`}
                  placeholder="Enter your email address"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${COLOR_CLASSES.bgPrimary} ${COLOR_CLASSES.hoverBgPrimary} focus:outline-none focus:ring-2 focus:ring-offset-2 ${COLOR_CLASSES.focusRingPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <a
                    href="/student/register"
                    className={`font-medium ${COLOR_CLASSES.textPrimary} hover:${COLOR_CLASSES.textPrimaryDark}`}
                  >
                    Sign up here
                  </a>
                </p>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter OTP
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  We've sent a 6-digit code to {email}
                </p>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 ${COLOR_CLASSES.focusRingPrimary} ${COLOR_CLASSES.borderPrimary} focus:z-10 sm:text-sm text-center text-xl tracking-widest`}
                  placeholder="000000"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className={`flex-1 py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${COLOR_CLASSES.focusRingPrimary}`}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${COLOR_CLASSES.bgPrimary} ${COLOR_CLASSES.hoverBgPrimary} focus:outline-none focus:ring-2 focus:ring-offset-2 ${COLOR_CLASSES.focusRingPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className={`text-sm ${COLOR_CLASSES.textPrimary} hover:${COLOR_CLASSES.textPrimaryDark} disabled:opacity-50`}
                >
                  {loading ? "Sending..." : "Didn't receive the code? Resend"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLoginPage;
