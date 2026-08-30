"use client";

import { fetchWithAuth } from "@/utils/fetchWithAuth";
import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

export default function UssdLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedApp, setSelectedApp] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/ussd/logs`;
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (selectedApp) params.append("projectId", selectedApp);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await fetchWithAuth(url);
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : { success: false, message: "Server did not return a valid response" };
      
      if (res.ok && data.success) {
        setLogs(data.data);
      } else {
        toast.error(data.message || "Failed to fetch USSD logs");
      }
    } catch (err: any) {
      console.error("Error fetching USSD logs:", err);
      toast.error("USSD API Error: Could not connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApps = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/applications`);
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : { success: false, message: "Server did not return a valid response" };
      
      if (res.ok && data.success) {
        setApps(data.data);
      } else {
        toast.error("Projects API Error: " + (data.message || "Failed to fetch applications"));
      }
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      toast.error("Projects API Error: Could not connect to server.");
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedApp]);

  const filteredLogs = logs.filter(log => {
    const appInfo = apps.find(a => a._id === log.projectId);
    const displayAppId = appInfo ? appInfo.appId : log.projectId;
    
    return log.msisdn?.toLowerCase().includes(searchPhone.toLowerCase()) ||
           displayAppId?.toLowerCase().includes(searchPhone.toLowerCase());
  });

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("USSD Logs Report", 14, 15);
      
      const tableColumn = ["Sl", "Phone", "App ID", "Pressed", "Response", "Date"];
      const tableRows: any[] = [];

      filteredLogs.forEach((log, idx) => {
        const appInfo = apps.find(a => a._id === log.projectId);
        const displayAppId = appInfo ? appInfo.appId : log.projectId;
        
        const rowData = [
          idx + 1,
          log.msisdn || "-",
          displayAppId || "-",
          log.messageReceived || "-",
          log.responseSent || "-",
          log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 8 }
      });
      
      doc.save(`USSD_Logs_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-full mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#337ab7] to-[#286090] rounded-xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-white text-lg sm:text-xl font-bold tracking-wide">USSD Logs</h2>
            <p className="text-white/80 text-sm mt-1">
              Total Interactions: <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded ml-1">{filteredLogs.length}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 flex-wrap items-center">
            <button
              onClick={downloadPDF}
              className="bg-white text-[#286090] px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-gray-100 transition-colors"
            >
              Download PDF
            </button>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white text-gray-700"
              title="Start Date"
            />
            <span className="text-white hidden sm:inline text-sm">to</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white text-gray-700"
              title="End Date"
            />
            <select 
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white text-gray-700"
            >
              <option value="">All Applications</option>
              {apps.map(app => (
                <option key={app._id || app.appId} value={app._id}>{app.appId}</option>
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
                placeholder="search phone or app_id" 
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white text-gray-800 shadow-inner placeholder-gray-500 transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800">Sl</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800">Phone (MSISDN)</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800">App ID</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800">User Pressed</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800">Response Sent</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-xs md:text-[15px] font-bold text-gray-800">Date Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">Loading logs...</td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No USSD logs found.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 md:py-5 md:px-6 text-sm text-gray-600">{idx + 1}</td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-sm font-semibold text-gray-800">{log.msisdn}</td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-sm text-gray-600">
                        {apps.find(a => a._id === log.projectId)?.appId || log.projectId}
                      </td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-sm font-bold text-blue-600 text-center">
                        {log.messageReceived || '-'}
                      </td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-sm text-gray-700 max-w-xs whitespace-pre-wrap">
                        {log.responseSent}
                      </td>
                      <td className="py-3 px-4 md:py-5 md:px-6 text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
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
