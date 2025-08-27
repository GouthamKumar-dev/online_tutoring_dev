import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseAxios from "../auth/baseAxios";

// Types
export interface TutorRequest {
  tutorId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  resumePath?: string;
  qualification?: string;
  experience?: number;
  subjects?: string[];
  preferredTimeSlot?: string;
  otp?: string;
  otpExpiresAt?: string;
  isVerified: boolean;
  registrationCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS" | "COMPLETED";
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface TutorRequestState {
  requests: TutorRequest[];
  loading: boolean;
  error?: string;
  actionLoading: boolean;
  pagination: PaginationInfo;
}

const initialState: TutorRequestState = {
  requests: [],
  loading: false,
  actionLoading: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

// Tutor Request Thunks
export const fetchTutorRequests = createAsyncThunk(
  "tutorRequest/fetchTutorRequests", 
  async (params?: { status?: string; limit?: number; offset?: number; page?: number }) => {
    let url = "/tutors";
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.append("status", params.status);
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.offset) searchParams.append("offset", params.offset.toString());
      
      const queryString = searchParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    
    const res = await baseAxios.get(url);
    return res.data;
  }
);

export const updateTutorRequestStatus = createAsyncThunk(
  "tutorRequest/updateTutorRequestStatus",
  async ({ id, status, message }: { id: number; status: string; message?: string }) => {
    const res = await baseAxios.patch(`/tutors/${id}/status`, {
      status,
      message
    });
    return res.data;
  }
);

export const createTutorRequest = createAsyncThunk(
  "tutorRequest/createTutorRequest",
  async (data: {
    user: string;
    userEmail?: string;
    subject: string;
    requestType: string;
    message?: string;
  }) => {
    const res = await baseAxios.post("/tutor-requests", data);
    return res.data;
  }
);

export const deleteTutorRequest = createAsyncThunk(
  "tutorRequest/deleteTutorRequest",
  async (id: number) => {
    await baseAxios.delete(`/tutors/${id}`);
    return id;
  }
);

const tutorRequestSlice = createSlice({
  name: "tutorRequest",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = undefined;
    },
    setActionLoading: (state, action) => {
      state.actionLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tutor Requests
      .addCase(fetchTutorRequests.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchTutorRequests.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the new paginated response format
        if (action.payload.data && action.payload.meta) {
          // New paginated response format
          state.requests = action.payload.data;
          state.pagination = {
            currentPage: action.payload.meta.page,
            totalPages: action.payload.meta.totalPages,
            totalItems: action.payload.meta.total,
            hasNextPage: action.payload.meta.hasNextPage,
            hasPrevPage: action.payload.meta.hasPrevPage,
          };
        } else if (action.payload.data && action.payload.pagination) {
          // Legacy paginated response
          state.requests = action.payload.data;
          state.pagination = action.payload.pagination;
        } else if (action.payload.data) {
          // Non-paginated response (fallback)
          state.requests = action.payload.data;
        } else {
          // Direct data response (legacy)
          state.requests = action.payload;
        }
      })
      .addCase(fetchTutorRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update Tutor Request Status
      .addCase(updateTutorRequestStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateTutorRequestStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.requests.findIndex(req => req.tutorId === action.payload.tutorId);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(updateTutorRequestStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message;
      })
      
      // Create Tutor Request
      .addCase(createTutorRequest.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      })
      
      // Delete Tutor Request
      .addCase(deleteTutorRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(req => req.tutorId !== Number(action.payload));
      });
  },
});

export const { clearError, setActionLoading } = tutorRequestSlice.actions;
export default tutorRequestSlice.reducer;
