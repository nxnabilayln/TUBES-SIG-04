import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const info = localStorage.getItem("admin_info");
    if (token && info) setAdmin(JSON.parse(info));
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await authAPI.login(username, password);
    const { access_token, nama_lengkap } = res.data;
    const adminInfo = { username, nama_lengkap };
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("admin_info", JSON.stringify(adminInfo));
    setAdmin(adminInfo);
    return adminInfo;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("admin_info");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{ admin, loading, login, logout, isLoggedIn: !!admin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
