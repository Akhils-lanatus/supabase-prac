import { useAuth } from "../context/AuthContext";

export const useIsAuthenticated = () => {
  const { user, loading } = useAuth();

  return {
    isAuthenticated: !!user,
    isLoading: loading,
  };
};
