import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseAxios from "../auth/baseAxios";

// Types
export interface AppUpdate {
  id: string;
  updateId?: string;
  time: string;
  date: string;
  prevVersion: string;
  currVersion: string;
  mandatory: boolean;
  description?: string;
  releaseNotes?: string;
  downloadUrl?: string;
  size?: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING";
  createdAt?: string;
  updatedAt?: string;
}

interface AppUpdatesState {
  updates: AppUpdate[];
  loading: boolean;
  error?: string;
  actionLoading: boolean;
}

const initialState: AppUpdatesState = {
  updates: [],
  loading: false,
  actionLoading: false,
};

// App Updates Thunks
export const fetchAppUpdates = createAsyncThunk(
  "appUpdates/fetchAppUpdates",
  async (params?: { status?: string; limit?: number; offset?: number }) => {
    let url = "/app-updates";
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.append("status", params.status);
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.offset) searchParams.append("offset", params.offset.toString());
      
      const queryString = searchParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    
    const res = await baseAxios.get(url);
    return res.data;
  }
);

export const createAppUpdate = createAsyncThunk(
  "appUpdates/createAppUpdate",
  async (data: {
    prevVersion: string;
    currVersion: string;
    mandatory: boolean;
    description?: string;
    releaseNotes?: string;
    downloadUrl?: string;
    size?: string;
  }) => {
    const res = await baseAxios.post("/app-updates", data);
    return res.data;
  }
);

export const updateAppUpdate = createAsyncThunk(
  "appUpdates/updateAppUpdate",
  async ({ id, data }: { id: string; data: Partial<AppUpdate> }) => {
    const res = await baseAxios.patch(`/app-updates/${id}`, data);
    return res.data;
  }
);

export const deleteAppUpdate = createAsyncThunk(
  "appUpdates/deleteAppUpdate",
  async (id: string) => {
    await baseAxios.delete(`/app-updates/${id}`);
    return id;
  }
);

export const toggleUpdateStatus = createAsyncThunk(
  "appUpdates/toggleUpdateStatus",
  async ({ id, status }: { id: string; status: string }) => {
    const res = await baseAxios.patch(`/app-updates/${id}/status`, { status });
    return res.data;
  }
);

const appUpdatesSlice = createSlice({
  name: "appUpdates",
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
      // Fetch App Updates
      .addCase(fetchAppUpdates.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchAppUpdates.fulfilled, (state, action) => {
        state.loading = false;
        state.updates = action.payload;
      })
      .addCase(fetchAppUpdates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create App Update
      .addCase(createAppUpdate.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createAppUpdate.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.updates.unshift(action.payload);
      })
      .addCase(createAppUpdate.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message;
      })
      
      // Update App Update
      .addCase(updateAppUpdate.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateAppUpdate.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.updates.findIndex(update => update.id === action.payload.id);
        if (index !== -1) {
          state.updates[index] = action.payload;
        }
      })
      .addCase(updateAppUpdate.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message;
      })
      
      // Toggle Update Status
      .addCase(toggleUpdateStatus.fulfilled, (state, action) => {
        const index = state.updates.findIndex(update => update.id === action.payload.id);
        if (index !== -1) {
          state.updates[index] = action.payload;
        }
      })
      
      // Delete App Update
      .addCase(deleteAppUpdate.fulfilled, (state, action) => {
        state.updates = state.updates.filter(update => update.id !== action.payload);
      });
  },
});

export const { clearError, setActionLoading } = appUpdatesSlice.actions;
export default appUpdatesSlice.reducer;
