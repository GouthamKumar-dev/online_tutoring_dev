import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseAxios from "../auth/baseAxios";

// Types
export interface BookRequest {
  id: string;
  bookingId: string;
  time?: string;
  date?: string;
  user: string;
  userEmail: string;
  course: string;
  courseId?: string;
  updatedBy?: string;
  status: "NOT_STARTED" | "CANCELLED" | "IN_PROGRESS" | "DONE" | "REGISTERED";
  notes?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  createdAt?: string;
  updatedAt?: string;
}

interface BookRequestsState {
  bookRequests: BookRequest[];
  loading: boolean;
  error?: string;
  actionLoading: boolean;
}

const initialState: BookRequestsState = {
  bookRequests: [],
  loading: false,
  actionLoading: false,
};

// Book Requests Thunks - Admin side (listing and status updates only)
export const fetchBookRequests = createAsyncThunk(
  "bookRequests/fetchBookRequests",
  async (params?: { 
    status?: string; 
    dateFrom?: string; 
    dateTo?: string; 
    limit?: number; 
    offset?: number;
    search?: string;
  }) => {
    let url = "/book-requests";
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.status && params.status !== "ALL") searchParams.append("status", params.status);
      if (params.dateFrom) searchParams.append("dateFrom", params.dateFrom);
      if (params.dateTo) searchParams.append("dateTo", params.dateTo);
      if (params.search) searchParams.append("search", params.search);
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.offset) searchParams.append("offset", params.offset.toString());
      
      const queryString = searchParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    
    const res = await baseAxios.get(url);
    return res.data;
  }
);

export const updateBookRequestStatus = createAsyncThunk(
  "bookRequests/updateBookRequestStatus",
  async ({ id, status }: { id: string; status: string }) => {
    const res = await baseAxios.patch(`/book-requests/${id}/status`, { status });
    return res.data;
  }
);

// Student side - create a new booking request
export const createBookRequest = createAsyncThunk(
  "bookRequests/createBookRequest",
  async (bookingData: {
    parentName: string;
    studentName: string;
    phoneNumber: string;
    email: string;
    courseId: string;
    courseName?: string;
  }) => {
    const res = await baseAxios.post("/book-requests", bookingData);
    return res.data;
  }
);

const bookRequestsSlice = createSlice({
  name: "bookRequests",
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
    // Fetch Book Requests
    builder
      .addCase(fetchBookRequests.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchBookRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.bookRequests = action.payload.data || action.payload;
      })
      .addCase(fetchBookRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch book requests";
      });

    // Update Book Request Status (Admin only functionality)
    builder
      .addCase(updateBookRequestStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = undefined;
      })
      .addCase(updateBookRequestStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedRequest = action.payload.data || action.payload;
        const index = state.bookRequests.findIndex(req => req.id === updatedRequest.id);
        if (index !== -1) {
          state.bookRequests[index] = updatedRequest;
        }
      })
      .addCase(updateBookRequestStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || "Failed to update book request status";
      });

    // Create Book Request (Student functionality)
    builder
      .addCase(createBookRequest.pending, (state) => {
        state.actionLoading = true;
        state.error = undefined;
      })
      .addCase(createBookRequest.fulfilled, (state) => {
        state.actionLoading = false;
        // Optionally add the new request to the list if needed
      })
      .addCase(createBookRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || "Failed to create booking request";
      });
  },
});

export const { clearError, setActionLoading } = bookRequestsSlice.actions;
export default bookRequestsSlice.reducer;
