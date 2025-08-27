import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseAxios from "../auth/baseAxios";

// Types
export interface Course {
  classId: number;
  className: string;
  classFullname: string;
  category: {
    categoryId: number;
    categoryName: string;
    categoryImageUrl: string;
    categoryDefinition: string;
    createdAt: string;
    updatedAt: string;
  };
  subcategory: {
    subcategoryId: number;
    subcategoryName: string;
    subcategoryDefinition: string;
    createdAt: string;
    updatedAt: string;
  };
  pdfPath1: string | null;
  pdfPath2: string | null;
  pdfPath3: string | null;
  pdfPath4: string | null;
  createdAt: string;
  updatedAt: string;
  // Optional fields for backward compatibility
  id?: string;
  name?: string;
  fullName?: string;
  description?: string;
  tutor?: string;
  duration?: string;
  level?: string;
  rating?: number;
  price?: string;
  image?: string;
}

interface CoursesState {
  courses: Course[];
  loading: boolean;
  error?: string;
}

const initialState: CoursesState = {
  courses: [],
  loading: false,
};

// Thunks
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (filters?: { 
    categoryId?: string; 
    subcategoryId?: string; 
    search?: string;
    level?: string;
    language?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.subcategoryId) params.append('subcategoryId', filters.subcategoryId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.level) params.append('level', filters.level);
    if (filters?.language) params.append('language', filters.language);
    
    const res = await baseAxios.get(`/courses?${params.toString()}`);
    return res.data;
  }
);

// Get all courses without filters (for initial load)
export const fetchAllCourses = createAsyncThunk(
  "courses/fetchAllCourses",
  async () => {
    const res = await baseAxios.get('/courses');
    return res.data;
  }
);

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchAllCourses.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = coursesSlice.actions;
export default coursesSlice.reducer;
