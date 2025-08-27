import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";
import {
  fetchLogs,
  deleteLog,
  clearLogs,
  setCurrentPage,
} from "../../features/logs/logsSlice";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import FilterListIcon from "@mui/icons-material/FilterList";
import Modal from "../../components/Modal";
import { toast } from "react-hot-toast";

const operationTypeColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800 border-green-200",
  UPDATE: "bg-blue-100 text-blue-800 border-blue-200",
  DELETE: "bg-red-100 text-red-800 border-red-200",
  LOGIN: "bg-purple-100 text-purple-800 border-purple-200",
  LOGOUT: "bg-gray-100 text-gray-800 border-gray-200",
  BOOKING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAYMENT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  ERROR: "bg-red-100 text-red-800 border-red-200",
  SYSTEM: "bg-slate-100 text-slate-800 border-slate-200",
};

const Logs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logs, loading, error, totalCount, currentPage, pageSize } =
    useSelector((state: RootState) => state.logs);

  // Local state for filters
  const [filters, setFilters] = useState({
    operationType: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearFilters, setClearFilters] = useState({
    olderThan: "",
    operationType: "",
  });

  useEffect(() => {
    loadLogs();
  }, [dispatch, currentPage, pageSize]);

  const loadLogs = () => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
    };

    if (filters.operationType) params.operationType = filters.operationType;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.search) params.search = filters.search;

    dispatch(fetchLogs(params));
  };

  const handleSearch = () => {
    dispatch(setCurrentPage(1));
    loadLogs();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setCurrentPage(newPage));
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this log entry?")) {
      return;
    }

    try {
      await dispatch(deleteLog(logId)).unwrap();
      toast.success("Log entry deleted successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete log entry");
    }
  };

  const handleClearLogs = async () => {
    const params: any = {};
    if (clearFilters.olderThan) params.olderThan = clearFilters.olderThan;
    if (clearFilters.operationType)
      params.operationType = clearFilters.operationType;

    try {
      await dispatch(clearLogs(params)).unwrap();
      toast.success("Logs cleared successfully!");
      setShowClearModal(false);
      setClearFilters({ olderThan: "", operationType: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to clear logs");
    }
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
      return new Date(dateString).toLocaleTimeString();
    } catch {
      return dateString;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-2 xs:p-4 sm:p-6 md:p-8  min-h-screen">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between mb-4 xs:mb-6 gap-2 xs:gap-4">
        <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-pink-700 tracking-tight flex items-center gap-2">
          <svg
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            className="text-pink-400"
          >
            <path
              d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 16H5V9h14v11Zm0-13H5V6h14v1Z"
              fill="currentColor"
            />
          </svg>
          Logs ({totalCount} entries)
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
          >
            <ClearAllIcon className="w-4 h-4" />
            Clear Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-pink-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search operations..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>

          {/* Operation Type Filter */}
          <div className="relative">
            <FilterListIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filters.operationType}
              onChange={(e) =>
                handleFilterChange("operationType", e.target.value)
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm appearance-none"
            >
              <option value="">All Operations</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="BOOKING">Booking</option>
              <option value="PAYMENT">Payment</option>
              <option value="ERROR">Error</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="relative">
            <CalendarMonthIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>

          <div className="relative">
            <CalendarMonthIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setFilters({
                operationType: "",
                startDate: "",
                endDate: "",
                search: "",
              });
              dispatch(setCurrentPage(1));
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg p-2 xs:p-4 sm:p-8 border border-pink-100">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-pink-400">Loading logs...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 bg-red-50 p-4 rounded-lg">
              Error loading logs: {error}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && logs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No logs found</div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && logs.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-left text-xs xs:text-sm sm:text-base">
                <thead>
                  <tr className="bg-pink-50 text-pink-700 text-xs xs:text-sm uppercase border-b-2 border-pink-100">
                    <th className="py-3 px-2 font-semibold">Time</th>
                    <th className="py-3 px-2 font-semibold">Date</th>
                    <th className="py-3 px-2 font-semibold">Type</th>
                    <th className="py-3 px-2 font-semibold">Operation</th>
                    <th className="py-3 px-2 font-semibold">User</th>
                    <th className="py-3 px-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr
                      key={log.id || idx}
                      className="border-b last:border-b-0 hover:bg-pink-50 transition-colors group"
                    >
                      <td className="py-3 px-2 text-xs xs:text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors">
                        {log.time ||
                          (log.createdAt ? formatTime(log.createdAt) : "N/A")}
                      </td>
                      <td className="py-3 px-2 text-xs xs:text-sm font-semibold text-gray-900 group-hover:text-pink-700 transition-colors">
                        {log.date ||
                          (log.createdAt ? formatDate(log.createdAt) : "N/A")}
                      </td>
                      <td className="py-3 px-2">
                        {log.operationType && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                              operationTypeColors[log.operationType] ||
                              "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {log.operationType}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-pink-700 transition-colors max-w-xs">
                        <div className="truncate" title={log.operation}>
                          {log.operation}
                        </div>
                        {log.details && (
                          <div
                            className="text-xs text-gray-400 truncate mt-1"
                            title={log.details}
                          >
                            {log.details}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-pink-700 transition-colors">
                        {log.userName ||
                          log.userEmail ||
                          log.userId ||
                          "System"}
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Log"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-pink-100">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
                  entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Clear Logs Modal */}
      <Modal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear Logs"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() => setShowClearModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              onClick={handleClearLogs}
            >
              Clear Logs
            </button>
          </div>
        }
      >
        <div className="w-full max-w-md">
          <div className="mb-4">
            <p className="text-gray-600 mb-4">
              Choose how you want to clear the logs. This action cannot be
              undone.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Clear logs older than (optional)
            </label>
            <input
              type="date"
              value={clearFilters.olderThan}
              onChange={(e) =>
                setClearFilters((prev) => ({
                  ...prev,
                  olderThan: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to clear all logs
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Operation type (optional)
            </label>
            <select
              value={clearFilters.operationType}
              onChange={(e) =>
                setClearFilters((prev) => ({
                  ...prev,
                  operationType: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Types</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="BOOKING">Booking</option>
              <option value="PAYMENT">Payment</option>
              <option value="ERROR">Error</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-red-800 text-sm font-medium">⚠️ Warning</p>
            <p className="text-red-700 text-sm">
              This will permanently delete the selected log entries. This action
              cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Logs;
