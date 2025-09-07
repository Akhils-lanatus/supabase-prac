import { useIsAuthenticated } from "../../utils/useIsAuthenticated";
import Auth from "./Auth";

const Protected = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useIsAuthenticated();

  if (!isAuthenticated) return <Auth />;

  return <>{children}</>;
};

export default Protected;
