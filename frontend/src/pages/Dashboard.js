import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import NotificationSection from "../components/NotificationSection";
import ResourceDetailModal from "../components/ResourceDetailModal";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalResources: 0,
    availableResources: 0,
    bookedResources: 0,
    totalList: [],
    availableList: [],
    bookedList: []
  });

  const [modal, setModal] = useState({ isOpen: false, title: "", items: [], type: "" });

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/resources/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh stats every 10 seconds
    return () => clearInterval(interval);
  }, [fetchStats]);

  const roleColors = {
    ADMIN: "border-red-500 text-red-700 bg-red-50",
    FACULTY: "border-indigo-500 text-indigo-700 bg-indigo-50",
    STUDENT: "border-emerald-500 text-emerald-700 bg-emerald-50"
  };

  const currentTheme = roleColors[user?.role] || roleColors.STUDENT;

  return (
    <>
      <Navbar />
      <div className="p-10 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Welcome, {user?.name}!</h2>
          <span className={`px-4 py-1 rounded-full text-sm font-bold border ${currentTheme}`}>
            {user?.role} Portal
          </span>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-700">Resource Statistics</h3>
          <span className="flex items-center text-xs text-green-500 font-medium bg-green-50 px-2 py-1 rounded-full animate-pulse">
            <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
            Real-time Updates
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <button
            onClick={() => setModal({ isOpen: true, title: "Total Resources", items: stats.totalList, type: "total" })}
            className={`bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-400 text-left hover:scale-105 transition cursor-pointer`}
          >
            <h3 className="text-lg font-semibold text-gray-600">Total Resources</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalResources}</p>
          </button>
          <button
            onClick={() => setModal({ isOpen: true, title: "Available Resources", items: stats.availableList, type: "available" })}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-400 text-left hover:scale-105 transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-600">Available</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{stats.availableResources}</p>
          </button>
          <button
            onClick={() => setModal({ isOpen: true, title: "Currently Booked", items: stats.bookedList, type: "booked" })}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-orange-400 text-left hover:scale-105 transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-600">Currently Booked</h3>
            <p className="text-3xl font-bold mt-2 text-orange-600">{stats.bookedResources}</p>
          </button>
        </div>

        <ResourceDetailModal
          isOpen={modal.isOpen}
          onClose={() => setModal({ ...modal, isOpen: false })}
          title={modal.title}
          items={modal.items}
          type={modal.type}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-indigo-600">
          {user?.role === 'ADMIN' && (
            <Link to="/users" className="bg-white p-6 rounded-xl shadow-md hover:scale-105 transition flex flex-col items-center justify-center text-center border-b-4 border-red-500">
              <h3 className="text-xl font-semibold">Users</h3>
              <p className="mt-2 text-gray-500">Manage students & staff</p>
            </Link>
          )}

          <Link to="/booking" className={`bg-white p-6 rounded-xl shadow-md hover:scale-105 transition flex flex-col items-center justify-center text-center border-b-4 ${user?.role === 'ADMIN' ? 'border-red-500' : currentTheme.split(' ')[0]}`}>
            <h3 className="text-xl font-semibold">Bookings</h3>
            <p className="mt-2 text-gray-500">Reserve campus resources</p>
          </Link>
        </div>

        <NotificationSection />
      </div>
    </>
  );
}

export default Dashboard;
