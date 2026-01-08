import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../common/context/Authprovider"; // Ensure this matches your folder structure
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const CertificatePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Ref for the element we want to turn into a PDF
  const certificateRef = useRef(null);
  
  // State for loading animation during download
  const [isDownloading, setIsDownloading] = useState(false);

  // 1. Get Data passed from OrdersPage
  const item = state?.item;
  const purchaseDate = state?.date;

  useEffect(() => {
    if (!item) {
      navigate("/orders");
    }
  }, [item, navigate]);

  if (!item) return null;

  // 2. Prepare Data
  const verificationURL = `https://horologie.com/verify/${item.id}-${user?.username || 'guest'}`;
  const dateObj = purchaseDate ? new Date(purchaseDate) : new Date();
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certificateID = item.id ? String(item.id).padStart(8, "0") : "00000000";
  const ownerName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`
    : user?.username || "Valued Collector";

  // 3. ✅ FIXED: SMART PDF DOWNLOAD LOGIC (Auto-Fit)
  const handleDownloadPDF = async () => {
    if (certificateRef.current === null) {
      return;
    }

    setIsDownloading(true);

    try {
      // A. Force Capture Settings
      // We force a specific width (1200px) so it doesn't get cut off on small screens
      const options = {
        cacheBust: true,
        pixelRatio: 2, // 2x resolution for sharpness
        backgroundColor: '#ffffff',
        width: 1200, 
        style: {
           // These styles apply ONLY during the screenshot process
           transform: 'scale(1)',
           transformOrigin: 'top left',
           width: '1200px',
           height: 'auto',
           margin: '0',
           padding: '0',
           overflow: 'visible' // Ensure nothing is hidden
        }
      };

      // B. Capture Element to PNG
      const dataUrl = await toPng(certificateRef.current, options);

      // C. Initialize PDF (A4 Landscape)
      const pdf = new jsPDF("l", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();   // 297mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm

      // D. Calculate Scale to Fit Page Perfectly
      // We check dimensions to maintain aspect ratio
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgRatio = imgProps.width / imgProps.height;
      const pageRatio = pageWidth / pageHeight;

      let finalWidth = pageWidth;
      let finalHeight = pageHeight;

      // If image is wider than page, constrain by width. Otherwise by height.
      if (imgRatio > pageRatio) {
        finalHeight = pageWidth / imgRatio;
      } else {
        finalWidth = pageHeight * imgRatio;
      }

      // E. Center the image on the PDF page
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      // F. Add Image & Save
      pdf.addImage(dataUrl, "PNG", x, y, finalWidth, finalHeight);
      pdf.save(`Horologie_Certificate_${certificateID}.pdf`);

    } catch (error) {
      console.error("Certificate Generation Error:", error);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 mt-6 sm:px-6 lg:px-8 print:bg-white print:p-0 print:mt-0">
      
      {/* THE CERTIFICATE CONTAINER (This gets captured) */}
      <div 
        ref={certificateRef}
        className="max-w-5xl mx-auto bg-white border border-gray-200 shadow-lg overflow-hidden relative"
      >
        
        {/* --- (1) BACKGROUND SEAL ANIMATION --- */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-5 pointer-events-none z-0">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 border-8 border-black rounded-full"></div>
            <div className="absolute inset-8 border-4 border-black rounded-full"></div>
            <div className="absolute inset-16 flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute inset-0"> 
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path id="circlePath" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                    <text className="text-xs font-bold fill-black">
                      <textPath href="#circlePath" startOffset="0%">
                        ✦ OFFICIAL DOCUMENT ✦ AUTHENTIC ✦ CHRONOWRIST ✦
                      </textPath>
                    </text>
                  </svg>
                </div>
                <div className="absolute inset-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-serif font-bold text-lg mb-1">CW</div>
                    <div className="text-xs font-medium tracking-wider">OFFICIAL</div>
                    <div className="w-12 h-0.5 bg-black mx-auto my-1"></div>
                    <div className="text-xs font-medium tracking-wider">SEAL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- (2) HEADER --- */}
        <div className="bg-gray-900 py-8 px-8 text-center border-b border-gray-200 relative z-10">
          <div className="absolute top-4 right-4 w-16 h-16 border-2 border-yellow-600 rounded-full flex items-center justify-center bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-serif font-medium text-yellow-500 tracking-wider mb-2">
            CERTIFICATE OF AUTHENTICITY
          </h1>
          <p className="text-sm text-gray-300 uppercase tracking-wider">
            Official Documentation of Horological Ownership
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Issued by ChronoWrist • {formattedDate}
          </p>
        </div>

        {/* --- (3) CONTENT BODY --- */}
        <div className="p-8 md:p-10 z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Left Column: Details */}
            <div>
              <div className="mb-8">
                <h2 className="font-serif text-xl font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Timepiece Specifications
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Model</p>
                    <p className="font-serif text-lg text-gray-900">{item.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Reference Number</p>
                    <p className="font-mono text-gray-800">CW-{certificateID}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Production Series</p>
                    <p className="text-gray-800">Limited Edition</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Date of Certification</p>
                    <p className="text-gray-800">{formattedDate}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="font-serif text-xl font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Ownership Details
                </h2>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mr-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Beloved Owner</p>
                    <p className="font-serif text-gray-900">{ownerName}</p>
                    <p className="text-xs text-gray-500 mt-1">Certificate ID: CW{certificateID}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Image & QR */}
            <div className="flex flex-col items-center justify-between">
              <div className="w-full h-72 mb-6 flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full object-contain"
                  crossOrigin="anonymous" 
                />
              </div>
              
              <div className="w-full text-center">
                <div className="flex flex-col items-center mt-4">
                  <div className="bg-white p-2 border border-gray-200">
                    <QRCode
                      value={verificationURL}
                      size={64}
                      fgColor="#333333"
                    />
                  </div>
                  <p className="text-[8px] uppercase tracking-widest text-gray-400 mt-2">
                    Scan to Verify Authenticity
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
                    Official Documentation
                  </p>
                  <div className="flex justify-center space-x-4">
                    <div className="border border-gray-200 p-2 inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">Warranty Card</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Inside PDF) */}
        <div className="bg-gray-800 text-gray-300 p-4 text-center">
          <p className="text-[10px] text-gray-300 uppercase tracking-widest">
            Horologie Official • Valid Only With Seal
          </p>
        </div>
      </div>

      {/* --- BUTTONS (Not in PDF) --- */}
      <div className="max-w-5xl mx-auto mt-8 flex justify-center space-x-6 print:hidden">
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="bg-yellow-600 text-white px-8 py-3 rounded-none uppercase text-xs font-bold tracking-widest hover:bg-yellow-700 transition-all flex items-center shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Minting Document...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </>
          )}
        </button>

        <button 
          onClick={() => navigate("/orders")}
          className="border border-gray-800 text-gray-800 px-8 py-3 rounded-none uppercase text-xs font-bold tracking-widest hover:bg-gray-100 transition-all flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Vault
        </button>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500 print:hidden">
        <p>This digital asset is secured by the Horologie Ledger.</p>
      </div>
    </div>
  );
};

export default CertificatePage;