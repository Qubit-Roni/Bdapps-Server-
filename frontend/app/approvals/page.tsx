"use client";

import { useState, useEffect } from "react";
import PortalLayout from "../../components/PortalLayout";
import { useRouter } from "next/navigation";

interface PendingUser {
  _id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function ApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin, if not, redirect or show error
    const role = localStorage.getItem("userRole");
    if (role !== "admin" && role !== "super_admin") {
      router.push("/dashboard");
      return;
    }
    fetchPendingUsers();
  }, [router]);

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.message || "Failed to load pending users");
      }
    } catch (err) {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/approve/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Update status to active instead of removing
        setUsers(users.map(user => user._id === id ? { ...user, status: 'active' } : user));
      } else {
        alert(data.message || "Failed to approve user");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <PortalLayout>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">User Approvals</h1>
          <p className="text-gray-500 mt-2">Manage and approve pending developer accounts.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-[#2cc17b]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-green-50 text-[#2cc17b] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
            <p className="text-gray-500 max-w-md mx-auto">There are no pending user registrations at the moment. Check back later.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="block w-full">
              <table className="w-full text-left border-collapse block sm:table">
                <thead className="hidden sm:table-header-group">
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="px-6 py-5 whitespace-nowrap">Name</th>
                    <th className="px-6 py-5 whitespace-nowrap">Phone</th>
                    <th className="px-6 py-5 whitespace-nowrap">Role</th>
                    <th className="px-6 py-5 whitespace-nowrap">Date</th>
                    <th className="px-6 py-5 whitespace-nowrap">Status</th>
                    <th className="px-6 py-5 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="block sm:table-row-group divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="block sm:table-row hover:bg-gray-50/50 transition-colors p-4 sm:p-0">
                      <td className="block sm:table-cell px-2 py-3 sm:px-6 sm:py-5 border-b sm:border-0 border-gray-50">
                        <div className="flex items-center justify-between sm:block">
                          <span className="sm:hidden font-bold text-xs uppercase text-gray-400">Name</span>
                          <div className="font-semibold text-gray-800">{user.name}</div>
                        </div>
                      </td>
                      <td className="block sm:table-cell px-2 py-3 sm:px-6 sm:py-5 border-b sm:border-0 border-gray-50">
                        <div className="flex items-center justify-between sm:block">
                          <span className="sm:hidden font-bold text-xs uppercase text-gray-400">Phone</span>
                          <span className="text-gray-600">{user.phone}</span>
                        </div>
                      </td>
                      <td className="block sm:table-cell px-2 py-3 sm:px-6 sm:py-5 border-b sm:border-0 border-gray-50">
                        <div className="flex items-center justify-between sm:block">
                          <span className="sm:hidden font-bold text-xs uppercase text-gray-400">Role</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="block sm:table-cell px-2 py-3 sm:px-6 sm:py-5 border-b sm:border-0 border-gray-50">
                        <div className="flex items-center justify-between sm:block">
                          <span className="sm:hidden font-bold text-xs uppercase text-gray-400">Date</span>
                          <span className="text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="block sm:table-cell px-2 py-3 sm:px-6 sm:py-5 border-b sm:border-0 border-gray-50">
                        <div className="flex items-center justify-between sm:block">
                          <span className="sm:hidden font-bold text-xs uppercase text-gray-400">Status</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-50 text-green-600 border border-green-100' 
                              : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                          }`}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="block sm:table-cell px-2 py-4 sm:px-6 sm:py-5 sm:text-right">
                        <div className="flex items-center justify-between sm:block">
                          <span className="sm:hidden font-bold text-xs uppercase text-gray-400">Action</span>
                          {user.status === 'pending' ? (
                            <button
                              onClick={() => handleApprove(user._id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2cc17b] to-[#25a86a] hover:from-[#25a86a] hover:to-[#1f8f5a] text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(44,193,123,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm italic sm:pr-4">Approved</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
