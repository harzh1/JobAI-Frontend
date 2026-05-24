import React, { useState } from "react";

import {
  StickyNote,
  Plus,
  Trash2,
  Check,
  Loader2,
} from "../components/ui/AppIcons";

import { Card, Button } from "../components/ui/UIComponents";

import EmptyStateCard from "../components/ui/EmptyStateCard";

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

  const deleteNote = (id) => {
    if (!window.confirm("Delete this note?")) return;

    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
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
        <Card
          className="
            border border-gray-200/80
            bg-white
            shadow-sm
          "
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Create Note
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Add reminders, prep points, or quick thoughts.
                </p>
              </div>

              <Button
                onClick={() => {
                  setIsCreating(false);
                  setNewNote("");
                }}
                variant="ghost"
                className="
                  rounded-xl
                  text-gray-500
                  hover:text-gray-900
                "
              >
                Cancel
              </Button>
            </div>

            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write something..."
              className="
                w-full
                min-h-[180px]
                rounded-2xl
                border border-gray-200
                bg-gray-50
                px-4 py-3
                text-[15px]
                leading-7
                text-gray-900
                outline-none
                resize-none
                transition-all
                focus:border-[#3442FF]
                focus:ring-4 focus:ring-[#3442FF]/10
              "
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

      {/* Notes */}
      <div className="space-y-4">
        {notes.map((note, index) => (
          <Card
            key={note.id}
            className={`
              border border-gray-200/80
              bg-white
              shadow-sm
              transition-all duration-200
              hover:border-indigo-200
              hover:shadow-md
              ${
                note.isCompleted
                  ? "opacity-75"
                  : ""
              }
            `}
          >
            <div className="flex items-start gap-4">
              {/* Toggle */}
              <button
                type="button"
                onClick={() => toggleNote(note)}
                className={`
                  mt-1
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-xl
                  border
                  transition-all duration-200
                  ${
                    note.isCompleted
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : "border-gray-200 bg-gray-50 text-gray-400 hover:border-indigo-200 hover:text-[#3442FF]"
                  }
                `}
              >
                <Check
                  size={18}
                  className={
                    note.isCompleted
                      ? "opacity-100"
                      : "opacity-0"
                  }
                />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                      Note {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`
                        inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold
                        ${
                          note.isCompleted
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-indigo-100 bg-indigo-50 text-[#3442FF]"
                        }
                      `}
                    >
                      {note.isCompleted
                        ? "Completed"
                        : "Active"}
                    </span>
                  </div>

                  <Button
                    onClick={() => deleteNote(note.id)}
                    variant="ghost"
                    className="
                      h-9 w-9 p-0
                      rounded-xl
                      text-gray-300
                      hover:bg-red-50
                      hover:text-red-500
                    "
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <p
                  className={`
                    whitespace-pre-wrap
                    text-[15px]
                    leading-7
                    ${
                      note.isCompleted
                        ? "text-gray-400 line-through"
                        : "text-gray-700"
                    }
                  `}
                >
                  {note.content}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
