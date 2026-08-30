"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useRef } from "react";

export default function FaqGenerator() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    appName: "",
    appId: "",
    username: "",
    supportName: "",
    supportEmail: "",
    supportMobile: "",
    accessMode: "SMS / USSD",
    appDescription: "",
    appKeyword: "afoot",
    smsPort: "21213",
    ussdCode: "",
    webUrl: "",
    hostAddress: "103.108.140.219",
    chargeAmount: "TK 2.00",
    chargeTypeDescription: "News related Bangla content",
    offerDetails: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeneratePDF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfRef.current) return;
    
    setIsGenerating(true);
    try {
      // Dynamic imports for Next.js client side compatibility
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = pdfRef.current;
      
      // Small delay to ensure any state updates/rendering are complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        logging: false 
      });
      const imgData = canvas.toDataURL("image/png");
      
      // Verify image data is valid
      if (imgData === "data:,") {
        throw new Error("Failed to capture HTML content to canvas");
      }
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.appName || "App"}_FAQ.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Make sure all libraries are loaded.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleGeneratePDF} className="space-y-6">
      
      {/* FAQ Details Header (Mimicking PDF) */}
      <div className="text-center mb-8 border-b border-red-700 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">FAQ Details Form</h1>
        <p className="text-gray-500 text-sm mt-1">Fill out the fields exactly as they should appear on the PDF</p>
      </div>

      <div className="border-[3px] border-double border-red-700 p-6 md:p-8 rounded-xl bg-white shadow-sm space-y-8">
        
        {/* ROW 1: bdapps App Details & Support Contact Details (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">bdapps App Details</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">App Name</label>
              <input type="text" name="appName" value={formData.appName} onChange={handleChange} required placeholder="e.g. afoot" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">App ID</label>
              <input type="text" name="appId" value={formData.appId} onChange={handleChange} required placeholder="e.g. APP_120995" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="e.g. academia" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Support Contact Details</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
              <input type="text" name="supportName" value={formData.supportName} onChange={handleChange} required placeholder="e.g. Md.Jahid Hossain Tito" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
              <input type="email" name="supportEmail" value={formData.supportEmail} onChange={handleChange} required placeholder="e.g. academia1050@gmail.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Mobile No.</label>
              <input type="text" name="supportMobile" value={formData.supportMobile} onChange={handleChange} required placeholder="e.g. 01628123777" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
            </div>
          </div>
        </div>

        {/* ROW 2: Access Mode */}
        <div>
          <label className="block font-bold text-gray-800 mb-2">Access Mode</label>
          <input type="text" name="accessMode" value={formData.accessMode} onChange={handleChange} required placeholder="e.g. SMS / USSD" className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
        </div>

        {/* ROW 3: App Description */}
        <div>
          <label className="block font-bold text-gray-800 mb-2">App Description</label>
          <textarea name="appDescription" value={formData.appDescription} onChange={handleChange} required rows={3} placeholder="The application will provide daily..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white resize-none"></textarea>
        </div>

        {/* ROW 4: Subscribe & Access */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Keywords & Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">App Keyword</label>
              <input type="text" name="appKeyword" value={formData.appKeyword} onChange={handleChange} required placeholder="e.g. afoot" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">SMS Port (Send to)</label>
              <input type="text" name="smsPort" value={formData.smsPort} onChange={handleChange} required placeholder="e.g. 21213" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">USSD Code (Optional)</label>
              <input type="text" name="ussdCode" value={formData.ussdCode} onChange={handleChange} placeholder="e.g. *213*55366#" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
            </div>
          </div>
          {selectedOption === 'web_android' && (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Web Subscription URL</label>
              <input type="url" name="webUrl" value={formData.webUrl} onChange={handleChange} required={selectedOption === 'web_android'} placeholder="e.g. https://www.bdapps.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-3 italic">Note: The system will automatically generate the "START", "STOP", "&lt;start&gt;", and "&lt;stop&gt;" instructions in the PDF based on this App Keyword.</p>
        </div>

        {/* ROW 6: Host Address */}
        <div>
          <label className="block font-bold text-gray-800 mb-2">Host Address [IP]</label>
          <input type="text" name="hostAddress" value={formData.hostAddress} onChange={handleChange} required placeholder="e.g. 103.108.140.219" className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
        </div>

        {/* ROW 7: Charge */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Charge Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Amount</label>
              <select name="chargeAmount" value={formData.chargeAmount} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white">
                <option value="TK 2.00">TK 2.00</option>
                <option value="TK 4.00">TK 4.00</option>
              </select>
            </div>
            {selectedOption === 'pro' && (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Service Type</label>
                <input type="text" name="chargeTypeDescription" value={formData.chargeTypeDescription} onChange={handleChange} required={selectedOption === 'pro'} placeholder="e.g. News related Bangla content" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white" />
              </div>
            )}
          </div>
        </div>

        {/* ROW 8: Offer Details */}
        {selectedOption === 'pro' && (
          <div>
            <label className="block font-bold text-gray-800 mb-2">Offer details</label>
            <textarea name="offerDetails" value={formData.offerDetails} onChange={handleChange} required={selectedOption === 'pro'} rows={2} placeholder="The application will provide..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 bg-white resize-none"></textarea>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isGenerating}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Generate & Download PDF
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <PortalLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 tracking-wide">FAQ Generator</h2>
          <p className="text-gray-500 mt-2">Select a service type to generate Frequently Asked Questions</p>
        </div>

        {!selectedOption ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <button 
              onClick={() => setSelectedOption('pro')}
              className="bg-gradient-to-r from-[#2cc17b] to-[#1f8f5a] rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 text-left"
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-2xl font-bold tracking-tight">Pro Service</h3>
                  <p className="text-white/80 text-sm mt-1">Generate FAQs for Pro Applications</p>
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
            </button>

            <button 
              onClick={() => setSelectedOption('web_android')}
              className="bg-gradient-to-r from-[#6978e8] to-[#5563c1] rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 text-left"
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-2xl font-bold tracking-tight">WEB / ANDROID</h3>
                  <p className="text-white/80 text-sm mt-1">Generate FAQs for Web and Android Apps</p>
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedOption(null)}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedOption === 'pro' ? 'Pro Service FAQ Generator' : 'Web/Android FAQ Generator'}
                </h3>
              </div>
            </div>
            
            {selectedOption ? (
              renderForm()
            ) : (
              <div className="text-center py-12 text-gray-500">
                Please select a service type above.
              </div>
            )}
          </div>
        )}

        {/* Hidden PDF Template */}
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} className="print-container">
          <div 
            ref={pdfRef} 
            style={{ 
              width: '800px', 
              padding: '40px', 
              background: 'white', 
              color: 'black', 
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: '15px'
            }}
          >
            <div style={{ border: '3px double #b91c1c', padding: '40px', minHeight: '1000px' }}>
              <h1 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '40px' }}>
                FAQ Details
              </h1>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div style={{ width: '45%' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>bdapps App Details</h3>
                  <p style={{ marginBottom: '8px' }}><strong>App Name:</strong> {formData.appName}</p>
                  <p style={{ marginBottom: '8px' }}><strong>App ID:</strong> {formData.appId}</p>
                  <p style={{ marginBottom: '8px' }}><strong>Username:</strong> {formData.username}</p>
                </div>
                <div style={{ width: '45%' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>Support Contact Details</h3>
                  <p style={{ marginBottom: '8px' }}><strong>Name:</strong> {formData.supportName}</p>
                  <p style={{ marginBottom: '8px' }}><strong>Email:</strong> {formData.supportEmail}</p>
                  <p style={{ marginBottom: '8px' }}><strong>MobileNo.</strong> {formData.supportMobile}</p>
                </div>
              </div>
              
              <p style={{ marginBottom: '20px' }}><strong>Access Mode:</strong> {formData.accessMode}</p>
              
              <div style={{ marginBottom: '25px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>App Description</p>
                <p style={{ lineHeight: '1.5' }}>{formData.appDescription}</p>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>How to Subscribe</p>
                <ul style={{ marginLeft: '40px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '5px' }}>
                    <strong>SMS:</strong> User will have to type <strong>"START {formData.appKeyword} "</strong> and send to {formData.smsPort} to complete the subscription.
                  </li>
                  {formData.ussdCode && (
                    <li style={{ marginBottom: '5px' }}><strong>USSD:</strong> Dial <strong>{formData.ussdCode}</strong> to subscribe.</li>
                  )}
                  {selectedOption === 'web_android' && formData.webUrl && (
                    <li><strong>Web:</strong> Users can visit <a href={formData.webUrl} style={{ color: 'blue', textDecoration: 'underline' }}>{formData.webUrl}</a>, enter their mobile number, and complete the subscription via OTP.</li>
                  )}
                </ul>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>How to Unsubscribe:</p>
                <ul style={{ marginLeft: '40px', listStyleType: 'disc' }}>
                  <li>
                    <strong>SMS:</strong> User will have to type <strong>"STOP {formData.appKeyword} "</strong> and send to {formData.smsPort} to complete the un-subscription.
                  </li>
                </ul>
              </div>
              
              <p style={{ marginBottom: '25px' }}><strong>Host Address [IP]:</strong> {formData.hostAddress}</p>
              
              <div style={{ marginBottom: '25px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Charge:</p>
                <ul style={{ marginLeft: '40px', listStyleType: 'disc' }}>
                  {selectedOption === 'pro' ? (
                    <>
                      <li style={{ marginBottom: '5px' }}>{formData.chargeAmount}+ (VAT + SD + SC)/day with Auto Renewal.</li>
                      <li style={{ marginBottom: '5px' }}>This is a subscription-based {formData.chargeTypeDescription} service.</li>
                      <li>Subscription charge will cost {formData.chargeAmount}+ (VAT + SD + SC) per day with Auto Renewal.</li>
                    </>
                  ) : (
                    <li>Subscription charge will cost {formData.chargeAmount}+ (VAT + SD + SC)/day with Auto Renewal.</li>
                  )}
                </ul>
              </div>
              
              {selectedOption === 'pro' && (
                <div style={{ marginBottom: '25px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Offer details:</p>
                  <p style={{ lineHeight: '1.5' }}>{formData.offerDetails}</p>
                </div>
              )}
              
              {selectedOption === 'pro' && (
                <div style={{ marginBottom: '25px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>How to use (user manual)</p>
                  <ol style={{ marginLeft: '20px', listStyleType: 'decimal' }}>
                    <li style={{ marginBottom: '5px' }}>
                      User will have to type "&lt;start {formData.appKeyword.toLowerCase()} &gt;" and send to {formData.smsPort} to complete the subscription.
                    </li>
                    <li>
                      User will have to type "&lt;stop {formData.appKeyword.toLowerCase()} &gt;" and send to {formData.smsPort} to complete the unsubscription.
                    </li>
                  </ol>
                </div>
              )}
              
            </div>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
