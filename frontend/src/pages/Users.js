import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

function Users() {

  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "STUDENT",
    status: "ACTIVE"
  });

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    await api.post("/users", form);
    fetchUsers();

    // reset form
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "STUDENT",
      status: "ACTIVE"
    });
  };

  return (
    <>
      <Navbar />
      <div className="p-10 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">User Management</h2>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Name */}
            <input
              className="border p-2 rounded"
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            {/* Email */}
            <input
              className="border p-2 rounded"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            {/* Phone */}
            <input
              className="border p-2 rounded"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            {/* Role Select */}
            <select
              className="border p-2 rounded"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>

            {/* Status Select */}
            <select
              className="border p-2 rounded"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Create User
          </button>
        </div>

        {/* User List */}
        <div className="grid gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-white p-4 rounded shadow">
              <p className="font-semibold">{u.name}</p>
              <p className="text-gray-500">{u.email}</p>
              <p className="text-sm text-gray-600">
                Role: {u.role} | Status: {u.status}
              </p>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}

export default Users;
