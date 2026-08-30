"use client";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface Application {
  _id: string;
  appName: string;
  appId: string;
  appPassword?: string;
  developerId?: string;
}

export default function DeployCenter() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'nodejs' | 'php'>('nodejs');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/applications`);
        const data = await res.json();
        if (res.ok && data.success) {
          setApplications(data.data);
          if (data.data.length > 0) {
            setSelectedApp(data.data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleAppChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const appId = e.target.value;
    const app = applications.find(a => a._id === appId) || null;
    setSelectedApp(app);
  };

  const getVercelUrl = () => {
    if (!selectedApp) return "#";
    const repoUrl = language === 'nodejs' 
      ? "https://github.com/your-username/bdapps-bot-template"
      : "https://github.com/your-username/bdapps-bot-template-php";
    return `https://vercel.com/new/clone?repository-url=${encodeURIComponent(repoUrl)}&env=APP_ID,APP_PASSWORD`;
  };

  const getRenderUrl = () => {
    if (!selectedApp) return "#";
    const repoUrl = language === 'nodejs' 
      ? "https://github.com/your-username/bdapps-bot-template"
      : "https://github.com/your-username/bdapps-bot-template-php";
    return `https://render.com/deploy?repo=${encodeURIComponent(repoUrl)}`;
  };

  const generateNodeJsZip = (zip: JSZip) => {
    const indexJsContent = `require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const APP_ID = process.env.APP_ID;
const APP_PASSWORD = process.env.APP_PASSWORD;
const BDAPPS_SERVER_URL = process.env.BDAPPS_SERVER_URL || "http://localhost:4000";

app.post('/api/v1/sms/receive', (req, res) => {
    console.log("Received SMS:", req.body);
    res.status(200).json({ success: true, message: "Received" });
});

app.post('/api/subscribe', async (req, res) => {
    const { subscriberId } = req.body;
    try {
        const response = await axios.post(\`\${BDAPPS_SERVER_URL}/api/v1/subscription/send-otp\`, {
            applicationId: APP_ID,
            password: APP_PASSWORD,
            subscriberId: subscriberId,
            action: "1"
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    const { referenceNo, otp } = req.body; 
    try {
        const response = await axios.post(\`\${BDAPPS_SERVER_URL}/api/v1/subscription/verify-otp\`, {
            applicationId: APP_ID,
            password: APP_PASSWORD,
            referenceNo: referenceNo,
            otp: otp
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/send-sms', async (req, res) => {
    const { message, destinationAddresses } = req.body;
    try {
        const response = await axios.post(\`\${BDAPPS_SERVER_URL}/api/v1/sms/send\`, {
            applicationId: APP_ID,
            password: APP_PASSWORD,
            message: message,
            destinationAddresses: destinationAddresses
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(\`✅ Bot is running on port \${PORT}\`);
});
`;

    const packageJsonContent = `{
  "name": "bdapps-bot-template",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "dependencies": {
    "axios": "^1.6.8",
    "body-parser": "^1.20.2",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  }
}`;

    const envContent = `APP_ID=${selectedApp?.appId || ''}
APP_PASSWORD=${selectedApp?.appPassword || ''}
BDAPPS_SERVER_URL=${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}
PORT=3000
`;

    zip.file("index.js", indexJsContent);
    zip.file("package.json", packageJsonContent);
    zip.file(".env", envContent);
  };

  const generatePhpZip = (zip: JSZip) => {
    const configPhp = `<?php
define('APP_ID', '${selectedApp?.appId || ''}');
define('APP_PASSWORD', '${selectedApp?.appPassword || ''}');
define('BDAPPS_SERVER_URL', '${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}');

function makeRequest($endpoint, $payload) {
    $payload['applicationId'] = APP_ID;
    $payload['password'] = APP_PASSWORD;
    
    $ch = curl_init(BDAPPS_SERVER_URL . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}
?>`;

    const subscribePhp = `<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['subscriberId'])) {
    echo json_encode(['error' => 'subscriberId is required']);
    exit;
}

$payload = [
    'subscriberId' => $data['subscriberId'],
    'action' => "1"
];
echo makeRequest('/api/v1/subscription/send-otp', $payload);
?>`;

    const verifyPhp = `<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['referenceNo']) || !isset($data['otp'])) {
    echo json_encode(['error' => 'referenceNo and otp are required']);
    exit;
}

$payload = [
    'referenceNo' => $data['referenceNo'],
    'otp' => $data['otp']
];
echo makeRequest('/api/v1/subscription/verify-otp', $payload);
?>`;

    const sendSmsPhp = `<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$payload = [
    'message' => $data['message'],
    'destinationAddresses' => $data['destinationAddresses']
];
echo makeRequest('/api/v1/sms/send', $payload);
?>`;

    const webhookPhp = `<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);
// Process SMS here
echo json_encode(['success' => true, 'message' => 'Received']);
?>`;

    zip.file("config.php", configPhp);
    zip.file("api/subscribe.php", subscribePhp);
    zip.file("api/verify-otp.php", verifyPhp);
    zip.file("api/send-sms.php", sendSmsPhp);
    zip.file("api/webhook.php", webhookPhp);
  };

  const handleDownloadZip = () => {
    if (!selectedApp) return;

    const zip = new JSZip();
    
    if (language === 'nodejs') {
      generateNodeJsZip(zip);
    } else {
      generatePhpZip(zip);
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${selectedApp.appName.replace(/[^a-zA-Z0-9]/g, "_")}-bot-${language}.zip`);
    });
  };

  return (
    <PortalLayout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">Deployment Center</h2>
          </div>
          
          {/* Language Selector */}
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button 
              onClick={() => setLanguage('nodejs')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${language === 'nodejs' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Node.js
            </button>
            <button 
              onClick={() => setLanguage('php')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${language === 'php' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              PHP
            </button>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm mb-8">Deploy your BDApps bot in 1-click to your preferred hosting provider, or download the source code to host it yourself.</p>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Application</label>
          {loading ? (
            <div className="h-10 bg-gray-100 animate-pulse rounded-lg w-full max-w-md"></div>
          ) : (
            <select 
              className="w-full max-w-md bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedApp?._id || ''}
              onChange={handleAppChange}
            >
              {applications.length === 0 ? (
                <option value="" disabled>No applications found</option>
              ) : (
                applications.map(app => (
                  <option key={app._id} value={app._id}>{app.appName}</option>
                ))
              )}
            </select>
          )}
        </div>

        {selectedApp ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            
            {/* Vercel */}
            <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-black text-white p-2 rounded-lg">
                    <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#ffffff"/></svg>
                  </div>
                  <h3 className="font-bold text-gray-800">Deploy to Vercel</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">1-Click deploy to Vercel. Ideal for {language === 'nodejs' ? 'Node.js APIs' : 'PHP Serverless'}. APP_ID and APP_PASSWORD will be configured automatically.</p>
              </div>
              <a href={getVercelUrl()} target="_blank" rel="noopener noreferrer" className="bg-black hover:bg-gray-800 text-white text-center py-2.5 rounded-lg font-medium transition-colors">
                Deploy {language === 'nodejs' ? 'Node.js' : 'PHP'} with Vercel
              </a>
            </div>

            {/* Render */}
            <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#46E3B7] p-2 rounded-lg">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg"><path d="M22 6L12 2L2 6V18L12 22L22 18V6Z" fill="#ffffff"/></svg>
                  </div>
                  <h3 className="font-bold text-gray-800">Deploy to Render</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Deploy to Render's free tier. You'll need to set the Environment Variables manually during deployment.</p>
              </div>
              <a 
                href={getRenderUrl()} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => {
                  const creds = `APP_ID=${selectedApp.appId}\nAPP_PASSWORD=${selectedApp.appPassword}`;
                  navigator.clipboard.writeText(creds);
                  alert("Render doesn't support automatic keys, so we copied your APP_ID and APP_PASSWORD to your clipboard. Just paste them when Render asks!");
                }}
                className="bg-[#46E3B7] hover:bg-[#3bc29c] text-white text-center py-2.5 rounded-lg font-medium transition-colors"
              >
                Deploy {language === 'nodejs' ? 'Node.js' : 'PHP'} with Render
              </a>
            </div>

            {/* ZIP / cPanel */}
            <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500 text-white p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <h3 className="font-bold text-gray-800">Download for cPanel / VPS</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Download the complete {language === 'nodejs' ? 'Node.js' : 'PHP'} bot code with your App ID and Password pre-configured.</p>
              </div>
              <button onClick={handleDownloadZip} className="bg-blue-500 hover:bg-blue-600 text-white text-center py-2.5 rounded-lg font-medium transition-colors">
                Download {language === 'nodejs' ? 'Node.js' : 'PHP'} ZIP
              </button>
            </div>

            {/* Docker */}
            <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#2496ED] text-white p-2 rounded-lg">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.9818 10.9858L9.0436 10.9858V12.1818H12.9818V10.9858ZM14.9382 10.9858L18.8764 10.9858V12.1818H14.9382V10.9858ZM9.0436 12.8727H12.9818V14.0687H9.0436V12.8727ZM18.8764 12.8727H14.9382V14.0687H18.8764V12.8727ZM7.0872 10.9858L3.149 10.9858V12.1818H7.0872V10.9858ZM3.149 12.8727H7.0872V14.0687H3.149V12.8727ZM9.0436 14.76H12.9818V15.956H9.0436V14.76ZM18.8764 14.76H14.9382V15.956H18.8764V14.76ZM7.0872 14.76H3.149V15.956H7.0872V14.76ZM14.9382 9.0988L18.8764 9.0988V10.2948H14.9382V9.0988ZM9.0436 9.0988L12.9818 9.0988V10.2948H9.0436V9.0988ZM7.0872 9.0988L3.149 9.0988V10.2948H7.0872V9.0988ZM11.0072 6.50553H14.9454V7.70153H11.0072V6.50553ZM16.9018 6.50553H20.84V7.70153H16.9018V6.50553ZM5.1126 6.50553H9.0508V7.70153H5.1126V6.50553ZM20.84 8.39243H16.9018V9.58843H20.84V8.39243ZM14.9454 8.39243H11.0072V9.58843H14.9454V8.39243ZM9.0508 8.39243H5.1126V9.58843H9.0508V8.39243Z" fill="white"/><path d="M2.84478 17.5855C1.19658 17.0706 0 15.5392 0 13.7291C0 11.4586 1.83909 9.61775 4.10741 9.61775C4.24432 9.61775 4.37894 9.62473 4.51098 9.63821C4.94052 7.78857 6.6025 6.38883 8.57143 6.38883C10.5186 6.38883 12.1637 7.75549 12.6105 9.57019C12.7845 9.54902 12.9621 9.53798 13.1429 9.53798C15.3401 9.53798 17.1214 11.3193 17.1214 13.5165C17.1214 15.3431 15.8943 16.8833 14.1952 17.371L14.2857 18H2.7483L2.84478 17.5855Z" fill="white"/></svg>
                  </div>
                  <h3 className="font-bold text-gray-800">Docker Run Command</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Run your bot instantly on any VPS that has Docker installed using this single command.</p>
              </div>
              <div className="bg-[#1e1e1e] rounded flex items-center justify-between p-2">
                <code className="text-[#46E3B7] text-xs font-mono truncate mr-2 flex-1">
                  {language === 'nodejs' 
                    ? `docker run -d -p 3000:3000 -e APP_ID=${selectedApp.appId} -e APP_PASSWORD=${selectedApp.appPassword} my-bdapps-bot`
                    : `docker run -d -p 80:80 -e APP_ID=${selectedApp.appId} -e APP_PASSWORD=${selectedApp.appPassword} php:apache`
                  }
                </code>
                <button 
                  onClick={() => {
                    const cmd = language === 'nodejs'
                      ? `docker run -d -p 3000:3000 -e APP_ID=${selectedApp.appId} -e APP_PASSWORD=${selectedApp.appPassword} my-bdapps-bot`
                      : `docker run -d -p 80:80 -e APP_ID=${selectedApp.appId} -e APP_PASSWORD=${selectedApp.appPassword} php:apache`;
                    navigator.clipboard.writeText(cmd);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center flex flex-col items-center justify-center">
            <div className="bg-gray-200 p-4 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Application Selected</h3>
            <p className="text-gray-500 text-sm max-w-md">
              You haven't created any BDApps applications yet. Please go to <strong>Application ➔ New</strong> from the sidebar to create your first application. Once created, the deployment options will appear here automatically!
            </p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
