import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import {
  fetchBookRequests,
  updateBookRequestStatus,
} from "../../features/bookRequests/bookRequestsSlice";
import type { BookRequest } from "../../features/bookRequests/bookRequestsSlice";

const statusBorderColors: Record<string, string> = {
  CANCELLED: "border-red-400 text-red-600",
  IN_PROGRESS: "border-yellow-400 text-yellow-700",
  DONE: "border-green-500 text-green-700",
  REGISTERED: "border-blue-500 text-blue-700",
};

const statusBgColors: Record<string, string> = {
  CANCELLED: "bg-red-50",
  IN_PROGRESS: "bg-yellow-50",
  DONE: "bg-green-50",
  REGISTERED: "bg-blue-50",
};

const statusOptions = [
  { value: "NOT_STARTED", label: "NOT STARTED" },
  { value: "CANCELLED", label: "CANCELLED" },
  { value: "IN_PROGRESS", label: "IN PROGRESS" },
  { value: "DONE", label: "DONE" },
  { value: "REGISTERED", label: "REGISTERED" },
];

const BookRequests: React.FC = () => {
  const dispatch = useAppDispatch();
  const { bookRequests, loading, error, actionLoading } = useAppSelector(
    (state) => state.bookRequests
  );

  // Local state for filtering
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });

  // Load book requests on component mount
  useEffect(() => {
    dispatch(fetchBookRequests());
  }, [dispatch]);

  // Filter requests based on status and date
  const filteredRequests = useMemo(() => {
    let filtered = bookRequests;

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((req) => req.status === filterStatus);
    }

    if (dateFilter.from && dateFilter.to) {
      filtered = filtered.filter((req) => {
        const reqDate = new Date(req.createdAt || req.date || "");
        const fromDate = new Date(dateFilter.from);
        const toDate = new Date(dateFilter.to);
        return reqDate >= fromDate && reqDate <= toDate;
      });
    }

    return filtered;
  }, [bookRequests, filterStatus, dateFilter]);

  // Utility functions
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Handle status update
  const handleStatusUpdate = async (
    request: BookRequest,
    newStatus: string
  ) => {
    try {
      await dispatch(
        updateBookRequestStatus({
          id: request.id,
          status: newStatus,
        })
      ).unwrap();
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  // Icon components
  const FilterIcon = ({ className }: { className: string }) => (
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
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
      />
    </svg>
  );

  const CalendarIcon = ({ className }: { className: string }) => (
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
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  return (
    <div className="p-2 xs:p-4 sm:p-6 md:p-8 min-h-screen">
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between mb-4 xs:mb-6 gap-2 xs:gap-4">
        <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-700 tracking-tight flex items-center gap-2">
          <svg
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            className="text-blue-400"
          >
            <path
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 16H5V5h14v14Z"
              fill="currentColor"
            />
          </svg>
          Book Requests
        </h2>

        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4">
          {/* Filter Controls */}
          <div className="flex items-center gap-1 xs:gap-2 bg-blue-50 rounded-lg px-2 py-1">
            <FilterIcon className="w-4 h-4 text-blue-400" />
            <span className="text-blue-600 text-xs xs:text-sm">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="ml-1 border border-blue-200 rounded px-2 py-1 text-xs xs:text-sm focus:outline-none bg-white"
            >
              <option value="ALL">ALL</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1 xs:gap-2 bg-pink-50 rounded-lg px-2 py-1">
            <CalendarIcon className="w-4 h-4 text-pink-400" />
            <input
              type="date"
              value={dateFilter.from}
              onChange={(e) =>
                setDateFilter((prev) => ({ ...prev, from: e.target.value }))
              }
              className="text-xs border-none bg-transparent text-pink-600 focus:outline-none"
            />
            <span className="text-pink-600 text-xs">to</span>
            <input
              type="date"
              value={dateFilter.to}
              onChange={(e) =>
                setDateFilter((prev) => ({ ...prev, to: e.target.value }))
              }
              className="text-xs border-none bg-transparent text-pink-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-2 xs:p-4 sm:p-8 border border-blue-100">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-blue-400">Loading book requests...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 bg-red-50 p-4 rounded-lg">
              Error loading book requests: {error}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No book requests found</div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filteredRequests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-left text-xs xs:text-sm sm:text-base">
              <thead>
                <tr className="bg-blue-50 text-blue-700 text-xs xs:text-sm uppercase border-b-2 border-blue-100">
                  <th className="py-3 px-2 font-semibold">Time</th>
                  <th className="py-3 px-2 font-semibold">Booking Id</th>
                  <th className="py-3 px-2 font-semibold">Booked user</th>
                  <th className="py-3 px-2 font-semibold">Course</th>
                  <th className="py-3 px-2 font-semibold">Last updated by</th>
                  <th className="py-3 px-2 font-semibold">Booking Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req: BookRequest, idx: number) => (
                  <tr
                    key={req.id || idx}
                    className="border-b last:border-b-0 hover:bg-blue-50 transition-colors group"
                  >
                    <td className="py-3 px-2 text-xs xs:text-sm">
                      <div className="flex items-center gap-1 xs:gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-300 group-hover:bg-blue-500 transition-colors" />
                        <span className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                          {req.time ||
                            (req.createdAt ? formatTime(req.createdAt) : "N/A")}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {req.date ||
                          (req.createdAt ? formatDate(req.createdAt) : "N/A")}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-xs xs:text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {req.bookingId || `#${req.id.slice(-8)}`}
                    </td>
                    <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-blue-700 transition-colors">
                      <div>{req.user}</div>
                      <div className="text-xs text-gray-400">
                        {req.userEmail}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-blue-700 transition-colors">
                      {req.course}
                    </td>
                    <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-blue-700 transition-colors">
                      {req.updatedBy || "System"}
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        {req.status === "NOT_STARTED" ? (
                          <button
                            className="w-full flex items-center justify-between px-2 xs:px-4 py-1 rounded-lg text-xs font-semibold border border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed"
                            disabled
                          >
                            NOT STARTED
                          </button>
                        ) : (
                          <select
                            value={req.status}
                            onChange={(e) =>
                              handleStatusUpdate(req, e.target.value)
                            }
                            className={`w-full px-2 xs:px-4 py-1 rounded-lg text-xs font-semibold border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              statusBorderColors[req.status] ||
                              "border-gray-300"
                            } ${statusBgColors[req.status] || "bg-white"}`}
                            disabled={actionLoading}
                          >
                            {statusOptions.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookRequests;
