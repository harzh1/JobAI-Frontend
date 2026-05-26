import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  X,
  Save,
  FileText,
  Loader2,
  Trash2,
  Tag,
} from "../components/ui/AppIcons";

import { Card, Button } from "../components/ui/UIComponents";
import { useAuth } from "../context/AuthContext";
import { allDetailsService } from "../services/database";
import EmptyStateCard from "../components/ui/EmptyStateCard";
import ConfirmDialog from "../components/ui/ConfirmDialog";

export default function AllDetails() {
  const { user } = useAuth();

  const [userDetails, setUserDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Add-new inline form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  // Confirm delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);

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
    const updatedDetails = userDetails.filter((d) => d.id !== id);

    const reindexed = updatedDetails.map((d, index) => ({
      ...d,
      id: index,
    }));

    setUserDetails(reindexed);
    setDeleteTarget(null);

    await saveToFirestore(reindexed);
  };

  const handleAddNew = async () => {
    if (!newLabel.trim() || !newValue.trim()) return;

    const newDetail = {
      id: userDetails.length,
      label: newLabel.trim(),
      value: newValue.trim(),
      category: "general",
    };

    const updatedDetails = [...userDetails, newDetail];

    setUserDetails(updatedDetails);
    setNewLabel("");
    setNewValue("");
    setShowAddForm(false);

    await saveToFirestore(updatedDetails);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewLabel("");
    setNewValue("");
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
    <div className="w-full space-y-6">
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
          onClick={() => setShowAddForm(true)}
          icon={Plus}
          disabled={isSaving || showAddForm}
          className="w-full sm:w-auto"
        >
          Add Detail
        </Button>
      </div>

      {/* Inline Add Form */}
      {showAddForm && (
        <Card className="transition-all duration-300 border-none bg-white dark:bg-[var(--surface-bg)] shadow-md">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Add New Detail
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#1f1f1f] dark:text-gray-400 mb-1.5">
                  Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Phone, Address, LinkedIn..."
                  autoFocus
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-transparent border border-[#e1e5ea] dark:border-[#333538]/50 focus:border-[#3442FF] focus:ring-4 focus:ring-[#3442FF]/10 text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#1f1f1f] dark:text-gray-400 mb-1.5">
                  Value
                </label>
                <textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter the detail value..."
                  rows={3}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-y transition-all bg-transparent border border-[#e1e5ea] dark:border-[#333538]/50 focus:border-[#3442FF] focus:ring-4 focus:ring-[#3442FF]/10 text-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="secondary" onClick={handleCancelAdd}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddNew}
                icon={Save}
                disabled={!newLabel.trim() || !newValue.trim() || isSaving}
              >
                Save Detail
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {userDetails.length === 0 && !showAddForm && (
        <EmptyStateCard
          icon={FileText}
          title="No details added yet"
          description="Add your personal information to auto-fill job applications."
        />
      )}

      {/* Details Table */}
      {userDetails.length > 0 && (
        <div className="overflow-hidden animate-in fade-in duration-300 px-2">
          <table className="w-full text-left min-w-[600px] border-collapse">
            <thead className="text-[12px] uppercase tracking-widest text-black font-bold border-b border-[#e1e5ea]">
              <tr>
                <th className="py-4 px-2 font-bold border-none w-48">Label</th>
                <th className="py-4 px-4 font-bold border-none">Value</th>
                <th className="py-4 px-4 font-bold border-none w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-[#e1e5ea]/60">
              {userDetails.map((detail) => (
                <tr 
                  key={detail.id} 
                  className="group hover:bg-[#f8fafd] transition-colors duration-200"
                >
                  <td className="py-4 px-2 align-top">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3442FF]/10 text-[#3442FF] dark:bg-[#3442FF]/20 rounded-full text-[11px] font-bold uppercase tracking-widest border border-transparent whitespace-nowrap">
                      <Tag size={12} />
                      {detail.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 align-top">
                    {editingId === detail.id ? (
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={4}
                        autoFocus
                        className="w-full rounded-xl px-4 py-3 text-[15px] outline-none resize-y transition-all bg-transparent border border-[#e1e5ea] dark:border-[#333538]/50 focus:border-[#3442FF] focus:ring-4 focus:ring-[#3442FF]/10 text-black"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed break-all text-black text-[15px] font-medium">
                        {detail.value}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === detail.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(detail.id)}
                            className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
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
                            onClick={() => handleStartEdit(detail.id, detail.value)}
                            className="p-2 rounded-full text-gray-400 hover:text-[#3442FF] hover:bg-[#3442FF]/10 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(detail)}
                            className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this detail?"
        description={`"${deleteTarget?.label}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={() => handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
