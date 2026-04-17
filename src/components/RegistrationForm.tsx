import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, CheckCircle2, Info } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function RegistrationForm() {
  const categoryOptions = useMemo(
    () => [
      "U10 Mens Single",
      "U10 Mens Double",
      "U10 Womens Single",
      "U10 Womens Double",
      "U12 Mens Single",
      "U12 Mens Double",
      "U12 Womens Single",
      "U12 Womens Double",
      "U14 Mens Single",
      "U14 Mens Double",
      "U14 Womens Single",
      "U14 Womens Double",
      "U16 Mens Single",
      "U16 Mens Double",
      "U16 Womens Single",
      "U16 Womens Double",
      "Mens Double Bakat Baru",
      "Mixed Double Bakat Baru",
    ],
    []
  );

  const [category, setCategory] = useState(categoryOptions[0]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [tngQrUrl, setTngQrUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    icNumber: "",
    phone: "",
    player2Name: "",
    player2Ic: "",
    receipt: null as File | null,
  });

  const isDouble = category.includes("Double");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("site_config")
          .select("tng_qr_code_url, created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (!cancelled) setTngQrUrl((data as any)?.tng_qr_code_url ?? null);
      } catch {
        if (!cancelled) setTngQrUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setCategory(categoryOptions[0]);
    setFormData({
      fullName: "",
      icNumber: "",
      phone: "",
      player2Name: "",
      player2Ic: "",
      receipt: null,
    });
  };

  const sanitizeFileName = (name: string) =>
    name.replace(/[^\w.\-()]+/g, "_").replace(/_+/g, "_");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.receipt) {
      setSubmitError("Please upload your payment receipt screenshot.");
      return;
    }

    if (isDouble && (!formData.player2Name.trim() || !formData.player2Ic.trim())) {
      setSubmitError("Please fill in Player 2 details for Double category.");
      return;
    }

    setIsSubmitting(true);
    try {
      const file = formData.receipt;
      const safeFileName = sanitizeFileName(file.name);
      const objectPath = `registrations/${formData.icNumber.trim()}/${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(objectPath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "application/octet-stream",
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(objectPath);

      const receiptUrl = publicUrlData.publicUrl;

      const { data: inserted, error: insertError } = await supabase
        .from("registrations")
        .insert({
          full_name: formData.fullName.trim(),
          ic_number: formData.icNumber.trim(),
          phone: formData.phone.trim(),
          group_name: category,
          second_player_name: isDouble ? formData.player2Name.trim() : null,
          second_player_ic: isDouble ? formData.player2Ic.trim() : null,
          payment_screenshot_url: receiptUrl,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      setSubmissionId(inserted?.id ?? null);
      setIsSubmitted(true);
      resetForm();
    } catch (err: any) {
      setSubmitError(err?.message ?? "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, receipt: e.target.files[0] });
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-24 px-6 text-center"
      >
        <div className="relative overflow-hidden bg-surface-container-low p-12 rounded-[40px] border border-primary/20 shadow-2xl">
          <div className="absolute -inset-32 bg-primary/10 blur-3xl" />
          <div className="relative">
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-headline font-bold text-on-background mb-4">Registration Received!</h2>
            <p className="text-on-surface-variant text-lg mb-6">
              We’ve received your submission. Our team will verify your payment and IC details within 24–48 hours.
            </p>
            {submissionId ? (
              <div className="mb-8 mx-auto max-w-md">
                <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl px-5 py-4 text-left">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Reference ID</p>
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-on-background text-sm break-all">{submissionId}</code>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(submissionId);
                        } catch {}
                      }}
                      className="shrink-0 bg-primary/10 text-primary font-headline font-bold px-4 py-2 rounded-full hover:bg-primary/15 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            <button 
              onClick={() => {
                setSubmissionId(null);
                setIsSubmitted(false);
              }}
              className="bg-primary text-on-primary font-headline font-bold px-8 py-3 rounded-full hover:brightness-110 transition-all"
            >
              Register Another Team
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <section className="py-24 px-6 max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-on-background">Tournament Registration</h2>
        <p className="text-on-surface-variant text-lg">Secure your spot in the arena. Precision starts with the right details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Category Selection */}
        <div className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/10">
          <label className="block text-sm font-headline font-bold text-primary uppercase tracking-widest mb-4">Select Category</label>
          <select 
            value={category}
            onChange={(e) => {
              const next = e.target.value;
              setCategory(next);
              if (!next.includes("Double")) {
                setFormData((prev) => ({ ...prev, player2Name: "", player2Ic: "" }));
              }
            }}
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-6 py-4 text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
          >
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Player Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/10 space-y-6">
            <h3 className="text-xl font-headline font-bold text-on-background mb-2">Player 1 Details</h3>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Full Name (As per IC)</label>
              <input 
                required
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="e.g. Lee Zii Jia"
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-background focus:border-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">IC Number</label>
              <input 
                required
                type="text"
                value={formData.icNumber}
                onChange={(e) => setFormData({...formData, icNumber: e.target.value})}
                placeholder="e.g. 000101-14-XXXX"
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-background focus:border-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Phone Number</label>
              <input 
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="e.g. 012-345 6789"
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-background focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isDouble ? (
              <motion.div 
                key="player2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/10 space-y-6"
              >
                <h3 className="text-xl font-headline font-bold text-on-background mb-2">Player 2 Details</h3>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Full Name (As per IC)</label>
                  <input 
                    required
                    type="text"
                    value={formData.player2Name}
                    onChange={(e) => setFormData({...formData, player2Name: e.target.value})}
                    placeholder="Partner's Name"
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-background focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">IC Number</label>
                  <input 
                    required
                    type="text"
                    value={formData.player2Ic}
                    onChange={(e) => setFormData({...formData, player2Ic: e.target.value})}
                    placeholder="Partner's IC"
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-background focus:border-primary outline-none transition-all"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-surface-container-low/30 p-8 rounded-[32px] border border-dashed border-outline-variant/20 flex flex-col items-center justify-center text-center"
              >
                <Info className="w-8 h-8 text-outline-variant mb-4" />
                <p className="text-on-surface-variant text-sm">Select a Double category to add a second player.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Payment Section */}
        <div className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-headline font-bold text-on-background">Payment Details</h3>
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
                <p className="text-primary font-bold mb-2">Registration Fee:</p>
                <p className="text-3xl font-headline font-extrabold text-on-background">
                  {isDouble ? "RM 120" : "RM 60"}
                  <span className="text-sm font-normal text-on-surface-variant ml-2">/ team</span>
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  1. Scan the QR code to pay via TNG eWallet or DuitNow.<br />
                  2. Ensure the amount matches your category.<br />
                  3. Upload a clear screenshot of the successful transaction.
                </p>
                <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">TNG QR Code</p>
                  {tngQrUrl ? (
                    <img
                      src={tngQrUrl}
                      alt="TNG QR Code"
                      referrerPolicy="no-referrer"
                      className="w-full max-w-[320px] mx-auto rounded-xl bg-white p-3 border border-outline-variant/10 object-contain"
                    />
                  ) : (
                    <div className="w-full max-w-[320px] mx-auto h-40 rounded-xl border border-dashed border-outline-variant/20 flex items-center justify-center text-on-surface-variant text-sm">
                      QR code not set yet (admin can upload it).
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <Info className="w-5 h-5 text-primary" />
                  <p className="text-xs text-primary/80">Single receipt covers both players for doubles.</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-6">
              {/* QR is now rendered in the payment instruction area (from site_config). */}
              
              <div className="w-full">
                <label className="relative group cursor-pointer block">
                  <input 
                    type="file" 
                    required
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                  <div className="w-full py-4 px-6 bg-surface-container-lowest border-2 border-dashed border-outline-variant/20 rounded-2xl flex items-center justify-center gap-3 group-hover:border-primary/50 transition-all">
                    <Upload className="w-5 h-5 text-primary" />
                    <span className="text-on-background font-bold">
                      {formData.receipt ? formData.receipt.name : "Upload Payment Receipt"}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {submitError ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl px-6 py-4">
            <p className="font-bold mb-1">Submission failed</p>
            <p className="text-sm opacity-90">{submitError}</p>
          </div>
        ) : null}

        <button 
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold py-5 rounded-2xl text-xl transition-all shadow-2xl ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:brightness-110 active:scale-[0.98]"
          }`}
        >
          {isSubmitting ? "SUBMITTING..." : "CONFIRM REGISTRATION"}
        </button>
      </form>
    </section>
  );
}
