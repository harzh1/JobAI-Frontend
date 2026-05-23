import React, { useState, useEffect } from "react";
import { Plus, Pencil, X, Save, FileText, Loader2 } from "../components/ui/AppIcons";
import { Card, Button } from "../components/ui/UIComponents";
import { useAuth } from "../context/AuthContext";
import { allDetailsService } from "../services/database";

export default function AllDetails() {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Load details from Firestore
  useEffect(() => {
    if (!user) return;

    const loadDetails = async () => {
      setIsLoading(true);
      try {
        const data = await allDetailsService.get(user.uid);
        // Transform array to include IDs for editing
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

  // Save details to Firestore
  const saveToFirestore = async (details) => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Remove the local id before saving
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
    if (window.confirm("Are you sure you want to delete this detail?")) {
      const updatedDetails = userDetails.filter((d) => d.id !== id);
      // Re-index the IDs
      const reindexed = updatedDetails.map((d, index) => ({ ...d, id: index }));
      setUserDetails(reindexed);
      await saveToFirestore(reindexed);
    }
  };

  const handleAddNew = async () => {
    const label = window.prompt("Enter field label:");
    if (!label || !label.trim()) return;

    const value = window.prompt("Enter field value:");
    if (!value || !value.trim()) return;

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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
        <p className="text-gray-600">Loading your details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-end items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="flex items-center gap-1 text-sm text-indigo-600">
                <Loader2 className="animate-spin" size={14} />
                Saving...
              </span>
            )}
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleAddNew}
          icon={Plus}
          disabled={isSaving}
          className="w-full sm:w-auto sm:ml-auto"
        >
          Add Detail
        </Button>
      </div>

      {/* Details List */}
      <div className="flex flex-col gap-4">
        {userDetails.map((detail) => (
          <Card
            key={detail.id}
            className="relative border-1 border-dashed border-gray-300 bg-white hover:border-indigo-300 transition-colors duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {editingId === detail.id ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-4 py-3 bg-indigo-50/50 border border-indigo-200 rounded-xl text-base text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                    rows={4}
                    autoFocus
                  />
                ) : (
                  <p className="text-base text-gray-900 whitespace-pre-wrap">
                    <span className="font-bold text-gray-900">
                      {detail.label}:
                    </span>{" "}
                    {detail.value}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-3">
                {editingId === detail.id ? (
                  <>
                    <Button
                      variant="ghost"
                      className="p-2 hover:bg-green-50 hover:text-green-600"
                      onClick={() => handleSaveEdit(detail.id)}
                    >
                      <Save size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-2 hover:bg-red-50 hover:text-red-600"
                      onClick={handleCancelEdit}
                    >
                      <X size={16} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="p-2 hover:bg-indigo-50 hover:text-indigo-600"
                      onClick={() => handleStartEdit(detail.id, detail.value)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-2 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDelete(detail.id)}
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

      {/* Empty State */}
      {userDetails.length === 0 && (
        <Card noPadding className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
            <FileText size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No details added yet</h3>
          <p className="text-sm text-gray-500">
            Add your personal information to auto-fill job applications.
          </p>
        </Card>
      )}
    </div>
  );
}
