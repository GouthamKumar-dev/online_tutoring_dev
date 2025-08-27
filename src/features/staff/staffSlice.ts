import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseAxios from "../auth/baseAxios";

// Types
export interface Staff {
  staffId: string;
  staffName: string;
  staffImageUrl?: string;
  staffDetails: string;
  isPremium: boolean;
  staffEmail: string;
  staffPhoneNumber: string;
  qualification: string;
  experience: string;
  subjects: string;
  preferredTimeSlot: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface StaffState {
  staffs: Staff[];
  loading: boolean;
  error?: string;
  pagination: PaginationInfo;
}

const initialState: StaffState = {
  staffs: [],
  loading: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

// Staff Thunks
export const fetchStaffs = createAsyncThunk(
  "staff/fetchStaffs",
  async (params?: { page?: number; limit?: number; offset?: number }) => {
    let url = "/staffs";
    if (params) {
      const searchParams = new URLSearchParams();
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

export const fetchPremiumStaffs = createAsyncThunk(
  "staff/fetchPremiumStaffs",
  async (params?: { page?: number; limit?: number; offset?: number }) => {
    let url = "/staffs";
    const searchParams = new URLSearchParams();
    searchParams.append("isPremium", "true");
    
    if (params) {
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.offset) searchParams.append("offset", params.offset.toString());
    }
    
    const queryString = searchParams.toString();
    url += `?${queryString}`;
    
    const res = await baseAxios.get(url);
    return res.data;
  }
);

export const createStaff = createAsyncThunk(
  "staff/createStaff",
  async (data: {
    staffName: string;
    staffEmail: string;  // Updated field name
    staffPhoneNumber: string;  // Updated field name
    qualification: string;
    experience: string;  // Changed to string
    subjects: string;
    preferredTimeSlot: string;  // Updated field name
    isPremium: boolean;  // Updated field name and type
    staffDetails: string;
    image?: File;
  }) => {
    const formData = new FormData();
    formData.append("staffName", data.staffName);
    formData.append("staffEmail", data.staffEmail);  // Updated field name
    formData.append("staffPhoneNumber", data.staffPhoneNumber);  // Updated field name
    formData.append("qualification", data.qualification);
    formData.append("experience", data.experience);  // No need to convert to string
    formData.append("subjects", data.subjects);
    formData.append("preferredTimeSlot", data.preferredTimeSlot);  // Updated field name
    formData.append("isPremium", data.isPremium.toString());  // Updated field name
    formData.append("staffDetails", data.staffDetails);
    if (data.image) {
      formData.append("profileImage", data.image);
    }

    const res = await baseAxios.post("/staffs/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
);

export const updateStaff = createAsyncThunk(
  "staff/updateStaff",
  async ({ id, data }: { id: string; data: FormData }) => {
    const res = await baseAxios.patch(`/staffs/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
);

export const deleteStaff = createAsyncThunk(
  "staff/deleteStaff",
  async (id: string) => {
    await baseAxios.delete(`/staffs/${id}`);
    return id;
  }
);

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Staffs
      .addCase(fetchStaffs.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchStaffs.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both paginated and non-paginated responses
        if (action.payload.data && action.payload.pagination) {
          // Paginated response
          state.staffs = action.payload.data;
          state.pagination = action.payload.pagination;
        } else if (action.payload.data) {
          // Non-paginated response (fallback)
          state.staffs = action.payload.data;
        } else {
          // Direct data response (legacy)
          state.staffs = action.payload;
        }
      })
      .addCase(fetchStaffs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch Premium Staffs
      .addCase(fetchPremiumStaffs.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchPremiumStaffs.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both paginated and non-paginated responses
        if (action.payload.data && action.payload.pagination) {
          // Paginated response
          state.staffs = action.payload.data;
          state.pagination = action.payload.pagination;
        } else if (action.payload.data) {
          // Non-paginated response (fallback)
          state.staffs = action.payload.data;
        } else {
          // Direct data response (legacy)
          state.staffs = action.payload;
        }
      })
      .addCase(fetchPremiumStaffs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create Staff
      .addCase(createStaff.fulfilled, (state, action) => {
        state.staffs.push(action.payload);
      })
      
      // Update Staff
      .addCase(updateStaff.fulfilled, (state, action) => {
        const index = state.staffs.findIndex(staff => staff.staffId === action.payload.staffId);
        if (index !== -1) {
          state.staffs[index] = action.payload;
        }
      })
      
      // Delete Staff
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staffs = state.staffs.filter(staff => staff.staffId !== action.payload);
      });
  },
});

export const { clearError } = staffSlice.actions;
export default staffSlice.reducer;
