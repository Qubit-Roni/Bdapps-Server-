"use client";


import { fetchWithAuth } from "@/utils/fetchWithAuth";
import PortalLayout from "@/components/PortalLayout";

import Link from "next/link";

import { useState } from "react";

import { useRouter } from "next/navigation";


export default function NewApplication() {
  const [formData, setFormData] = useState({
    appType: "",
    appId: "",
    appPassword: "",
    smsKeyword: "",
    ussdKeyword: "",
    deliveryHour: "10",
    deliveryMinute: "00",
    deliveryAmPm: "AM",
    webUrl: ""
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isProApp = formData.appType === "Pro";
  const isWebAndroid = formData.appType === "Web/Android";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };

    if (name === "deliveryHour" || name === "deliveryAmPm" || name === "deliveryMinute") {
      const hour = parseInt(name === "deliveryHour" ? value : nextData.deliveryHour, 10);
      const amPm = name === "deliveryAmPm" ? value : nextData.deliveryAmPm;

      let isValid = true;
      if (amPm === "AM") {
        if (hour !== 10 && hour !== 11) isValid = false;
      } else {
        if (hour === 9 || hour === 10 || hour === 11) isValid = false;
      }

      if (!isValid) {
        setErrorMsg("Delivery time must be between 10:00 AM and 08:00 PM");
      } else {
        setErrorMsg("");
      }
    }

    if (name === "appType") {
      setErrorMsg("");
    }

    setFormData(nextData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (errorMsg) {
      alert("Please fix the errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    const finalData: any = {
      appType: formData.appType,
      appId: formData.appId,
      appPassword: formData.appPassword,
      smsKeyword: formData.smsKeyword,
      ussdKeyword: formData.ussdKeyword,
    };

    if (isProApp) {
      finalData.deliveryTime = `${formData.deliveryHour}:${formData.deliveryMinute} ${formData.deliveryAmPm}`;
    }

    if (isWebAndroid && formData.webUrl) {
      finalData.webUrl = formData.webUrl;
    }

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/projects/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/application/list");
      } else {
        setErrorMsg(data.message || "Failed to create application.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Error creating application:", err);
      setErrorMsg("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <PortalLayout>
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden max-w-3xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 md:p-8 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2cc17b] to-[#25a86a] flex items-center justify-center shadow-inner">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 tracking-wide">Create a New App</h2>
          </div>

          <Link
            href="/application/list"
            className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            App List
          </Link>
        </div>

        {/* Form Section */}
        <div className="p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* App Type */}
            <div>
              <label className="block text-sm md:text-base font-bold text-gray-700 mb-2">
                App Type: <span className="text-red-500">*</span>
              </label>
              <select
                name="appType"
                value={formData.appType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-gray-800 text-sm md:text-base outline-none focus:bg-white focus:border-[#8fd3f4] focus:ring-4 focus:ring-[#8fd3f4]/20 transition-all cursor-pointer"
                required
              >
                <option value="" disabled>-- Select App Type --</option>
                <option value="Pro">Pro App</option>
                <option value="Web/Android">Web / Android App</option>
              </select>
            </div>

            {/* App Id */}
            <div>
              <label className="block text-sm md:text-base font-bold text-gray-700 mb-2">
                App Id: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="appId"
                value={formData.appId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-gray-800 text-sm md:text-base outline-none focus:bg-white focus:border-[#8fd3f4] focus:ring-4 focus:ring-[#8fd3f4]/20 transition-all"
                required
              />
            </div>

            {/* App Password */}
            <div>
              <label className="block text-sm md:text-base font-bold text-gray-700 mb-2">
                App Password: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="appPassword"
                value={formData.appPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-gray-800 text-sm md:text-base outline-none focus:bg-white focus:border-[#8fd3f4] focus:ring-4 focus:ring-[#8fd3f4]/20 transition-all"
                required
              />
            </div>

            {/* SMS Keyword */}
            <div>
              <label className="block text-sm md:text-base font-bold text-gray-700 mb-2">
                SMS Keyword: {isProApp && <span className="text-red-500">*</span>}
                {isWebAndroid && <span className="ml-2 text-xs md:text-sm font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>}
              </label>
              <input
                type="text"
                name="smsKeyword"
                value={formData.smsKeyword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-gray-800 text-sm md:text-base outline-none focus:bg-white focus:border-[#8fd3f4] focus:ring-4 focus:ring-[#8fd3f4]/20 transition-all"
                required={isProApp}
              />
            </div>

            {/* USSD Keyword */}
            <div>
              <label className="block text-sm md:text-base font-bold text-gray-700 mb-2">
                USSD Keyword: {isProApp && <span className="text-red-500">*</span>}
                {isWebAndroid && <span className="ml-2 text-xs md:text-sm font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>}
              </label>
              <input
                type="text"
                name="ussdKeyword"
                value={formData.ussdKeyword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-gray-800 text-sm md:text-base outline-none focus:bg-white focus:border-[#8fd3f4] focus:ring-4 focus:ring-[#8fd3f4]/20 transition-all"
                required={isProApp}
              />
            </div>

            {/* Delivery Time - Only for Pro App */}
            {isProApp && (
              <div>
                <label className="block text-sm md:text-base font-bold text-gray-700 mb-2">
                  Delivery Time: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>

                  <div className={`flex items-center w-full pl-12 pr-2 py-2 bg-[#fafafa] border rounded-xl transition-all ${errorMsg ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-[#8fd3f4] focus-within:ring-4 focus-within:ring-[#8fd3f4]/20'}`}>

                    {/* Hour Dropdown */}
                    <select
                      name="deliveryHour"
                      value={formData.deliveryHour}
                      onChange={handleChange}
                      className="bg-transparent text-gray-800 text-sm md:text-base font-semibold outline-none py-1 pr-1 appearance-none cursor-pointer text-center"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                        <option key={num} value={num.toString()}>{num.toString().padStart(2, '0')}</option>
                      ))}
                    </select>

                    <span className="text-gray-400 font-bold mx-1">:</span>

                    {/* Minute Dropdown */}
                    <select
                      name="deliveryMinute"
                      value={formData.deliveryMinute}
                      onChange={handleChange}
                      className="bg-transparent text-gray-800 text-sm md:text-base font-semibold outline-none py-1 pr-2 appearance-none cursor-pointer text-center mr-2"
                    >
                      {["00", "15", "30", "45"].map(min => (
                        <option key={min} value={min}>{min}</option>
                      ))}
                    </select>

                    {/* AM/PM Dropdown */}
                    <select
                      name="deliveryAmPm"
                      value={formData.deliveryAmPm}
                      onChange={handleChange}
                      className="bg-white border border-gray-200 rounded-lg text-gray-800 text-sm md:text-base font-bold outline-none px-3 py-1 cursor-pointer hover:border-gray-300 ml-auto"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>

                  </div>
                </div>
                {errorMsg && <p className="text-red-500 text-xs md:text-sm font-semibold mt-2 ml-1">{errorMsg}</p>}
              </div>
            )}

            {/* Web/Android URL - Only for Web/Android App (Optional) */}
            {isWebAndroid && (
              <div>
                <label className="block text-sm md:text-base font-bold text-gray-700 mb-2">
                  Web / Android URL:
                  <span className="ml-2 text-xs md:text-sm font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
                </label>
                <input
                  type="url"
                  name="webUrl"
                  value={formData.webUrl}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-gray-800 text-sm md:text-base outline-none focus:bg-white focus:border-[#8fd3f4] focus:ring-4 focus:ring-[#8fd3f4]/20 transition-all"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!!errorMsg || isSubmitting}
                className={`w-full py-4 text-white text-base font-bold rounded-xl transition-all duration-300 ${
                  errorMsg || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#2cc17b] to-[#25a86a] hover:from-[#25a86a] hover:to-[#1f8f5a] shadow-[0_5px_15px_rgba(44,193,123,0.3)] hover:shadow-[0_8px_20px_rgba(44,193,123,0.4)]'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Store'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </PortalLayout>
  );
}
