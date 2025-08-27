import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

export const useStudentAuth = () => {
  const { token, role } = useSelector((state: RootState) => state.auth);
  
  const isAuthenticated = Boolean(token);
  const isStudent = role === 'student';
  const isLoggedInStudent = isAuthenticated && isStudent;
  
  return {
    isAuthenticated,
    isStudent,
    isLoggedInStudent,
    token,
    role,
  };
};

export default useStudentAuth;
