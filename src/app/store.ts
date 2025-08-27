
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import categoryReducer from "../features/category/categorySlice";
import authReducer from "../features/auth/authSlice";
import staffReducer from "../features/staff/staffSlice";
import tutorRequestReducer from "../features/tutorRequest/tutorRequestSlice";
import bookRequestsReducer from "../features/bookRequests/bookRequestsSlice";
import logsReducer from "../features/logs/logsSlice";
import appUpdatesReducer from "../features/appUpdates/appUpdatesSlice";
import coursesReducer from "../features/courses/coursesSlice";
import studentReducer from "../features/student/studentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    staff: staffReducer,
    tutorRequest: tutorRequestReducer,
    bookRequests: bookRequestsReducer,
    logs: logsReducer,
    appUpdates: appUpdatesReducer,
    courses: coursesReducer,
    student: studentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
