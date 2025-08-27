import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseAxios from "../auth/baseAxios";

// Types
export interface LogEntry {
  id: string;
  logId?: string;
  time: string;
  date: string;
  operation: string;
  operationType: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "BOOKING" | "PAYMENT" | "ERROR" | "SYSTEM";
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LogsState {
  logs: LogEntry[];
  loading: boolean;
  error?: string;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

const initialState: LogsState = {
  logs: [],
  loading: false,
  totalCount: 0,
  currentPage: 1,
  pageSize: 50,
};

// Logs Thunks
export const fetchLogs = createAsyncThunk(
  "logs/fetchLogs",
  async (params?: {
    page?: number;
    limit?: number;
    operationType?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    search?: string;
  }) => {
    let url = "/logs";
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.operationType) searchParams.append("operationType", params.operationType);
      if (params.startDate) searchParams.append("startDate", params.startDate);
      if (params.endDate) searchParams.append("endDate", params.endDate);
      if (params.userId) searchParams.append("userId", params.userId);
      if (params.search) searchParams.append("search", params.search);
      
      const queryString = searchParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    
    const res = await baseAxios.get(url);
    return res.data;
  }
);

export const createLog = createAsyncThunk(
  "logs/createLog",
  async (data: {
    operation: string;
    operationType: string;
    details?: string;
    userId?: string;
  }) => {
    const res = await baseAxios.post("/logs", data);
    return res.data;
  }
);

export const deleteLog = createAsyncThunk(
  "logs/deleteLog",
  async (id: string) => {
    await baseAxios.delete(`/logs/${id}`);
    return id;
  }
);

export const clearLogs = createAsyncThunk(
  "logs/clearLogs",
  async (params?: { olderThan?: string; operationType?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.olderThan) searchParams.append("olderThan", params.olderThan);
    if (params?.operationType) searchParams.append("operationType", params.operationType);
    
    const queryString = searchParams.toString();
    const url = queryString ? `/logs/clear?${queryString}` : "/logs/clear";
    
    const res = await baseAxios.delete(url);
    return res.data;
  }
);

const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = undefined;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Logs
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.logs || action.payload;
        state.totalCount = action.payload.totalCount || action.payload.length;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create Log
      .addCase(createLog.fulfilled, (state, action) => {
        state.logs.unshift(action.payload);
        state.totalCount += 1;
      })
      
      // Delete Log
      .addCase(deleteLog.fulfilled, (state, action) => {
        state.logs = state.logs.filter(log => log.id !== action.payload);
        state.totalCount -= 1;
      })
      
      // Clear Logs
      .addCase(clearLogs.fulfilled, (state) => {
        state.logs = [];
        state.totalCount = 0;
        state.currentPage = 1;
      });
  },
});

export const { clearError, setCurrentPage, setPageSize } = logsSlice.actions;
export default logsSlice.reducer;
