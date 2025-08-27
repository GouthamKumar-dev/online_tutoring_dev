import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  registerStudent,
  sendStudentOtp,
  verifyStudentOtp,
} from "../features/auth/authSlice";
import { COLOR_CLASSES } from "../constants/colors";
import illustrationImg from "../assets/Group_5.png";

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: "general" | "booking";
  courseDetails?: {
    title: string;
    level: string;
    parentName?: string;
    studentName?: string;
    phoneNumber?: string;
  };
}

const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = "general",
  courseDetails,
}) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState<"email" | "otp" | "details" | "success">(
    "email"
  );
  const [emailId, setEmailId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false); // for send OTP, verify OTP, register
  const [loadingResend, setLoadingResend] = useState(false); // for resend OTP only
  const [error, setError] = useState("");
  const [isEmailRegistered, setIsEmailRegistered] = useState<boolean | null>(
    null
  );
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

  // Student details for general login
  const [studentDetails, setStudentDetails] = useState({
    studentName: "",
    parentName: "",
    phoneNumber: "",
  });

  // Student details for booking mode (editable)
  const [bookingDetails, setBookingDetails] = useState({
    studentName: courseDetails?.studentName || "",
    parentName: courseDetails?.parentName || "",
    phoneNumber: courseDetails?.phoneNumber || "",
  });

  // Timer effect for OTP countdown
  useEffect(() => {
    let interval: number;

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            // setStep("email");
            setError("OTP expired. Please request a new one.");
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await dispatch(sendStudentOtp(emailId) as any).unwrap();
      // If successful, email is registered
      setIsEmailRegistered(result.isRegistered || true);
      setStep("otp");
      // Start the 5-minute timer
      setTimeRemaining(300);
      setTimerActive(true);
    } catch (err: any) {
      console.error("OTP Send Error:", err);

      // The error now contains the proper payload with isRegistered field
      if (err.isRegistered === false) {
        setIsEmailRegistered(false);
        setStep("details");
      } else {
        setError(err.message || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await dispatch(verifyStudentOtp({ emailId, otp }) as any).unwrap();
      setTimerActive(false);
      if (mode === "booking") {
        setStep("success");
      } else {
        if (isEmailRegistered) {
          onSuccess?.();
          onClose();
        } else {
          setStep("details");
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    setLoadingResend(true);
    setError("");
    try {
      const result = await dispatch(sendStudentOtp(emailId) as any).unwrap();
      setIsEmailRegistered(result.isRegistered || true);
      setTimeRemaining(300);
      setTimerActive(true);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoadingResend(false);
    }
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate fields
      const name = (
        mode === "booking"
          ? bookingDetails.studentName
          : studentDetails.studentName
      ).trim();
      const parent = (
        mode === "booking"
          ? bookingDetails.parentName
          : studentDetails.parentName
      ).trim();
      const phone = (
        mode === "booking"
          ? bookingDetails.phoneNumber
          : studentDetails.phoneNumber
      ).trim();

      if (!emailId || !name || !parent || !phone) {
        setError("All fields are required.");
        setLoading(false);
        return;
      }

      // Register the student
      await dispatch(
        registerStudent({
          emailId,
          studentName: name,
          parentName: parent,
          phoneNumber: phone,
        }) as any
      ).unwrap();

      // After successful registration, complete the login or booking
      if (mode === "booking") {
        setStep("success");
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("email");
    setEmailId("");
    setOtp("");
    setError("");
    setIsEmailRegistered(null);
    setTimerActive(false);
    setTimeRemaining(300);
    setStudentDetails({
      studentName: "",
      parentName: "",
      phoneNumber: "",
    });
    setBookingDetails({
      studentName: courseDetails?.studentName || "",
      parentName: courseDetails?.parentName || "",
      phoneNumber: courseDetails?.phoneNumber || "",
    });
    onClose();
  };

  const handleDone = () => {
    onSuccess?.();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
        <div className="flex">
          {/* Left Side - Illustration */}
          <div
            className={`hidden md:flex md:w-1/2 ${COLOR_CLASSES.gradientFull} items-center justify-center p-8`}
          >
            <div className="text-center text-white">
              <img
                src={illustrationImg}
                alt="Student illustration"
                className="w-64 h-64 mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold mb-2">
                {mode === "booking"
                  ? "Book for a free"
                  : step === "details"
                  ? "Almost there!"
                  : "Welcome Back!"}
              </h3>
              <p className="text-lg opacity-90">
                {mode === "booking"
                  ? "demo class now"
                  : step === "details"
                  ? "Create your account to get started"
                  : "Continue your learning journey"}
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mode === "booking"
                    ? "Verify Your Email"
                    : step === "details"
                    ? "Create Your Account"
                    : "Student Login"}
                </h2>
                {mode === "booking" && courseDetails && (
                  <div className="text-sm text-gray-600 mb-4">
                    <p className="font-medium">{courseDetails.title}</p>
                    <p>{courseDetails.level}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {mode === "booking" && (
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Name
                      </label>
                      <input
                        type="text"
                        value={bookingDetails.parentName}
                        onChange={(e) =>
                          setBookingDetails({
                            ...bookingDetails,
                            parentName: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                        placeholder="Enter parent's name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student Name
                      </label>
                      <input
                        type="text"
                        value={bookingDetails.studentName}
                        onChange={(e) =>
                          setBookingDetails({
                            ...bookingDetails,
                            studentName: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                        placeholder="Enter student's name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={bookingDetails.phoneNumber}
                          onChange={(e) =>
                            setBookingDetails({
                              ...bookingDetails,
                              phoneNumber: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border border-l-0 border-gray-300 rounded-r-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 ${COLOR_CLASSES.bgPrimary} text-white rounded-md ${COLOR_CLASSES.hoverBgPrimary} transition-colors disabled:opacity-50`}
                >
                  {loading
                    ? "Sending..."
                    : mode === "booking"
                    ? "Book Now"
                    : "Send OTP"}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600">
                    OTP is sent to{" "}
                    <span className="font-medium">{emailId}</span>
                  </p>
                  <div
                    className="flex justify-center items-center space-x-2 mt-4"
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
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-lg transition-all duration-150 hover:border-blue-400 focus:border-blue-500"
                        value={otp[index] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          let newOtp = otp.split("");
                          newOtp[index] = val;
                          setOtp(newOtp.join("").slice(0, 6));
                          if (val && e.target.nextSibling)
                            (e.target.nextSibling as HTMLInputElement).focus();
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Backspace" &&
                            !otp[index] &&
                            index > 0
                          ) {
                            const prev = (e.target as HTMLInputElement)
                              .previousSibling as HTMLInputElement;
                            if (prev) prev.focus();
                          } else if (e.key === "ArrowLeft" && index > 0) {
                            const prev = (e.target as HTMLInputElement)
                              .previousSibling as HTMLInputElement;
                            if (prev) prev.focus();
                          } else if (e.key === "ArrowRight" && index < 5) {
                            const next = (e.target as HTMLInputElement)
                              .nextSibling as HTMLInputElement;
                            if (next) next.focus();
                          }
                        }}
                        autoFocus={index === 0}
                        autoComplete="one-time-code"
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>
                  {/* Resend OTP Button */}
                  <button
                    type="button"
                    className={`mt-4 text-sm font-medium text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={handleResendOtp}
                    disabled={loadingResend || timerActive}
                  >
                    {loadingResend
                      ? "Resending..."
                      : timerActive
                      ? `Resend OTP in ${formatTime(timeRemaining)}`
                      : "Resend OTP"}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setTimerActive(false);
                      setTimeRemaining(300);
                      setOtp("");
                      setError("");
                    }}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6 || !timerActive}
                    className={`flex-1 py-3 px-4 ${COLOR_CLASSES.bgPrimary} text-white rounded-md ${COLOR_CLASSES.hoverBgPrimary} transition-colors disabled:opacity-50`}
                  >
                    {loading ? "Verifying..." : "Verify Email"}
                  </button>
                </div>
              </form>
            )}

            {step === "details" && mode === "general" && (
              <form onSubmit={handleSubmitDetails} className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600">
                    Create your account to continue learning
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={emailId}
                      onChange={(e) => setEmailId(e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      value={studentDetails.studentName}
                      onChange={(e) =>
                        setStudentDetails({
                          ...studentDetails,
                          studentName: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                      placeholder="Enter student's full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Name *
                    </label>
                    <input
                      type="text"
                      value={studentDetails.parentName}
                      onChange={(e) =>
                        setStudentDetails({
                          ...studentDetails,
                          parentName: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                      placeholder="Enter parent's full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={studentDetails.phoneNumber}
                        maxLength={10}
                        onChange={(e) =>
                          setStudentDetails({
                            ...studentDetails,
                            phoneNumber: e.target.value,
                          })
                        }
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-r-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !emailId ||
                      !studentDetails.studentName ||
                      !studentDetails.parentName ||
                      !studentDetails.phoneNumber
                    }
                    className={`flex-1 py-3 px-4 ${COLOR_CLASSES.bgPrimary} text-white rounded-md ${COLOR_CLASSES.hoverBgPrimary} transition-colors disabled:opacity-50`}
                  >
                    {loading ? "Saving..." : "Register"}
                  </button>
                </div>
              </form>
            )}

            {step === "success" && mode === "booking" && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Success
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Congratulations, your demo class booking is successfully
                    registered.
                  </p>
                  <p className="text-gray-600">
                    Our executive will be contacting soon.
                  </p>
                </div>
                <button
                  onClick={handleDone}
                  className={`w-full py-3 px-4 ${COLOR_CLASSES.bgPrimary} text-white rounded-md ${COLOR_CLASSES.hoverBgPrimary} transition-colors`}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginModal;
