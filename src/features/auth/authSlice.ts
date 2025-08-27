import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseAxios from "./baseAxios";

interface StudentProfile {
  userId: string;
  studentName: string;
  parentName: string;
  phoneNumber: string;
  emailId: string;
}

interface AuthState {
  token: string | null;
  role: string | null;
  student: StudentProfile | null;
}

// NOTE: No localStorage/sessionStorage is used. Auth state is kept in memory only.
const initialState: AuthState = {
  token: null,
  role: null,
  student: null,
};

// Remove old login thunk, add OTP thunks
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (email: string) => {
    await baseAxios.post("/send-otp", { email });
    return email;
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }: { email: string; otp: string }) => {
    const res = await baseAxios.post("/verify-otp", { email, otp });
    // Expecting { token, role } from backend if OTP is valid
    return { token: res.data.token, role: res.data.role };
  }
);

// Student-specific OTP thunks
export const sendStudentOtp = createAsyncThunk(
  "auth/sendStudentOtp",
  async (emailId: string, { rejectWithValue }) => {
    try {
      await baseAxios.post("/students/send-otp", { emailId });
      return { emailId, isRegistered: true };
    } catch (error: any) {
      // Extract the actual response data from the error
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || error.message || "Failed to send OTP",
        isRegistered: errorData.isRegistered || false,
        ...errorData
      });
    }
  }
);

// Student-specific OTP verification
export const verifyStudentOtp = createAsyncThunk(
  "auth/verifyStudentOtp",
  async ({ emailId, otp }: { emailId: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await baseAxios.post("/students/login", { emailId, otp });
      // Expecting { token, role: 'student' } from backend if OTP is valid
      return { token: res.data.token, role: 'student' };
    } catch (error: any) {
      // Extract the actual response data from the error
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || error.message || "Invalid OTP",
        ...errorData
      });
    }
  }
);

export const registerStudent = createAsyncThunk(
  "/students",
  async (studentData: any, { rejectWithValue }) => {
    try {
      const res = await baseAxios.post("/students", studentData);
      return res.data;
    } catch (error: any) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || error.message || "Failed to register student",
        ...errorData
      });
    }
  }
);

// Fetch student profile
export const fetchStudentProfile = createAsyncThunk(
  "auth/fetchStudentProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await baseAxios.get("/students/profile");
      return res.data.student;
    } catch (error: any) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || error.message || "Failed to fetch profile",
        ...errorData
      });
    }
  }
);

export const refreshToken = createAsyncThunk("auth/refresh", async () => {
  const res = await baseAxios.get("/auth/refresh");
  // Expecting { token, role } from backend
  return { token: res.data.token, role: res.data.role };
});

// Executive-specific login (username/password)
export const loginExecutive = createAsyncThunk(
  "auth/loginExecutive",
  async ({ username, password }: { username: string; password: string }) => {
    const res = await baseAxios.post("/executive/login", {
      username,
      password,
    });
    return { token: res.data.token, role: res.data.role };
  }
);

// Executive-specific refresh token
export const refreshExecutiveToken = createAsyncThunk("auth/refreshExecutive", async () => {
  const res = await baseAxios.get("/executive/refresh");
  // Expecting { token, role } from backend
  return { token: res.data.token, role: res.data.role };
});

// Student-specific refresh token
export const refreshStudentToken = createAsyncThunk("auth/refreshStudent", async () => {
  const res = await baseAxios.get("/students/refresh");
  // Expecting { token, role } from backend
  return { token: res.data.token, role: res.data.role };
});

// Smart refresh that calls the appropriate endpoint based on role
export const refreshTokenByRole = createAsyncThunk(
  "auth/refreshByRole", 
  async (_, { getState, dispatch }) => {
    const state = getState() as any;
    const userRole = state.auth.role;
    
    if (userRole === "executive") {
      return await dispatch(refreshExecutiveToken()).unwrap();
    } else if (userRole === "student") {
      return await dispatch(refreshStudentToken()).unwrap();
    } else {
      // For admin and other roles, use the general refresh
      return await dispatch(refreshToken()).unwrap();
    }
  }
);

 
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.role = null;
      state.student = null;
    },
    login(state, action) {
      state.token = action.payload.token;
      state.role = action.payload.role;
    },
    setStudentProfile(state, action) {
      state.student = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
    });
    builder.addCase(verifyStudentOtp.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
    });
    builder.addCase(loginExecutive.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
    });
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
    });
    builder.addCase(refreshExecutiveToken.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
    });
    builder.addCase(refreshStudentToken.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
    });
    builder.addCase(refreshTokenByRole.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
    });
    builder.addCase(fetchStudentProfile.fulfilled, (state, action) => {
      state.student = action.payload;
    });
  },
});

export const { logout, login, setStudentProfile } = authSlice.actions;

// Selectors
export const selectStudent = (state: any) => state.auth.student;
export const selectIsLoggedIn = (state: any) => !!state.auth.token;
export const selectUserRole = (state: any) => state.auth.role;

export default authSlice.reducer;
