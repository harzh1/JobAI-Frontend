import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  X,
  Save,
  FileText,
  Loader2,
} from "../components/ui/AppIcons";

import { Card, Button } from "../components/ui/UIComponents";
import { useAuth } from "../context/AuthContext";
import { allDetailsService } from "../services/database";
import EmptyStateCard from "../components/ui/EmptyStateCard";

export default function AllDetails() {
  const { user } = useAuth();

  const [userDetails, setUserDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadDetails = async () => {
      setIsLoading(true);

      try {
        const data = await allDetailsService.get(user.uid);

        const details = (data.details || []).map((d, index) => ({
          ...d,
          id: index,
        }));

        setUserDetails(details);
      } catch (error) {
        console.error("Error loading details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [user]);

  const saveToFirestore = async (details) => {
    if (!user) return;

    setIsSaving(true);

    try {
      const detailsToSave = details.map(({ id: _id, ...rest }) => rest);

      await allDetailsService.save(user.uid, detailsToSave);
    } catch (error) {
      console.error("Error saving details:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (id, currentValue) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (id) => {
    if (!editValue.trim()) return;

    const updatedDetails = userDetails.map((d) =>
      d.id === id ? { ...d, value: editValue } : d
    );

    setUserDetails(updatedDetails);

    await saveToFirestore(updatedDetails);

    setEditingId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this detail?")) return;

    const updatedDetails = userDetails.filter((d) => d.id !== id);

    const reindexed = updatedDetails.map((d, index) => ({
      ...d,
      id: index,
    }));

    setUserDetails(reindexed);

    await saveToFirestore(reindexed);
  };

  const handleAddNew = async () => {
    const label = window.prompt("Enter field label:");
    if (!label?.trim()) return;

    const value = window.prompt("Enter field value:");
    if (!value?.trim()) return;

    const newDetail = {
      id: userDetails.length,
      label: label.trim(),
      value: value.trim(),
      category: "general",
    };

    const updatedDetails = [...userDetails, newDetail];

    setUserDetails(updatedDetails);

    await saveToFirestore(updatedDetails);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2
          className="animate-spin text-[#3442FF] mb-4"
          size={32}
        />

        <p className="text-sm text-gray-500">
          Loading your details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <div className="flex items-center gap-3 sm:mr-auto">
          {isSaving && (
            <span className="flex items-center gap-2 text-sm text-[#3442FF]">
              <Loader2 className="animate-spin" size={14} />
              Saving changes...
            </span>
          )}
        </div>

        <Button
          variant="primary"
          onClick={handleAddNew}
          icon={Plus}
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          Add Detail
        </Button>
      </div>

      {/* Empty State */}
      {userDetails.length === 0 && (
        <EmptyStateCard
          icon={FileText}
          title="No details added yet"
          description="Add your personal information to auto-fill job applications."
        />
      )}

      {/* Details */}
      <div className="space-y-4">
        {userDetails.map((detail) => (
          <Card
            key={detail.id}
            className="
              border border-gray-200/80
              bg-white
              shadow-sm
              transition-all duration-200
              hover:border-indigo-200
              hover:shadow-md
            "
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="mb-3">
                  <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3442FF]">
                    {detail.label}
                  </span>
                </div>

                {editingId === detail.id ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={4}
                    autoFocus
                    className="
                      w-full
                      rounded-2xl
                      border border-gray-200
                      bg-gray-50
                      px-4 py-3
                      text-sm text-gray-900
                      outline-none
                      resize-none
                      transition-all
                      focus:border-[#3442FF]
                      focus:ring-4 focus:ring-[#3442FF]/10
                    "
                  />
                ) : (
                  <p className="text-[15px] leading-7 text-gray-700 whitespace-pre-wrap">
                    {detail.value}
                  </p>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                {editingId === detail.id ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => handleSaveEdit(detail.id)}
                      className="
                        h-9 w-9 p-0
                        rounded-xl
                        hover:bg-green-50
                        hover:text-green-600
                      "
                    >
                      <Save size={16} />
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="
                        h-9 w-9 p-0
                        rounded-xl
                        hover:bg-red-50
                        hover:text-red-600
                      "
                    >
                      <X size={16} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        handleStartEdit(detail.id, detail.value)
                      }
                      className="
                        h-9 w-9 p-0
                        rounded-xl
                        hover:bg-indigo-50
                        hover:text-[#3442FF]
                      "
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(detail.id)}
                      className="
                        h-9 w-9 p-0
                        rounded-xl
                        hover:bg-red-50
                        hover:text-red-600
                      "
                    >
                      <X size={16} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
