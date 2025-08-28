import React, { useState, useEffect } from "react";
import { COLOR_CLASSES } from "../../constants/colors";
import bgWorld from "../../assets/bg-world.png";
import illustrationImg3 from "../../assets/Group_3.png";
import Group_3_no_bg from "../../assets/Group_3_no_bg.png";
import { tutorApi } from "../../features/tutor/tutorApi";
import { toast } from "react-hot-toast";

interface TutorFormData {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  resume: any;
  subjects: string;
  preferredTiming: string;
}

const TutorSignupPage: React.FC = () => {
  const [formData, setFormData] = useState<TutorFormData>({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    experience: "",
    resume: null,
    subjects: "",
    preferredTiming: "",
  });

  console.log("Form Data:", formData); // Debugging line

  const [errors, setErrors] = useState<Partial<TutorFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  // Time picker states
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Timer effect for OTP countdown
  useEffect(() => {
    let interval: number;

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            toast.error("OTP expired. Please request a new one.");
            return 0;
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

  // Helper function to format time slot from start and end times
  const formatTimeSlot = (start: string, end: string) => {
    if (!start || !end) return "";

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const handleInputChange = (field: keyof TutorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF or Word document");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, resume: file }));
      if (errors.resume) {
        setErrors((prev) => ({ ...prev, resume: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TutorFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone))
      newErrors.phone = "Phone number is invalid";
    if (!formData.qualification.trim())
      newErrors.qualification = "Qualification is required";
    if (!formData.experience.trim())
      newErrors.experience = "Experience is required";
    if (!formData.subjects.trim()) newErrors.subjects = "Subjects are required";
    if (!startTime || !endTime)
      newErrors.preferredTiming = "Preferred timing is required";
    if (!formData.resume) newErrors.resume = "Resume is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyEmail = async () => {
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Email is invalid" }));
      return;
    }

    setLoadingVerify(true);
    try {
      await tutorApi.initiateEmailVerification({ email: formData.email });
      setShowOtpModal(true);
      setTimeRemaining(300);
      setTimerActive(true);
      setOtp("");
      toast.success("OTP sent to your email successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleOtpVerification = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoadingVerify(true);
    try {
      await tutorApi.verifyOtp({
        email: formData.email,
        otp: otp,
      });

      setIsEmailVerified(true);
      setShowOtpModal(false);
      setTimerActive(false);
      setOtp("");
      toast.success("Email verified successfully!");
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP. Please try again.");
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResendOtp = async () => {
    setLoadingResend(true);
    try {
      await tutorApi.initiateEmailVerification({ email: formData.email });
      setTimeRemaining(300);
      setTimerActive(true);
      setOtp("");
      toast.success("OTP resent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setLoadingResend(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!isEmailVerified) {
      toast.error("Please verify your email address first");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the time slot for submission
      const formattedTimeSlot = formatTimeSlot(startTime, endTime);

      // Convert experience to number (extract number from string or handle "Fresher")
      let experienceNumber = 0;
      if (formData.experience.toLowerCase() === "fresher") {
        experienceNumber = 0;
      } else {
        experienceNumber = parseFloat(formData.experience) || 0;
      }

      // Prepare data for API submission
      const registrationData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        qualification: formData.qualification,
        experience: experienceNumber,
        subjects: formData.subjects,
        preferredTimeSlot: formattedTimeSlot,
        resume: formData.resume!,
      };

      await tutorApi.completeRegistration(registrationData);

      toast.success(
        "Application submitted successfully! We will contact you soon."
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        qualification: "",
        experience: "",
        resume: null,
        subjects: "",
        preferredTiming: "",
      });
      setIsEmailVerified(false);
      setStartTime("");
      setEndTime("");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to submit application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-none">
      <section
        className=""
        style={{
          backgroundImage: `url(${bgWorld})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full px-5 md:px-28 bg-white/90 backdrop-blur-none">
          <div className="max-w-7xl mx-auto px-4 pt-5 pb-8 sm:px-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div
                className={`${COLOR_CLASSES.bgSecondaryLight} rounded-lg flex items-center justify-around py-8 px-5  sticky top-10 z-30 mx-5 h-[6rem] md:hidden `}
               
              >
                <div className="text-lg">
                  <p className="text-gray-900  font-normal">
                    If you are a
                    <span className={`${COLOR_CLASSES.textTertiary} ml-1`}>
                      tutor
                    </span>
                  </p>
                  <p className={`${COLOR_CLASSES.textTertiary} font-bold`}>
                    SIGNUP HERE
                  </p>
                </div>
                <div className="">
                  <img
                    src={Group_3_no_bg}
                    alt="Character"
                    className="w-[8rem] h-[10rem] scale-x-[-1] object-contain mb-[1.5rem]"
                  />
                </div>
              </div>
              {/* Left Side - Form */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="hidden  md:block md:mb-6">
                  <h1 className="md:text-2xl text-gray-900 mb-2">
                    If you are a
                    <span className={`${COLOR_CLASSES.textTertiary} ml-1`}>
                      tutor
                    </span>
                  </h1>
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
                    <span className={COLOR_CLASSES.textTertiary}>
                      SIGNUP HERE
                    </span>
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-xs  font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-xs  border rounded-lg focus:outline-none focus:ring-2 ${
                        COLOR_CLASSES.focusRingPrimary
                      } focus:border-transparent  ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs  mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  {/* Email Field with Verification inside input */}
                  <div>
                    <label className="block text-xs  font-medium text-gray-700 mb-2">
                      Email Id
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`w-full pl-4 py-3 pr-8 text-xs  border rounded-lg focus:outline-none focus:ring-2 ${
                          COLOR_CLASSES.focusRingPrimary
                        } focus:border-transparent ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your email"
                      />

                      {/* Right-side button or icon inside input */}
                      {!isEmailVerified ? (
                        <button
                          type="button"
                          onClick={handleVerifyEmail}
                          disabled={loadingVerify}
                          className={`absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 text-xs  font-medium rounded-md text-white ${
                            loadingVerify
                              ? "bg-gray-400 cursor-not-allowed"
                              : `${COLOR_CLASSES.bgInfo} ${COLOR_CLASSES.hoverBgInfo}`
                          }`}
                        >
                          {loadingVerify ? "..." : "Verify"}
                        </button>
                      ) : (
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-600">
                          {/* Blue tick (SVG icon) */}
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs  mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      maxLength={10}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-xs border rounded-lg focus:outline-none focus:ring-2 ${
                        COLOR_CLASSES.focusRingPrimary
                      } focus:border-transparent ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Qualification Field */}
                  <div>
                    <label className="block text-xs  font-medium text-gray-700 mb-2">
                      Qualification
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) =>
                        handleInputChange("qualification", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-xs  border rounded-lg focus:outline-none focus:ring-2 ${
                        COLOR_CLASSES.focusRingPrimary
                      } focus:border-transparent ${
                        errors.qualification
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., B.Tech, M.Sc, PhD"
                    />
                    {errors.qualification && (
                      <p className="text-red-500 text-xs  mt-1">
                        {errors.qualification}
                      </p>
                    )}
                  </div>

                  {/* Experience Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Experience (Years)
                    </label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange("experience", value);
                      }}
                      className={`w-full px-4 py-3 text-xs border rounded-lg focus:outline-none focus:ring-2 ${
                        COLOR_CLASSES.focusRingPrimary
                      } focus:border-transparent ${
                        errors.experience ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., 5 or Fresher"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter years of experience
                    </p>
                    {errors.experience && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.experience}
                      </p>
                    )}
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label className="block text-xs  font-medium text-gray-700 mb-2">
                      Resume *
                    </label>
                    <div className="flex items-center gap-4">
                      <label
                        className={`cursor-pointer px-6 py-3 text-xs  ${
                          COLOR_CLASSES.bgSecondary
                        } ${COLOR_CLASSES.hoverBgSecondary} ${
                          COLOR_CLASSES.textPrimary
                        } rounded-lg font-medium transition duration-200 ${
                          formData.resume ? "bg-green-100 text-green-700" : ""
                        }`}
                      >
                        {formData.resume ? "Change Resume" : "Upload Resume"}
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          accept=".pdf"
                          className="hidden"
                        />
                      </label>
                      {formData.resume && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs  text-gray-600">
                            {formData.resume.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                resume: null,
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 text-xs "
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload PDF file (max 5MB)
                    </p>
                    {errors.resume && (
                      <p className="text-red-500 text-xs  mt-1">
                        {errors.resume}
                      </p>
                    )}
                  </div>

                  {/* Subjects Selection */}
                  <div>
                    <label className="block text-xs  font-medium text-gray-700 mb-2">
                      Subjects
                    </label>
                    <input
                      type="text"
                      value={formData.subjects}
                      onChange={(e) =>
                        handleInputChange("subjects", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-xs  border rounded-lg focus:outline-none focus:ring-2 ${
                        COLOR_CLASSES.focusRingPrimary
                      } focus:border-transparent ${
                        errors.subjects ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Math, Science"
                    />
                    {errors.subjects && (
                      <p className="text-red-500 text-xs  mt-1">
                        {errors.subjects}
                      </p>
                    )}
                  </div>

                  {/* Preferred Timing */}
                  <div>
                    <label className="block text-xs  font-medium text-gray-700 mb-2">
                      Preferred Timing
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs  text-gray-500 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className={`w-full px-3 py-2 text-xs  border rounded-lg focus:outline-none focus:ring-2 ${
                            COLOR_CLASSES.focusRingPrimary
                          } focus:border-transparent ${
                            errors.preferredTiming
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs  text-gray-500 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className={`w-full px-3 py-2 text-xs  border rounded-lg focus:outline-none focus:ring-2 ${
                            COLOR_CLASSES.focusRingPrimary
                          } focus:border-transparent ${
                            errors.preferredTiming
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                    </div>
                    {startTime && endTime && (
                      <p className="text-xs  text-gray-600 mt-2">
                        Selected: {formatTimeSlot(startTime, endTime)}
                      </p>
                    )}
                    {errors.preferredTiming && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.preferredTiming}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !isEmailVerified}
                    className={`w-full py-4 text-xs  rounded-lg font-semibold text-white transition duration-200 ${
                      isSubmitting || !isEmailVerified
                        ? "bg-gray-400 cursor-not-allowed"
                        : `${COLOR_CLASSES.bgPrimary} ${COLOR_CLASSES.hoverBgPrimary}`
                    }`}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : !isEmailVerified
                      ? "Verify Email to Book"
                      : "Book Now"}
                  </button>
                </form>
              </div>

              {/* Right Side - Illustration */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-full max-w-lg">
                  <img
                    src={illustrationImg3}
                    alt="Tutor Illustration"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verify Your Email
                  </h2>
                  <p className="text-sm text-gray-600">
                    Complete your tutor registration
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowOtpModal(false);
                    setTimerActive(false);
                    setTimeRemaining(300);
                    setOtp("");
                  }}
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

              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">
                  OTP is sent to{" "}
                  <span className="font-medium">{formData.email}</span>
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
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
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

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setTimerActive(false);
                    setTimeRemaining(300);
                    setOtp("");
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOtpVerification}
                  disabled={loadingVerify || otp.length !== 6 || !timerActive}
                  className={`flex-1 py-3 px-4 ${COLOR_CLASSES.bgPrimary} text-white rounded-md ${COLOR_CLASSES.hoverBgPrimary} transition-colors disabled:opacity-50`}
                >
                  {loadingVerify ? "Verifying..." : "Verify Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorSignupPage;
