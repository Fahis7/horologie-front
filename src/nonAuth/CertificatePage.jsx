import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../common/context/Authprovider";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const CertificatePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const item = state?.item;
  const purchaseDate = state?.date;

  useEffect(() => {
    if (!item) {
      navigate("/orders");
    }
  }, [item, navigate]);

  if (!item) return null;

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

  const handleDownloadPDF = async () => {
    if (certificateRef.current === null) {
      return;
    }

    setIsDownloading(true);

    try {
      const options = {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 1200,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: '1200px',
          height: 'auto',
          margin: '0',
          padding: '0',
          overflow: 'visible'
        }
      };

      const dataUrl = await toPng(certificateRef.current, options);
      const pdf = new jsPDF("l", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(dataUrl);
      const imgRatio = imgProps.width / imgProps.height;
      const pageRatio = pageWidth / pageHeight;

      let finalWidth = pageWidth;
      let finalHeight = pageHeight;

      if (imgRatio > pageRatio) {
        finalHeight = pageWidth / imgRatio;
      } else {
        finalWidth = pageHeight * imgRatio;
      }

      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-12 px-3 sm:px-4 lg:px-8 print:bg-white print:p-0 print:mt-0 mt-4">
      
      {/* Back button for mobile */}
      <div className="lg:hidden mb-4">
        <button 
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Vault
        </button>
      </div>

      {/* THE CERTIFICATE CONTAINER */}
      <div 
        ref={certificateRef}
        className="max-w-5xl mx-auto bg-white border border-gray-200 shadow-lg overflow-hidden relative"
      >
        
        {/* --- (1) BACKGROUND SEAL ANIMATION --- */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 opacity-5 pointer-events-none z-0">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 border-6 sm:border-8 border-black rounded-full"></div>
            <div className="absolute inset-6 sm:inset-8 border-3 sm:border-4 border-black rounded-full"></div>
            <div className="absolute inset-12 sm:inset-16 flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute inset-0"> 
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path id="circlePath" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                    <text className="text-[6px] sm:text-[8px] md:text-xs font-bold fill-black">
                      <textPath href="#circlePath" startOffset="0%">
                        ✦ OFFICIAL DOCUMENT ✦ AUTHENTIC ✦ CHRONOWRIST ✦
                      </textPath>
                    </text>
                  </svg>
                </div>
                <div className="absolute inset-6 sm:inset-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-serif font-bold text-base sm:text-lg mb-1">CW</div>
                    <div className="text-[10px] sm:text-xs font-medium tracking-wider">OFFICIAL</div>
                    <div className="w-8 sm:w-12 h-0.5 bg-black mx-auto my-1"></div>
                    <div className="text-[10px] sm:text-xs font-medium tracking-wider">SEAL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- (2) HEADER --- */}
        <div className="bg-gray-900 py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8 text-center border-b border-gray-200 relative z-10">
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 border-yellow-600 rounded-full flex items-center justify-center bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-medium text-yellow-500 tracking-wider mb-1 sm:mb-2">
            CERTIFICATE OF AUTHENTICITY
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 uppercase tracking-wider">
            Official Documentation of Horological Ownership
          </p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2">
            Issued by ChronoWrist • {formattedDate}
          </p>
        </div>

        {/* --- (3) CONTENT BODY --- */}
        <div className="p-4 sm:p-6 md:p-8 lg:p-10 z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
            
            {/* Left Column: Details */}
            <div>
              <div className="mb-6 sm:mb-8">
                <h2 className="font-serif text-lg sm:text-xl font-medium text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                  Timepiece Specifications
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">Model</p>
                    <p className="font-serif text-base sm:text-lg text-gray-900 break-words">{item.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">Reference Number</p>
                    <p className="font-mono text-sm sm:text-base text-gray-800">CW-{certificateID}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">Production Series</p>
                    <p className="text-sm sm:text-base text-gray-800">Limited Edition</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">Date of Certification</p>
                    <p className="text-sm sm:text-base text-gray-800">{formattedDate}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h2 className="font-serif text-lg sm:text-xl font-medium text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                  Ownership Details
                </h2>
                <div className="flex items-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">Beloved Owner</p>
                    <p className="font-serif text-sm sm:text-base text-gray-900 break-words">{ownerName}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Certificate ID: CW{certificateID}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Image & QR */}
            <div className="flex flex-col items-center justify-between mt-4 md:mt-0">
              <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 mb-4 sm:mb-6 flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-auto max-w-full object-contain"
                  crossOrigin="anonymous"
                  loading="lazy"
                />
              </div>
              
              <div className="w-full text-center">
                <div className="flex flex-col items-center mt-2 sm:mt-4">
                  <div className="bg-white p-1 sm:p-2 border border-gray-200">
                    <QRCode
                      value={verificationURL}
                      size={window.innerWidth < 640 ? 56 : window.innerWidth < 768 ? 64 : 72}
                      fgColor="#333333"
                    />
                  </div>
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-gray-400 mt-1 sm:mt-2">
                    Scan to Verify Authenticity
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4 sm:pt-6 mt-4 sm:mt-6">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
                    Official Documentation
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                    <div className="border border-gray-200 p-1 sm:p-2 inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[10px] sm:text-xs">Warranty Card</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Inside PDF) */}
        <div className="bg-gray-800 text-gray-300 p-3 sm:p-4 text-center">
          <p className="text-[8px] sm:text-[10px] text-gray-300 uppercase tracking-widest">
            Horologie Official • Valid Only With Seal
          </p>
        </div>
      </div>

      {/* --- BUTTONS (Not in PDF) --- */}
      <div className="max-w-5xl mx-auto mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6 print:hidden">
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="bg-yellow-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-none uppercase text-xs font-bold tracking-widest hover:bg-yellow-700 transition-all flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          className="hidden lg:flex border border-gray-800 text-gray-800 px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-none uppercase text-xs font-bold tracking-widest hover:bg-gray-100 transition-all items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Vault
        </button>
      </div>

      <div className="mt-6 sm:mt-8 text-center text-xs text-gray-500 print:hidden px-4">
        <p className="text-sm sm:text-base">This digital asset is secured by the Horologie Ledger.</p>
      </div>
    </div>
  );
};

export default CertificatePage;