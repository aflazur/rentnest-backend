import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createCategory = async (payload: { name: string; description?: string }) => {
  const existing = await prisma.category.findUnique({ where: { name: payload.name } });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "A category with this name already exists");
  }

  const category = await prisma.category.create({
    data: {
      name: payload.name,
      slug: slugify(payload.name),
      description: payload.description,
    },
  });

  return category;
};

const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  return category;
};

const updateCategory = async (id: string, payload: { name?: string; description?: string }) => {
  await getCategoryById(id);

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...payload,
      ...(payload.name ? { slug: slugify(payload.name) } : {}),
    },
  });

  return category;
};

const deleteCategory = async (id: string) => {
  await getCategoryById(id);

  const propertyCount = await prisma.property.count({ where: { categoryId: id } });

  if (propertyCount > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot delete a category that has properties linked to it");
  }

  await prisma.category.delete({ where: { id } });

  return null;
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};