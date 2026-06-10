import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-primary text-white shadow-md z-[1000] relative">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo & judul */}
        <Link
          to="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">
            🅿️
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-sm">WebGIS Parkir</p>
            <p className="text-white/70 text-xs">Kota Bukittinggi</p>
          </div>
        </Link>

        {/* Nav kanan */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-white/80 text-sm hidden sm:block">
                👤 {admin?.nama_lengkap || admin?.username}
              </span>
              <Link
                to="/admin"
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                Dashboard Admin
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Login Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
