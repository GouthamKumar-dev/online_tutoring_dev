import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import Pagination from "../../components/shared/Pagination";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";
import {
  fetchCategories,
  createCategory,
  createSubcategory,
  createCourse,
  updateCategory,
  updateSubcategory,
  updateCourse,
  deleteCategory,
  deleteSubcategory,
  deleteCourse,
} from "../../features/category/categorySlice";
import type {
  NodeType,
  CategoryNode,
  Course,
} from "../../features/category/categorySlice";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SchoolIcon from "@mui/icons-material/School";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-hot-toast";
import { getImageUrl } from "../../constants/config";
import { findNodeById } from "../../utils/category";
import SkeletonGrid from "../../components/shared/SkeletonGrid";

interface NavigationPath {
  id: string;
  name: string;
  type: NodeType;
}

const CategoryManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error, pagination } = useSelector(
    (state: RootState) => state.category
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Good for grid layout

  // Navigation state for breadcrumbs
  const [navigationPath, setNavigationPath] = useState<NavigationPath[]>([]);
  const [viewingLevel, setViewingLevel] = useState<"categories" | "children">(
    "categories"
  );
  const [currentParent, setCurrentParent] = useState<CategoryNode | null>(null);

  // Modal states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditChildModal, setShowEditChildModal] = useState(false);

  // Edit states
  const [editingItem, setEditingItem] = useState<CategoryNode | null>(null);
  const [editItemType, setEditItemType] = useState<
    "category" | "subcategory" | "course" | null
  >(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Category form states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDefinition, setNewCategoryDefinition] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  // Subcategory form states
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryDefinition, setNewSubcategoryDefinition] = useState("");
  const [addSubcategoryLoading, setAddSubcategoryLoading] = useState(false);
  const [addSubcategoryError, setAddSubcategoryError] = useState<string | null>(
    null
  );

  // Course form states
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseFullName, setNewCourseFullName] = useState("");
  const [newCoursePDF1, setNewCoursePDF1] = useState<File | null>(null);
  const [newCoursePDF2, setNewCoursePDF2] = useState<File | null>(null);
  const [newCoursePDF3, setNewCoursePDF3] = useState<File | null>(null);
  const [newCoursePDF4, setNewCoursePDF4] = useState<File | null>(null);
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [addCourseError, setAddCourseError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Only paginate at the top level (categories view)
        if (viewingLevel === "categories") {
          const result = await dispatch(
            fetchCategories({
              page: currentPage,
              limit: itemsPerPage,
            })
          ).unwrap();
          console.log("Categories loaded:", result);
        } else {
          // For children view, load without pagination
          const result = await dispatch(fetchCategories()).unwrap();
          console.log("Categories loaded:", result);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, [dispatch, currentPage, itemsPerPage, viewingLevel]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const navigateToChildren = (item: CategoryNode) => {
    const itemType: NodeType = item.categoryId ? "category" : "subcategory";
    const itemId = (item.categoryId ?? item.subcategoryId)?.toString() || "";
    const itemName = item.categoryName || item.subcategoryName || "";

    setNavigationPath((prev) => [
      ...prev,
      { id: itemId, name: itemName, type: itemType },
    ]);
    setCurrentParent(item);
    setViewingLevel("children");
  };

  const navigateToCategories = () => {
    setViewingLevel("categories");
    setCurrentParent(null);
    setNavigationPath([]);
  };

  const navigateBack = () => {
    if (navigationPath.length === 0) return;

    const newPath = [...navigationPath];
    newPath.pop();
    setNavigationPath(newPath);

    if (newPath.length === 0) {
      navigateToCategories();
    } else {
      const parentItem = newPath[newPath.length - 1];
      // Find the parent item in categories to set as current parent
      const findItemInCategories = (
        categories: CategoryNode[],
        id: string
      ): CategoryNode | null => {
        for (const cat of categories) {
          if (cat.categoryId?.toString() === id) return cat;
          if (cat.subcategories) {
            for (const sub of cat.subcategories) {
              if (sub.subcategoryId?.toString() === id) return sub;
            }
          }
        }
        return null;
      };

      const parentData = findItemInCategories(categories, parentItem.id);
      setCurrentParent(parentData);
      setViewingLevel("children");
    }
  };

  const resetCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryDefinition("");
    setNewCategoryImage(null);
    setAddCategoryError(null);
  };

  // Business rule: Determine what can be added based on current context
  const getAvailableActions = () => {
    if (!currentParent)
      return { canAddSubcategory: false, canAddCourse: false };

    const isCategory = !!currentParent.categoryId;
    const isSubcategory = !!currentParent.subcategoryId;

    // Get current children to understand the context
    const children: CategoryNode[] | Course[] = isCategory
      ? [
          ...(currentParent.subcategories || []),
          ...(currentParent.courses || []),
        ]
      : isSubcategory
      ? [...(currentParent.children || []), ...(currentParent.courses || [])]
      : [];

    // New Business Rule:
    // - If no items: show both buttons
    // - If items exist: show corresponding button based on existing item types
    if (children.length === 0) {
      // No items present - show both buttons
      return {
        canAddSubcategory: true,
        canAddCourse: true,
      };
    }

    // Items exist - determine what types are present
    const hasSubcategories = (children as CategoryNode[]).some(
      (child) => !!(child as CategoryNode).subcategoryId
    );
    const hasCourses = (children as Course[]).some(
      (child) => !!(child as Course).classId
    );

    if (hasSubcategories && !hasCourses) {
      // Only subcategories exist - only show Add Subcategory
      return {
        canAddSubcategory: true,
        canAddCourse: false,
      };
    } else if (hasCourses && !hasSubcategories) {
      // Only courses exist - only show Add Course
      return {
        canAddSubcategory: false,
        canAddCourse: true,
      };
    } else if (hasSubcategories && hasCourses) {
      // Mixed content - show both (this handles mixed scenarios)
      return {
        canAddSubcategory: true,
        canAddCourse: true,
      };
    }

    // Fallback - show both
    return {
      canAddSubcategory: true,
      canAddCourse: true,
    };
  };

  const resetSubcategoryForm = () => {
    setNewSubcategoryName("");
    setNewSubcategoryDefinition("");
    setAddSubcategoryError(null);
  };

  const resetCourseForm = () => {
    setNewCourseName("");
    setNewCourseFullName("");
    setNewCoursePDF1(null);
    setNewCoursePDF2(null);
    setNewCoursePDF3(null);
    setNewCoursePDF4(null);
    setAddCourseError(null);
  };

  // Helper function to generate parent breadcrumb string
  const getParentBreadcrumb = () => {
    if (!currentParent) return "";

    const breadcrumbParts: string[] = [];

    // Add all navigation path items
    navigationPath.forEach((item) => {
      breadcrumbParts.push(item.name);
    });

    return breadcrumbParts.join(" > ");
  };

  const resetEditForm = () => {
    setEditingItem(null);
    setEditItemType(null);
    setNewCategoryName("");
    setNewCategoryDefinition("");
    setNewCategoryImage(null);
    setEditError(null);
  };

  const handleEditClick = (
    item: CategoryNode,
    itemType: "category" | "subcategory" | "course"
  ) => {
    setEditingItem(item);
    setEditItemType(itemType);

    if (itemType === "category") {
      setNewCategoryName(item.categoryName || "");
      setNewCategoryDefinition(item.categoryDefinition || "");
      setShowEditCategoryModal(true);
    } else {
      // For editing subcategories and courses, we'll populate the edit form differently
      // depending on the type being edited
      if ((item as CategoryNode).subcategoryName) {
        // Editing a subcategory
        setNewSubcategoryName((item as CategoryNode).subcategoryName || "");
        setNewSubcategoryDefinition(
          (item as CategoryNode).subcategoryDefinition || ""
        );
      } else {
        // Editing a course
        setNewCourseName((item as Course).className || "");
        setNewCourseFullName((item as Course).classFullname || "");
      }
      setShowEditChildModal(true);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setAddCategoryError("Category name is required.");
      return;
    }

    if (!newCategoryImage) {
      setAddCategoryError("Category image is required.");
      return;
    }

    // Validate image file type
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(newCategoryImage.type)) {
      setAddCategoryError(
        "Please select a valid image file (JPEG, PNG, GIF, or WebP)."
      );
      return;
    }

    // Validate image file size (max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (newCategoryImage.size > maxSizeInBytes) {
      setAddCategoryError("Image file size must be less than 5MB.");
      return;
    }

    setAddCategoryLoading(true);
    setAddCategoryError(null);

    try {
      const formData = new FormData();
      formData.append("categoryName", newCategoryName.trim());
      formData.append("categoryDefinition", newCategoryDefinition.trim());

      // Ensure the image is properly appended
      if (newCategoryImage) {
        formData.append("image", newCategoryImage, newCategoryImage.name);
      }

      // Debug: Log form data
      console.log("Creating category with FormData:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await dispatch(createCategory(formData)).unwrap();
      toast.success("Category created successfully!");
      setShowAddCategoryModal(false);
      resetCategoryForm();
      await dispatch(
        fetchCategories({
          page: currentPage,
          limit: itemsPerPage,
        })
      ).unwrap();
    } catch (err: any) {
      console.error("Category creation error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create category.";
      setAddCategoryError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAddCategoryLoading(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (!currentParent) return;

    if (!newSubcategoryName.trim()) {
      setAddSubcategoryError("Name is required.");
      return;
    }

    setAddSubcategoryLoading(true);
    setAddSubcategoryError(null);

    try {
      const parentId = (currentParent.categoryId ??
        currentParent.subcategoryId) as number;
      const parentType: NodeType = currentParent.categoryId
        ? "category"
        : "subcategory";

      console.log("Creating subcategory with:", {
        subcategoryName: newSubcategoryName.trim(),
        subcategoryDefinition: newSubcategoryDefinition.trim(),
        parentId: parentId,
        parentType: parentType,
        isParentSubcategory: parentType === "subcategory",
      });

      await dispatch(
        createSubcategory({
          subcategoryName: newSubcategoryName.trim(),
          subcategoryDefinition: newSubcategoryDefinition.trim(),
          parentId: parentId,
          parentType: parentType as NodeType,
          isParentSubcategory: parentType === "subcategory",
        })
      ).unwrap();

      toast.success("Subcategory created successfully!");
      setShowAddSubcategoryModal(false);
      resetSubcategoryForm();

      // Refresh categories data
      const fetched = await dispatch(fetchCategories()).unwrap();
      const freshCategories: CategoryNode[] = Array.isArray(fetched)
        ? fetched
        : fetched?.data ?? [];

      // Try to synchronously locate the refreshed parent and restore navigation path
      if (currentParent && navigationPath.length > 0) {
        const currentNavigationPath = [...navigationPath];
        const lastPathItem =
          currentNavigationPath[currentNavigationPath.length - 1];

        const refreshedParent = findNodeById(
          freshCategories,
          lastPathItem.id,
          lastPathItem.type
        );
        if (refreshedParent) {
          setNavigationPath(currentNavigationPath);
          setCurrentParent(refreshedParent);
          setViewingLevel("children");
        }
      }
    } catch (err: any) {
      console.error("Subcategory creation error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create subcategory.";
      setAddSubcategoryError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAddSubcategoryLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!currentParent) return;

    if (!newCourseName.trim()) {
      setAddCourseError("Course name is required.");
      return;
    }

    if (!newCourseFullName.trim()) {
      setAddCourseError("Course full name is required.");
      return;
    }

    // Check if at least one PDF is provided
    const pdfFiles = [
      newCoursePDF1,
      newCoursePDF2,
      newCoursePDF3,
      newCoursePDF4,
    ].filter(Boolean);
    if (pdfFiles.length === 0) {
      setAddCourseError("At least one PDF file is required for courses.");
      return;
    }

    setAddCourseLoading(true);
    setAddCourseError(null);

    try {
      const parentId = (currentParent.categoryId ??
        currentParent.subcategoryId) as number;
      const parentType: NodeType = currentParent.categoryId
        ? "category"
        : "subcategory";

      // Create a FileList-like object from the individual files
      const dataTransfer = new DataTransfer();
      pdfFiles.forEach((file) => {
        if (file) dataTransfer.items.add(file);
      });

      await dispatch(
        createCourse({
          className: newCourseName.trim(),
          classFullname: newCourseFullName.trim(),
          parentId: parentId,
          parentType: parentType as NodeType,
          pdfs: dataTransfer.files,
        })
      ).unwrap();

      toast.success("Course created successfully!");
      setShowAddCourseModal(false);
      resetCourseForm();

      // Refresh categories data and use returned payload to restore navigation
      const fetched = await dispatch(fetchCategories()).unwrap();
      const freshCategories: CategoryNode[] = Array.isArray(fetched)
        ? fetched
        : fetched?.data ?? [];

      if (currentParent && navigationPath.length > 0) {
        const currentNavigationPath = [...navigationPath];
        const lastPathItem =
          currentNavigationPath[currentNavigationPath.length - 1];

        const refreshedParent = findNodeById(
          freshCategories,
          lastPathItem.id,
          lastPathItem.type
        );
        if (refreshedParent) {
          setNavigationPath(currentNavigationPath);
          setCurrentParent(refreshedParent);
          setViewingLevel("children");
        }
      }
    } catch (err: any) {
      console.error("Course creation error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create course.";
      setAddCourseError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAddCourseLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This will also delete all its children."
      )
    ) {
      return;
    }

    try {
      await dispatch(deleteCategory(categoryId)).unwrap();
      toast.success("Category deleted successfully!");
      await dispatch(
        fetchCategories({
          page: currentPage,
          limit: itemsPerPage,
        })
      ).unwrap();

      if (currentParent?.categoryId?.toString() === categoryId) {
        navigateToCategories();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete category.");
    }
  };

  const handleDeleteChild = async (
    item: CategoryNode,
    itemType: "subcategory" | "course"
  ) => {
    if (!confirm(`Are you sure you want to delete this ${itemType}?`)) {
      return;
    }

    try {
      if (itemType === "subcategory") {
        await dispatch(
          deleteSubcategory((item.subcategoryId as number).toString())
        ).unwrap();
      } else {
        await dispatch(
          deleteCourse((item.classId as number).toString())
        ).unwrap();
      }

      toast.success(
        `${
          itemType === "subcategory" ? "Subcategory" : "Course"
        } deleted successfully!`
      );

      // Refresh categories data and restore navigation using payload
      const fetched = await dispatch(fetchCategories()).unwrap();
      const freshCategories: CategoryNode[] = Array.isArray(fetched)
        ? fetched
        : fetched?.data ?? [];

      if (currentParent && navigationPath.length > 0) {
        const currentNavigationPath = [...navigationPath];
        const lastPathItem =
          currentNavigationPath[currentNavigationPath.length - 1];

        const refreshedParent = findNodeById(
          freshCategories,
          lastPathItem.id,
          lastPathItem.type
        );
        if (refreshedParent) {
          setNavigationPath(currentNavigationPath);
          setCurrentParent(refreshedParent);
          setViewingLevel("children");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || `Failed to delete ${itemType}.`);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingItem || !newCategoryName.trim()) {
      setEditError("Category name is required.");
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const formData = new FormData();
      formData.append("categoryName", newCategoryName.trim());
      formData.append("categoryDefinition", newCategoryDefinition.trim());
      if (newCategoryImage) {
        formData.append("image", newCategoryImage);
      }

      // Debug: Log form data
      console.log("Updating category with data:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await dispatch(
        updateCategory({
          id: (editingItem.categoryId as number).toString(),
          formData: formData,
        })
      ).unwrap();

      toast.success("Category updated successfully!");
      setShowEditCategoryModal(false);
      resetEditForm();
      await dispatch(
        fetchCategories({
          page: currentPage,
          limit: itemsPerPage,
        })
      ).unwrap();
    } catch (err: any) {
      setEditError(err?.message || "Failed to update category.");
      toast.error("Failed to update category.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateChild = async () => {
    if (!editingItem) {
      setEditError("No item selected for editing.");
      return;
    }

    // Validate based on the type of item being edited
    if (editItemType === "subcategory" && !newSubcategoryName.trim()) {
      setEditError("Subcategory name is required.");
      return;
    }

    if (editItemType === "course" && !newCourseName.trim()) {
      setEditError("Course name is required.");
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      if (editItemType === "subcategory") {
        const updateData = {
          subcategoryName: newSubcategoryName.trim(),
          subcategoryDefinition: newSubcategoryDefinition.trim(),
        };

        await dispatch(
          updateSubcategory({
            id: (editingItem.subcategoryId as number).toString(),
            data: updateData,
          })
        ).unwrap();
      } else if (editItemType === "course") {
        const formData = new FormData();
        formData.append("className", newCourseName.trim());
        formData.append("classFullname", newCourseFullName.trim());

        // Add PDF files if any are selected
        const pdfFiles = [
          newCoursePDF1,
          newCoursePDF2,
          newCoursePDF3,
          newCoursePDF4,
        ].filter(Boolean);
        pdfFiles.forEach((pdf) => {
          if (pdf) formData.append("pdfs", pdf);
        });

        await dispatch(
          updateCourse({
            id: (editingItem.classId as number).toString(),
            formData,
          })
        ).unwrap();
      }

      toast.success(
        `${
          editItemType === "course" ? "Course" : "Subcategory"
        } updated successfully!`
      );
      setShowEditChildModal(false);
      resetEditForm();

      // Refresh categories data and restore navigation using returned payload
      const fetched = await dispatch(fetchCategories()).unwrap();
      const freshCategories: CategoryNode[] = Array.isArray(fetched)
        ? fetched
        : fetched?.data ?? [];

      if (currentParent && navigationPath.length > 0) {
        const currentNavigationPath = [...navigationPath];
        const lastPathItem =
          currentNavigationPath[currentNavigationPath.length - 1];

        const refreshedParent = findNodeById(
          freshCategories,
          lastPathItem.id,
          lastPathItem.type
        );
        if (refreshedParent) {
          setNavigationPath(currentNavigationPath);
          setCurrentParent(refreshedParent);
          setViewingLevel("children");
        }
      }
    } catch (err: any) {
      setEditError(err?.message || `Failed to update ${editItemType}.`);
      toast.error(`Failed to update ${editItemType}.`);
    } finally {
      setEditLoading(false);
    }
  };

  const renderBreadcrumb = () => {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <button
          onClick={navigateToCategories}
          className="hover:text-blue-600 transition-colors"
        >
          Categories
        </button>
        {navigationPath.map((item, index) => (
          <React.Fragment key={item.id}>
            <KeyboardArrowRightIcon className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => {
                if (index === navigationPath.length - 1) return;
                const newPath = navigationPath.slice(0, index + 1);
                setNavigationPath(newPath);
                const parentData =
                  categories.find(
                    (cat) => cat.categoryId?.toString() === item.id
                  ) ||
                  categories
                    .flatMap((cat) => cat.subcategories || [])
                    .find((sub) => sub.subcategoryId?.toString() === item.id) ||
                  null;
                setCurrentParent(parentData as CategoryNode | null);
                setViewingLevel("children");
              }}
              className="hover:text-blue-600 transition-colors"
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderCategoriesView = () => {
    return (
      <div className="space-y-6">
        {/* Add Category Button */}
        <div className="sm:flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            All Categories
          </h2>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAddCategoryModal(true)}
          >
            <AddIcon className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No categories found</div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowAddCategoryModal(true)}
            >
              Add Your First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: CategoryNode) => (
              <div
                key={
                  category.categoryId ?? category.id ?? category.categoryName
                }
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Category Image Cover */}
                {category.categoryImageUrl && (
                  <div className="w-full h-48 overflow-hidden relative">
                    <img
                      src={getImageUrl(category.categoryImageUrl)}
                      alt={category.categoryName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <FolderIcon className="w-12 h-12 text-blue-600" />
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {!category.categoryImageUrl && (
                        <FolderIcon className="w-6 h-6 text-blue-600" />
                      )}
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {category.categoryName}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(category, "category");
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(
                            (category.categoryId as number)?.toString() ||
                              (category.id as string) ||
                              ""
                          );
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {category.categoryDefinition || "No description"}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <div className="flex flex-col gap-1">
                        <span>
                          {category.subcategories?.length || 0} subcategories
                        </span>
                        <span>
                          {category.allCourses?.length || 0} total courses
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigateToChildren(category)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Contents →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {categories.length > 0 && (
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
              itemsPerPageOptions={[6, 12, 18, 24]}
            />
          </div>
        )}
      </div>
    );
  };

  const renderChildrenView = () => {
    if (!currentParent) return null;

    const children = [
      ...(currentParent.subcategories || []),
      ...(currentParent.children || []), // For nested subcategories
      ...(currentParent.courses || []),
    ];

    return (
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={
                navigationPath.length > 0 ? navigateBack : navigateToCategories
              }
              className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Go back"
            >
              <ArrowBackIcon className="w-4 h-4" />
              <span className="text-xs">Back</span>
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Contents of{" "}
                {currentParent.categoryName || currentParent.subcategoryName}
              </h2>
            </div>
          </div>
          <div className="flex gap-2">
            {(() => {
              const { canAddSubcategory, canAddCourse } = getAvailableActions();
              return (
                <>
                  {canAddSubcategory && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => setShowAddSubcategoryModal(true)}
                    >
                      <FolderIcon className="w-4 h-4" />
                      Add Subcategory
                    </button>
                  )}
                  {canAddCourse && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      onClick={() => setShowAddCourseModal(true)}
                    >
                      <SchoolIcon className="w-4 h-4" />
                      Add Course
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Children Grid */}
        {children.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No items found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child: CategoryNode) => {
              const isSubcategory = !!child.subcategoryId;

              return (
                <div
                  key={
                    child.subcategoryId ??
                    child.classId ??
                    child.id ??
                    (child.subcategoryName || child.className)
                  }
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {isSubcategory ? (
                        <FolderIcon className="w-6 h-6 text-green-600" />
                      ) : (
                        <SchoolIcon className="w-6 h-6 text-purple-600" />
                      )}
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {child.subcategoryName || child.className}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(
                            child,
                            isSubcategory ? "subcategory" : "course"
                          );
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChild(
                            child,
                            isSubcategory ? "subcategory" : "course"
                          );
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {child.subcategoryDefinition ||
                      child.classFullname ||
                      "No description"}
                  </p>

                  {/* Show nested content for subcategories */}
                  {isSubcategory && (
                    <div className="mb-4 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>
                          {(child.children?.length || 0) +
                            (child.subcategories?.length || 0)}{" "}
                          nested
                        </span>
                        <span>{child.courses?.length || 0} courses</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {isSubcategory ? "Subcategory" : "Course"}
                    </div>
                    {isSubcategory && (
                      <button
                        onClick={() => navigateToChildren(child)}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        {(child.children?.length || 0) +
                          (child.subcategories?.length || 0) +
                          (child.courses?.length || 0) >
                        0
                          ? "View Contents →"
                          : "Explore →"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Category Manager
          </h1>
          {renderBreadcrumb()}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-6">
            {/* Keep a skeleton loader for both views */}
            {viewingLevel === "categories" ? (
              <SkeletonGrid columns={3} rows={2} />
            ) : (
              <SkeletonGrid columns={3} rows={1} />
            )}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
          </div>
        )}

        {/* Content */}
        {!loading &&
          !error &&
          (viewingLevel === "categories"
            ? renderCategoriesView()
            : renderChildrenView())}

        {/* Add Category Modal */}
        <Modal
          open={showAddCategoryModal}
          onClose={() => {
            setShowAddCategoryModal(false);
            resetCategoryForm();
          }}
          title="Add New Category"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowAddCategoryModal(false);
                  resetCategoryForm();
                }}
                disabled={addCategoryLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleAddCategory}
                disabled={addCategoryLoading}
              >
                {addCategoryLoading ? "Creating..." : "Create Category"}
              </button>
            </div>
          }
        >
          <div className="w-full max-w-lg mx-auto px-2">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Category Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Category Description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newCategoryDefinition}
                onChange={(e) => setNewCategoryDefinition(e.target.value)}
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Category Image *
              </label>

              {/* Image Preview */}
              {newCategoryImage && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-2">
                    Image Preview:
                  </div>
                  <div className="w-32 h-24 border border-gray-200 rounded-lg overflow-hidden mx-auto">
                    <img
                      src={URL.createObjectURL(newCategoryImage)}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewCategoryImage(e.target.files?.[0] || null)
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="add-category-image"
                  required
                />
                <label
                  htmlFor="add-category-image"
                  className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg py-4 px-4 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <AddIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {newCategoryImage
                      ? "Change Image"
                      : "Upload Category Image"}
                  </span>
                </label>
              </div>

              {newCategoryImage && (
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <span>{newCategoryImage.name}</span>
                  <button
                    type="button"
                    onClick={() => setNewCategoryImage(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {addCategoryError && (
              <div className="text-red-500 text-sm mt-4 bg-red-50 p-2 rounded">
                {addCategoryError}
              </div>
            )}
          </div>
        </Modal>

        {/* Add Subcategory Modal */}
        <Modal
          open={showAddSubcategoryModal}
          onClose={() => {
            setShowAddSubcategoryModal(false);
            resetSubcategoryForm();
          }}
          title="Add New Subcategory"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowAddSubcategoryModal(false);
                  resetSubcategoryForm();
                }}
                disabled={addSubcategoryLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleAddSubcategory}
                disabled={addSubcategoryLoading}
              >
                {addSubcategoryLoading ? "Creating..." : "Create Subcategory"}
              </button>
            </div>
          }
        >
          <div className="w-full max-w-lg mx-auto px-2">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Subcategory Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="Enter subcategory name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Subcategory Definition
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newSubcategoryDefinition}
                onChange={(e) => setNewSubcategoryDefinition(e.target.value)}
                placeholder="Enter subcategory definition"
                rows={3}
              />
            </div>

            {addSubcategoryError && (
              <div className="text-red-500 text-sm mt-4 bg-red-50 p-2 rounded">
                {addSubcategoryError}
              </div>
            )}
          </div>
        </Modal>

        {/* Add Course Modal */}
        <Modal
          open={showAddCourseModal}
          onClose={() => {
            setShowAddCourseModal(false);
            resetCourseForm();
          }}
          title="Add New Course"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowAddCourseModal(false);
                  resetCourseForm();
                }}
                disabled={addCourseLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                onClick={handleAddCourse}
                disabled={addCourseLoading}
              >
                {addCourseLoading ? "Creating..." : "Create Course"}
              </button>
            </div>
          }
        >
          <div className="w-full max-w-lg mx-auto px-2">
            {/* Parent Breadcrumb */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <FolderIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Parent:</span>
                <span className="font-medium text-gray-800">
                  {getParentBreadcrumb() || "Categories"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Course Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="Enter course name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Course Full Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={newCourseFullName}
                onChange={(e) => setNewCourseFullName(e.target.value)}
                placeholder="Enter course full name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                PDF Files
              </label>
              <div className="space-y-3">
                {/* PDF Upload Button 1 */}
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      setNewCoursePDF1(e.target.files?.[0] || null)
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="course-pdf-1"
                  />
                  <label
                    htmlFor="course-pdf-1"
                    className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-3 px-4 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer bg-gray-50"
                  >
                    <span className="text-sm text-gray-600">
                      {newCoursePDF1 ? newCoursePDF1.name : "Upload PDF 1"}
                    </span>
                  </label>
                  {newCoursePDF1 && (
                    <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      ✓ {newCoursePDF1.name}
                    </div>
                  )}
                </div>

                {/* PDF Upload Button 2 */}
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      setNewCoursePDF2(e.target.files?.[0] || null)
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="course-pdf-2"
                  />
                  <label
                    htmlFor="course-pdf-2"
                    className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-3 px-4 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer bg-gray-50"
                  >
                    <span className="text-sm text-gray-600">
                      {newCoursePDF2 ? newCoursePDF2.name : "Upload PDF 2"}
                    </span>
                  </label>
                  {newCoursePDF2 && (
                    <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      ✓ {newCoursePDF2.name}
                    </div>
                  )}
                </div>

                {/* PDF Upload Button 3 */}
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      setNewCoursePDF3(e.target.files?.[0] || null)
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="course-pdf-3"
                  />
                  <label
                    htmlFor="course-pdf-3"
                    className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-3 px-4 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer bg-gray-50"
                  >
                    <span className="text-sm text-gray-600">
                      {newCoursePDF3 ? newCoursePDF3.name : "Upload PDF 3"}
                    </span>
                  </label>
                  {newCoursePDF3 && (
                    <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      ✓ {newCoursePDF3.name}
                    </div>
                  )}
                </div>

                {/* PDF Upload Button 4 */}
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      setNewCoursePDF4(e.target.files?.[0] || null)
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="course-pdf-4"
                  />
                  <label
                    htmlFor="course-pdf-4"
                    className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-3 px-4 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer bg-gray-50"
                  >
                    <span className="text-sm text-gray-600">
                      {newCoursePDF4 ? newCoursePDF4.name : "Upload PDF 4"}
                    </span>
                  </label>
                  {newCoursePDF4 && (
                    <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      ✓ {newCoursePDF4.name}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload PDF files for the course materials. At least one PDF is
                required.
              </p>
            </div>

            {addCourseError && (
              <div className="text-red-500 text-sm mt-4 bg-red-50 p-2 rounded">
                {addCourseError}
              </div>
            )}
          </div>
        </Modal>

        {/* Edit Category Modal */}
        <Modal
          open={showEditCategoryModal}
          onClose={() => {
            setShowEditCategoryModal(false);
            resetEditForm();
          }}
          title="Edit Category"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowEditCategoryModal(false);
                  resetEditForm();
                }}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleUpdateCategory}
                disabled={editLoading}
              >
                {editLoading ? "Updating..." : "Update Category"}
              </button>
            </div>
          }
        >
          <div className="w-full max-w-lg mx-auto px-2">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Category Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Category Description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newCategoryDefinition}
                onChange={(e) => setNewCategoryDefinition(e.target.value)}
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Category Image (optional - leave empty to keep current)
              </label>

              {/* Current Image Preview */}
              {editingItem?.categoryImageUrl && !newCategoryImage && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-2">
                    Current Image:
                  </div>
                  <div className="w-32 h-24 border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(editingItem.categoryImageUrl)}
                      alt="Current category"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* New Image Preview */}
              {newCategoryImage && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-2">
                    New Image Preview:
                  </div>
                  <div className="w-32 h-24 border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(newCategoryImage)}
                      alt="New category preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewCategoryImage(e.target.files?.[0] || null)
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="edit-category-image"
                />
                <label
                  htmlFor="edit-category-image"
                  className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg py-4 px-4 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <AddIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {newCategoryImage ? "Change Image" : "Upload New Image"}
                  </span>
                </label>
              </div>

              {newCategoryImage && (
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <span>{newCategoryImage.name}</span>
                  <button
                    type="button"
                    onClick={() => setNewCategoryImage(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {editError && (
              <div className="text-red-500 text-sm mt-4 bg-red-50 p-2 rounded">
                {editError}
              </div>
            )}
          </div>
        </Modal>

        {/* Edit Child Modal */}
        <Modal
          open={showEditChildModal}
          onClose={() => {
            setShowEditChildModal(false);
            resetEditForm();
          }}
          title={`Edit ${editItemType === "course" ? "Course" : "Subcategory"}`}
          footer={
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowEditChildModal(false);
                  resetEditForm();
                }}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleUpdateChild}
                disabled={editLoading}
              >
                {editLoading
                  ? "Updating..."
                  : `Update ${
                      editItemType === "course" ? "Course" : "Subcategory"
                    }`}
              </button>
            </div>
          }
        >
          <div className="w-full max-w-lg mx-auto px-2">
            {editItemType === "subcategory" ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="Enter subcategory name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Subcategory Definition
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSubcategoryDefinition}
                    onChange={(e) =>
                      setNewSubcategoryDefinition(e.target.value)
                    }
                    placeholder="Enter subcategory definition"
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="Enter course name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Course Full Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newCourseFullName}
                    onChange={(e) => setNewCourseFullName(e.target.value)}
                    placeholder="Enter course full name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Update PDF Files (optional)
                  </label>

                  {/* Show existing PDFs */}
                  {editingItem && editItemType === "course" && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-800 font-medium mb-2">
                        Current PDF Files:
                      </div>
                      <div className="space-y-1 text-xs text-blue-700">
                        {editingItem.pdfPath1 && (
                          <div className="flex items-center gap-2">
                            <span>📄</span>
                            <span>
                              PDF 1:{" "}
                              {editingItem.pdfPath1.split("/").pop() ||
                                editingItem.pdfPath1}
                            </span>
                          </div>
                        )}
                        {editingItem.pdfPath2 && (
                          <div className="flex items-center gap-2">
                            <span>📄</span>
                            <span>
                              PDF 2:{" "}
                              {editingItem.pdfPath2.split("/").pop() ||
                                editingItem.pdfPath2}
                            </span>
                          </div>
                        )}
                        {editingItem.pdfPath3 && (
                          <div className="flex items-center gap-2">
                            <span>📄</span>
                            <span>
                              PDF 3:{" "}
                              {editingItem.pdfPath3.split("/").pop() ||
                                editingItem.pdfPath3}
                            </span>
                          </div>
                        )}
                        {editingItem.pdfPath4 && (
                          <div className="flex items-center gap-2">
                            <span>📄</span>
                            <span>
                              PDF 4:{" "}
                              {editingItem.pdfPath4.split("/").pop() ||
                                editingItem.pdfPath4}
                            </span>
                          </div>
                        )}
                        {!editingItem.pdfPath1 &&
                          !editingItem.pdfPath2 &&
                          !editingItem.pdfPath3 &&
                          !editingItem.pdfPath4 && (
                            <div className="text-gray-500">
                              No PDF files found for this course
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* PDF Upload Button 1 */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          setNewCoursePDF1(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="edit-course-pdf-1"
                      />
                      <label
                        htmlFor="edit-course-pdf-1"
                        className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-3 px-4 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer bg-gray-50"
                      >
                        <span className="text-sm text-gray-600">
                          {newCoursePDF1
                            ? newCoursePDF1.name
                            : "Upload New PDF 1"}
                        </span>
                      </label>
                      {newCoursePDF1 && (
                        <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          ✓ {newCoursePDF1.name}
                        </div>
                      )}
                    </div>

                    {/* PDF Upload Button 2 */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          setNewCoursePDF2(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="edit-course-pdf-2"
                      />
                      <label
                        htmlFor="edit-course-pdf-2"
                        className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-3 px-4 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer bg-gray-50"
                      >
                        <span className="text-sm text-gray-600">
                          {newCoursePDF2
                            ? newCoursePDF2.name
                            : "Upload New PDF 2"}
                        </span>
                      </label>
                      {newCoursePDF2 && (
                        <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          ✓ {newCoursePDF2.name}
                        </div>
                      )}
                    </div>

                    {/* PDF Upload Button 3 */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          setNewCoursePDF3(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="edit-course-pdf-3"
                      />
                      <label
                        htmlFor="edit-course-pdf-3"
                        className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-3 px-4 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer bg-gray-50"
                      >
                        <span className="text-sm text-gray-600">
                          {newCoursePDF3
                            ? newCoursePDF3.name
                            : "Upload New PDF 3"}
                        </span>
                      </label>
                      {newCoursePDF3 && (
                        <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          ✓ {newCoursePDF3.name}
                        </div>
                      )}
                    </div>

                    {/* PDF Upload Button 4 */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          setNewCoursePDF4(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="edit-course-pdf-4"
                      />
                      <label
                        htmlFor="edit-course-pdf-4"
                        className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-3 px-4 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer bg-gray-50"
                      >
                        <span className="text-sm text-gray-600">
                          {newCoursePDF4
                            ? newCoursePDF4.name
                            : "Upload New PDF 4"}
                        </span>
                      </label>
                      {newCoursePDF4 && (
                        <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          ✓ {newCoursePDF4.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty to keep existing PDFs, or upload new ones to
                    replace
                  </p>
                </div>
              </>
            )}

            {editError && (
              <div className="text-red-500 text-sm mt-4 bg-red-50 p-2 rounded">
                {editError}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CategoryManager;
