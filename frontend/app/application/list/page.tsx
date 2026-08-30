"use client";


import { fetchWithAuth } from "@/utils/fetchWithAuth";
import PortalLayout from "@/components/PortalLayout";

import Link from "next/link";

import { useState, useEffect } from "react";


export default function ApplicationList() {
  const [appList, setAppList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [appToDelete, setAppToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApps = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/applications`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAppList(data.data);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // --- DELETE LOGIC ---
  const handleDelete = (id: string) => {
    setAppToDelete(id);
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/applications/${appToDelete}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setAppToDelete(null);
        fetchApps();
      } else {
        alert("Failed to delete application.");
        setAppToDelete(null);
      }
    } catch (err) {
      console.error("Error deleting application:", err);
      alert("Error deleting application.");
      setAppToDelete(null);
    }
  };

  // --- EDIT LOGIC ---
  const handleEditOpen = (app: any) => {
    setEditData({ ...app });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/applications/${editData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsEditModalOpen(false);
        fetchApps();
      } else {
        alert(data.message || "Failed to update application.");
      }
    } catch (err) {
      console.error("Error updating application:", err);
      alert("Error updating application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 md:p-8 border-b border-gray-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#2cc17b] to-[#25a86a] flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 tracking-wide">App List</h2>
            </div>
            
            <Link 
              href="/application/new"
              className="w-full sm:w-auto px-6 py-3 shrink-0 bg-gradient-to-r from-[#2cc17b] to-[#25a86a] hover:from-[#25a86a] hover:to-[#1f8f5a] text-white text-sm font-bold rounded-xl shadow-[0_5px_15px_rgba(44,193,123,0.3)] hover:shadow-[0_8px_20px_rgba(44,193,123,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create a New App
            </Link>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">App Type</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">App Id</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">SMS Keyword</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">USSD Keyword</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Delivery Time</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 md:py-12 text-center text-gray-400 text-xs md:text-base">
                      Loading applications...
                    </td>
                  </tr>
                ) : appList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 md:py-12 text-center text-gray-400 text-xs md:text-base whitespace-normal">
                      No applications found. Click "Create a New App" to get started.
                    </td>
                  </tr>
                ) : (
                  appList.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 md:py-5 md:px-6 text-xs md:text-base font-medium text-gray-600">
                        {app.appType === 'Pro' ? (
                          <span className="px-2 md:px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs md:text-sm font-semibold">Pro</span>
                        ) : (
                          <span className="px-2 md:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs md:text-sm font-semibold">Web/Android</span>
                        )}
                      </td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-xs md:text-base font-semibold text-gray-800">{app.appId}</td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-xs md:text-base">
                        {app.smsKeyword ? (
                          <span className="px-2 md:px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-medium text-[10px] md:text-sm">
                            {app.smsKeyword}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-xs md:text-base">
                        {app.ussdKeyword ? (
                          <span className="px-2 md:px-3 py-1 bg-purple-50 text-purple-600 rounded-full font-medium text-[10px] md:text-sm">
                            {app.ussdKeyword}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-xs md:text-base font-medium text-gray-600">
                        {app.deliveryTime || <span className="text-gray-400 italic">N/A</span>}
                      </td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-xs md:text-base">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => handleEditOpen(app)}
                            className="text-blue-500 hover:text-blue-700 transition-colors p-1" 
                            title="Edit"
                          >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(app._id)}
                            className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded transition-colors" 
                            title="Delete"
                          >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {appToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete App?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this application? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setAppToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-sm transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit App Modal */}
      {isEditModalOpen && editData && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm overflow-y-auto p-4 md:p-8">
          <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl flex flex-col mt-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2cc17b] to-[#1f8f5a] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Application</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">App ID</label>
                <input 
                  type="text" 
                  value={editData.appId} 
                  onChange={(e) => setEditData({...editData, appId: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2cc17b] focus:border-transparent outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">App Password</label>
                <input 
                  type="text" 
                  value={editData.appPassword} 
                  onChange={(e) => setEditData({...editData, appPassword: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2cc17b] focus:border-transparent outline-none text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">SMS Keyword</label>
                  <input 
                    type="text" 
                    value={editData.smsKeyword || ""} 
                    onChange={(e) => setEditData({...editData, smsKeyword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2cc17b] focus:border-transparent outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">USSD Keyword</label>
                  <input 
                    type="text" 
                    value={editData.ussdKeyword || ""} 
                    onChange={(e) => setEditData({...editData, ussdKeyword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2cc17b] focus:border-transparent outline-none text-gray-900"
                  />
                </div>
              </div>

              {editData.appType === 'Pro' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Delivery Time</label>
                  <input 
                    type="time" 
                    value={editData.deliveryTime || ""} 
                    onChange={(e) => setEditData({...editData, deliveryTime: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2cc17b] focus:border-transparent outline-none text-gray-900"
                  />
                </div>
              )}

              {editData.appType === 'Web/Android' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Web URL</label>
                  <input 
                    type="url" 
                    value={editData.webUrl || ""} 
                    onChange={(e) => setEditData({...editData, webUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2cc17b] focus:border-transparent outline-none text-gray-900"
                    placeholder="https://"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#2cc17b] hover:bg-[#25a86a] text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
