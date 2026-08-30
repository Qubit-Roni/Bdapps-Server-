"use client";


import { fetchWithAuth } from "@/utils/fetchWithAuth";
import PortalLayout from "@/components/PortalLayout";

import { useState, useEffect } from "react";

import Link from "next/link";


export default function Dashboard() {
  const [apps, setApps] = useState<any[]>([]);
  const [proCount, setProCount] = useState<number | null>(null);
  const [webCount, setWebCount] = useState<number | null>(null);
  
  const [todayContents, setTodayContents] = useState<any[]>([]);
  const [yesterdayContents, setYesterdayContents] = useState<any[]>([]);
  const [tomorrowContents, setTomorrowContents] = useState<any[]>([]);
  const [isLoadingContents, setIsLoadingContents] = useState(true);

  // Edit/Delete Modals state
  const [editData, setEditData] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      // Fetch Apps
      const appsRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/applications`);
      const appsData = await appsRes.json();
      if (appsRes.ok && appsData.success) {
        setApps(appsData.data);
        setProCount(appsData.data.filter((a: any) => a.appType === "Pro").length);
        setWebCount(appsData.data.filter((a: any) => a.appType === "Web/Android").length);
      }

      // Fetch Contents
      const contentsRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/contents`);
      const contentsData = await contentsRes.json();
      if (contentsRes.ok && contentsData.success) {
        const contents = contentsData.data;

        const getFormattedDate = (d: Date) => {
          return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
        };

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStr = getFormattedDate(today);
        const yesterdayStr = getFormattedDate(yesterday);
        const tomorrowStr = getFormattedDate(tomorrow);

        const parseDate = (cDate: string) => {
          if (!cDate) return "";
          if (/^\d{4}-\d{2}-\d{2}$/.test(cDate)) return cDate;
          const parts = cDate.split(/[\/\-]/);
          if (parts.length === 3 && parts[2].length === 4) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
          return cDate;
        };

        setTodayContents(contents.filter((c: any) => parseDate(c.date) === todayStr));
        setYesterdayContents(contents.filter((c: any) => parseDate(c.date) === yesterdayStr));
        setTomorrowContents(contents.filter((c: any) => parseDate(c.date) === tomorrowStr));
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoadingContents(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // DELETE
  const handleDelete = (id: string) => setContentToDelete(id);
  const confirmDelete = async () => {
    if (!contentToDelete) return;
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/contents/${contentToDelete}`, { method: "DELETE" });
      if (res.ok) {
        fetchDashboardData();
      } else alert("Failed to delete content.");
    } catch (err) {
      alert("Error deleting content.");
    } finally {
      setContentToDelete(null);
    }
  };

  // EDIT
  const handleEditOpen = (content: any) => {
    setEditData({ ...content, subKeyword: content.subKeyword?.trim() || "" });
    setIsEditModalOpen(true);
  };
  const handleEditSubmit = async () => {
    if (!editData) return;
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/contents/${editData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subKeyword: editData.subKeyword,
          date: editData.date,
          contentBody: editData.contentBody
        })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchDashboardData();
      } else alert("Failed to update content.");
    } catch (err) {
      alert("Error updating content.");
    }
  };

  // Stats Helpers
  const getStats = (list: any[]) => ({
    total: list.length,
    sent: list.filter(c => c.status === 'success').length,
    pending: list.filter(c => c.status === 'pending' || !c.status).length,
    failed: list.filter(c => c.status === 'failed').length,
  });

  const todayStats = getStats(todayContents);
  const yesterdayStats = getStats(yesterdayContents);
  const tomorrowStats = getStats(tomorrowContents);

  return (
    <PortalLayout>
      <div className="max-w-full mx-auto pb-10">

        {/* Top 2 Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-2">
          {/* Pro App */}
          <button className="bg-gradient-to-r from-[#2cc17b] to-[#1f8f5a] rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 text-left">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold tracking-tight">Pro App</h3>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm rounded-xl px-5 py-2 min-w-[60px]">
                <span className="text-white text-2xl font-extrabold leading-none">{proCount === null ? "..." : proCount}</span>
                <span className="text-white/70 text-xs font-medium">Hosted</span>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
          </button>

          {/* Web/Android App */}
          <button className="bg-gradient-to-r from-[#6978e8] to-[#5563c1] rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 text-left">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold tracking-tight">Web / Android App</h3>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm rounded-xl px-5 py-2 min-w-[60px]">
                <span className="text-white text-2xl font-extrabold leading-none">{webCount === null ? "..." : webCount}</span>
                <span className="text-white/70 text-xs font-medium">Hosted</span>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
          </button>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT SIDEBAR */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-4">
            
            {/* Today's Content Stats */}
            <div className="border border-gray-200 rounded overflow-hidden shadow-sm bg-white">
              <div className="bg-[#e2f0d9] px-4 py-3 border-b border-gray-200">
                <h3 className="text-[#4a6b38] font-semibold text-sm">Today's Content</h3>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                <div className="bg-[#337ab7] text-white text-xs px-2.5 py-1.5 rounded-sm font-semibold flex gap-1.5 items-center">
                  <span>Total</span> <span className="bg-white text-[#337ab7] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{todayStats.total}</span>
                </div>
                <div className="bg-[#5cb85c] text-white text-xs px-2.5 py-1.5 rounded-sm font-semibold flex gap-1.5 items-center">
                  <span>Sent</span> <span className="bg-white text-[#5cb85c] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{todayStats.sent}</span>
                </div>
                <div className="bg-[#f0ad4e] text-white text-xs px-2.5 py-1.5 rounded-sm font-semibold flex gap-1.5 items-center">
                  <span>Pending</span> <span className="bg-white text-[#f0ad4e] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{todayStats.pending}</span>
                </div>
                <div className="bg-[#d9534f] text-white text-xs px-2.5 py-1.5 rounded-sm font-semibold flex gap-1.5 items-center">
                  <span>Failed</span> <span className="bg-white text-[#d9534f] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{todayStats.failed}</span>
                </div>
              </div>
            </div>

            {/* Yesterday's Content Stats */}
            <div className="border border-gray-200 rounded overflow-hidden shadow-sm bg-white">
              <div className="bg-[#e2f0d9] px-4 py-3 border-b border-gray-200">
                <h3 className="text-[#4a6b38] font-semibold text-sm">Yesterday's Content</h3>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                <div className="bg-[#337ab7] text-white text-xs px-2.5 py-1.5 rounded-sm font-semibold flex gap-1.5 items-center">
                  <span>Total</span> <span className="bg-white text-[#337ab7] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{yesterdayStats.total}</span>
                </div>
                <div className="bg-[#5cb85c] text-white text-xs px-2.5 py-1.5 rounded-sm font-semibold flex gap-1.5 items-center">
                  <span>Sent</span> <span className="bg-white text-[#5cb85c] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{yesterdayStats.sent}</span>
                </div>
                <div className="bg-[#f0ad4e] text-white text-xs px-2.5 py-1.5 rounded-sm font-semibold flex gap-1.5 items-center">
                  <span>Pending</span> <span className="bg-white text-[#f0ad4e] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{yesterdayStats.pending}</span>
                </div>
                <div className="bg-[#d9534f] text-white text-xs px-2.5 py-1.5 rounded-sm font-semibold flex gap-1.5 items-center">
                  <span>Failed</span> <span className="bg-white text-[#d9534f] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{yesterdayStats.failed}</span>
                </div>
              </div>
            </div>

            {/* Tomorrow's Content Stats */}
            <div className="border border-gray-200 rounded overflow-hidden shadow-sm bg-white">
              <div className="bg-[#e2f0d9] px-4 py-3 border-b border-gray-200">
                <h3 className="text-[#4a6b38] font-semibold text-sm">Tomorrow's Content</h3>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                <div className="bg-[#337ab7] text-white text-xs px-2.5 py-1.5 rounded-sm font-semibold flex gap-1.5 items-center">
                  <span>Total</span> <span className="bg-white text-[#337ab7] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{tomorrowStats.total}</span>
                </div>
              </div>
            </div>

            {/* Keyword & Time */}
            <div className="border border-gray-200 rounded overflow-hidden shadow-sm bg-white">
              <div className="bg-[#e2f0d9] px-4 py-3 border-b border-gray-200">
                <h3 className="text-[#4a6b38] font-semibold text-sm">Keyword & Time</h3>
              </div>
              <div className="p-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 px-2 font-bold text-gray-700">#</th>
                      <th className="py-2 px-2 font-bold text-gray-700">App Id</th>
                      <th className="py-2 px-2 font-bold text-gray-700">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-gray-500">No Apps</td>
                      </tr>
                    ) : apps.map((app, idx) => (
                      <tr key={app._id} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 px-2 text-gray-600">{idx + 1}</td>
                        <td className="py-2 px-2 text-gray-800">{app.appId}</td>
                        <td className="py-2 px-2 text-gray-600">18:00:00</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE (TABLES) */}
          <div className="flex-1 space-y-6">
            
            {/* Today's Content Table */}
            <div className="border border-gray-200 rounded overflow-hidden shadow-sm bg-white">
              <div className="bg-[#3c763d] px-4 py-2.5">
                <h3 className="text-white font-bold text-sm">Today's Content</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-2.5 px-4 font-bold text-gray-800 text-xs">App Id</th>
                      <th className="py-2.5 px-4 font-bold text-gray-800 text-xs w-full whitespace-normal min-w-[200px]">Content</th>
                      <th className="py-2.5 px-4 font-bold text-gray-800 text-xs text-center">Length</th>
                      <th className="py-2.5 px-4 font-bold text-gray-800 text-xs text-center">Status</th>
                      <th className="py-2.5 px-4 font-bold text-gray-800 text-xs text-center">Edit</th>
                      <th className="py-2.5 px-4 font-bold text-gray-800 text-xs text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingContents ? (
                      <tr><td colSpan={6} className="text-center py-6 text-gray-500 text-xs">Loading...</td></tr>
                    ) : todayContents.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-6 text-gray-500 text-xs">No content found</td></tr>
                    ) : todayContents.map((content) => (
                      <tr key={content._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700 text-xs">{content.subKeyword}</td>
                        <td className="py-3 px-4 text-gray-600 whitespace-normal text-xs">{content.contentBody}</td>
                        <td className="py-3 px-4 text-gray-600 text-center text-xs">{content.contentBody?.length || 0}</td>
                        <td className="py-3 px-4 text-center">
                          {content.status === 'success' ? (
                            <span className="text-[#5cb85c] text-xs font-semibold">Success</span>
                          ) : content.status === 'failed' ? (
                            <span className="text-[#d9534f] text-xs font-semibold">Failed</span>
                          ) : (
                            <span className="text-[#f0ad4e] text-xs font-semibold">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleEditOpen(content)} className="text-blue-500 hover:text-blue-700">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleDelete(content._id)} className="text-white bg-[#d9534f] rounded-sm p-1 hover:bg-red-700">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tomorrow's Content Table */}
            <div className="border border-gray-200 rounded overflow-hidden shadow-sm bg-white">
              <div className="bg-[#3c763d] px-4 py-2.5">
                <h3 className="text-white font-bold text-sm">Tomorrow's Content</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-2.5 px-4 font-bold text-gray-800 text-xs">App Id</th>
                      <th className="py-2.5 px-4 font-bold text-gray-800 text-xs w-full whitespace-normal min-w-[200px]">Content</th>
                      <th className="py-2.5 px-4 font-bold text-gray-800 text-xs text-center">Length</th>
                      <th className="py-2.5 px-4 font-bold text-gray-800 text-xs text-center">Edit</th>
                      <th className="py-2.5 px-4 font-bold text-gray-800 text-xs text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingContents ? (
                      <tr><td colSpan={5} className="text-center py-6 text-gray-500 text-xs">Loading...</td></tr>
                    ) : tomorrowContents.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-6 text-gray-500 text-xs">No content found</td></tr>
                    ) : tomorrowContents.map((content) => (
                      <tr key={content._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700 text-xs">{content.subKeyword}</td>
                        <td className="py-3 px-4 text-gray-600 whitespace-normal text-xs">{content.contentBody}</td>
                        <td className="py-3 px-4 text-gray-600 text-center text-xs">{content.contentBody?.length || 0}</td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleEditOpen(content)} className="text-blue-500 hover:text-blue-700">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleDelete(content._id)} className="text-white bg-[#d9534f] rounded-sm p-1 hover:bg-red-700">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-[#8B0000] font-bold text-[13px] md:text-sm mt-2">
              Note: Maximum length of a content is 300 characters.
            </div>

          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {contentToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Content?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this content?</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setContentToDelete(null)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-sm transition-colors">Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editData && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-gray-50 overflow-y-auto p-4 md:p-8">
          <div className="w-full max-w-3xl bg-white shadow-xl flex flex-col mt-4">
            <div className="bg-[#4a8f4c] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Content</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-1.5 border border-white text-white text-sm font-semibold hover:bg-white/10 transition-colors">Close</button>
            </div>
            <div className="p-6">
              <div className="border border-[#f5c6cb] p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Sub_keyword:</label>
                  <select 
                    value={editData.subKeyword || ""}
                    onChange={(e) => setEditData({...editData, subKeyword: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#4a8f4c] text-gray-800 bg-white"
                  >
                    <option value="" disabled>Select an App ID</option>
                    {editData.subKeyword && !apps.find(a => a.appId === editData.subKeyword) && <option value={editData.subKeyword}>{editData.subKeyword}</option>}
                    {apps.map(app => <option key={app._id} value={app.appId}>{app.appId}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Date:</label>
                  <input 
                    type="date" value={editData.date || ""}
                    onChange={(e) => setEditData({...editData, date: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#4a8f4c] text-gray-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Content:</label>
                  <textarea 
                    value={editData.contentBody || ""}
                    onChange={(e) => setEditData({...editData, contentBody: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#4a8f4c] h-40 resize-none text-gray-700"
                    maxLength={300}
                  />
                </div>
              </div>
              <button onClick={handleEditSubmit} className="w-full mt-4 py-3 bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-bold rounded shadow-sm transition-colors text-center">
                Update
              </button>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
