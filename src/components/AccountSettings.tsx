import React from "react";
import { User, LogOut, LogIn, ExternalLink, Loader2, RefreshCw, Plus, CloudLightning, Pencil } from "lucide-react";
import { Button } from "./ui/Button";

interface AccountSettingsProps {
  state: any;
  theme: "dark" | "light";
  setTheme: React.Dispatch<React.SetStateAction<"dark" | "light">>;
  isFirebaseReady: boolean;
  auth: any;
  handleGoogleLogin: () => Promise<void>;
  handleGoogleLogout: () => Promise<void>;
  handleCreateSpreadsheet: () => Promise<void>;
  handleSyncAllHistory: () => Promise<void>;
  isSyncingAllHistory: boolean;
  isCreatingSheet: boolean;
  sheetsSyncMessage: { text: string; error: boolean } | null;
  setSheetsSyncMessage: (msg: { text: string; error: boolean } | null) => void;
  isEditingProfile: boolean;
  setIsEditingProfile: (editing: boolean) => void;
}

export default function AccountSettings({
  state,
  theme,
  setTheme,
  isFirebaseReady,
  auth,
  handleGoogleLogin,
  handleGoogleLogout,
  handleCreateSpreadsheet,
  handleSyncAllHistory,
  isSyncingAllHistory,
  isCreatingSheet,
  sheetsSyncMessage,
  setSheetsSyncMessage,
  isEditingProfile,
  setIsEditingProfile,
}: AccountSettingsProps) {
  return (
    <div className="space-y-5">
      <div className="m3-appbar" style={{ alignItems: "center" }}>
        <div>
          <h2 className="m3-h" style={{ fontSize: "var(--m3-headline-md)", margin: "2px 0 4px" }}>Account settings</h2>
          <p className="m3-body">Configure cloud sync and save custom routines safely.</p>
        </div>
        {state.user ? (
          <Button variant="tonal" onClick={handleGoogleLogout} className="m3-btn error sm" style={{ width: "auto", flex: "none" }}>
            <LogOut className="w-[16px] h-[16px]" />
            <span>Disconnect</span>
          </Button>
        ) : null}
      </div>

      {!state.user && (
        <div style={{ textAlign: "center", padding: "4px 0 0" }}>
          <div className="m3-shape lg center" style={{ marginBottom: 10 }}>
            <svg className="sf" viewBox="0 0 100 100"><use href="#shape-sunny" fill="var(--m3-primary-cont)" /></svg>
            <span className="si"><User style={{ width: 32, height: 32, color: "var(--m3-primary)" }} /></span>
          </div>
          <div style={{ fontWeight: 500, fontSize: "var(--m3-title-lg)", color: "var(--m3-on)", margin: "6px 0 8px" }}>You're surfing as Guest</div>
          <p className="m3-body center" style={{ maxWidth: 330, margin: "0 auto 18px" }}>
            Log in with your Google account to secure your custom work logs, track exercises, and load metrics instantly across devices.
          </p>
          <Button variant="accent" onClick={handleGoogleLogin} className="m3-btn accent">
            <LogIn className="w-[18px] h-[18px]" />
            <span>Sync with Google account</span>
          </Button>
          {typeof window !== 'undefined' && window.self !== window.top && (
            <p style={{ fontFamily: "var(--m3-mono-font)", fontSize: 11, lineHeight: 1.5, color: "#d9920a", background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.18)", padding: 12, borderRadius: 14, maxWidth: 330, margin: "16px auto 0", textAlign: "left" }}>
              ⚠️ <strong>Framed sandbox notice:</strong> this framed preview blocks Google login popups. Click <strong>"Open in a new tab"</strong> at the top-right to authorize safely.
            </p>
          )}
        </div>
      )}

      {/* My athlete profile */}
      <div className="m3-card hi">
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div className="m3-shape md">
            <svg className="sf" viewBox="0 0 100 100"><use href="#shape-scallop" fill="var(--m3-primary-cont)" /></svg>
            <span className="si"><User style={{ width: 24, height: 24, color: "var(--m3-primary)" }} /></span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: "var(--m3-title-lg)", color: "var(--m3-on)" }}>My athlete profile</div>
            <p style={{ fontFamily: "var(--m3-mono-font)", fontSize: "var(--m3-label-sm)", color: "var(--m3-on-var)", marginTop: 4, lineHeight: 1.5 }}>
              {state.userProfile
                ? `${state.userProfile.age} yo · ${state.userProfile.biologicalSex} · ${state.userProfile.preferredUnits === 'Metric' ? `${state.userProfile.weightKg} kg` : `${Math.round(state.userProfile.weightKg * 2.20462)} lbs`}`
                : "No profile data set."}
              {state.userProfile ? <><br />Goal: {state.userProfile.primaryGoal}</> : null}
              {state.userProfile && (state.userProfile.trainingExperience || state.userProfile.daysPerWeek) ? (
                <><br />{state.userProfile.trainingExperience || "—"}{state.userProfile.daysPerWeek ? ` · ${state.userProfile.daysPerWeek} days/week` : ""}</>
              ) : null}
            </p>
          </div>
        </div>
        <div style={{ height: 14 }} />
        <Button variant="tonal" onClick={() => setIsEditingProfile(true)} className="m3-btn tonal-primary sm" style={{ width: "auto" }}>
          <Pencil className="w-[16px] h-[16px]" /> Edit profile
        </Button>
      </div>

      {/* Application theme */}
      <div className="m3-card hi">
        <h2 className="m3-h" style={{ fontSize: "var(--m3-title-lg)", marginTop: 0 }}>Application theme</h2>
        <p className="m3-body">Toggle between Light and Neural Expressive Dark.</p>
        <div style={{ height: 12 }} />
        <div className="m3-bgroup">
          <Button
            variant="none"
            className={`seg${theme === 'light' ? ' sel' : ''}`}
            onClick={() => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); setTheme("light"); }}
          >Light</Button>
          <Button
            variant="none"
            className={`seg${theme === 'dark' ? ' sel' : ''}`}
            onClick={() => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); setTheme("dark"); }}
          >Dark</Button>
        </div>
      </div>

      {state.user && (
        <div className="space-y-6">
          {/* Connected Profile Summary */}
          <div className="bg-white/3 border border-gray-200 dark:border-white/5 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {state.user.photoURL ? (
              <img
                src={state.user.photoURL}
                alt="Profile avatar"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full border border-indigo-500/30 ring-4 ring-indigo-500/15"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner dark:shadow-none flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 font-bold ring-4 ring-white/5">
                <User className="w-6 h-6 text-indigo-400" />
              </div>
            )}

            <div>
              <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-base">{state.user.displayName || "Google Athlete"}</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mt-0.5">{state.user.email}</p>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 mt-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse mr-1" />
                Cloud Synchronization Active
              </span>
            </div>
          </div>

          {/* Synchronization Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300/60 uppercase tracking-widest font-mono">Routine Templates</span>
              <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100 font-mono mt-1">{state.templates.length}</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">Saved workouts backed up in cloud.</p>
            </div>
            <div className="p-4 bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300/60 uppercase tracking-widest font-mono">Completed Logs</span>
              <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100 font-mono mt-1">{state.history.length}</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">Lifting statistics synced securely.</p>
            </div>
          </div>

          {/* Google Sheets Sync Control Bento Card */}
          <div className="bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm flex items-center space-x-2">
                  <span className="p-1 px-1.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">Active Integration</span>
                  <span>Google Sheet Synchronizer</span>
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 max-w-md leading-relaxed">
                  Establish a dynamic sync. Every time you finish a workout, sets, reps, weights, and coaching logs will push directly onto your personal spreadsheet.
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold self-start">
                📊
              </div>
            </div>

            {/* Status and Action Buttons */}
            {!state.googleAccessToken ? (
              <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-3 col-span-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-amber-400">Google Sheets Session Required</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-normal">
                  To obtain write permissions for spreadsheets, click below to authorize and securely link your Sheets access for this browser session.
                </p>
                <Button
                  variant="tonal"
                  onClick={handleGoogleLogin}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Authorize Google Sheets API</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Authorized & Ready */}
                <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-emerald-400">Sheets API Authorized</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Session Secure</span>
                  </div>

                  {/* Spreadsheet ID Presence */}
                  {state.spreadsheetId ? (
                    <div className="space-y-3 pt-1 border-t border-gray-200 dark:border-white/5">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 font-mono tracking-wider uppercase block">Your Target Spreadsheet:</span>
                        <a
                          href={`https://docs.google.com/spreadsheets/d/${state.spreadsheetId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 hover:underline text-indigo-400 hover:text-indigo-600 dark:text-indigo-300 text-xs mt-1 break-all"
                        >
                          <span>Open Workout Logs Sheet</span>
                          <ExternalLink className="w-3 h-3 text-indigo-400" />
                        </a>
                      </div>

                      {/* Auto Sync Toggle */}
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-white/5">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">Auto Sync Completed Sets</span>
                          <span className="text-[10px] text-gray-500 dark:text-slate-400 block">Appends on every finished workout</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={state.isSheetsSyncEnabled}
                            onChange={(e) => {
                              const newVal = e.target.checked;
                              state.setIsSheetsSyncEnabled(newVal);
                              localStorage.setItem("projectpb_sheets_sync_enabled", newVal ? "true" : "false");
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                        </label>
                      </div>

                      {/* Sync Actions Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <Button
                          variant="primary"
                          onClick={handleSyncAllHistory}
                          disabled={isSyncingAllHistory}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 disabled:bg-indigo-600/35 text-gray-900 dark:text-gray-100 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          {isSyncingAllHistory ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-900 dark:text-gray-100" />
                              <span>Syncing Logs...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Refresh Full Sync</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="none"
                          onClick={() => {
                            if (confirm("Disconnect currently linked Google Sheet? This stops cloud sheets sync.")) {
                              state.setSpreadsheetId(null);
                              localStorage.removeItem("projectpb_spreadsheet_id");
                              if (isFirebaseReady && auth && auth.currentUser) {
                                import("firebase/firestore").then(async ({ doc, setDoc }) => {
                                  const { db } = await import("../firebase");
                                  if (db) {
                                    await setDoc(doc(db, "user_sheets", auth.currentUser!.uid), {
                                      spreadsheetId: null,
                                    });
                                  }
                                });
                              }
                              setSheetsSyncMessage({ text: "Google Sheet successfully disconnected.", error: false });
                            }
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-gray-600 dark:text-slate-300 text-xs font-bold rounded-lg transition-all border border-gray-200 dark:border-white/5 cursor-pointer"
                        >
                          Unlink Sheet
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1 border-t border-gray-200 dark:border-white/5">
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-normal">
                        No linked spreadsheet found. Click below to automatically provision or restore your Project PB spreadsheet.
                      </p>
                      <Button
                        variant="tonal"
                        onClick={handleCreateSpreadsheet}
                        disabled={isCreatingSheet}
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/35 text-slate-950 text-xs font-black rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        {isCreatingSheet ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Provisioning Spreadsheet...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Project PB Workout Sheet</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Action Sync Message bar */}
            {sheetsSyncMessage && (
              <div className={`p-3 rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-1.5 ${
                sheetsSyncMessage.error ? "bg-rose-500/10 border border-rose-500/25 text-rose-300" : "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
              }`}>
                <span>{sheetsSyncMessage.text}</span>
              </div>
            )}
          </div>

          {/* Security banner */}
          <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/15 flex items-start space-x-3">
            <CloudLightning className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-300">Google Cloud Persistence Security</h5>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                Each routine backup is mapped to your unique user identifiers inside our encrypted database schema, fully preventing unauthorized reads or data injection.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
