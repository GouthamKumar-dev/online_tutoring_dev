import React, { useState, useEffect } from "react";

const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, onClose, title, children, footer }) => {
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) {
      setShow(true);
      // Disable body scroll when modal opens
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable body scroll when modal closes
      document.body.style.overflow = "unset";
      const timeout = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timeout);
    }

    // Cleanup function to ensure scroll is re-enabled if component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);
  if (!show && !open) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: "rgba(40, 30, 80, 0.25)",
        backdropFilter: "blur(12px) saturate(120%)",
        WebkitBackdropFilter: "blur(12px) saturate(120%)",
      }}
    >
      <div
        className={`relative bg-gradient-to-br from-white/90 via-violet-50 to-violet-100 border border-violet-200 shadow-2xl rounded-3xl p-8 min-w-[340px] w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] flex flex-col transition-all duration-300 ${
          open ? "scale-100 opacity-100 animate-pop" : "scale-95 opacity-0"
        }`}
        style={{
          boxShadow:
            "0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 6px 0 rgba(124, 58, 237, 0.08)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        <style>{`
                    @keyframes pop {
                        0% { transform: scale(0.95); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .animate-pop { animation: pop 0.22s cubic-bezier(.4,2,.6,1) both; }
                    .modal-close:focus-visible {
                        outline: 2px solid #a78bfa;
                        outline-offset: 2px;
                    }
                    .custom-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: #c4b5fd #f3f4f6;
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f3f4f6;
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #c4b5fd;
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #a78bfa;
                    }
                `}</style>
        <button
          className="modal-close absolute top-3 right-4 text-2xl text-violet-400 hover:text-violet-600 transition-colors rounded-full p-1 w-10 h-10 flex items-center justify-center hover:bg-violet-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          onClick={onClose}
          tabIndex={0}
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="#ede9fe"
              stroke="#a78bfa"
              strokeWidth="1.5"
            />
            <path
              d="M9 9l6 6M15 9l-6 6"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="flex flex-col items-center mb-6 flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#ede9fe" />
              <path
                d="M8 12.5l2.5 2.5 5-5"
                stroke="#7c3aed"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-2xl font-extrabold text-center text-violet-700 drop-shadow-sm tracking-tight">
            {title}
          </div>
        </div>
        <div className="text-gray-700 text-base flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
        {footer && (
          <div className="flex-shrink-0 mt-6 pt-4 border-t border-violet-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
