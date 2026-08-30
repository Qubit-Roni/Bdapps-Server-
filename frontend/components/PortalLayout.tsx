"use client";


import { fetchWithAuth } from "@/utils/fetchWithAuth";
import Link from "next/link";

import { useState, useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";


export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("user");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    const role = localStorage.getItem("userRole") || "user";
    setUserName(name);
    setUserRole(role);

    const fetchNotifs = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/contents/notifications`);
        const data = await res.json();
        if (res.ok && data.success) {
          setNotificationCount(data.count || 0);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifs();

    if (role === "admin" || role === "super_admin") {
      const fetchPendingUsers = async () => {
        try {
          const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/users`);
          const data = await res.json();
          if (res.ok && data.success) {
            const pendingCount = data.users?.filter((u: any) => u.status === 'pending').length || 0;
            setPendingUsersCount(pendingCount);
          }
        } catch (err) {
          console.error("Error fetching pending users:", err);
        }
      };
      fetchPendingUsers();
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setShowLogoutModal(false);
    router.push("/");
  };

  const getPageName = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/instruction") return "Instruction";
    return "Portal";
  };

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />, isFill: true },
    { name: "Instruction", href: "/instruction", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />, isFill: false },
    { 
      name: "Application", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />, 
      isFill: false,
      subLinks: [
        { name: "List", href: "/application/list" },
        { name: "New", href: "/application/new" }
      ]
    },
    { 
      name: "All Content", 
      href: "/all-content", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />, 
      isFill: false 
    },
    { 
      name: "Error Contents", 
      href: "/error-contents", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />, 
      isFill: false 
    },
    { name: "FAQ Generator", href: "/faq-generator", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />, isFill: false },
    { 
      name: "Logs", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />, 
      isFill: false,
      subLinks: [
        { name: "Subscription", href: "/subscription-log" },
        { name: "SMS", href: "/sms-log" },
        { name: "OTP", href: "/otp-logs" },
        { name: "USSD", href: "/ussd-log" }
      ]
    },
    { 
      name: "Deploy Center", 
      href: "/deploy", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />, 
      isFill: false 
    },
    { name: "Notifications", href: "/notifications", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />, isFill: false },
    { name: "Send SMS (Testing)", href: "/send-sms", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />, isFill: false }
  ];

  if (userRole === "admin" || userRole === "super_admin") {
    navLinks.push({
      name: "User Approval",
      href: "/approvals",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      isFill: false
    });
  }

  navLinks.push({ 
    name: "Settings", href: "/settings", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />, isFill: false 
  });

  const toggleMenu = (menuName: string) => {
    if (openMenu === menuName) {
      setOpenMenu(null);
    } else {
      setOpenMenu(menuName);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f5f6fa] font-sans overflow-hidden">
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 w-[260px] bg-[#222222] transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none`}
        >
          {/* Mobile Close Button */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-white/50 hover:text-white md:hidden"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo Area */}
          <div className="h-[60px] bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex items-center justify-center shrink-0 relative overflow-hidden group">
            {/* Glassy glow behind text */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <h1 className="text-3xl font-black tracking-widest uppercase relative z-10 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm animate-text-gradient">
              Qubit
            </h1>
          </div>

          {/* Profile Card */}
          <div className="p-4 shrink-0">
            <div className="bg-gradient-to-br from-[#1f8f5a] via-[#25a86a] to-[#84fab0] rounded-xl p-5 flex flex-col items-center justify-center shadow-lg">
              <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center mb-2">
                <span className="text-white font-semibold text-lg">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-white text-sm font-semibold text-center truncate max-w-[160px]">{userName}</div>
              <div className="text-white/70 text-[10px] tracking-widest mt-1 uppercase">{userRole}</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-2 pb-24 space-y-1 overflow-y-auto">
            {navLinks.map((link) => {
              if (link.subLinks) {
                const isOpen = openMenu === link.name;
                return (
                  <div key={link.name} className="flex flex-col">
                    <button 
                      onClick={() => toggleMenu(link.name)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg group transition-colors text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill={link.isFill ? "currentColor" : "none"} viewBox="0 0 24 24" stroke={!link.isFill ? "currentColor" : "none"}>
                          {link.icon}
                        </svg>
                        <span className="text-sm font-medium">{link.name}</span>
                      </div>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isOpen && (
                      <div className="mt-1 ml-11 space-y-1">
                        {link.subLinks.map(subLink => {
                          const isSubActive = pathname === subLink.href;
                          return (
                            <Link
                              key={subLink.name}
                              href={subLink.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isSubActive
                                  ? "text-white bg-white/10"
                                  : "text-gray-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              {subLink.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href!} 
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg group transition-colors ${
                    isActive 
                      ? "bg-gradient-to-r from-[#2cc17b] to-[#25a86a] text-white shadow-md" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill={link.isFill ? "currentColor" : "none"} viewBox="0 0 24 24" stroke={!link.isFill ? "currentColor" : "none"}>
                      {link.icon}
                    </svg>
                    <span className="text-sm font-medium">{link.name}</span>
                  </div>
                  {link.name === "Notifications" && notificationCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                      {notificationCount}
                    </span>
                  )}
                  {link.name === "User Approval" && pendingUsersCount > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]">
                      {pendingUsersCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none md:hidden"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <button className="hidden md:block text-gray-500 hover:text-gray-700 focus:outline-none">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              
              {/* Top Header Notification Bell */}
              <Link href="/notifications" className="relative p-2 text-gray-500 hover:text-blue-500 transition-colors focus:outline-none">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-500 hover:text-white hover:bg-red-500 border border-red-400 rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </header>

          {/* Dynamic Page Content */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
      
      {/* Global Footer (Full Screen Width) */}
      <footer className="w-full bg-gradient-to-r from-[#1e1e1e] to-[#252525] border-t-[3px] border-[#2cc17b] py-3.5 shrink-0 relative z-50 shadow-2xl backdrop-blur-md">
        <p className="text-center text-sm text-gray-400 font-medium tracking-wide flex items-center justify-center">
          Developed By 
          <span className="px-3 py-1 ml-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm relative overflow-hidden group">
            <span className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="text-lg font-black tracking-widest uppercase relative z-10 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-text-gradient drop-shadow-sm">
              Qubit
            </span>
          </span>
        </p>
      </footer>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Log Out?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of your account?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-md transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
