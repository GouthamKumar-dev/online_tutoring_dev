import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import Pagination from "../../components/shared/Pagination";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";
import {
  fetchStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../../features/staff/staffSlice";
import type { Staff } from "../../features/staff/staffSlice";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import { toast } from "react-hot-toast";
import { COLOR_CLASSES } from "../../constants/colors";
import baseAxios from "../../features/auth/baseAxios";

const Staffs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { staffs, loading, error, pagination } = useSelector(
    (state: RootState) => state.staff
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit state
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form states
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhoneNumber, setStaffPhoneNumber] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [subjects, setSubjects] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [staffDetails, setStaffDetails] = useState("");
  const [staffImage, setStaffImage] = useState<File | null>(null);

  // Loading and error states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    dispatch(
      fetchStaffs({
        page: currentPage,
        limit: itemsPerPage,
      })
    );
  }, [dispatch, currentPage, itemsPerPage]);

  // Helper function to format time slot from start and end times
  const formatTimeSlot = (start: string, end: string) => {
    if (!start || !end) return "";

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Helper function to parse time slot back to start and end times
  const parseTimeSlot = (timeSlot: string) => {
    if (!timeSlot) return { start: "", end: "" };

    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return "";

      let hours = parseInt(match[1]);
      const minutes = match[2];
      const ampm = match[3].toUpperCase();

      if (ampm === "PM" && hours !== 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    };

    const parts = timeSlot.split(" - ");
    if (parts.length === 2) {
      return {
        start: parseTime(parts[0].trim()),
        end: parseTime(parts[1].trim()),
      };
    }

    return { start: "", end: "" };
  };

  const resetForm = () => {
    setStaffName("");
    setStaffEmail("");
    setStaffPhoneNumber("");
    setQualification("");
    setExperience("");
    setSubjects("");
    setPreferredTimeSlot("");
    setStartTime("");
    setEndTime("");
    setIsPremium(false);
    setStaffDetails("");
    setStaffImage(null);
    setActionError(null);
    setEditingStaff(null);
  };

  const handleAddStaff = async () => {
    if (!staffName || !staffEmail || !staffPhoneNumber) {
      setActionError("Staff name, email, and phone number are required.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      // Format time slot from start and end times
      const formattedTimeSlot =
        startTime && endTime
          ? formatTimeSlot(startTime, endTime)
          : preferredTimeSlot;

      await dispatch(
        createStaff({
          staffName,
          staffEmail,
          staffPhoneNumber,
          qualification,
          experience,
          subjects,
          preferredTimeSlot: formattedTimeSlot,
          isPremium,
          staffDetails,
          image: staffImage || undefined,
        })
      ).unwrap();

      toast.success("Staff created successfully!");
      setShowAddModal(false);
      resetForm();
      // Refresh the current page
      dispatch(
        fetchStaffs({
          page: currentPage,
          limit: itemsPerPage,
        })
      );
    } catch (err: any) {
      setActionError(err?.message || "Failed to create staff.");
      toast.error("Failed to create staff.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (staff: Staff) => {
    setEditingStaff(staff);
    setStaffName(staff.staffName);
    setStaffEmail(staff.staffEmail);
    setStaffPhoneNumber(staff.staffPhoneNumber);
    setQualification(staff.qualification);
    setExperience(staff.experience);
    setSubjects(staff.subjects);
    setPreferredTimeSlot(staff.preferredTimeSlot);

    // Parse existing time slot into start and end times
    const { start, end } = parseTimeSlot(staff.preferredTimeSlot);
    setStartTime(start);
    setEndTime(end);

    setIsPremium(staff.isPremium);
    setStaffDetails(staff.staffDetails);
    setShowEditModal(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff || !staffName || !staffEmail || !staffPhoneNumber) {
      setActionError("Staff name, email, and phone number are required.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const formData = new FormData();
      formData.append("staffName", staffName);
      formData.append("staffEmail", staffEmail);
      formData.append("staffPhoneNumber", staffPhoneNumber);
      formData.append("qualification", qualification);
      formData.append("experience", experience);
      formData.append("subjects", subjects);

      // Format time slot from start and end times
      const formattedTimeSlot =
        startTime && endTime
          ? formatTimeSlot(startTime, endTime)
          : preferredTimeSlot;
      formData.append("preferredTimeSlot", formattedTimeSlot);

      formData.append("isPremium", isPremium.toString());
      formData.append("staffDetails", staffDetails);
      if (staffImage) {
        formData.append("profileImage", staffImage);
      }

      await dispatch(
        updateStaff({
          id: editingStaff.staffId, // Use staffId instead of id
          data: formData,
        })
      ).unwrap();

      toast.success("Staff updated successfully!");
      setShowEditModal(false);
      resetForm();
      // Refresh the current page
      dispatch(
        fetchStaffs({
          page: currentPage,
          limit: itemsPerPage,
        })
      );
    } catch (err: any) {
      setActionError(err?.message || "Failed to update staff.");
      toast.error("Failed to update staff.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStaff = (staffId: string, staffName: string) => {
    setStaffToDelete({ id: staffId, name: staffName });
    setShowDeleteModal(true);
  };

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;

    setDeleteLoading(true);
    try {
      await dispatch(deleteStaff(staffToDelete.id)).unwrap();
      toast.success("Staff deleted successfully!");
      setShowDeleteModal(false);
      setStaffToDelete(null);
      // Refresh the current page
      dispatch(
        fetchStaffs({
          page: currentPage,
          limit: itemsPerPage,
        })
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete staff.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStaffToDelete(null);
  };

  const handleStatusChange = async (
    staffId: string,
    newStatus: boolean,
    staffName: string
  ) => {
    try {
      // Create FormData for the update
      const formData = new FormData();

      // Find the current staff data
      const currentStaff = staffs.find((staff) => staff.staffId === staffId);
      if (!currentStaff) {
        toast.error("Staff not found");
        return;
      }

      // Append all current data with the new status
      formData.append("staffName", currentStaff.staffName);
      formData.append("staffEmail", currentStaff.staffEmail);
      formData.append("staffPhoneNumber", currentStaff.staffPhoneNumber);
      formData.append("qualification", currentStaff.qualification);
      formData.append("experience", currentStaff.experience);
      formData.append("subjects", currentStaff.subjects);
      formData.append("preferredTimeSlot", currentStaff.preferredTimeSlot);
      formData.append("isPremium", newStatus.toString());
      formData.append("staffDetails", currentStaff.staffDetails);

      await dispatch(
        updateStaff({
          id: staffId,
          data: formData,
        })
      ).unwrap();

      toast.success(
        `${staffName} status updated to ${newStatus ? "PREMIUM" : "NORMAL"}`
      );
      // Refresh the current page
      dispatch(
        fetchStaffs({
          page: currentPage,
          limit: itemsPerPage,
        })
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update staff status.");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getStatusColor = (isPremium: boolean) => {
    return isPremium
      ? "bg-green-100 text-green-800"
      : "bg-orange-100 text-orange-800";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Our Staffs</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className={`px-4 py-2 ${COLOR_CLASSES.bgPrimary} text-white rounded-lg ${COLOR_CLASSES.hoverBgPrimary} transition-colors flex items-center gap-2`}
          >
            <AddIcon fontSize="small" />
            Add new staff
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
          </div>
        )}

        {/* Staff Table */}
        {!loading && !error && (
          <>
            {staffs.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-2 xs:p-4 sm:p-8 border border-violet-100">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full w-full table-fixed divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-violet-50 text-violet-700 text-xs xs:text-sm uppercase border-b-2 border-violet-100">
                          <th className="py-3 px-2 font-semibold w-48 text-left">
                            Name
                          </th>
                          <th className="py-3 px-2 font-semibold w-16 text-left">
                            Image
                          </th>
                          <th className="py-3 px-2 font-semibold w-72 text-left">
                            Details
                          </th>
                          <th className="py-3 px-2 font-semibold w-48 text-left">
                            Email
                          </th>
                          <th className="py-3 px-2 font-semibold w-32 text-left">
                            Phone Number
                          </th>
                          <th className="py-3 px-2 font-semibold w-40 text-left">
                            Qualification
                          </th>
                          <th className="py-3 px-2 font-semibold w-28 text-left">
                            Experience
                          </th>
                          <th className="py-3 px-2 font-semibold w-48 text-left">
                            Subjects
                          </th>
                          <th className="py-3 px-2 font-semibold w-36 text-left">
                            Time Slot
                          </th>
                          <th className="py-3 px-2 font-semibold w-28 text-left">
                            Status
                          </th>
                          <th className="py-3 px-2 font-semibold w-24 text-left">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {staffs.map((staff) => (
                          <tr
                            key={staff.staffId}
                            className="border-b last:border-b-0 hover:bg-violet-50 transition-colors group"
                          >
                            <td className="py-3 px-2 text-xs xs:text-sm font-medium text-gray-700 group-hover:text-violet-700 transition-colors overflow-hidden truncate">
                              {staff.staffName || "N/A"}
                            </td>
                            <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors">
                              <div className="w-10 h-10">
                                {staff.staffImageUrl ? (
                                  <img
                                    src={`${baseAxios.defaults.baseURL}${staff.staffImageUrl}`}
                                    alt={staff.staffName}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <PersonIcon
                                      className="text-gray-400"
                                      fontSize="small"
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors overflow-hidden truncate">
                              <div className="max-w-full">
                                {staff.staffDetails || "N/A"}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors overflow-hidden truncate">
                              {staff.staffEmail || "N/A"}
                            </td>
                            <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors overflow-hidden truncate">
                              {staff.staffPhoneNumber || "N/A"}
                            </td>
                            <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors overflow-hidden truncate">
                              {staff.qualification || "N/A"}
                            </td>
                            <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors">
                              {staff.experience
                                ? `${staff.experience} years`
                                : "N/A"}
                            </td>
                            <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors overflow-hidden truncate">
                              {staff.subjects || "N/A"}
                            </td>
                            <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors overflow-hidden truncate">
                              {staff.preferredTimeSlot || "N/A"}
                            </td>
                            <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors">
                              <select
                                value={staff.isPremium ? "PREMIUM" : "NORMAL"}
                                onChange={(e) =>
                                  handleStatusChange(
                                    staff.staffId,
                                    e.target.value === "PREMIUM",
                                    staff.staffName
                                  )
                                }
                                className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-purple-500 ${getStatusColor(
                                  staff.isPremium
                                )}`}
                              >
                                <option value="NORMAL">NORMAL</option>
                                <option value="PREMIUM">PREMIUM</option>
                              </select>
                            </td>
                            <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditClick(staff)}
                                  className={`${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.hoverTextPrimary} p-1 rounded hover:${COLOR_CLASSES.bgSecondary}/10`}
                                  title="Edit"
                                >
                                  <EditIcon fontSize="small" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteStaff(
                                      staff.staffId,
                                      staff.staffName
                                    )
                                  }
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Delete"
                                >
                                  <DeleteIcon fontSize="small" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {(pagination?.totalItems ?? 0) > 0 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      totalItems={pagination.totalItems}
                      hasNextPage={pagination.hasNextPage}
                      hasPrevPage={pagination.hasPrevPage}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500">No staff members found</div>
              </div>
            )}
          </>
        )}

        {/* Add Staff Modal */}
        <Modal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          title="Add New Staff"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 ${COLOR_CLASSES.bgPrimary} text-white rounded-lg ${COLOR_CLASSES.hoverBgPrimary} transition-colors disabled:opacity-50`}
                onClick={handleAddStaff}
                disabled={actionLoading}
              >
                {actionLoading ? "Creating..." : "Create"}
              </button>
            </div>
          }
        >
          <div className="w-full px-3 sm:px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Staff Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Enter staff name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={staffPhoneNumber}
                  onChange={(e) => setStaffPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  required
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Qualification
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="Enter qualification"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Experience
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Enter experience (e.g., 5 years of teaching)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Status
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={isPremium ? "PREMIUM" : "NORMAL"}
                  onChange={(e) => setIsPremium(e.target.value === "PREMIUM")}
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Subjects
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="Enter subjects (e.g., Physics, Chemistry, Biology)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Preferred Time Slot
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                {startTime && endTime && (
                  <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                    Time Slot: {formatTimeSlot(startTime, endTime)}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Select start and end times to create a time slot
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Staff Details
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={staffDetails}
                  onChange={(e) => setStaffDetails(e.target.value)}
                  placeholder="Enter staff details"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Staff Image
                </label>

                {/* New Image Preview */}
                {staffImage && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Selected Image:
                    </p>
                    <div className="flex items-center space-x-3">
                      <img
                        src={URL.createObjectURL(staffImage)}
                        alt="Staff image preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                      />
                      <div className="text-sm text-green-600">
                        <p>{staffImage.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setStaffImage(e.target.files?.[0] || null)}
                    className="hidden"
                    id="staff-image-upload"
                  />
                  <label
                    htmlFor="staff-image-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Upload Image
                  </label>
                </div>
              </div>
            </div>

            {actionError && (
              <div className="text-red-500 text-sm mt-4 bg-red-50 p-2 rounded">
                {actionError}
              </div>
            )}
          </div>
        </Modal>

        {/* Edit Staff Modal */}
        <Modal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          title="Edit Staff"
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                onClick={handleUpdateStaff}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Update"}
              </button>
            </div>
          }
        >
          <div className="w-full px-3 sm:px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Staff Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Enter staff name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={staffPhoneNumber}
                  onChange={(e) => setStaffPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  required
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Qualification
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="Enter qualification"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Experience
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Enter experience (e.g., 5 years of teaching)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Status
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={isPremium ? "PREMIUM" : "NORMAL"}
                  onChange={(e) => setIsPremium(e.target.value === "PREMIUM")}
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Subjects
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="Enter subjects (e.g., Physics, Chemistry, Biology)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Preferred Time Slot
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                {startTime && endTime && (
                  <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                    Time Slot: {formatTimeSlot(startTime, endTime)}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Select start and end times to create a time slot
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Staff Details
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={staffDetails}
                  onChange={(e) => setStaffDetails(e.target.value)}
                  placeholder="Enter staff details"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Staff Image (optional - leave empty to keep current)
                </label>

                {/* Current Image Preview */}
                {editingStaff?.staffImageUrl && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                    <div className="flex items-center space-x-3">
                      <img
                        src={`${baseAxios.defaults.baseURL}${editingStaff.staffImageUrl}`}
                        alt={editingStaff.staffName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className="text-sm text-gray-500">
                        <p>Click "Upload New Image" below to update</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* New Image Preview */}
                {staffImage && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      New Image Preview:
                    </p>
                    <div className="flex items-center space-x-3">
                      <img
                        src={URL.createObjectURL(staffImage)}
                        alt="New staff image preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                      />
                      <div className="text-sm text-green-600">
                        <p>This image will replace the current one</p>
                        <p className="text-xs">{staffImage.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setStaffImage(e.target.files?.[0] || null)}
                    className="hidden"
                    id="staff-image-upload-edit"
                  />
                  <label
                    htmlFor="staff-image-upload-edit"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Upload New Image
                  </label>
                </div>
              </div>
            </div>

            {actionError && (
              <div className="text-red-500 text-sm mt-4 bg-red-50 p-2 rounded">
                {actionError}
              </div>
            )}
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={showDeleteModal}
          onClose={cancelDelete}
          title="Confirm Delete"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={cancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                onClick={confirmDeleteStaff}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          }
        >
          <div className="w-full max-w-md px-3 sm:px-5">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Staff Member
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {staffToDelete?.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Staffs;
