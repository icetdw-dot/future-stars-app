import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type SiteConfigRow = {
  id: string;
  champion_photo_url: string | null;
  tng_qr_code_url: string | null;
  created_at: string;
};

type RegistrationRow = {
  id: string;
  full_name: string;
  ic_number: string;
  phone: string;
  group_name: string;
  second_player_name: string | null;
  second_player_ic: string | null;
  payment_screenshot_url: string | null;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
};

type MatchRow = {
  id: string;
  group_name: string;
  match_status: "scheduled" | "in_progress" | "finished" | "cancelled";
  score_a: number | null;
  score_b: number | null;
  created_at: string;
  player_a_registration_id: string;
  player_b_registration_id: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const ADMIN_SESSION_KEY = "fs_admin_ok_v1";

export default function Admin() {
  const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [siteConfig, setSiteConfig] = useState<SiteConfigRow | null>(null);
  const [championFile, setChampionFile] = useState<File | null>(null);
  const [tngQrFile, setTngQrFile] = useState<File | null>(null);

  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [matches, setMatches] = useState<(MatchRow & { player_a_name?: string; player_b_name?: string })[]>([]);

  const [createMatchA, setCreateMatchA] = useState<string>("");
  const [createMatchB, setCreateMatchB] = useState<string>("");
  const [createMatchGroup, setCreateMatchGroup] = useState<string>("");

  useEffect(() => {
    const ok = localStorage.getItem(ADMIN_SESSION_KEY) === "1";
    if (ok) setIsUnlocked(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const registrationOptions = useMemo(() => {
    return registrations.map((r) => ({
      id: r.id,
      label: `${r.full_name} (${r.ic_number}) · ${r.group_name}`,
      group: r.group_name,
    }));
  }, [registrations]);

  async function loadAll() {
    setError(null);
    setBusy(true);
    try {
      const { data: cfg, error: cfgErr } = await supabase
        .from("site_config")
        .select("id, champion_photo_url, tng_qr_code_url, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cfgErr) throw cfgErr;
      setSiteConfig((cfg as any) ?? null);

      const { data: regs, error: regsErr } = await supabase
        .from("registrations")
        .select(
          "id, full_name, ic_number, phone, group_name, second_player_name, second_player_ic, payment_screenshot_url, approval_status, created_at"
        )
        .order("created_at", { ascending: false });
      if (regsErr) throw regsErr;
      setRegistrations((regs as any) ?? []);

      const { data: ms, error: mErr } = await supabase
        .from("matches")
        .select(
          "id, group_name, match_status, score_a, score_b, created_at, player_a_registration_id, player_b_registration_id, player_a:registrations!matches_player_a_registration_id_fkey(full_name), player_b:registrations!matches_player_b_registration_id_fkey(full_name)"
        )
        .order("created_at", { ascending: false });
      if (mErr) throw mErr;

      const normalized =
        (ms as any[])?.map((row) => ({
          id: row.id,
          group_name: row.group_name,
          match_status: row.match_status,
          score_a: row.score_a,
          score_b: row.score_b,
          created_at: row.created_at,
          player_a_registration_id: row.player_a_registration_id,
          player_b_registration_id: row.player_b_registration_id,
          player_a_name: row.player_a?.full_name,
          player_b_name: row.player_b?.full_name,
        })) ?? [];
      setMatches(normalized);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load admin data.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!isUnlocked) return;
    void loadAll();
  }, [isUnlocked]);

  async function unlock() {
    setError(null);
    if (!envPassword || envPassword === "CHANGE_ME") {
      setError("Admin password is not set. Please set VITE_ADMIN_PASSWORD in .env and restart dev server.");
      return;
    }
    if (password !== envPassword) {
      setError("Wrong password.");
      return;
    }
    localStorage.setItem(ADMIN_SESSION_KEY, "1");
    setIsUnlocked(true);
    setPassword("");
  }

  function sanitizeFileName(name: string) {
    return name.replace(/[^\w.\-()]+/g, "_").replace(/_+/g, "_");
  }

  async function uploadPublicAsset(file: File, objectPath: string) {
    const { error: upErr } = await supabase.storage.from("site-assets").upload(objectPath, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type || "application/octet-stream",
    });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("site-assets").getPublicUrl(objectPath);
    return data.publicUrl;
  }

  async function saveSiteConfig() {
    setError(null);
    setBusy(true);
    try {
      const updates: { champion_photo_url?: string | null; tng_qr_code_url?: string | null } = {};

      if (championFile) {
        const url = await uploadPublicAsset(
          championFile,
          `champion/${Date.now()}-${sanitizeFileName(championFile.name)}`
        );
        updates.champion_photo_url = url;
      }

      if (tngQrFile) {
        const url = await uploadPublicAsset(tngQrFile, `tng/${Date.now()}-${sanitizeFileName(tngQrFile.name)}`);
        updates.tng_qr_code_url = url;
      }

      if (!updates.champion_photo_url && !updates.tng_qr_code_url) {
        setToast("No changes to save.");
        return;
      }

      const { data: up, error: upErr } = await supabase
        .from("site_config")
        .insert({
          champion_photo_url: updates.champion_photo_url ?? siteConfig?.champion_photo_url ?? null,
          tng_qr_code_url: updates.tng_qr_code_url ?? siteConfig?.tng_qr_code_url ?? null,
        })
        .select("id, champion_photo_url, tng_qr_code_url, created_at")
        .single();

      if (upErr) throw upErr;
      setSiteConfig(up as any);
      setChampionFile(null);
      setTngQrFile(null);
      setToast("Site config updated.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to update site config.");
    } finally {
      setBusy(false);
    }
  }

  async function setRegistrationStatus(id: string, approval_status: "approved" | "rejected") {
    setError(null);
    setBusy(true);
    try {
      const { error: upErr } = await supabase.from("registrations").update({ approval_status }).eq("id", id);
      if (upErr) throw upErr;
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, approval_status } : r)));
      setToast(`Registration ${approval_status}.`);
    } catch (e: any) {
      setError(e?.message ?? "Failed to update registration.");
    } finally {
      setBusy(false);
    }
  }

  async function createMatch() {
    setError(null);
    if (!createMatchA || !createMatchB || createMatchA === createMatchB) {
      setError("Please choose two different players.");
      return;
    }
    const group = createMatchGroup || registrationOptions.find((r) => r.id === createMatchA)?.group || "";
    if (!group) {
      setError("Please choose a group.");
      return;
    }
    setBusy(true);
    try {
      const { data: inserted, error: insErr } = await supabase
        .from("matches")
        .insert({
          group_name: group,
          player_a_registration_id: createMatchA,
          player_b_registration_id: createMatchB,
          match_status: "scheduled",
          score_a: 0,
          score_b: 0,
        })
        .select(
          "id, group_name, match_status, score_a, score_b, created_at, player_a_registration_id, player_b_registration_id, player_a:registrations!matches_player_a_registration_id_fkey(full_name), player_b:registrations!matches_player_b_registration_id_fkey(full_name)"
        )
        .single();
      if (insErr) throw insErr;
      setMatches((prev) => [
        {
          id: (inserted as any).id,
          group_name: (inserted as any).group_name,
          match_status: (inserted as any).match_status,
          score_a: (inserted as any).score_a,
          score_b: (inserted as any).score_b,
          created_at: (inserted as any).created_at,
          player_a_registration_id: (inserted as any).player_a_registration_id,
          player_b_registration_id: (inserted as any).player_b_registration_id,
          player_a_name: (inserted as any).player_a?.full_name,
          player_b_name: (inserted as any).player_b?.full_name,
        },
        ...prev,
      ]);
      setCreateMatchA("");
      setCreateMatchB("");
      setCreateMatchGroup("");
      setToast("Match created.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to create match.");
    } finally {
      setBusy(false);
    }
  }

  async function updateMatch(id: string, patch: Partial<Pick<MatchRow, "score_a" | "score_b" | "match_status">>) {
    setError(null);
    setBusy(true);
    try {
      const { error: upErr } = await supabase.from("matches").update(patch).eq("id", id);
      if (upErr) throw upErr;
      setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
      setToast("Match updated.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to update match.");
    } finally {
      setBusy(false);
    }
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-surface px-6 py-24">
        <div className="max-w-md mx-auto bg-surface-container-low border border-outline-variant/10 rounded-[32px] p-10 shadow-2xl">
          <h1 className="text-3xl font-headline font-bold text-on-background mb-2">Admin Access</h1>
          <p className="text-on-surface-variant mb-8">Enter the admin password to continue.</p>

          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl px-5 py-4 mb-6">
              <p className="font-bold mb-1">Access denied</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          ) : null}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-background focus:border-primary outline-none transition-all"
          />
          <button
            type="button"
            onClick={unlock}
            className="mt-6 w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-2xl hover:brightness-110 transition-all"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-primary selection:text-on-primary">
      <div className="fixed inset-0 noise-overlay pointer-events-none z-[100]"></div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-background">Admin Console</h1>
            <p className="text-on-surface-variant mt-2">Manage site config, registrations, and matches.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void loadAll()}
              className={cn(
                "bg-surface-container-low border border-outline-variant/10 text-on-background font-headline font-bold px-5 py-3 rounded-full transition-all",
                busy ? "opacity-70 cursor-not-allowed" : "hover:bg-surface-container-high"
              )}
              disabled={busy}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(ADMIN_SESSION_KEY);
                setIsUnlocked(false);
              }}
              className="bg-primary/10 text-primary font-headline font-bold px-5 py-3 rounded-full hover:bg-primary/15 transition-all"
            >
              Lock
            </button>
          </div>
        </div>

        {toast ? (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-surface-container-low border border-outline-variant/10 shadow-2xl rounded-full px-6 py-3 text-on-background">
            {toast}
          </div>
        ) : null}

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl px-6 py-4 mb-8">
            <p className="font-bold mb-1">Error</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        ) : null}

        {/* Site Config */}
        <section className="bg-surface-container-low border border-outline-variant/10 rounded-[32px] p-8 mb-10">
          <h2 className="text-2xl font-headline font-bold text-on-background mb-6">Site Config</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Previous Champion Photo
              </p>
              {siteConfig?.champion_photo_url ? (
                <img
                  src={siteConfig.champion_photo_url}
                  referrerPolicy="no-referrer"
                  className="w-full h-56 object-cover rounded-2xl border border-outline-variant/10"
                />
              ) : (
                <div className="w-full h-56 rounded-2xl bg-surface-container-lowest border border-dashed border-outline-variant/20 flex items-center justify-center text-on-surface-variant">
                  Not set
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setChampionFile(e.target.files?.[0] ?? null)}
                className="mt-4 block w-full text-sm text-on-surface-variant"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">TNG QR Code</p>
              {siteConfig?.tng_qr_code_url ? (
                <img
                  src={siteConfig.tng_qr_code_url}
                  referrerPolicy="no-referrer"
                  className="w-full h-56 object-contain rounded-2xl border border-outline-variant/10 bg-white"
                />
              ) : (
                <div className="w-full h-56 rounded-2xl bg-surface-container-lowest border border-dashed border-outline-variant/20 flex items-center justify-center text-on-surface-variant">
                  Not set
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setTngQrFile(e.target.files?.[0] ?? null)}
                className="mt-4 block w-full text-sm text-on-surface-variant"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => void saveSiteConfig()}
            disabled={busy}
            className={cn(
              "mt-8 bg-primary text-on-primary font-headline font-bold px-8 py-4 rounded-2xl transition-all",
              busy ? "opacity-70 cursor-not-allowed" : "hover:brightness-110"
            )}
          >
            Save Config
          </button>
          <p className="mt-4 text-xs text-on-surface-variant">
            Note: this uploads files to Storage bucket <code>site-assets</code> as public URLs.
          </p>
        </section>

        {/* Matches */}
        <section className="bg-surface-container-low border border-outline-variant/10 rounded-[32px] p-8 mb-10">
          <h2 className="text-2xl font-headline font-bold text-on-background mb-6">Match Management</h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end mb-8">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Player A
              </label>
              <select
                value={createMatchA}
                onChange={(e) => {
                  const v = e.target.value;
                  setCreateMatchA(v);
                  const g = registrationOptions.find((r) => r.id === v)?.group;
                  if (g) setCreateMatchGroup(g);
                }}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-4 py-3 text-on-background focus:border-primary outline-none transition-all"
              >
                <option value="">Select…</option>
                {registrationOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Player B
              </label>
              <select
                value={createMatchB}
                onChange={(e) => setCreateMatchB(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-4 py-3 text-on-background focus:border-primary outline-none transition-all"
              >
                <option value="">Select…</option>
                {registrationOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Group
              </label>
              <input
                value={createMatchGroup}
                onChange={(e) => setCreateMatchGroup(e.target.value)}
                placeholder="e.g. U14 Boys Double"
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-4 py-3 text-on-background focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="lg:col-span-4">
              <button
                type="button"
                onClick={() => void createMatch()}
                disabled={busy}
                className={cn(
                  "w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-2xl transition-all",
                  busy ? "opacity-70 cursor-not-allowed" : "hover:brightness-110"
                )}
              >
                Create Match
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{m.group_name}</p>
                    <p className="text-on-background font-headline font-bold text-lg">
                      {m.player_a_name ?? m.player_a_registration_id} vs {m.player_b_name ?? m.player_b_registration_id}
                    </p>
                    <p className="text-on-surface-variant text-sm mt-1">Status: {m.match_status}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={m.score_a ?? 0}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setMatches((prev) => prev.map((x) => (x.id === m.id ? { ...x, score_a: v } : x)));
                        }}
                        className="w-24 bg-surface border border-outline-variant/20 rounded-xl px-3 py-2 text-on-background focus:border-primary outline-none transition-all"
                      />
                      <span className="text-on-surface-variant">:</span>
                      <input
                        type="number"
                        min={0}
                        value={m.score_b ?? 0}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setMatches((prev) => prev.map((x) => (x.id === m.id ? { ...x, score_b: v } : x)));
                        }}
                        className="w-24 bg-surface border border-outline-variant/20 rounded-xl px-3 py-2 text-on-background focus:border-primary outline-none transition-all"
                      />
                    </div>

                    <select
                      value={m.match_status}
                      onChange={(e) =>
                        setMatches((prev) =>
                          prev.map((x) => (x.id === m.id ? { ...x, match_status: e.target.value as any } : x))
                        )
                      }
                      className="bg-surface border border-outline-variant/20 rounded-xl px-3 py-2 text-on-background focus:border-primary outline-none transition-all"
                    >
                      <option value="scheduled">scheduled</option>
                      <option value="in_progress">in_progress</option>
                      <option value="finished">finished</option>
                      <option value="cancelled">cancelled</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => void updateMatch(m.id, { score_a: m.score_a ?? 0, score_b: m.score_b ?? 0, match_status: m.match_status })}
                      disabled={busy}
                      className={cn(
                        "bg-primary/10 text-primary font-headline font-bold px-5 py-2 rounded-full transition-all",
                        busy ? "opacity-70 cursor-not-allowed" : "hover:bg-primary/15"
                      )}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {matches.length === 0 ? (
              <div className="text-on-surface-variant text-sm">No matches yet.</div>
            ) : null}
          </div>
        </section>

        {/* Registrations */}
        <section className="bg-surface-container-low border border-outline-variant/10 rounded-[32px] p-8">
          <h2 className="text-2xl font-headline font-bold text-on-background mb-6">Registration Review</h2>

          <div className="space-y-4">
            {registrations.map((r) => (
              <div
                key={r.id}
                className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="min-w-0">
                    <p className="text-on-background font-headline font-bold text-lg">
                      {r.full_name} <span className="text-on-surface-variant font-normal">({r.ic_number})</span>
                    </p>
                    <p className="text-on-surface-variant text-sm mt-1">{r.phone} · {r.group_name}</p>
                    {r.second_player_name || r.second_player_ic ? (
                      <p className="text-on-surface-variant text-sm mt-2">
                        Player 2: {r.second_player_name ?? "-"} ({r.second_player_ic ?? "-"})
                      </p>
                    ) : null}
                    <p className="text-on-surface-variant text-sm mt-2">
                      Status:{" "}
                      <span
                        className={cn(
                          "font-bold",
                          r.approval_status === "approved" && "text-emerald-300",
                          r.approval_status === "rejected" && "text-red-300",
                          r.approval_status === "pending" && "text-amber-200"
                        )}
                      >
                        {r.approval_status}
                      </span>
                    </p>
                  </div>

                  <div className="w-full lg:w-[360px]">
                    {r.payment_screenshot_url ? (
                      <a
                        href={r.payment_screenshot_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <img
                          src={r.payment_screenshot_url}
                          referrerPolicy="no-referrer"
                          className="w-full h-56 object-cover rounded-2xl border border-outline-variant/10 hover:brightness-110 transition-all"
                        />
                      </a>
                    ) : (
                      <div className="w-full h-56 rounded-2xl bg-surface border border-dashed border-outline-variant/20 flex items-center justify-center text-on-surface-variant">
                        No receipt
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => void setRegistrationStatus(r.id, "approved")}
                        disabled={busy}
                        className={cn(
                          "flex-1 bg-emerald-500/15 text-emerald-200 font-headline font-bold py-3 rounded-2xl transition-all",
                          busy ? "opacity-70 cursor-not-allowed" : "hover:bg-emerald-500/20"
                        )}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void setRegistrationStatus(r.id, "rejected")}
                        disabled={busy}
                        className={cn(
                          "flex-1 bg-red-500/15 text-red-200 font-headline font-bold py-3 rounded-2xl transition-all",
                          busy ? "opacity-70 cursor-not-allowed" : "hover:bg-red-500/20"
                        )}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {registrations.length === 0 ? (
              <div className="text-on-surface-variant text-sm">No registrations yet.</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

