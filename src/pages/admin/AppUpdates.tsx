import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import {
  fetchAppUpdates,
  createAppUpdate,
  updateAppUpdate,
  deleteAppUpdate,
} from "../../features/appUpdates/appUpdatesSlice";
import type { AppUpdate } from "../../features/appUpdates/appUpdatesSlice";
import Modal from "../../components/Modal";

const AppUpdates: React.FC = () => {
  const dispatch = useAppDispatch();
  const { updates, loading, error, actionLoading } = useAppSelector(
    (state) => state.appUpdates
  );

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<AppUpdate | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    prevVersion: "",
    currVersion: "",
    mandatory: false,
    description: "",
    releaseNotes: "",
    downloadUrl: "",
    size: "",
  });

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    dispatch(fetchAppUpdates());
  }, [dispatch]);

  const filteredUpdates = useMemo(() => {
    if (filterStatus === "ALL") return updates;
    return updates.filter(
      (update: AppUpdate) => update.status === filterStatus
    );
  }, [updates, filterStatus]);

  const resetForm = () => {
    setFormData({
      prevVersion: "",
      currVersion: "",
      mandatory: false,
      description: "",
      releaseNotes: "",
      downloadUrl: "",
      size: "",
    });
    setSelectedUpdate(null);
  };

  const handleCreate = async () => {
    if (!formData.prevVersion || !formData.currVersion) {
      alert("Previous and current versions are required");
      return;
    }

    try {
      await dispatch(
        createAppUpdate({
          prevVersion: formData.prevVersion,
          currVersion: formData.currVersion,
          mandatory: formData.mandatory,
          description: formData.description,
          releaseNotes: formData.releaseNotes,
          downloadUrl: formData.downloadUrl,
          size: formData.size,
        })
      ).unwrap();

      setShowCreateModal(false);
      resetForm();
      alert("App update created successfully!");
    } catch (error) {
      console.error("Failed to create update:", error);
      alert("Failed to create app update");
    }
  };

  const handleEdit = async () => {
    if (!selectedUpdate || !formData.prevVersion || !formData.currVersion) {
      alert("Previous and current versions are required");
      return;
    }

    try {
      await dispatch(
        updateAppUpdate({
          id: selectedUpdate.id,
          data: formData,
        })
      ).unwrap();

      setShowEditModal(false);
      resetForm();
      alert("App update updated successfully!");
    } catch (error) {
      console.error("Failed to update:", error);
      alert("Failed to update app update");
    }
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm("Are you sure you want to delete this app update?")) {
      return;
    }

    try {
      await dispatch(deleteAppUpdate(updateId)).unwrap();
      alert("App update deleted successfully!");
    } catch (error) {
      console.error("Failed to delete update:", error);
      alert("Failed to delete app update");
    }
  };

  const handleToggleStatus = async (update: AppUpdate) => {
    const newStatus = update.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await dispatch(
        updateAppUpdate({
          id: update.id,
          data: { status: newStatus },
        })
      ).unwrap();
      alert(`App update ${newStatus.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Failed to toggle status:", error);
      alert("Failed to toggle update status");
    }
  };

  const openEditModal = (update: AppUpdate) => {
    setSelectedUpdate(update);
    setFormData({
      prevVersion: update.prevVersion,
      currVersion: update.currVersion,
      mandatory: update.mandatory,
      description: update.description || "",
      releaseNotes: update.releaseNotes || "",
      downloadUrl: update.downloadUrl || "",
      size: update.size || "",
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Icon components
  const AddIcon = ({ className }: { className: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 4v16m8-8H4"
      />
    </svg>
  );

  const EditIcon = ({ className }: { className: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );

  const DeleteIcon = ({ className }: { className: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );

  const ToggleOnIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM17 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
    </svg>
  );

  const ToggleOffIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
    </svg>
  );

  return (
    <div className="p-2 xs:p-4 sm:p-6 md:p-8  min-h-screen">
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between mb-4 xs:mb-6 gap-2 xs:gap-4">
        <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-fuchsia-700 tracking-tight flex items-center gap-2">
          <svg
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            className="text-fuchsia-400"
          >
            <path
              d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10 5.16-.26 9-4.45 9-10V7l-10-5Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          App Updates
        </h2>

        <div className="flex items-center gap-2">
          {/* Filter Controls */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-fuchsia-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          >
            <option value="ALL">All Updates</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
          >
            <AddIcon className="w-4 h-4" />
            Create New Update
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-2 xs:p-4 sm:p-8 border border-fuchsia-100">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-fuchsia-400">Loading app updates...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 bg-red-50 p-4 rounded-lg">
              Error loading app updates: {error}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredUpdates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No app updates found</div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filteredUpdates.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs xs:text-sm sm:text-base">
              <thead>
                <tr className="bg-fuchsia-50 text-fuchsia-700 text-xs xs:text-sm uppercase border-b-2 border-fuchsia-100">
                  <th className="py-3 px-2 font-semibold">Time</th>
                  <th className="py-3 px-2 font-semibold">Date</th>
                  <th className="py-3 px-2 font-semibold">Previous Version</th>
                  <th className="py-3 px-2 font-semibold">Current Version</th>
                  <th className="py-3 px-2 font-semibold">Mandatory</th>
                  <th className="py-3 px-2 font-semibold">Status</th>
                  <th className="py-3 px-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpdates.map((update: AppUpdate, idx: number) => (
                  <tr
                    key={update.id || idx}
                    className="border-b last:border-b-0 hover:bg-fuchsia-50 transition-colors group"
                  >
                    <td className="py-3 px-2 text-xs xs:text-sm font-medium text-gray-700 group-hover:text-fuchsia-700 transition-colors">
                      {update.time ||
                        (update.createdAt
                          ? formatTime(update.createdAt)
                          : "N/A")}
                    </td>
                    <td className="py-3 px-2 text-xs xs:text-sm font-semibold text-gray-900 group-hover:text-fuchsia-700 transition-colors">
                      {update.date ||
                        (update.createdAt
                          ? formatDate(update.createdAt)
                          : "N/A")}
                    </td>
                    <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-fuchsia-700 transition-colors">
                      {update.prevVersion}
                    </td>
                    <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-fuchsia-700 transition-colors">
                      {update.currVersion}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {update.mandatory ? (
                        <svg
                          className="mx-auto text-fuchsia-700 w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          update.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : update.status === "INACTIVE"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {update.status || "PENDING"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(update)}
                          className="p-1 text-fuchsia-600 hover:bg-fuchsia-50 rounded transition-colors"
                          title={`${
                            update.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"
                          } Update`}
                        >
                          {update.status === "ACTIVE" ? (
                            <ToggleOnIcon className="w-4 h-4" />
                          ) : (
                            <ToggleOffIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(update)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Update"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(update.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Update"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Update Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New App Update"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors disabled:opacity-50"
              onClick={handleCreate}
              disabled={actionLoading}
            >
              {actionLoading ? "Creating..." : "Create Update"}
            </button>
          </div>
        }
      >
        <div className="w-full max-w-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Previous Version *
              </label>
              <input
                type="text"
                value={formData.prevVersion}
                onChange={(e) =>
                  setFormData({ ...formData, prevVersion: e.target.value })
                }
                placeholder="e.g., 1.0.0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Current Version *
              </label>
              <input
                type="text"
                value={formData.currVersion}
                onChange={(e) =>
                  setFormData({ ...formData, currVersion: e.target.value })
                }
                placeholder="e.g., 1.1.0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="mandatory"
              checked={formData.mandatory}
              onChange={(e) =>
                setFormData({ ...formData, mandatory: e.target.checked })
              }
              className="mr-2 h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300 rounded"
            />
            <label
              htmlFor="mandatory"
              className="text-sm font-medium text-gray-700"
            >
              Mandatory Update
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the update..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Release Notes
            </label>
            <textarea
              value={formData.releaseNotes}
              onChange={(e) =>
                setFormData({ ...formData, releaseNotes: e.target.value })
              }
              placeholder="Detailed release notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Download URL
              </label>
              <input
                type="url"
                value={formData.downloadUrl}
                onChange={(e) =>
                  setFormData({ ...formData, downloadUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                File Size
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                placeholder="e.g., 15 MB"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Update Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit App Update"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors disabled:opacity-50"
              onClick={handleEdit}
              disabled={actionLoading}
            >
              {actionLoading ? "Updating..." : "Update"}
            </button>
          </div>
        }
      >
        <div className="w-full max-w-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Previous Version *
              </label>
              <input
                type="text"
                value={formData.prevVersion}
                onChange={(e) =>
                  setFormData({ ...formData, prevVersion: e.target.value })
                }
                placeholder="e.g., 1.0.0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Current Version *
              </label>
              <input
                type="text"
                value={formData.currVersion}
                onChange={(e) =>
                  setFormData({ ...formData, currVersion: e.target.value })
                }
                placeholder="e.g., 1.1.0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="mandatory-edit"
              checked={formData.mandatory}
              onChange={(e) =>
                setFormData({ ...formData, mandatory: e.target.checked })
              }
              className="mr-2 h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300 rounded"
            />
            <label
              htmlFor="mandatory-edit"
              className="text-sm font-medium text-gray-700"
            >
              Mandatory Update
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the update..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Release Notes
            </label>
            <textarea
              value={formData.releaseNotes}
              onChange={(e) =>
                setFormData({ ...formData, releaseNotes: e.target.value })
              }
              placeholder="Detailed release notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Download URL
              </label>
              <input
                type="url"
                value={formData.downloadUrl}
                onChange={(e) =>
                  setFormData({ ...formData, downloadUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                File Size
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                placeholder="e.g., 15 MB"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppUpdates;
