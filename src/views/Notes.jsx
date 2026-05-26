import React, { useState } from "react";

import {
  StickyNote,
  Plus,
  Trash2,
  Check,
  Loader2,
  Pencil,
  X,
  Save,
} from "../components/ui/AppIcons";

import { Card, Button } from "../components/ui/UIComponents";

import EmptyStateCard from "../components/ui/EmptyStateCard";
import ConfirmDialog from "../components/ui/ConfirmDialog";

export default function Notes({ notes, setNotes }) {
  const [newNote, setNewNote] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note = {
      id: `note-${Date.now()}`,
      content: newNote,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setNotes([note, ...notes]);

    setNewNote("");
    setIsCreating(false);
  };

  const toggleNote = (note) => {
    setNotes(
      notes.map((n) =>
        n.id === note.id
          ? { ...n, isCompleted: !n.isCompleted }
          : n
      )
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setNotes(notes.filter((n) => n.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleEditClick = (note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = (id) => {
    if (!editContent.trim()) return;
    setNotes(notes.map((n) => (n.id === id ? { ...n, content: editContent } : n)));
    setEditingId(null);
    setEditContent("");
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full sm:w-auto"
            icon={Plus}
          >
            New Note
          </Button>
        )}
      </div>

      {/* Create Note */}
      {isCreating && (
        <Card className="transition-all duration-300 border-none bg-white dark:bg-[var(--surface-bg)] shadow-md">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Create Note
                </h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Add reminders, prep points, or quick thoughts.
                </p>
              </div>

              <Button
                onClick={() => {
                  setIsCreating(false);
                  setNewNote("");
                }}
                variant="ghost"
                className="rounded-full text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-gray-100"
              >
                Cancel
              </Button>
            </div>

            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write something..."
              autoFocus
              className="w-full min-h-[180px] rounded-xl px-4 py-3 text-[15px] leading-7 outline-none resize-y transition-all bg-transparent border border-[#e1e5ea] dark:border-[#333538]/50 focus:border-[#3442FF] focus:ring-4 focus:ring-[#3442FF]/10 text-black"
            />

            <div className="flex justify-end">
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                Add Note
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {notes.length === 0 && !isCreating && (
        <EmptyStateCard
          icon={StickyNote}
          title="No notes yet"
          description="Create your first note to keep track of reminders, prep points, or follow-ups."
        />
      )}

      {/* Notes Table */}
      {notes.length > 0 && (
        <div className="overflow-hidden animate-in fade-in duration-300 px-2">
          <table className="w-full text-left min-w-[600px] border-collapse">
            <thead className="text-[12px] uppercase tracking-widest text-black font-bold border-b border-[#e1e5ea]">
              <tr>
                <th className="py-4 px-2 font-bold border-none w-24">Status</th>
                <th className="py-4 px-4 font-bold border-none">Note Content</th>
                <th className="py-4 px-4 font-bold border-none w-48">Date & Time</th>
                <th className="py-4 px-4 font-bold border-none w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-[#e1e5ea]/60">
              {notes.map((note) => (
                <tr
                  key={note.id}
                  className={`group hover:bg-[#f8fafd] transition-colors duration-200 ${note.isCompleted ? "opacity-70" : ""
                    }`}
                >
                  <td className="py-4 px-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => toggleNote(note)}
                      className={`flex items-center gap-2 text-[13px] font-bold transition-colors duration-200 rounded-full py-1.5 ${note.isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-black"
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${note.isCompleted
                            ? "border-emerald-500 bg-emerald-500 dark:border-emerald-500 dark:bg-emerald-500"
                            : "border-gray-300 dark:border-gray-600"
                          }`}
                      >
                        {note.isCompleted && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      {note.isCompleted ? "Done" : "Active"}
                    </button>
                  </td>
                  <td className="py-4 px-4 align-middle">
                    {editingId === note.id ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        autoFocus
                        className="w-full rounded-xl px-4 py-3 text-[15px] outline-none resize-y transition-all bg-transparent border border-[#e1e5ea] dark:border-[#333538]/50 focus:border-[#3442FF] focus:ring-4 focus:ring-[#3442FF]/10 text-black"
                      />
                    ) : (
                      <p
                        className={`whitespace-pre-wrap leading-relaxed line-clamp-2 break-all ${note.isCompleted
                            ? "text-[var(--muted)] line-through opacity-70"
                            : "text-black text-[15px] font-medium"
                          }`}
                      >
                        {note.content}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-black text-[14px]">
                    {note.createdAt ? formatDate(note.createdAt) : "Unknown"}
                  </td>
                  <td className="py-4 px-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === note.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(note.id)}
                            className="p-2 rounded-full text-[#3442FF] hover:bg-[#3442FF]/10 transition-colors"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-gray-100 transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(note)}
                            className="p-2 rounded-full text-gray-400 hover:text-[#3442FF] hover:bg-[#3442FF]/10 transition-all duration-200 inline-flex"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(note)}
                            className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 inline-flex"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this note?"
        description="This note will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
