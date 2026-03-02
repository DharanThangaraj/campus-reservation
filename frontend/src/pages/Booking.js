import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

function Booking() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    resourceId: "",
    startTime: "",
    endTime: "",
    purpose: "",
    participants: ""
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/resources");
      console.log("Resources fetched:", res.data);
      setResources(res.data);
    } catch (err) {
      console.error("Failed to fetch resources", err);
      showToast("Failed to load resources", "error");
    }

    try {
      const res = await api.get("/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resourceId) return showToast("Select a resource", "warning");

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    const diffMs = end - start;
    const diffHrs = diffMs / (1000 * 60 * 60);

    // 1. Working Hours (9 AM - 5 PM)
    const startHour = start.getHours();
    const startMin = start.getMinutes();
    const endHour = end.getHours();
    const endMin = end.getMinutes();

    if (startHour < 9 || (endHour > 17 || (endHour === 17 && endMin > 0))) {
      return showToast("Select at working hours (9 AM - 5 PM)", "error");
    }

    // 2. Break Times
    // Morning Break: 10:30 - 11:00
    const morningBreakStart = 10 * 60 + 30;
    const morningBreakEnd = 11 * 0; // Wait, 11:00
    const isMorningOverlap = (s, e) => {
      const sMin = s.getHours() * 60 + s.getMinutes();
      const eMin = e.getHours() * 60 + e.getMinutes();
      return sMin < 11 * 60 && eMin > 10 * 60 + 30;
    };
    const isLunchOverlap = (s, e) => {
      const sMin = s.getHours() * 60 + s.getMinutes();
      const eMin = e.getHours() * 60 + e.getMinutes();
      return sMin < 13 * 60 + 30 && eMin > 12 * 60 + 30;
    };

    if (isMorningOverlap(start, end)) {
      return showToast("Booking overlaps with morning break (10:30 AM - 11:00 AM)", "error");
    }
    if (isLunchOverlap(start, end)) {
      return showToast("Booking overlaps with lunch time (12:30 PM - 01:30 PM)", "error");
    }

    // 3. Role-Based Duration
    let maxHrs = 0;
    if (user.role === 'STUDENT') maxHrs = 2;
    else if (user.role === 'FACULTY') maxHrs = 3;
    else if (user.role === 'ADMIN') maxHrs = 8;

    if (diffHrs > maxHrs) {
      return showToast(`Maximum duration for ${user.role} is ${maxHrs} hours`, "error");
    }

    // 4. Capacity Check
    const selectedResource = resources.find(r => r.id === parseInt(form.resourceId));
    if (parseInt(form.participants) > selectedResource?.capacity) {
      return showToast(`Participants exceed resource capacity (${selectedResource?.capacity})`, "error");
    }

    try {
      await api.post(`/bookings?userId=${user.id}`, {
        ...form,
        participants: parseInt(form.participants)
      });
      showToast("Booking request submitted!", "success");
      setForm({ resourceId: "", startTime: "", endTime: "", purpose: "", participants: "" });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Booking failed";
      showToast(msg, "error");
    }
  };

  const groupedResources = resources.reduce((acc, r) => {
    const type = r.type || "Other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(r);
    return acc;
  }, {});

  const handleApprove = async (id, role) => {
    try {
      const endpoint = role === 'FACULTY' ? 'approve-faculty' : 'approve-admin';
      await api.put(`/bookings/${id}/${endpoint}`);
      showToast("Approved successfully", "success");
      fetchData();
    } catch (err) {
      showToast("Approval failed", "error");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return showToast("Please provide a reason", "warning");
    try {
      await api.put(`/bookings/${selectedBookingId}/reject?reason=${rejectionReason}`);
      showToast("Rejected successfully", "success");
      setShowRejectModal(false);
      setRejectionReason("");
      fetchData();
    } catch (err) {
      showToast("Rejection failed", "error");
    }
  };

  const openRejectModal = (id) => {
    setSelectedBookingId(id);
    setShowRejectModal(true);
  };

  const roleThemes = {
    ADMIN: "text-red-700 bg-red-600 border-red-500",
    FACULTY: "text-indigo-700 bg-indigo-600 border-indigo-500",
    STUDENT: "text-emerald-700 bg-emerald-600 border-emerald-500"
  };

  const theme = roleThemes[user?.role] || roleThemes.STUDENT;

  return (
    <>
      <Navbar />
      <div className="p-10 bg-gray-100 min-h-screen">
        <h2 className={`text-3xl font-bold mb-8 ${theme.split(' ')[0]}`}>Booking Management</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Booking Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg h-fit">
            <h3 className={`text-xl font-semibold mb-6 border-b pb-2 ${theme.split(' ')[0]}`}>Book a Resource</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                <select
                  className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-500"
                  value={form.resourceId}
                  required
                  onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
                >
                  <option value="">Select Resource</option>
                  {Object.keys(groupedResources).map(type => (
                    <optgroup key={type} label={type.replace('_', ' ')}>
                      {groupedResources[type].map(r => (
                        <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="datetime-local"
                    className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-500"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="datetime-local"
                    className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-500"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <textarea
                  className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-500"
                  placeholder="Reason for booking..."
                  rows="3"
                  required
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Capacity (No. of Participants)</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-500"
                  required
                  min="1"
                  placeholder="Enter required capacity..."
                  value={form.participants}
                  onChange={(e) => setForm({ ...form, participants: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className={`${theme.split(' ')[1]} text-white px-6 py-3 rounded-lg hover:opacity-90 w-full font-semibold transition shadow-md`}
              >
                Submit Request
              </button>
            </form>
          </div>

          {/* Bookings List */}
          <div className="space-y-6">
            <h3 className={`text-xl font-semibold border-b pb-2 ${theme.split(' ')[0]}`}>Ongoing Requests</h3>
            {bookings.length === 0 ? (
              <p className="text-gray-500 italic">No bookings found</p>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className={`bg-white p-6 rounded-xl shadow-md border-l-4 transition hover:shadow-lg ${theme.split(' ')[2]}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className={`font-bold text-lg ${theme.split(' ')[0]}`}>Booking #{b.id}</p>
                      <p className="text-sm text-gray-400 font-medium">By User #{b.userId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${b.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      b.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">From:</span> {new Date(b.startTime).toLocaleString()}</p>
                    <p><span className="font-medium">To:</span> {new Date(b.endTime).toLocaleString()}</p>
                    <p className="col-span-2"><span className="font-medium">Purpose:</span> {b.purpose}</p>
                    {b.rejectionReason && (
                      <p className="col-span-2 text-red-600 italic"><span className="font-bold">Reason:</span> {b.rejectionReason}</p>
                    )}
                  </div>

                  {/* Role-based actions */}
                  <div className="flex space-x-3 pt-4 border-t">
                    {user?.role === 'FACULTY' && b.status === 'PENDING_FACULTY' && (
                      <button
                        onClick={() => handleApprove(b.id, 'FACULTY')}
                        className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition"
                      >
                        Approve & Forward to Admin
                      </button>
                    )}

                    {user?.role === 'ADMIN' && b.status === 'PENDING_ADMIN' && (
                      <button
                        onClick={() => handleApprove(b.id, 'ADMIN')}
                        className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition"
                      >
                        Approve Booking
                      </button>
                    )}

                    {((user?.role === 'FACULTY' && b.status === 'PENDING_FACULTY') ||
                      (user?.role === 'ADMIN' && b.status === 'PENDING_ADMIN')) && (
                        <button
                          onClick={() => openRejectModal(b.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition"
                        >
                          Reject
                        </button>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Reject Booking Request</h3>
            <p className="text-gray-600 mb-4">Please specify the reason for rejection:</p>
            <textarea
              className="border p-2 rounded w-full mb-4 focus:ring-2 focus:ring-red-500"
              rows="4"
              placeholder="e.g., Resource already reserved for maintainance..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 selection:shadow-md transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Booking;
