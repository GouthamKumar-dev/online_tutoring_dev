import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../app/store";
import { refreshTokenByRole } from "./authSlice";
import { useNavigate } from "react-router-dom";

const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        await dispatch(refreshTokenByRole()).unwrap();
      } catch (err) {
        // Redirect to login on failed refresh
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [dispatch, navigate]);

  if (loading)
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center min-h-screen bg-white/70 z-50">
        <svg
          className="animate-spin h-20 w-20 text-violet-500 mb-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      </div>
    );

  return <>{children}</>;
};

export default AuthLoader;
