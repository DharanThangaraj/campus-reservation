import React from 'react';

function ResourceDetailModal({ isOpen, onClose, title, items, type }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {items.length === 0 ? (
                        <p className="text-center text-gray-500 italic py-8">No resources found in this category.</p>
                    ) : (
                        <div className="space-y-4">
                            {type === 'booked' ? (
                                items.map((b) => (
                                    <div key={b.id} className="p-4 border rounded-xl hover:bg-gray-50 transition border-l-4 border-orange-500">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-800">Booking #{b.id}</p>
                                                <p className="text-sm text-gray-600">Resource ID: {b.resourceId}</p>
                                                <p className="text-sm text-gray-500">{new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleTimeString()}</p>
                                            </div>
                                            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-bold uppercase">
                                                Booked
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-700"><span className="font-semibold text-gray-500">Purpose:</span> {b.purpose}</p>
                                        <p className="text-xs text-gray-400 mt-1 italic">Reserved by User #{b.userId}</p>
                                    </div>
                                ))
                            ) : (
                                items.map((r) => (
                                    <div key={r.id} className={`p-4 border rounded-xl hover:bg-gray-50 transition border-l-4 ${type === 'available' ? 'border-green-500' : 'border-blue-500'}`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-gray-800">{r.name}</p>
                                                <p className="text-sm text-gray-500">{r.type.replace('_', ' ')}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Capacity</span>
                                                <p className="text-lg font-bold text-gray-700">{r.capacity}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t bg-gray-50 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResourceDetailModal;
