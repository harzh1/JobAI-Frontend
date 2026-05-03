import React, { useState } from "react";
import { StickyNote, Plus, Square, Trash2, CheckSquare } from "../components/ui/AppIcons";
import { Card, Button } from "../components/ui/UIComponents";

export default function Notes({ notes, setNotes }) {
  const [newNote, setNewNote] = useState("");

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
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Notes & Tasks</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-600" /> New Note
            </h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm h-32 mb-4"
            />
            <Button
              onClick={handleAddNote}
              className="w-full"
              disabled={!newNote.trim()}
            >
              Add Note
            </Button>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          {notes.length === 0 ? (
            <p className="text-center text-gray-500">No notes yet.</p>
          ) : (
            notes.map((note) => (
              <Card
                key={note.id}
                className={`group border-l-4 ${
                  note.isCompleted
                    ? "border-l-gray-300 opacity-75"
                    : "border-l-indigo-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Button
                    onClick={() => toggleNote(note)}
                    variant="ghost"
                    className="mt-0.5 p-0 text-gray-400 hover:text-green-600"
                  >
                    {note.isCompleted ? (
                      <CheckSquare size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </Button>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        note.isCompleted
                          ? "line-through text-gray-500"
                          : "text-gray-800"
                      }`}
                    >
                      {note.content}
                    </p>
                  </div>
                  <Button
                    onClick={() => deleteNote(note.id)}
                    variant="ghost"
                    className="p-0 text-gray-300 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
