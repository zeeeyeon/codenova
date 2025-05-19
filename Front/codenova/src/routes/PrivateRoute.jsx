// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import  { useSessionStore } from "../store/useSessionStore";
import  { useChatStore} from "../store/useChatStore";

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const isTokenValid = useAuthStore((state) => state.isTokenValid);
  const logout = useAuthStore((state) => state.logout);
  const clearSession = useSessionStore((state) => state.clearSession);
  const clearAllChats = useChatStore((state) => state.clearAllChats);


  if (!token || !isTokenValid()) {
    clearSession();
    clearAllChats();
    logout();
    return <Navigate to="/" replace />;
  }


  return children;
};

export default PrivateRoute;
