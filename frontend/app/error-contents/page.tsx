"use client";


import { fetchWithAuth } from "@/utils/fetchWithAuth";
import PortalLayout from "@/components/PortalLayout";

import { useState, useEffect } from "react";


export default function ErrorContents() {
  const [contents, setContents] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState("");

  const fetchContents = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/contents`);
      const data = await res.json();
      if (res.ok && data.success) {
        // Filter only failed contents
        const failedContents = data.data.filter((c: any) => c.status === 'failed');
        setContents(failedContents);
      }
    } catch (err) {
      console.error("Error fetching contents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApps = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/applications`);
      const data = await res.json();
      if (res.ok && data.success) {
        setApps(data.data);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  useEffect(() => {
    fetchContents();
    fetchApps();
  }, []);

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.subKeyword?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          content.date?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesApp = selectedApp === "" || content.subKeyword === selectedApp;
    return matchesSearch && matchesApp;
  });

  return (
    <PortalLayout>
      <div className="max-w-full mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-white text-lg sm:text-xl font-bold tracking-wide">Error / Failed Contents</h2>
            <p className="text-white/80 text-sm mt-1">
              Total Failed Deliveries: <span className="font-bold text-red-600 bg-white px-2 py-0.5 rounded ml-1">{filteredContents.length}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            <select 
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white text-gray-700"
            >
              <option value="">All Applications</option>
              {apps.map(app => (
                <option key={app._id || app.appId} value={app.appId}>{app.appId}</option>
              ))}
            </select>
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="search app id or date" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white text-gray-800 shadow-inner placeholder-gray-500 transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-red-50 border-b border-red-100">
                  <th className="w-12 py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800">Sl</th>
                  <th className="w-32 py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800 whitespace-nowrap">App ID (Keyword)</th>
                  <th className="w-48 py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800 whitespace-nowrap">Failed At (Date & Time)</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800">Content Body</th>
                  <th className="w-24 py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">Loading error contents...</td>
                  </tr>
                ) : filteredContents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center align-middle">
                      <div className="flex flex-col items-center justify-center w-full">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-gray-600 font-semibold text-lg">Hooray! No failed contents.</p>
                        <p className="text-gray-400 text-sm mt-1">All your deliveries are going perfectly.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContents.map((content, idx) => (
                    <tr key={content._id} className="hover:bg-red-50/30 transition-colors">
                      <td className="py-3 px-4 md:py-5 md:px-6 text-sm text-gray-600">{idx + 1}</td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-sm font-semibold text-gray-800">{content.subKeyword}</td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-sm text-gray-600">
                        <div className="font-medium text-gray-800">
                          {new Date(content.updatedAt || content.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(content.updatedAt || content.createdAt).toLocaleTimeString()}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">Target: {content.date}</div>
                      </td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-sm text-gray-700 w-full">
                        <div className="max-h-24 overflow-y-auto pr-2 scrollbar-thin whitespace-pre-wrap text-xs md:text-sm">
                          {content.contentBody}
                        </div>
                      </td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-100 border border-red-200 px-2.5 py-1 rounded-md font-semibold text-xs shadow-sm">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          FAILED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
