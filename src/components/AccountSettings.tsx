import React from "react";
import { User, LogOut, LogIn, ExternalLink, Loader2, RefreshCw, Plus, CloudLightning } from "lucide-react";

interface AccountSettingsProps {
  state: any;
  theme: string;
  setTheme: (theme: string) => void;
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
    <div className="bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner shadow-md dark:shadow-none backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 dark:border-white/5 pb-5 gap-4">
        <div>
          <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg md:text-xl">Account Settings</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">Configure cloud synchronization and save custom routines safely.</p>
        </div>

        <div className="flex items-center gap-3">
          {state.user ? (
            <button
              onClick={handleGoogleLogout}
              className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 dark:text-rose-450 border border-rose-500/20 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all font-mono"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Sync</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* My Profile Section */}
      <div className="bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span>My Athlete Profile</span>
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
              {state.userProfile
                ? `${state.userProfile.age} yo ${state.userProfile.biologicalSex} • ${state.userProfile.preferredUnits === 'Metric' ? `${state.userProfile.weightKg} kg` : `${Math.round(state.userProfile.weightKg * 2.20462)} lbs`} • Goal: ${state.userProfile.primaryGoal}`
                : "No profile data set."}
            </p>
          </div>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* App Appearance Settings */}
      <div className="bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm flex items-center space-x-2">
              <span>Application Theme</span>
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">
              Toggle between Light Mode and Neural Expressive Dark Mode.
            </p>
          </div>
        </div>
        <div className="flex bg-purple-50/50 dark:bg-black p-1 rounded-xl w-full border border-purple-100 dark:border-purple-500/20 mt-4">
          <button
            role="tab"
            aria-selected={theme === 'light'}
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
              setTheme("light");
            }}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              theme === 'light'
                ? "bg-white dark:bg-purple-600 text-purple-700 dark:text-white ring-1 ring-purple-200 dark:ring-purple-500/50 shadow-sm"
                : "text-purple-600/70 dark:text-purple-300/70 hover:text-purple-700 dark:hover:text-purple-200 hover:bg-purple-100/50 dark:hover:bg-purple-500/10"
            }`}
          >
            Light
          </button>
          <button
            role="tab"
            aria-selected={theme === 'dark'}
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
              setTheme("dark");
            }}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              theme === 'dark'
                ? "bg-white dark:bg-purple-600 text-purple-700 dark:text-white ring-1 ring-purple-200 dark:ring-purple-500/50 shadow-sm"
                : "text-purple-600/70 dark:text-purple-300/70 hover:text-purple-700 dark:hover:text-purple-200 hover:bg-purple-100/50 dark:hover:bg-purple-500/10"
            }`}
          >
            Dark
          </button>
        </div>
      </div>

      {state.user ? (
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
                <button
                  onClick={handleGoogleLogin}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer hover:scale-[1.02]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Authorize Google Sheets API</span>
                </button>
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
                              localStorage.setItem("sw3at_sheets_sync_enabled", newVal ? "true" : "false");
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                        </label>
                      </div>

                      {/* Sync Actions Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <button
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
                        </button>

                        <button
                          onClick={() => {
                            if (confirm("Disconnect currently linked Google Sheet? This stops cloud sheets sync.")) {
                              state.setSpreadsheetId(null);
                              localStorage.removeItem("sw3at_spreadsheet_id");
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
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1 border-t border-gray-200 dark:border-white/5">
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-normal">
                        No linked spreadsheet found. Click below to automatically provision or restore your Project PB spreadsheet.
                      </p>
                      <button
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
                      </button>
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
      ) : (
        <div className="text-center py-10 space-y-5">
          <User className="w-16 h-16 text-indigo-500/20 mx-auto animate-pulse" />
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-base">You are surfing as Guest</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Log in with your Google account to secure your custom work logs, track exercises, and load metrics instantly across desktops or phones.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="px-6 py-3 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-550 hover:to-purple-550 text-white font-black text-xs rounded-xl shadow-lg inline-flex items-center space-x-2.5 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.96] ring-1 ring-white/10"
          >
            <LogIn className="w-4 h-4 text-white" />
            <span>Sync with Google Account</span>
          </button>

          {typeof window !== 'undefined' && window.self !== window.top && (
            <p className="text-[10px] text-[#f59e0b] leading-normal font-mono bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl max-w-sm mx-auto text-left">
              ⚠️ <strong>Framed Sandbox Notice:</strong> This framed preview blocks Google login popups. Click <strong>"Open in a new tab"</strong> at the top-right of your screen to authorize safely.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
