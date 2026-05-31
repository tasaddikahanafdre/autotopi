import React, { useState } from "react";
import { MapPin, Phone, Mail, Send, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { WebsiteSettings } from "../types";

import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

interface ContactViewProps {
  settings: WebsiteSettings;
}

export default function ContactView({ settings }: ContactViewProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "General Question",
    message: ""
  });

  // Simple math quiz for spam safety
  const [spamAnswer, setSpamAnswer] = useState("");
  const [correctSpamAnswer] = useState(12); // What is 5 + 7?

  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatusMsg({ type: "error", text: "Please fill out all required fields (Name, Email, Message)." });
      return;
    }

    if (parseInt(spamAnswer) !== correctSpamAnswer) {
      setStatusMsg({ type: "error", text: "Incorrect answer for security challenge. Try again." });
      return;
    }

    setIsLoading(true);

    try {
      const messageId = "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
      const payload = {
        id: messageId,
        name: formData.name.trim(),
        phone: formData.phone.trim() || "",
        email: formData.email.trim(),
        subject: formData.subject || "General Question",
        message: formData.message.trim(),
        status: "pending" as const,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "messages", messageId), payload);

      setStatusMsg({
        type: "success",
        text: "Message successfully submitted! Your inquiry has been logged directly in Firestore."
      });
      // Clear fields
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "General Question",
        message: ""
      });
      setSpamAnswer("");
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ 
        type: "error", 
        text: "Could not publish message to database. Access might be restricted." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-12">
      {/* Page Header */}
      <div className="border-b-2 border-brand-red pb-4">
        <h1 className="text-3xl sm:text-5xl font-black text-brand-dark uppercase tracking-tight">
          CONTACT AUTOTOPI
        </h1>
        <p className="text-gray-500 mt-2 text-sm max-w-xl font-light">
          Have an auto review request, a media coverage proposal, or some sponsorships to list? Send us an inquiry! Our staff will get back to you within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Contact info deck - 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">
              COMMUNITY HEADQUARTERS
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed font-light mb-6">
              Our office is located centrally along the hub of Kazi Nazrul Islam Avenue in Dhaka. Stop by or call us on our direct helplines.
            </p>
          </div>

          <div className="space-y-6">
            {/* Address */}
            <div className="flex gap-4 p-5 bg-gray-50 border border-gray-200 rounded-none shadow-sm leading-relaxed">
              <div className="w-11 h-11 bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0 rounded-none">
                <MapPin className="w-5 h-5 shadow-sm" />
              </div>
              <div>
                <dt className="text-xs text-slate-500 font-mono uppercase tracking-wider font-bold">Office Address</dt>
                <dd className="text-sm font-black text-brand-dark mt-1 font-anek uppercase">
                  {settings.address || "House 44, Kayes Vobon (2nd Floor), Road: Kazi Nazrul Islam Avenue, Dhaka, Bangladesh."}
                </dd>
              </div>
            </div>

            {/* Helpline */}
            <div className="flex gap-4 p-5 bg-gray-50 border border-gray-200 rounded-none shadow-sm leading-relaxed">
              <div className="w-11 h-11 bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0 rounded-none">
                <Phone className="w-5 h-5 shadow-sm" />
              </div>
              <div>
                <dt className="text-xs text-slate-500 font-mono uppercase tracking-wider font-bold">Inquiry Helpline</dt>
                <dd className="text-sm font-black text-brand-dark mt-1">
                  <a href={`tel:${settings.helpline}`} className="hover:text-brand-red transition-all">
                    {settings.helpline || "+880 1882-201114"}
                  </a>
                </dd>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 p-5 bg-gray-50 border border-gray-200 rounded-none shadow-sm leading-relaxed">
              <div className="w-11 h-11 bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0 rounded-none">
                <Mail className="w-5 h-5 shadow-sm" />
              </div>
              <div>
                <dt className="text-xs text-slate-500 font-mono uppercase tracking-wider font-bold">Official Email</dt>
                <dd className="text-sm font-black text-brand-dark mt-1 truncate">
                  <a href={`mailto:${settings.email}`} className="hover:text-brand-red transition-all">
                    {settings.email || "autotopibd@gmail.com"}
                  </a>
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Form panel - 3 Columns */}
        <div className="lg:col-span-3 bg-white border border-gray-200 p-6 sm:p-10 rounded-none shadow-sm space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tight">
            SUBMIT MEDIA REQUEST FORM
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1 my-0.5">
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Ahsan Kabir"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-none focus:bg-white focus:outline-none focus:border-brand-red text-sm text-gray-900 shadow-inner"
                />
              </div>
              <div className="space-y-1 my-0.5">
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block">Phone (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., +880 1XXXXXXXXX"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-none focus:bg-white focus:outline-none focus:border-brand-red text-sm text-gray-900 shadow-inner"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1 my-0.5">
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block">Email Desk *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g., corporate@example.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-none focus:bg-white focus:outline-none focus:border-brand-red text-sm text-gray-900 shadow-inner"
                />
              </div>
              <div className="space-y-1 my-0.5">
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-none focus:bg-white focus:outline-none focus:border-brand-red text-sm text-gray-700 shadow-inner"
                >
                  <option value="General Question">General Question</option>
                  <option value="Vehicle Review Proposals">Vehicle Review Proposals</option>
                  <option value="Sponsorship advert">Sponsorship Adverts</option>
                  <option value="Lubricant / lubricant brand showcase">Lubricant Showcases</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block">Message Content *</label>
              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Type your message, details, lubricant types, or specific automotive launching requests..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-none focus:bg-white focus:outline-none focus:border-brand-red text-sm text-gray-900 shadow-inner"
              />
            </div>

            {/* Spam checking Challenge */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-none flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-brand-dark flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-red shrink-0" />
                <span><strong>Security verification:</strong> Complete the sum: <strong>What is 5 + 7?</strong></span>
              </span>
              <input
                type="number"
                size={4}
                required
                value={spamAnswer}
                onChange={(e) => setSpamAnswer(e.target.value)}
                placeholder="Answer"
                className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-brand-red text-center text-sm font-black text-brand-dark shadow-inner"
              />
            </div>

            {/* Status indicators */}
            {statusMsg && (
              <div
                className={`p-4 rounded-none text-sm flex items-start gap-2 ${
                  statusMsg.type === "success"
                    ? "bg-green-50 border border-green-250 text-green-700 animate-fade-in"
                    : "bg-brand-red/5 border border-brand-red/10 text-brand-red animate-pulse"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-brand-red mt-0.5" />
                )}
                <span className="leading-relaxed font-semibold">{statusMsg.text}</span>
              </div>
            )}

            {/* Submit Action */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3.5 bg-brand-red hover:bg-[#1A1A1A] text-white font-black text-xs uppercase tracking-widest rounded-none border border-brand-red flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isLoading ? "Delivering..." : "Deliver Message"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
