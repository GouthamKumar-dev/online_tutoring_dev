import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";
import {
  fetchTutorRequests,
} from "../../features/tutorRequest/tutorRequestSlice";
import type { TutorRequest } from "../../features/tutorRequest/tutorRequestSlice";
import Pagination from "../../components/shared/Pagination";
import { getImageUrl } from "../../constants/config";

export interface Tutor {
  tutorId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  resumePath?: string;
  qualification?: string;
  experience?: number;
  subjects?: string[];
  preferredTimeSlot?: string;
  otp?: string;
  otpExpiresAt?: string;
  isVerified: boolean;
  registrationCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS" | "COMPLETED";
}

const TutorRequests: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading, error, pagination } = useSelector(
    (state: RootState) => state.tutorRequest
  );

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchParams: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    dispatch(fetchTutorRequests(fetchParams));
  }, [dispatch, currentPage, itemsPerPage]);

  const filteredRequests = requests as TutorRequest[]; // All filtering is now done server-side

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="p-2 xs:p-4 sm:p-6 md:p-8 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tutor Management</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-2 xs:p-4 sm:p-8 border border-violet-100">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-violet-400">Loading tutor requests...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 bg-red-50 p-4 rounded-lg">
              Error loading tutor requests: {error}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No tutor requests found</div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filteredRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="bg-violet-50 text-violet-700 text-xs xs:text-sm uppercase border-b-2 border-violet-100">
                    <th className="py-3 px-2 font-semibold">Name</th>
                    <th className="py-3 px-2 font-semibold">Email</th>
                    <th className="py-3 px-2 font-semibold">Phone</th>
                    <th className="py-3 px-2 font-semibold">Qualification</th>
                    <th className="py-3 px-2 font-semibold">Experience</th>
                    <th className="py-3 px-2 font-semibold">Subjects</th>
                    <th className="py-3 px-2 font-semibold">Time Slot</th>
                    <th className="py-3 px-2 font-semibold">Resume</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((req, idx) => (
                    <tr
                      key={req.tutorId || idx}
                      className="border-b last:border-b-0 hover:bg-violet-50 transition-colors group"
                    >
                      <td className="py-3 px-2 text-xs xs:text-sm font-medium text-gray-700 group-hover:text-violet-700 transition-colors">
                        {req.name || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors">
                        {req.email || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors">
                        {req.phoneNumber || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors">
                        {req.qualification || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors">
                        {req.experience ? `${req.experience} years` : "N/A"}
                      </td>
                      <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors">
                        {req.subjects && Array.isArray(req.subjects)
                          ? req.subjects.join(", ")
                          : "N/A"}
                      </td>
                      <td className="py-3 px-2 text-xs xs:text-sm text-gray-600 group-hover:text-violet-700 transition-colors">
                        {req.preferredTimeSlot || "N/A"}
                      </td>

                      <td>
                        {req.resumePath && (
                          <button
                            onClick={() =>
                              window.open(
                                getImageUrl(req.resumePath || ""),
                                "_blank"
                              )
                            }
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="View Resume"
                          >
                            📄
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredRequests.length > 0 && (
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
    </div>
  );
};

export default TutorRequests;
