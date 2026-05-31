import React, { useState } from "react";
import { 
  auth, 
  googleProvider 
} from "../firebase";
import { 
  signInWithPopup 
} from "firebase/auth";
import { X, ShieldCheck, Chrome, Loader2, AlertTriangle, ExternalLink } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorText("");
    setSuccessText("");
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessText("Logged in successfully with Google!");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "";
      if (err.code === "auth/operation-not-allowed") {
        errMsg = "Google Sign-In is not currently enabled for your Firebase project. To enable it:\n1. Open your Firebase Console.\n2. Navigate to Authentication -> Sign-in method.\n3. Turn on the 'Google' provider.";
      } else if (
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request" ||
        errMsg.includes("closed-by-user") ||
        errMsg.includes("Pending promise was never set") ||
        errMsg.includes("internal-error")
      ) {
        errMsg = "Google Sign-In popup was blocked or terminated because this application is currently embedded inside an iframe. Please click 'Open App in New Tab' above to sign in cleanly.";
      } else {
        errMsg = err.message || "Failed to sign in with Google.";
      }
      setErrorText(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in font-sans">
        
        {/* Decorative Top header bar */}
        <div className="h-2 bg-gradient-to-r from-red-650 via-red-600 to-black w-full" />

        {/* Modal close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-2xl font-black tracking-tight text-gray-950 uppercase flex items-center justify-center gap-2">
              <ShieldCheck className="w-6 h-6 text-red-600" />
              <span>Google Authentication</span>
            </h3>
            <p className="text-xs text-gray-400 tracking-wide font-light">
              Connect to your Autotopi profile directory safely.
            </p>
          </div>

          {/* Iframe notice if embedded in preview */}
          {window.self !== window.top && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-[11px] leading-relaxed space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-extrabold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Running in Iframe Preview</span>
              </div>
              <p className="font-bold text-amber-900 leading-tight">
                Google popups are typically blocked in iframe environments.
              </p>
              <p className="text-amber-700 font-light">
                To sign in with Google, please click the button below to launch the app in a dedicated tab.
              </p>
              <a
                href={window.location.origin + window.location.hash}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-lg transition-colors cursor-pointer shadow-sm text-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open App in New Tab</span>
              </a>
            </div>
          )}

          {/* Social login gate */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Chrome className="w-5 h-5 text-red-500" />
            )}
            <span>Continue with Google</span>
          </button>

          {errorText && (
            <div className="text-xs font-semibold text-red-655 bg-red-50 p-4 border border-red-200 rounded-xl leading-relaxed space-y-3 animate-shake">
              <p className="whitespace-pre-line text-left">{errorText}</p>
              {errorText.includes("Authentication -> Sign-in method") && (
                <a
                  href="https://console.firebase.google.com/project/custom-machine-vcf5x/authentication/providers"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-lg transition-colors cursor-pointer shadow-sm text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Go to Firebase Console</span>
                </a>
              )}
            </div>
          )}

          {successText && (
            <div className="text-xs font-bold text-green-650 bg-green-50 p-3 rounded-lg leading-relaxed text-center">
              {successText}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
