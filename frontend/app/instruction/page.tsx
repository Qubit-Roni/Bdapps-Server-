"use client";

import { fetchWithAuth } from "@/utils/fetchWithAuth";
import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";

export default function Instruction() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const [instructions, setInstructions] = useState([
    { label: "Allowed Host Address", value: "Loading..." },
    { label: "Message Receiving URL", value: "Loading..." },
    { label: "USSD Receiving URL", value: "Loading..." },
    { label: "Subscription Notification URL", value: "Loading..." },
  ]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/settings/integration-urls`);
        const data = await res.json();
        if (res.ok && data.success) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          setInstructions([
            { label: "Allowed Host Address", value: data.data.allowedHostAddress },
            { label: "Message Receiving URL", value: `${baseUrl}/api/v1/sms/message-receiving-url` },
            { label: "USSD Receiving URL", value: `${baseUrl}/api/v1/ussd/ussd-connection-url` },
            { label: "Subscription Notification URL", value: `${baseUrl}/api/v1/subscription/subscription-notification-url` },
          ]);
        }
      } catch (err) {
        console.error("Error fetching integration settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <PortalLayout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <h2 className="text-lg font-bold text-gray-800">API Integration Instructions</h2>
        </div>

        <div className="border-b border-gray-100 mb-6"></div>

        {/* Rows */}
        <div className="space-y-6">
          {instructions.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="md:w-1/3">
                <span className="text-[13px] font-bold text-gray-700">{item.label}</span>
              </div>
              
              <div className="md:w-1/2 relative">
                <input 
                  type="text" 
                  readOnly 
                  value={item.value} 
                  className="w-full bg-[#fafafa] text-[#d65576] text-sm px-4 py-3 rounded-lg border border-gray-200 font-mono focus:outline-none"
                />
              </div>

              <div className="md:w-auto">
                <button 
                  onClick={() => handleCopy(item.value, index)}
                  className="bg-[#2cc17b] hover:bg-[#25a86a] text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors w-full md:w-auto"
                >
                  {copiedIndex === index ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
        
        <div className="mt-12 mb-6">
          <div className="flex items-center gap-3 mb-6 border-t border-gray-100 pt-8">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">Web Application OTP Integration (Copy & Paste Code)</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* HTML Snippet */}
            <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm">
              <div className="flex justify-between items-center bg-[#2d2d2d] px-4 py-2">
                <span className="text-gray-300 text-xs font-mono">subscription.html (HTML Code)</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(htmlSnippet);
                    setCopiedIndex(98);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                  className="text-gray-300 hover:text-white flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded transition-colors"
                >
                  {copiedIndex === 98 ? "Copied!" : "Copy HTML"}
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-[#d4d4d4] text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {htmlSnippet}
                </pre>
              </div>
            </div>

            {/* JS Snippet */}
            <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm">
              <div className="flex justify-between items-center bg-[#2d2d2d] px-4 py-2">
                <span className="text-gray-300 text-xs font-mono">subscription.js (JavaScript Code)</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(jsSnippet);
                    setCopiedIndex(99);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                  className="text-gray-300 hover:text-white flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded transition-colors"
                >
                  {copiedIndex === 99 ? "Copied!" : "Copy Script"}
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-[#d4d4d4] text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {jsSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

const htmlSnippet = `<!-- আপনার ওয়েবসাইটের সাবস্ক্রিপশন পেজে এই HTML কোডটি বসাবেন -->
<div id="phoneSection">
    <p>Enter your Robi/Airtel number:</p>
    <input type="text" id="phoneNumber" placeholder="018XXXXXXXX" />
    <button onclick="sendOtp()">Send OTP</button>
</div>

<div id="otpSection" style="display:none;">
    <p>Enter 6-digit OTP:</p>
    <input type="text" id="otpCode" placeholder="OTP Code" />
    <button onclick="verifyOtp()">Verify & Subscribe</button>
</div>`;

const jsSnippet = `// এই জাভাস্ক্রিপ্ট কোডটি আপনার পেজের নিচে <script> ট্যাগের ভেতরে বসাবেন

// আপনার Qubit Server IP বা Domain এখানে বসাবেন
const SERVER_URL = "http://<YOUR_QUBIT_SERVER_IP>:8000"; 

// ⚠️ নিচে আপনার BDApps সার্ভিসের অরিজিনাল App ID এবং App API KEY (Password) বসাতে হবে ⚠️
const BDAPPS_APP_ID = "এখানে_BDApps_App_ID_বসাবেন"; 
const BDAPPS_PASSWORD = "এখানে_BDApps_App_API_KEY_বসাবেন"; 

let currentPhone = "";

async function sendOtp() {
    const phone = document.getElementById("phoneNumber").value;
    if(!phone) return alert("Please enter phone number!");
    
    try {
        const response = await fetch(\`\${SERVER_URL}/api/v1/otp/send\`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appId: BDAPPS_APP_ID, password: BDAPPS_PASSWORD, msisdn: phone })
        });
        const data = await response.json();
        
        if (data.success) {
            alert("OTP Sent!");
            currentPhone = phone;
            document.getElementById("phoneSection").style.display = "none";
            document.getElementById("otpSection").style.display = "block";
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) { alert("Server connection failed!"); }
}

async function verifyOtp() {
    const otp = document.getElementById("otpCode").value;
    if(!otp) return alert("Please enter OTP!");
    
    try {
        const response = await fetch(\`\${SERVER_URL}/api/v1/otp/verify\`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appId: BDAPPS_APP_ID, password: BDAPPS_PASSWORD, msisdn: currentPhone, otpCode: otp })
        });
        const data = await response.json();
        
        if (data.success) {
            alert("Subscription Successful!");
            // সাবস্ক্রাইব হয়ে গেলে ইউজারকে আপনার অ্যাপের মূল পেজে রিডাইরেক্ট করে দিন
            // window.location.href = "home.html"; 
        } else {
            alert("Invalid OTP!");
        }
    } catch (error) { alert("Verification failed!"); }
}`;
