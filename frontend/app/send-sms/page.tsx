"use client";


import { fetchWithAuth } from "@/utils/fetchWithAuth";
import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";


export default function SendSmsTest() {
  const [apps, setApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState("");
  
  // Tabs: 'single' | 'broadcast'
  const [mode, setMode] = useState<'single' | 'broadcast'>('single');
  
  const [msisdn, setMsisdn] = useState("tel:BGD");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseLog, setResponseLog] = useState<any>(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/applications`);
        const isJson = res.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await res.json() : { success: false, message: "Server did not return a valid response" };
        
        if (res.ok && data.success) {
          setApps(data.data);
          if (data.data.length > 0) {
            setSelectedApp(data.data[0]._id);
          }
        } else {
          toast.error("Projects API Error: " + (data.message || "Failed to fetch applications"));
        }
      } catch (err: any) {
        console.error("Error fetching apps:", err);
        toast.error("Projects API Error: Could not connect to server.");
      }
    };
    fetchApps();
  }, []);

  const handleSendSingle = async () => {
    if (!selectedApp || !msisdn || !message) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    setResponseLog(null);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedApp,
          msisdn: msisdn,
          message: message,
        }),
      });
      
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : { success: false, message: "Server did not return a valid response" };
      
      setResponseLog(data);
      if (!res.ok || !data.success) {
        toast.error("SMS API Error: " + (data.message || "Failed to send SMS"));
      } else {
        toast.success("SMS sent successfully!");
      }
    } catch (err: any) {
      setResponseLog({ success: false, message: err.message });
      toast.error("SMS API Error: Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!selectedApp || !message) {
      alert("Please fill the message field");
      return;
    }

    setLoading(true);
    setResponseLog(null);

    try {
      // Step 1: Fetch all active subscribers
      setResponseLog({ status: "Fetching active subscribers..." });
      const subRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/subscription/active/${selectedApp}`);
      const subData = await subRes.json();
      
      if (!subRes.ok || !subData.success) {
        throw new Error(subData.message || "Failed to fetch subscribers");
      }

      const msisdns = subData.data || [];
      if (msisdns.length === 0) {
        setResponseLog({ success: false, message: "No active subscribers found for this application." });
        setLoading(false);
        return;
      }

      setResponseLog({ status: `Found ${msisdns.length} active subscribers. Sending broadcast...` });

      // Step 2: Send bulk SMS
      const sendRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/sms/bulk-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedApp,
          msisdns: msisdns,
          message: message,
        }),
      });
      
      const isJson = sendRes.headers.get("content-type")?.includes("application/json");
      const sendData = isJson ? await sendRes.json() : { success: false, message: "Server did not return a valid response" };
      
      setResponseLog(sendData);
      if (!sendRes.ok || !sendData.success) {
        toast.error("SMS API Error: " + (sendData.message || "Failed to send broadcast"));
      } else {
        toast.success("Broadcast sent successfully!");
      }
    } catch (err: any) {
      setResponseLog({ success: false, message: err.message });
      toast.error("SMS API Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-[22px] font-semibold text-gray-800 mb-2">SMS Content Delivery</h2>
        <p className="text-gray-500 mb-6 text-sm">Send instant content to a single number or broadcast to all active subscribers.</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setMode('single')}
              className={`flex-1 py-4 text-sm md:text-base font-medium transition-colors ${mode === 'single' ? 'bg-[#f0fdf6] text-[#1f8f5a] border-b-2 border-[#1f8f5a]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Send Single SMS
            </button>
            <button 
              onClick={() => setMode('broadcast')}
              className={`flex-1 py-4 text-sm md:text-base font-medium transition-colors ${mode === 'broadcast' ? 'bg-[#eff2ff] text-[#5563c1] border-b-2 border-[#5563c1]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Broadcast (All Subscribers)
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Select App */}
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Select Application</label>
              <select 
                value={selectedApp} 
                onChange={(e) => setSelectedApp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2cc17b] focus:border-transparent outline-none bg-gray-50 text-gray-900 text-sm md:text-base"
              >
                {apps.map(app => (
                  <option key={app._id} value={app._id}>{app.appId} ({app.appType})</option>
                ))}
              </select>
            </div>

            {/* MSISDN (Only for Single Mode) */}
            {mode === 'single' && (
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Mobile Number (Format: tel:BGD018XXXXXXX)</label>
                <input 
                  type="text" 
                  value={msisdn}
                  onChange={(e) => setMsisdn(e.target.value)}
                  placeholder="tel:BGD018XXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2cc17b] focus:border-transparent outline-none bg-gray-50 text-gray-900 text-sm md:text-base"
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Content / Message</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your content here..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2cc17b] focus:border-transparent outline-none bg-gray-50 text-gray-900 resize-none text-sm md:text-base"
              />
            </div>

            {mode === 'single' ? (
              <button 
                onClick={handleSendSingle}
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white text-sm md:text-base font-medium transition-all ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#2cc17b] to-[#1f8f5a] hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {loading ? "Sending..." : "Send SMS"}
              </button>
            ) : (
              <button 
                onClick={handleBroadcast}
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white text-sm md:text-base font-medium transition-all ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#6978e8] to-[#5563c1] hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {loading ? "Processing Broadcast..." : "Broadcast to All Subscribers"}
              </button>
            )}
          </div>
        </div>

        {/* Response Box */}
        {responseLog && (
          <div className={`mt-6 p-4 rounded-xl border ${responseLog.success === false ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
            <h3 className={`font-semibold text-sm mb-2 ${responseLog.success === false ? 'text-red-800' : 'text-blue-800'}`}>
              System Response:
            </h3>
            <pre className="text-xs bg-white p-3 rounded-lg overflow-x-auto text-gray-700 border border-gray-100 shadow-inner">
              {JSON.stringify(responseLog, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
