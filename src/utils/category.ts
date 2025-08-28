import type { CategoryNode, NodeType } from "../features/category/categorySlice";

/**
 * Recursively search categories and their nested subcategories/children
 * for a node matching the given id and type.
 */
export function findNodeById(
  categories: CategoryNode[],
  id: string,
  type: NodeType
): CategoryNode | null {
  for (const cat of categories) {
    if (type === "category" && cat.categoryId?.toString() === id) return cat;

    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        if (type === "subcategory" && sub.subcategoryId?.toString() === id) return sub as CategoryNode;

        // search deeper in nested children on subcategories
        if (sub.children) {
          const found = findNodeById(sub.children, id, type);
          if (found) return found;
        }
      }
    }

    // also search directly in children field (legacy shape)
    if (cat.children) {
      const found = findNodeById(cat.children, id, type);
      if (found) return found;
    }
  }

  return null;
}
