"use client";


import { fetchWithAuth } from "@/utils/fetchWithAuth";
import PortalLayout from "@/components/PortalLayout";

import Link from "next/link";

import { useState, useEffect, useRef } from "react";

import * as XLSX from "xlsx";


export default function AllContent() {
  const [apps, setApps] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedApp, setSelectedApp] = useState("all");

  // Edit Modal State
  const [editData, setEditData] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch applications for the dropdown
  useEffect(() => {
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
    
    fetchApps();
  }, []);

  // Fetch contents
  const fetchContents = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/contents`);
      const data = await res.json();
      if (res.ok && data.success) {
        let filteredData = data.data;

        // Apply local filtering
        if (selectedApp !== "all") {
          filteredData = filteredData.filter((c: any) => c.subKeyword === selectedApp);
        }
        if (startDate) {
          filteredData = filteredData.filter((c: any) => new Date(c.date) >= new Date(startDate));
        }
        if (endDate) {
          filteredData = filteredData.filter((c: any) => new Date(c.date) <= new Date(endDate));
        }

        setContents(filteredData);
      }
    } catch (err) {
      console.error("Error fetching contents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleSearch = () => {
    fetchContents();
  };

  // Delete Modal State
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);

  // Triggered when clicking delete on a row
  const handleDelete = (id: string) => {
    setContentToDelete(id);
  };

  // Actually delete the content
  const confirmDelete = async () => {
    if (!contentToDelete) return;
    
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/contents/${contentToDelete}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setContentToDelete(null);
        fetchContents();
      } else {
        alert("Failed to delete content.");
        setContentToDelete(null);
      }
    } catch (err) {
      console.error("Error deleting content:", err);
      alert("Error deleting content.");
      setContentToDelete(null);
    }
  };

  // Helper to format date strictly to YYYY-MM-DD for input type="date"
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      // If it's already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

      // Handle DD/MM/YYYY or DD-MM-YYYY
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length === 3) {
        // If year is the last part (e.g. 28/07/2026)
        if (parts[2].length === 4) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        // If year is the first part (e.g. 2026/07/28)
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
      }

      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return ""; // invalid date
      return d.toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

  // Open Edit Modal
  const handleEditOpen = (content: any) => {
    setEditData({
      ...content,
      date: formatDateForInput(content.date),
      subKeyword: content.subKeyword?.trim() || ""
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
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
        fetchContents();
      } else {
        alert("Failed to update content.");
      }
    } catch (err) {
      console.error("Error updating content:", err);
      alert("Error updating content.");
    }
  };

  const handleDownloadSample = () => {
    const ws = XLSX.utils.json_to_sheet([{ App_id: "", Date: "", Content: "" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, "content_sample.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      if (!json || json.length === 0) {
        alert("The uploaded file is empty or invalid. Please check the file.");
        return;
      }

      // Validate columns (check the first row keys)
      const firstRow = json[0] as any;
      const hasAppId = "App_id" in firstRow || "app_id" in firstRow || "App Id" in firstRow;
      const hasDate = "Date" in firstRow || "date" in firstRow;
      const hasContent = "Content" in firstRow || "content" in firstRow;

      if (!hasAppId || !hasDate || !hasContent) {
        alert("Invalid file format! The Excel file MUST have exactly these three columns: 'App_id', 'Date', and 'Content'. Please download the Sample File to see the correct format.");
        return;
      }

      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/contents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json)
      });
      
      if (res.ok) {
        alert("Contents uploaded successfully!");
        fetchContents();
      } else {
        alert("Failed to upload contents. The backend might have rejected it.");
      }
    } catch (err) {
      console.error("Error parsing file:", err);
      alert("Error parsing file. Ensure it is a valid Excel file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-full mx-auto space-y-6">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload}
        />

        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#2cc17b] to-[#25a86a] rounded-xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-white text-lg sm:text-xl font-bold tracking-wide">Content List</h2>
          
          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3">
            <button 
              onClick={handleDownloadSample}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#1f8f5a] border border-white/20 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-[#1a7a4c] transition-all duration-300 text-center flex items-center justify-center gap-2"
              title="Download Sample Excel File"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Sample File
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#25a86a] text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#25a86a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Batch Upload
                </>
              )}
            </button>
            <Link 
              href="/all-content/new"
              className="w-full sm:w-auto px-5 py-2.5 border-2 border-white/80 hover:bg-white hover:text-[#25a86a] text-white text-sm font-bold rounded-lg transition-all duration-300 text-center"
            >
              Create a New Content
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col md:flex-row items-end gap-4 md:gap-6 w-full">
          
          {/* Row 1 for Mobile: Start and End Dates */}
          <div className="flex flex-row w-full md:w-auto gap-3">
            <div className="flex flex-col flex-1 md:w-auto">
              <label className="text-[13px] md:text-sm font-bold text-gray-600 mb-1.5">Start:</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full md:w-48 px-2 md:px-4 py-2.5 bg-[#f8f9fa] border border-gray-200 rounded-lg text-[13px] md:text-base text-gray-700 focus:outline-none focus:border-[#2cc17b] focus:ring-1 focus:ring-[#2cc17b] transition-colors"
              />
            </div>

            <div className="flex flex-col flex-1 md:w-auto">
              <label className="text-[13px] md:text-sm font-bold text-gray-600 mb-1.5">End:</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full md:w-48 px-2 md:px-4 py-2.5 bg-[#f8f9fa] border border-gray-200 rounded-lg text-[13px] md:text-base text-gray-700 focus:outline-none focus:border-[#2cc17b] focus:ring-1 focus:ring-[#2cc17b] transition-colors"
              />
            </div>
          </div>

          {/* Row 2 for Mobile: App Id and Search */}
          <div className="flex flex-row w-full md:w-auto flex-1 gap-3 items-end">
            <div className="flex flex-col flex-1 md:w-auto md:max-w-xs">
              <label className="text-[13px] md:text-sm font-bold text-gray-600 mb-1.5">App Id:</label>
              <div className="relative">
                <select 
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value)}
                  className="w-full px-2 md:px-4 py-2.5 bg-[#f8f9fa] border border-gray-200 rounded-lg text-[13px] md:text-base text-gray-700 focus:outline-none focus:border-[#2cc17b] focus:ring-1 focus:ring-[#2cc17b] transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">All Apps</option>
                  {apps.map(app => (
                    <option key={app._id} value={app.appId}>{app.appId}</option>
                  ))}
                </select>
                <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSearch}
              className="w-auto px-4 md:px-8 py-2.5 bg-[#5cb85c] hover:bg-[#4cae4c] text-white text-[13px] md:text-base font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>

        </div>

        {/* Content Table Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="py-3 px-2 md:py-4 md:px-3 text-xs md:text-[15px] font-bold text-gray-800 w-[1%] whitespace-nowrap text-center">Sl</th>
                  <th className="py-3 px-2 md:py-4 md:px-3 text-xs md:text-[15px] font-bold text-gray-800 w-[1%] whitespace-nowrap text-center">App Id</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800 w-full text-left">Content</th>
                  <th className="py-3 px-2 md:py-4 md:px-3 text-xs md:text-[15px] font-bold text-gray-800 w-[1%] whitespace-nowrap text-center">Length</th>
                  <th className="py-3 px-2 md:py-4 md:px-3 text-xs md:text-[15px] font-bold text-gray-800 w-[1%] whitespace-nowrap text-center">Date</th>
                  <th className="py-3 px-2 md:py-4 md:px-3 text-xs md:text-[15px] font-bold text-gray-800 w-[1%] whitespace-nowrap text-center">Status</th>
                  <th className="py-3 px-2 md:py-4 md:px-3 text-xs md:text-[15px] font-bold text-gray-800 w-[1%] whitespace-nowrap text-center">Edit</th>
                  <th className="py-3 px-2 md:py-4 md:px-3 text-xs md:text-[15px] font-bold text-gray-800 w-[1%] whitespace-nowrap text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500 text-sm md:text-base">
                      Loading contents...
                    </td>
                  </tr>
                ) : contents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500 text-sm md:text-base">
                      No content found. Please search or create new content.
                    </td>
                  </tr>
                ) : (
                  contents.map((content, idx) => (
                    <tr key={content._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-2 md:py-5 md:px-3 text-xs md:text-base text-gray-600 text-center w-[1%] whitespace-nowrap">{idx + 1}</td>
                      <td className="py-3 px-2 md:py-5 md:px-3 text-xs md:text-base font-semibold text-gray-800 whitespace-nowrap text-center w-[1%]">{content.subKeyword}</td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-xs md:text-base text-gray-600 max-w-[200px] sm:max-w-md lg:max-w-2xl break-words whitespace-normal text-left">{content.contentBody}</td>
                      <td className="py-3 px-2 md:py-5 md:px-3 text-xs md:text-base text-gray-600 font-mono text-center w-[1%] whitespace-nowrap">{content.contentBody?.length || 0}</td>
                      <td className="py-3 px-2 md:py-5 md:px-3 text-xs md:text-base text-gray-600 whitespace-nowrap text-center w-[1%]">{content.date}</td>
                      <td className="py-3 px-2 md:py-5 md:px-3 text-xs md:text-base font-semibold text-center w-[1%] whitespace-nowrap">
                        {content.status === 'success' ? (
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded">Success</span>
                        ) : content.status === 'failed' ? (
                          <span className="text-red-600 bg-red-50 px-2 py-1 rounded">Failed</span>
                        ) : (
                          <span className="text-orange-400 bg-orange-50 px-2 py-1 rounded">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-2 md:py-5 md:px-3 text-xs md:text-base text-center w-[1%] whitespace-nowrap">
                        <button 
                          onClick={() => handleEditOpen(content)}
                          className="text-blue-500 hover:text-blue-700 p-1 mx-auto block" 
                          title="Edit"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </td>
                      <td className="py-3 px-2 md:py-5 md:px-3 text-xs md:text-base text-center w-[1%] whitespace-nowrap">
                        <button 
                          onClick={() => handleDelete(content._id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded mx-auto block" 
                          title="Delete"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-[#8B0000] font-bold text-sm md:text-base text-center mt-2">
          Note: Maximum length of a content is 300 characters.
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {contentToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Content?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this content? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setContentToDelete(null)}
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

      {/* Edit Modal / Page Overlay */}
      {isEditModalOpen && editData && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-gray-50 overflow-y-auto p-4 md:p-8">
          <div className="w-full max-w-3xl bg-white shadow-xl flex flex-col mt-4">
            
            {/* Header */}
            <div className="bg-[#4a8f4c] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Content</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-1.5 border border-white text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                All Content
              </button>
            </div>

            {/* Form Container with Red Border */}
            <div className="p-6">
              <div className="border border-[#f5c6cb] p-6 space-y-5">
                
                {/* Sub_keyword */}
                <div>
                  <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">Sub_keyword:</label>
                  <select 
                    value={editData.subKeyword || ""}
                    onChange={(e) => setEditData({...editData, subKeyword: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#4a8f4c] text-gray-800 text-sm md:text-base bg-white"
                  >
                    <option value="" disabled>Select an App ID</option>
                    {editData.subKeyword && !apps.find(a => a.appId === editData.subKeyword) && (
                      <option value={editData.subKeyword}>{editData.subKeyword}</option>
                    )}
                    {apps.map(app => (
                      <option key={app._id} value={app.appId}>{app.appId}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">Date:</label>
                  <input 
                    type="date"
                    value={editData.date || ""}
                    onChange={(e) => setEditData({...editData, date: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#4a8f4c] text-gray-800 text-sm md:text-base bg-white"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">Content:</label>
                  <textarea 
                    value={editData.contentBody || ""}
                    onChange={(e) => setEditData({...editData, contentBody: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#4a8f4c] h-40 resize-none text-gray-700 text-sm md:text-base"
                    maxLength={300}
                  />
                </div>

              </div>

              {/* Submit Button */}
              <button 
                onClick={handleEditSubmit}
                className="w-full mt-4 py-3 bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-bold rounded shadow-sm transition-colors text-center"
              >
                Update
              </button>
            </div>

          </div>
        </div>
      )}

    </PortalLayout>
  );
}
