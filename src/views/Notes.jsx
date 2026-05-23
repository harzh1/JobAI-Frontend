import React, { useState } from "react";
import { StickyNote, Plus, Square, Trash2, CheckSquare } from "../components/ui/AppIcons";
import { Card, Button } from "../components/ui/UIComponents";

export default function Notes({ notes, setNotes }) {
  const [newNote, setNewNote] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: `note-${Date.now()}`,
      content: newNote,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      type: "note",
    };
    setNotes([note, ...notes]);
    setNewNote("");
    setIsCreating(false);
  };

  const toggleNote = (note) => {
    setNotes(
      notes.map((n) =>
        n.id === note.id ? { ...n, isCompleted: !n.isCompleted } : n
      )
    );
  };

  const deleteNote = (id) => {
    if (window.confirm("Delete this note?"))
      setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto sm:ml-auto">
            <Plus size={18} />
            New Note
          </Button>
        )}
      </div>

      <div className="space-y-5 min-h-[320px]">
        {isCreating && (
          <Card className="border border-gray-200/80 bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-3">
                <Button
                  onClick={() => {
                    setIsCreating(false);
                    setNewNote("");
                  }}
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-900"
                >
                  Cancel
                </Button>
              </div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note, reminder, or quick task..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm h-40 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-400 resize-none"
              />
              <div className="flex justify-end">
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  Add Note
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-5">
          {notes.length === 0 ? (
            <Card className="min-h-[320px] flex flex-col items-center justify-center text-center border border-dashed border-gray-200 bg-gray-50/50">
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-indigo-400 shadow-sm mb-5">
                <StickyNote size={24} />
              </div>
              <h3 className="text-gray-900 font-bold text-xl mb-2">No notes yet</h3>
              <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                Create your first note to keep track of reminders, prep points, or follow-ups.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {notes.map((note, index) => (
                <Card
                  key={note.id}
                  className={`group border border-gray-200/80 bg-white/95 backdrop-blur-sm shadow-[0_14px_36px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(15,23,42,0.08)] ${
                    note.isCompleted ? "opacity-80" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => toggleNote(note)}
                      className={`mt-0.5 w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 transition-all ${
                        note.isCompleted
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : "bg-gray-50 border-gray-200 text-gray-400 hover:border-indigo-200 hover:text-indigo-600"
                      }`}
                    >
                      {note.isCompleted ? (
                        <CheckSquare size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-semibold">
                            Note {String(index + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              note.isCompleted
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            }`}
                          >
                            {note.isCompleted ? "Completed" : "Active"}
                          </span>
                        </div>

                        <Button
                          onClick={() => deleteNote(note.id)}
                          variant="ghost"
                          className="p-0 text-gray-300 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <p
                        className={`text-[15px] leading-7 ${
                          note.isCompleted
                            ? "line-through text-gray-400"
                            : "text-gray-800"
                        }`}
                      >
                        {note.content}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
