"use client";


import { fetchWithAuth } from "@/utils/fetchWithAuth";
import PortalLayout from "@/components/PortalLayout";

import { useState, useEffect } from "react";

import Link from "next/link";


interface Notification {
  appId: string;
  appName: string;
  message: string;
  type: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/contents/notifications`);
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-md p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-bold tracking-wide">Action Required</h2>
              <p className="text-white/80 text-sm mt-1">
                You have {notifications.length} application{notifications.length !== 1 ? 's' : ''} requiring attention.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sm:p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
              <p className="text-gray-500 max-w-sm">
                Great job! All your applications have content scheduled for tomorrow and beyond.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-xl transition-colors gap-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-1 sm:mt-0">
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{notif.appName}</h4>
                      <p className="text-red-600/90 text-sm font-medium mt-1">{notif.message}</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto shrink-0">
                    <Link 
                      href="/all-content/new"
                      className="inline-block w-full sm:w-auto text-center px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg shadow transition-colors"
                    >
                      Add Content
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
}
