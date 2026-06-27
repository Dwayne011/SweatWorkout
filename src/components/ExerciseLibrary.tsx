/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { robustFetch } from "../utils/network";
import {
  Plus,
  Search,
  Dumbbell,
  Tag,
  Sparkles,
  Filter,
  ChevronRight,
  X,
  Download,
  Upload,
  Edit,
  Video,
  Image as ImageIcon,
  AlertTriangle,
  FileCode
} from "lucide-react";
import { Exercise } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { openExerciseGuide } from "./ExerciseGuideModal";

interface ExerciseLibraryProps {
  exercises: Exercise[];
  onAddCustomExercise: (name: string, category: string, equipment: string) => Promise<Exercise>;
  onUpdateCustomExercise?: (updated: Exercise) => Promise<void>;
  onImportCustomExercises?: (imported: { name: string; category: string; equipment: string; [key: string]: any }[]) => Promise<void>;
}

export default function ExerciseLibrary({
  exercises,
  onAddCustomExercise,
  onUpdateCustomExercise,
  onImportCustomExercises,
}: ExerciseLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Show / Hide Modals
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  // New custom exercise initial creation states
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Arms");
  const [newEquipment, setNewEquipment] = useState("Barbell");
  const [isSaving, setIsSaving] = useState(false);

  // Edit granular states
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Arms");
  const [editEquipment, setEditEquipment] = useState("Barbell");
  const [editVideoLink, setEditVideoLink] = useState("");
  const [editMediaUrl, setEditMediaUrl] = useState("");
  const [editMediaType, setEditMediaType] = useState<"image" | "video">("image");
  const [editSetupInstructions, setEditSetupInstructions] = useState("");
  const [editFormMechanics, setEditFormMechanics] = useState("");
  const [editCoachTip, setEditCoachTip] = useState("");
  const [editPrimaryTarget, setEditPrimaryTarget] = useState("");
  const [editSecondaryTarget, setEditSecondaryTarget] = useState("");
  const [largeFileError, setLargeFileError] = useState("");

  // AI Media Analysis states
  const [selectedFileForAnalysis, setSelectedFileForAnalysis] = useState<{ base64: string; mimeType: string; fileName: string } | null>(null);
  const [isAnalyzingMedia, setIsAnalyzingMedia] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  // Import JSON raw text state
  const [rawImportText, setRawImportText] = useState("");
  const [importError, setImportError] = useState("");

  // Get active categories list
  const uniqueCategories = Array.from(new Set(exercises.map((e) => e.category))).sort((a, b) => a.localeCompare(b));
  const categories = ["All", ...uniqueCategories];

  const filtered = exercises
    .filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = categoryFilter === "All" || ex.category === categoryFilter;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSaveCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await onAddCustomExercise(newName, newCategory, newEquipment);
      setNewName("");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (ex: Exercise) => {
    setEditingEx(ex);
    setEditName(ex.name);
    setEditCategory(ex.category);
    setEditEquipment(ex.equipment);
    setEditVideoLink(ex.videoLink || "");
    setEditMediaUrl(ex.mediaUrl || "");
    setEditMediaType(ex.mediaType || "image");
    setEditSetupInstructions(ex.setupInstructions || "");
    setEditFormMechanics(ex.formMechanics || "");
    setEditCoachTip(ex.coachTip || "");
    setEditPrimaryTarget(ex.primaryTarget || "");
    setEditSecondaryTarget(ex.secondaryTarget || "");
    setLargeFileError("");
    setSelectedFileForAnalysis(null);
    setIsAnalyzingMedia(false);
    setAnalysisError("");
    setShowEditForm(true);
  };

  const handleSaveGranularEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEx || !editName.trim() || !onUpdateCustomExercise) return;

    setIsSaving(true);
    try {
      const updated: Exercise = {
        ...editingEx,
        name: editName,
        category: editCategory,
        equipment: editEquipment,
        videoLink: editVideoLink.trim() || undefined,
        mediaUrl: editMediaUrl || undefined,
        mediaType: editMediaUrl ? editMediaType : undefined,
        setupInstructions: editSetupInstructions.trim() || undefined,
        formMechanics: editFormMechanics.trim() || undefined,
        coachTip: editCoachTip.trim() || undefined,
        primaryTarget: editPrimaryTarget.trim() || undefined,
        secondaryTarget: editSecondaryTarget.trim() || undefined,
      };

      await onUpdateCustomExercise(updated);
      setShowEditForm(false);
      setEditingEx(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Supports files up to 30MB for express/Gemini multimodal processing
    if (file.size > 30 * 1024 * 1024) {
      setLargeFileError("Selected file exceeds the 30MB analysis limit. Try a smaller image or video clip.");
      return;
    }
    setLargeFileError("");

    const isVideo = file.type.startsWith("video/");
    const reader = new FileReader();
    reader.onload = () => {
      const resultBase64 = reader.result as string;
      setSelectedFileForAnalysis({
        base64: resultBase64,
        mimeType: file.type,
        fileName: file.name
      });

      // Maintain lean DB size in Firestore:
      // Only keep visual thumbnails/loops if they are very compact (<800KB).
      // Standard video guides generate granular descriptive forms and do not need raw binary persistence.
      if (file.size < 800 * 1024) {
        setEditMediaUrl(resultBase64);
        setEditMediaType(isVideo ? "video" : "image");
      } else {
        setEditMediaUrl("");
        setLargeFileError("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunAiAnalysis = async () => {
    if (!selectedFileForAnalysis) {
      setAnalysisError("Please select an image or video file first to analyze.");
      return;
    }
    setIsAnalyzingMedia(true);
    setAnalysisError("");
    try {
      const response = await robustFetch("/api/ai/analyze-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          mediaData: selectedFileForAnalysis.base64,
          mimeType: selectedFileForAnalysis.mimeType,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: "Raw network transmission failure." }));
        throw new Error(errJson.error || "multimodal media analysis error");
      }

      const info = await response.json();
      if (info.category) setEditCategory(info.category);
      if (info.equipment) setEditEquipment(info.equipment);
      if (info.setupInstructions) setEditSetupInstructions(info.setupInstructions);
      if (info.formMechanics) setEditFormMechanics(info.formMechanics);
      if (info.coachTip) setEditCoachTip(info.coachTip);
      if (info.primaryTarget) setEditPrimaryTarget(info.primaryTarget);
      if (info.secondaryTarget) setEditSecondaryTarget(info.secondaryTarget);

      alert("AI analysis succeeded! Automatically extracted exact setups, posture alignment mechanics, cues and targets.");
    } catch (err: any) {
      console.error("AI analysis issue:", err);
      setAnalysisError(err?.message || "multimodal parsing error. Please check your network and API configuration.");
    } finally {
      setIsAnalyzingMedia(false);
    }
  };

  const handleExport = () => {
    const customOnly = exercises.filter((ex) => ex.isCustom);
    if (customOnly.length === 0) {
      alert("You don't have any custom exercises to export yet! Create some first.");
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customOnly, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "sw3at_custom_exercises.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawImportText.trim() || !onImportCustomExercises) return;

    try {
      const parsed = JSON.parse(rawImportText);
      const exercisesArray = Array.isArray(parsed) ? parsed : [parsed];

      // Validate basic shape
      const isValid = exercisesArray.every(
        (item) => typeof item === "object" && item !== null && item.name && item.category && item.equipment
      );

      if (!isValid) {
        setImportError("Import failed. Elements must contain descriptive name, category, and equipment keys.");
        return;
      }

      onImportCustomExercises(exercisesArray);
      setRawImportText("");
      setImportError("");
      setShowImportForm(false);
      alert(`Import complete! Loaded ${exercisesArray.length} custom exercises successfully.`);
    } catch (err) {
      setImportError("Malformed JSON input structure. Please verify keys and bracket alignments.");
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportCustomExercises) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const exercisesArray = Array.isArray(parsed) ? parsed : [parsed];

        const isValid = exercisesArray.every(
          (item) => typeof item === "object" && item !== null && item.name && item.category && item.equipment
        );

        if (!isValid) {
          alert("Import parsed JSON format is invalid. Ensure objects contain a name, category, and equipment.");
          return;
        }

        onImportCustomExercises(exercisesArray);
        setShowImportForm(false);
        alert(`Successfully uploaded and loaded ${exercisesArray.length} custom exercises!`);
      } catch (err) {
        alert("Incorrect JSON structure parsing failure.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-40 w-full max-w-full min-w-0" id="exercise-library-container">
      <style>
        {`
          @keyframes swipe-wiggle {
            0%, 50%, 100% { transform: translateX(0); }
            10%, 30% { transform: translateX(-8px); }
            20%, 40% { transform: translateX(8px); }
          }
          .animate-swipe-wiggle {
            animation: swipe-wiggle 4s ease-in-out infinite;
          }
        `}
      </style>
      {/* Search Header Banner & Quick Actions */}
      <div className="bg-white dark:bg-black w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 p-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3 min-w-0">
        <div className="relative flex-1 min-w-0 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-indigo-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs md:text-sm bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 font-semibold font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-gray-200 dark:border-white/10 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create Custom</span>
          </button>

          <div className="bgroup">
            <button
              onClick={handleExport}
              className="px-3.5 py-2.5 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-800 dark:text-slate-200 text-xs font-bold shadow flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              title="Download your custom exercises collections as JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Export Collection</span>
            </button>

            <button
              onClick={() => setShowImportForm(true)}
              className="px-3.5 py-2.5 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-800 dark:text-slate-200 text-xs font-bold shadow flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              title="Import custom exercise guides"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Scrolling tabs */}
      <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-full relative min-w-0 group rounded-xl">
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white/80 dark:from-black/80 to-transparent pointer-events-none z-10 flex items-center justify-end pr-1 md:hidden">
            <ChevronRight className="w-4 h-4 text-indigo-500 opacity-60 animate-swipe-wiggle" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-4 invisible-scrollbar w-full touch-pan-x min-w-0 overflow-y-hidden" style={{ WebkitOverflowScrolling: "touch", paddingRight: "40px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 text-xs rounded-xl font-bold font-mono uppercase tracking-wide shrink-0 transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
                categoryFilter === cat
                  ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-500/30"
                  : "bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner shadow-md dark:shadow-none border border-gray-200 dark:border-white/5 text-gray-500 dark:text-slate-400 hover:border-gray-200 dark:border-white/10 hover:text-gray-900 dark:text-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List with inline Edit button for custom exercises */}
      <div className="bg-white dark:bg-black dark:border-white/10 shadow-sm rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden divide-y divide-gray-100 dark:divide-white/5 shadow-2xl">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400 text-xs font-semibold font-mono">
            No matching exercises in your library yet.
          </div>
        ) : (
          filtered.map((item) => {
            const rawName = item.name;
            const nameMatch = rawName.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
            const mainTitle = nameMatch ? nameMatch[1].trim() : rawName;
            const subtitleModifier = nameMatch ? nameMatch[2].trim() : null;

            return (
              <div
                key={item.id}
                onClick={() => openExerciseGuide(item)}
                style={{ contentVisibility: 'auto', containIntrinsicSize: '0 80px' }}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group w-full"
                title="Click to view setup and guide demonstration"
              >
                <div className="flex flex-row items-center space-x-3.5 flex-1 min-w-0 pr-3">
                  <div className="p-2.5 bg-white dark:bg-black dark:border-white/10 shadow-sm text-indigo-600 dark:text-indigo-400 rounded-xl border border-gray-200 dark:border-white/5 shrink-0 group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:text-indigo-300 transition-colors">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base flex flex-wrap items-center gap-1.5 group-hover:text-indigo-550 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      <span className="whitespace-normal break-words flex-1 min-w-0">{mainTitle}</span>
                      {item.isCustom && (
                        <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-bold px-1.5 py-0.5 rounded-lg uppercase tracking-wider font-mono shrink-0">
                          Custom
                        </span>
                      )}
                    </h4>
                    {subtitleModifier && (
                      <div className="text-[13px] font-semibold text-indigo-500 dark:text-indigo-300 mt-0.5 leading-snug">
                        {subtitleModifier}
                      </div>
                    )}
                    <p className="text-[11px] sm:text-[12px] font-mono tracking-wide font-bold text-slate-400 dark:text-slate-500 uppercase mt-1 flex items-center space-x-1">
                      <span>{item.category}</span>
                      <span className="text-gray-300 dark:text-gray-100/10">&bull;</span>
                      <span>{item.equipment}</span>
                    </p>
                  </div>
                </div>
              
              <div className="flex items-center space-x-2">
                {item.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid triggering open guide
                      handleStartEdit(item);
                    }}
                    className="p-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 hover:text-white dark:hover:text-white border border-indigo-500/20 hover:border-indigo-400 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                    title="Edit granular guide details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* MODAL 1: CREATE RECENTLY ADDED */}
      {showAddForm && createPortal(
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-black backdrop-blur-xl rounded-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl relative"
            >
              <div className="p-4 bg-black/30 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <span>Create Custom Exercise</span>
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:bg-black dark:border-white/10 shadow-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCustom} className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1.5 font-mono">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kettlebell Arm halo"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs font-semibold bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1.5 font-mono">
                      Muscle Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full text-xs font-semibold bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 text-gray-900 dark:text-gray-100"
                    >
                      <option value="Arms" className="bg-white dark:bg-black">Arms</option>
                      <option value="Back" className="bg-white dark:bg-black">Back</option>
                      <option value="Cardio" className="bg-white dark:bg-black">Cardio</option>
                      <option value="Chest" className="bg-white dark:bg-black">Chest</option>
                      <option value="Core" className="bg-white dark:bg-black">Core</option>
                      <option value="Legs" className="bg-white dark:bg-black">Legs</option>
                      <option value="Shoulders" className="bg-white dark:bg-black">Shoulders</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1.5 font-mono">
                      Equipment Type
                    </label>
                    <select
                      value={newEquipment}
                      onChange={(e) => setNewEquipment(e.target.value)}
                      className="w-full text-xs font-semibold bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 text-gray-900 dark:text-gray-100"
                    >
                      <option value="Barbell" className="bg-white dark:bg-black">Barbell</option>
                      <option value="Bodyweight" className="bg-white dark:bg-black">Bodyweight</option>
                      <option value="Cables" className="bg-white dark:bg-black">Cables</option>
                      <option value="Dumbbell" className="bg-white dark:bg-black">Dumbbell</option>
                      <option value="Machine" className="bg-white dark:bg-black">Machine</option>
                      <option value="Other" className="bg-white dark:bg-black">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-800 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !newName.trim()}
                    className="px-4 py-2 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-gray-200 dark:border-white/10 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-md transition-all disabled:opacity-55 cursor-pointer"
                  >
                    <span>{isSaving ? "Saving..." : "Create"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: EDIT GRANULAR DETAILS (Saves to user account) */}
      {showEditForm && editingEx && createPortal(
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-black backdrop-blur-3xl rounded-2xl w-full max-w-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl relative flex flex-col max-h-[92vh]"
            >
              <div className="p-4 bg-black/30 border-b border-gray-200 dark:border-white/5 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center space-x-2">
                  <Edit className="w-5 h-5 text-indigo-400" />
                  <span>Configure Custom Exercise Guide</span>
                </h3>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingEx(null);
                  }}
                  className="p-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:bg-black dark:border-white/10 shadow-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGranularEdit} className="p-5 overflow-y-auto flex-1 space-y-4">
                {/* Visual warning */}
                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3 flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-indigo-250 leading-relaxed font-semibold">
                    Configuring these files bypasses default synthetic loops and populates correct setups, real YouTube tutorial displays, or your own photo/video demonstrations!
                  </p>
                </div>

                {/* Primary properties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1 font-mono">
                      Exercise Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-xs font-semibold bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1 font-mono">
                        Category
                      </label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full text-xs font-semibold bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Arms">Arms</option>
                        <option value="Back">Back</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Chest">Chest</option>
                        <option value="Core">Core</option>
                        <option value="Legs">Legs</option>
                        <option value="Shoulders">Shoulders</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1 font-mono">
                        Equipment
                      </label>
                      <select
                        value={editEquipment}
                        onChange={(e) => setEditEquipment(e.target.value)}
                        className="w-full text-xs font-semibold bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Barbell">Barbell</option>
                        <option value="Bodyweight">Bodyweight</option>
                        <option value="Cables">Cables</option>
                        <option value="Dumbbell">Dumbbell</option>
                        <option value="Machine">Machine</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Media options */}
                <div className="border-t border-gray-200 dark:border-white/5 pt-3.5 space-y-3.5">
                  <h4 className="text-[10px] font-extrabold text-gray-900 dark:text-gray-100 tracking-wider uppercase font-mono">
                    Media Demonstration Setup
                  </h4>

                  <div>
                    <label className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1 font-mono">
                      YouTube Video Link
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      value={editVideoLink}
                      onChange={(e) => setEditVideoLink(e.target.value)}
                      className="w-full text-xs font-semibold bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                    />
                  </div>

                  {/* Upload option */}
                  <div>
                    <label className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1 font-mono">
                      Upload Self-Demonstration Media (Image or Video)
                    </label>
                    <div className="mt-1.5 flex flex-col md:flex-row items-center gap-3">
                      <label className="px-4 py-2.5 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-350 cursor-pointer flex items-center space-x-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Choose Media File</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleMediaUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono leading-tight">
                        Supports video clips & photos up to 30MB. Only compact files (&lt;800KB) are synchronized to the cloud; larger clips are analyzed by Gemini 3.5 Flash to automatically populate correct mechanics, and then discarded to save database storage!
                      </span>
                    </div>

                    {largeFileError && (
                      <div className="mt-2 text-rose-400 text-[10px] font-semibold flex items-center gap-1 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{largeFileError}</span>
                      </div>
                    )}

                    {/* Loaded file indicator for high-level AI analysis */}
                    {selectedFileForAnalysis && (
                      <div className="mt-3.5 p-3.5 bg-indigo-950/10 border border-indigo-500/20 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {selectedFileForAnalysis.mimeType.startsWith("video/") ? (
                              <Video className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-indigo-400" />
                            )}
                            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                              {selectedFileForAnalysis.fileName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFileForAnalysis(null);
                              setEditMediaUrl("");
                              setAnalysisError("");
                            }}
                            className="text-[9px] text-rose-500 font-bold uppercase tracking-widest hover:underline cursor-pointer"
                          >
                            Remove File
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={isAnalyzingMedia}
                          onClick={handleRunAiAnalysis}
                          className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-950/10"
                        >
                          {isAnalyzingMedia ? (
                            <>
                              <Sparkles className="w-4 h-4 animate-spin text-white" />
                              <span>AI Analyzing Technique & Biomechanics...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-305 animate-pulse" />
                              <span>✨ AI Analyze & Autofill Movement Guide</span>
                            </>
                          )}
                        </button>

                        {analysisError && (
                          <p className="text-[10px] text-rose-400 font-semibold font-mono leading-relaxed mt-1">
                            ⚠️ {analysisError}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Standard Media Preview Box (displayed if saved to cloud) */}
                    {editMediaUrl && !selectedFileForAnalysis && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-2.5">
                          {editMediaType === "video" ? (
                            <Video className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-indigo-400" />
                          )}
                          <span className="text-[10px] text-slate-500 dark:text-slate-350 font-mono italic">
                            Cloud-synced visual demo active
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditMediaUrl("");
                            setLargeFileError("");
                          }}
                          className="text-[9px] text-rose-500 font-bold uppercase tracking-widest hover:underline cursor-pointer"
                        >
                          Clear Attachment
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Granular Setup/Form Instructions */}
                <div className="border-t border-gray-200 dark:border-white/5 pt-3.5 space-y-3.5">
                  <h4 className="text-[10px] font-extrabold text-gray-900 dark:text-gray-100 tracking-wider uppercase font-mono">
                    Granular Instruction Steps
                  </h4>

                  <div>
                    <label className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1.5 font-mono">
                      Correct Equipment Setup (One action point per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Adjust the cable pulley to chest height&#10;Maintain 2 paces of back stepping distance for active tension"
                      value={editSetupInstructions}
                      onChange={(e) => setEditSetupInstructions(e.target.value)}
                      className="w-full text-xs font-semibold bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1.5 font-mono">
                      Body Form & Mechanics (One mechanical rule per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Keep shoulder blades back and down&#10;Exhale as you press, keeping your wrists locked rigid"
                      value={editFormMechanics}
                      onChange={(e) => setEditFormMechanics(e.target.value)}
                      className="w-full text-xs font-semibold bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1 font-mono">
                      Coach Pro-Tip (Summary warning or cue)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Focus on squeezing your pinkies together at peak squeeze to lock muscle pump"
                      value={editCoachTip}
                      onChange={(e) => setEditCoachTip(e.target.value)}
                      className="w-full text-xs font-semibold bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1 font-mono">
                        Primary Target (comma-separated list)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pectorals, Anterior Deltoids"
                        value={editPrimaryTarget}
                        onChange={(e) => setEditPrimaryTarget(e.target.value)}
                        className="w-full text-xs font-semibold bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1 font-mono">
                        Secondary Target (comma-separated list)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Triceps, Rotator cuff"
                        value={editSecondaryTarget}
                        onChange={(e) => setEditSecondaryTarget(e.target.value)}
                        className="w-full text-xs font-semibold bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer buttons Inside scroll */}
                <div className="pt-3.5 flex justify-end space-x-2 border-t border-gray-200 dark:border-white/5 sticky bottom-0 bg-white dark:bg-black py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingEx(null);
                    }}
                    className="px-4 py-2 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-800 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !editName.trim()}
                    className="px-4 py-2 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-gray-200 dark:border-white/10 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-md transition-all disabled:opacity-55 cursor-pointer"
                  >
                    <span>{isSaving ? "Saving..." : "Save Config to Account"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: IMPORT PORTAL */}
      {showImportForm && createPortal(
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-black backdrop-blur-xl rounded-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl relative"
            >
              <div className="p-4 bg-black/30 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center space-x-2">
                  <FileCode className="w-5 h-5 text-indigo-400" />
                  <span>Import Custom Exercises</span>
                </h3>
                <button
                  onClick={() => setShowImportForm(false)}
                  className="p-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:bg-black dark:border-white/10 shadow-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Method 1: Direct JSON Upload */}
                <div>
                  <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1.5 font-mono">
                    Method 1: Upload JSON File
                  </label>
                  <label className="w-full flex flex-col items-center justify-center p-5 border border-dashed border-white/15 rounded-xl bg-white dark:bg-black hover:bg-black/30 transition-colors cursor-pointer text-center space-y-1.5 focus-within:ring-1 focus-within:ring-indigo-500">
                    <Upload className="w-6 h-6 text-indigo-400" />
                    <span className="text-xs font-bold text-gray-600 dark:text-slate-300">Choose custom_exercises.json</span>
                    <span className="text-[10px] text-slate-500 font-mono">Loads file structure instantly</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-gray-200 dark:border-white/5"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Or</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-white/5"></div>
                </div>

                {/* Method 2: Raw text Paste */}
                <form onSubmit={handleImportTextSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1 text-mono">
                      Method 2: Paste Raw JSON Object/Array
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder='[&#10;  {&#10;    "name": "Custom Pushup",&#10;    "category": "Chest",&#10;    "equipment": "Bodyweight"&#10;  }&#10;]'
                      value={rawImportText}
                      onChange={(e) => setRawImportText(e.target.value)}
                      className="w-full text-xs font-semibold bg-black/45 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-550 text-gray-900 dark:text-gray-100 font-mono leading-relaxed placeholder-gray-650"
                    />
                  </div>

                  {importError && (
                    <div className="text-rose-455 text-[10px] font-semibold flex items-center gap-1 font-mono leading-tight">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{importError}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowImportForm(false)}
                      className="px-4 py-2 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-800 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!rawImportText.trim()}
                      className="px-4 py-2 bg-gradient-to-tr from-indigo-640 via-violet-640 to-purple-640 hover:from-indigo-550 hover:to-purple-550 border border-gray-200 dark:border-white/10 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-md transition-all disabled:opacity-55 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse and Load</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
