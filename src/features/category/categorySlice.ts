import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseAxios from "../auth/baseAxios";

// Types
export type NodeType = "category" | "subcategory" | "course";

export interface CategoryNode {
  // Main category fields
  categoryId?: number;
  categoryName?: string;
  categoryImageUrl?: string;
  categoryDefinition?: string;
  subcategories?: {
    subcategoryId: number;
    subcategoryName: string;
    subcategoryDefinition: string;
    children: CategoryNode[];
    courses: Course[];
    createdAt: string;
    updatedAt: string;
  }[];
  courses?: Course[];
  allCourses?: Course[];
  createdAt?: string;
  updatedAt?: string;
  
  // Subcategory fields
  subcategoryId?: number;
  subcategoryName?: string;
  subcategoryDefinition?: string;
  children?: CategoryNode[];
  
  // Course fields
  classId?: number;
  className?: string;
  classFullname?: string;
  pdfPath1?: string;
  pdfPath2?: string;
  pdfPath3?: string;
  pdfPath4?: string;
  subcategory?: any;
  
  // Legacy fields for backward compatibility
  id?: string;
  name?: string;
  definition?: string;
  type?: NodeType;
  parentId?: number;
  parentType?: NodeType;
  imageUrl?: string;
  pdfUrls?: string[];
  isParentSubcategory?: boolean;
}

export interface Course {
  classId: number;
  className: string;
  classFullname: string;
  subcategory?: any;
  pdfPath1?: string;
  pdfPath2?: string;
  pdfPath3?: string;
  pdfPath4?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface CategoryState {
  categories: CategoryNode[];
  children: CategoryNode[];
  selectedCategory: CategoryNode | null;
  loading: boolean;
  childrenLoading: boolean;
  error?: string;
  childrenError?: string;
  pagination: PaginationInfo;
}

const initialState: CategoryState = {
  categories: [],
  children: [],
  selectedCategory: null,
  loading: false,
  childrenLoading: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

// Category Thunks
export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (params?: { page?: number; limit?: number; offset?: number }) => {
    let url = "/categories";
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


export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (formData: FormData) => {
    const res = await baseAxios.post("/categories/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const res = await baseAxios.put(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id: string) => {
    await baseAxios.delete(`/categories/${id}`);
    return id;
  }
);


export const createSubcategory = createAsyncThunk(
  "category/createSubcategory",
  async (data: {
    subcategoryName: string;
    subcategoryDefinition: string;
    parentId: number;
    parentType: NodeType;
    isParentSubcategory: boolean;
  }) => {
    console.log("Creating subcategory with data:", data);
    
    const res = await baseAxios.post("/subcategories/create", {
      subcategoryName: data.subcategoryName,
      subcategoryDefinition: data.subcategoryDefinition,
      parentId: data.parentId,
      parentType: data.parentType,
      isParentSubcategory: data.isParentSubcategory,
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    return res.data;
  }
);

export const updateSubcategory = createAsyncThunk(
  "category/updateSubcategory",
  async ({ id, data }: { id: string; data: any }) => {
    const res = await baseAxios.put(`/subcategories/${id}`, data);
    return res.data;
  }
);

export const deleteSubcategory = createAsyncThunk(
  "category/deleteSubcategory",
  async (id: string) => {
    await baseAxios.delete(`/subcategories/${id}`);
    return id;
  }
);



export const createCourse = createAsyncThunk(
  "category/createCourse",
  async (data: {
    className: string;
    classFullname: string;
    parentId: number;
    parentType: NodeType;
    pdfs: FileList;
  }) => {
    const formData = new FormData();
    formData.append("className", data.className);
    formData.append("classFullname", data.classFullname);
    formData.append("parentId", data.parentId.toString());
    formData.append("parentType", data.parentType);
    
    Array.from(data.pdfs).forEach((pdf) => {
      formData.append("pdfs", pdf);
    });

    const res = await baseAxios.post("/courses/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
);

export const updateCourse = createAsyncThunk(
  "category/updateCourse",
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const res = await baseAxios.put(`/courses/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
);

export const deleteCourse = createAsyncThunk(
  "category/deleteCourse",
  async (id: string) => {
    await baseAxios.delete(`/courses/${id}`);
    return id;
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearChildren: (state) => {
      state.children = [];
      state.childrenError = undefined;
    },
    clearError: (state) => {
      state.error = undefined;
      state.childrenError = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both paginated and non-paginated responses
        if (action.payload.data && action.payload.pagination) {
          // Paginated response
          state.categories = action.payload.data;
          state.pagination = action.payload.pagination;
        } else if (action.payload.data) {
          // Non-paginated response (fallback)
          state.categories = action.payload.data;
        } else {
          // Direct data response (legacy)
          state.categories = action.payload;
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(cat => 
          (cat.categoryId?.toString() || cat.id) !== action.payload
        );
      })
      .addCase(createSubcategory.fulfilled, (state, action) => {
        state.children.push(action.payload);
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.children.push(action.payload);
      })
      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        state.children = state.children.filter(child => child.id !== action.payload);
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.children = state.children.filter(child => child.id !== action.payload);
      });
  },
});

export const { setSelectedCategory, clearChildren, clearError } = categorySlice.actions;
export default categorySlice.reducer;
