"use client";


import { fetchWithAuth } from "@/utils/fetchWithAuth";
import PortalLayout from "@/components/PortalLayout";

import Link from "next/link";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";


export default function NewContent() {
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [subKeyword, setSubKeyword] = useState("");
  const [contents, setContents] = useState([{ date: "", contentBody: "" }]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch applications for the dropdown
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/applications`);
        const data = await res.json();
        if (res.ok && data.success) {
          setApps(data.data);
          if (data.data.length > 0) {
            setSubKeyword(data.data[0].appId); // Select first app by default
          }
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };
    
    fetchApps();
  }, []);

  // Fetch latest date when App ID changes
  useEffect(() => {
    if (!subKeyword) return;
    
    const fetchLatestDate = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/contents`);
        const data = await res.json();
        if (res.ok && data.success) {
          const appContents = data.data.filter((c: any) => c.subKeyword === subKeyword);
          
          let nextDateStr = new Date().toISOString().split('T')[0]; // Default to today
          
          if (appContents.length > 0) {
             // sort by date desc
             appContents.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
             const latestDate = appContents[0].date;
             
             const parsedLatest = new Date(latestDate);
             if (!isNaN(parsedLatest.getTime())) {
                parsedLatest.setDate(parsedLatest.getDate() + 1);
                nextDateStr = parsedLatest.toISOString().split('T')[0];
             }
          }
          
          // update the first row's date if there's only 1 empty row, or just update the first row
          setContents((prev) => {
            const newContents = [...prev];
            if (newContents.length === 1 && !newContents[0].contentBody) {
               newContents[0].date = nextDateStr;
            }
            return newContents;
          });
        }
      } catch (err) {
        console.error("Error fetching latest date:", err);
      }
    };
    
    fetchLatestDate();
  }, [subKeyword]);

  const handleAddMore = () => {
    let nextDate = new Date().toISOString().split('T')[0];
    if (contents.length > 0 && contents[contents.length - 1].date) {
        const lastDate = new Date(contents[contents.length - 1].date);
        if (!isNaN(lastDate.getTime())) {
            lastDate.setDate(lastDate.getDate() + 1);
            nextDate = lastDate.toISOString().split('T')[0];
        }
    }
    setContents([...contents, { date: nextDate, contentBody: "" }]);
  };

  const handleRemove = (index: number) => {
    const newContents = [...contents];
    newContents.splice(index, 1);
    setContents(newContents);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newContents = [...contents];
    if (field === "contentBody" && value.length > 300) {
      return; // Stop typing if > 300 chars
    }
    newContents[index] = { ...newContents[index], [field]: value };
    setContents(newContents);
  };

  const handleStore = async () => {
    // Basic validation
    if (!subKeyword) {
      alert("Please select a Sub_keyword");
      return;
    }
    
    for (let i = 0; i < contents.length; i++) {
      if (!contents[i].date || !contents[i].contentBody.trim()) {
        alert(`Please fill in all date and content fields for entry #${i + 1}`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/contents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subKeyword,
          contents
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/all-content");
      } else {
        alert("Error saving content: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save content.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto">
        
        <div className="text-red-700 font-semibold mb-4 text-sm">
          Note: Maximum length of a content is 300 characters.
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#39824c] to-[#409155] p-4 flex justify-between items-center">
            <h2 className="text-white font-bold tracking-wide">Create a New Content</h2>
            <Link 
              href="/all-content"
              className="px-4 py-1.5 border-2 border-white text-white text-sm font-bold hover:bg-white hover:text-[#39824c] transition-colors rounded-sm"
            >
              All Content
            </Link>
          </div>

          {/* Form Body */}
          <div className="p-6 md:p-8">
            
            {/* Sub Keyword */}
            <div className="mb-6 border border-pink-100 p-6 rounded-md shadow-sm bg-[#fafafa]">
              <label className="block text-sm font-bold text-gray-800 mb-2">Sub_keyword:</label>
              <div className="relative">
                <select 
                  value={subKeyword}
                  onChange={(e) => setSubKeyword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:border-[#409155] focus:ring-1 focus:ring-[#409155] appearance-none"
                >
                  <option value="" disabled>Select an App ID</option>
                  {apps.map(app => (
                    <option key={app._id} value={app.appId}>{app.appId}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Dynamic Content Rows */}
            {contents.map((item, index) => (
              <div key={index} className="mb-6 border border-gray-200 p-6 rounded-md shadow-sm relative bg-white">
                
                {contents.length > 1 && (
                  <button 
                    onClick={() => handleRemove(index)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded"
                  >
                    Remove
                  </button>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-800 mb-2">Date:</label>
                  <input 
                    type="date" 
                    value={item.date}
                    onChange={(e) => handleChange(index, "date", e.target.value)}
                    className="w-full md:w-64 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:border-[#409155] focus:ring-1 focus:ring-[#409155]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Content: <span className="text-gray-400 font-normal text-xs ml-2">({item.contentBody.length}/300)</span>
                  </label>
                  <textarea 
                    value={item.contentBody}
                    onChange={(e) => handleChange(index, "contentBody", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:border-[#409155] focus:ring-1 focus:ring-[#409155] resize-y"
                    placeholder="Enter your content here..."
                  ></textarea>
                </div>
              </div>
            ))}

            {/* More Button */}
            <div className="mb-8">
              <button 
                onClick={handleAddMore}
                className="px-6 py-2.5 bg-[#337ab7] hover:bg-[#286090] text-white text-sm font-medium shadow-sm transition-colors rounded-sm"
              >
                More
              </button>
            </div>

            {/* Store Button */}
            <button 
              onClick={handleStore}
              disabled={isSaving}
              className="w-full py-3.5 bg-[#5cb85c] hover:bg-[#4cae4c] disabled:bg-gray-400 text-white text-base font-bold shadow-sm transition-colors rounded-sm"
            >
              {isSaving ? "Saving..." : "Store"}
            </button>

          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
