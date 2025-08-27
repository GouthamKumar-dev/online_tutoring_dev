import baseAxios from "../auth/baseAxios";

// Types for tutor registration
export interface InitiateEmailRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface CompleteTutorRegistrationRequest {
  name: string;
  email: string;
  phoneNumber: string;
  qualification: string;
  experience: number;
  subjects: string;
  preferredTimeSlot: string;
  resume: File;
}

export interface TutorApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// API functions for tutor registration
export const tutorApi = {
  // Step 1: Initiate email verification
  initiateEmailVerification: async (data: InitiateEmailRequest): Promise<TutorApiResponse> => {
    try {
      const response = await baseAxios.post("/tutors/initiate-email", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to initiate email verification");
    }
  },

  // Step 2: Verify OTP
  verifyOtp: async (data: VerifyOtpRequest): Promise<TutorApiResponse> => {
    try {
      const response = await baseAxios.post("/tutors/verify-otp", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to verify OTP");
    }
  },

  // Step 3: Complete registration with form data and resume
  completeRegistration: async (data: CompleteTutorRegistrationRequest): Promise<TutorApiResponse> => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("qualification", data.qualification);
      formData.append("experience", data.experience.toString());
      formData.append("subjects", data.subjects);
      formData.append("preferredTimeSlot", data.preferredTimeSlot);
      formData.append("resume", data.resume);

      const response = await baseAxios.post("/tutors/complete", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to complete registration");
    }
  },
};
