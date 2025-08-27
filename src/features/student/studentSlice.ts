import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import studentAxios from "../auth/studentAxios";

interface StudentProfile {
  id: string;
  parentName: string;
  studentName: string;
  phone: string;
  email: string;
  joinedDate: string;
  totalClasses: number;
  upcomingClasses: number;
}

interface Booking {
  id: string;
  title: string;
  subject: string;
  class: string;
  status: "completed" | "booked" | "upcoming" | "cancelled" | "not_allotted";
  date: string;
  time: string;
  tutor: string;
}

interface StudentState {
  profile: StudentProfile | null;
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  profile: null,
  bookings: [],
  loading: false,
  error: null,
};

// Fetch student profile
export const fetchStudentProfile = createAsyncThunk(
  "student/fetchProfile",
  async () => {
    const response = await studentAxios.get("/students/profile");
    return response.data;
  }
);

// Fetch student bookings
export const fetchStudentBookings = createAsyncThunk(
  "student/fetchBookings",
  async () => {
    const response = await studentAxios.get("/students/bookings");
    return response.data;
  }
);

// Update student profile
export const updateStudentProfile = createAsyncThunk(
  "student/updateProfile",
  async (profileData: Partial<StudentProfile>) => {
    const response = await studentAxios.put("/students/profile", profileData);
    return response.data;
  }
);

// Cancel booking
export const cancelBooking = createAsyncThunk(
  "student/cancelBooking",
  async (bookingId: string) => {
    await studentAxios.delete(`/students/bookings/${bookingId}`);
    return bookingId;
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStudent: (state) => {
      state.profile = null;
      state.bookings = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder
      .addCase(fetchStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch profile";
      });

    // Fetch bookings
    builder
      .addCase(fetchStudentBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchStudentBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch bookings";
      });

    // Update profile
    builder
      .addCase(updateStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update profile";
      });

    // Cancel booking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.filter(
          (booking) => booking.id !== action.payload
        );
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to cancel booking";
      });
  },
});

export const { clearError, resetStudent } = studentSlice.actions;
export default studentSlice.reducer;
