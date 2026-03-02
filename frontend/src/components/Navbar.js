import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleBg = {
    ADMIN: "bg-red-600",
    FACULTY: "bg-indigo-600",
    STUDENT: "bg-emerald-600"
  };

  const currentBg = roleBg[user?.role] || "bg-indigo-600";

  return (
    <div className={`${currentBg} text-white p-4 flex justify-between items-center shadow-lg transition-colors duration-500`}>
      <Link to="/" className="text-xl font-bold">Campus Resource</Link>
      <div className="space-x-6 flex items-center">
        <Link to="/" className="hover:text-gray-200">Dashboard</Link>
        {user?.role === 'ADMIN' && <Link to="/users" className="hover:text-gray-200">Users</Link>}
        <Link to="/booking" className="hover:text-gray-200">Booking</Link>

        {user ? (
          <div className="flex items-center space-x-4 border-l pl-6">
            <NotificationDropdown user={user} />
            <span className="text-sm font-medium">{user.name} ({user.role})</span>
            <button
              onClick={handleLogout}
              className="bg-white text-indigo-900 border border-white hover:bg-transparent hover:text-white px-3 py-1 rounded text-sm font-bold transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-white text-indigo-600 hover:bg-transparent hover:text-white border border-white px-3 py-1 rounded text-sm font-bold transition">Login</Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;
