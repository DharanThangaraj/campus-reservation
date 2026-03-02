import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

function Resources() {

  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "LAB",
    capacity: 0,
    status: "AVAILABLE"
  });

  const fetchResources = async () => {
    const res = await api.get("/resources");
    setResources(res.data);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSubmit = async () => {
    await api.post("/resources", form);
    fetchResources();
  };

  return (
    <>
      <Navbar />
      <div className="p-10 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Resources</h2>

        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <input
            className="border p-2 rounded w-full mb-3"
            placeholder="Resource Name"
            onChange={(e)=>setForm({...form,name:e.target.value})}
          />

          <input
            type="number"
            className="border p-2 rounded w-full mb-3"
            placeholder="Capacity"
            onChange={(e)=>setForm({...form,capacity:e.target.value})}
          />

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Add Resource
          </button>
        </div>

        <div className="grid gap-4">
          {resources.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded shadow">
              <p className="font-semibold">{r.name}</p>
              <p className="text-gray-500">{r.type}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Resources;
