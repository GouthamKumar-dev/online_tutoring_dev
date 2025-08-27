import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { resetStudent } from '../features/student/studentSlice';
import type { AppDispatch } from '../app/store';

export const useStudentLogout = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleStudentLogout = () => {
    // Clear auth state
    dispatch(logout());
    
    // Clear student data
    dispatch(resetStudent());
    
    // Redirect to home page
    window.location.href = '/';
  };

  return handleStudentLogout;
};

export default useStudentLogout;
