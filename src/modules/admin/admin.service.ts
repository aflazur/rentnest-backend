import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { paginationHelper } from "../../utils/paginationHelper";

const getAllUsers = async (options: { page?: string; limit?: string; sortBy?: string; sortOrder?: "asc" | "desc" }) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        activeStatus: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return { meta: { page, limit, total, totalPages: Math.ceil(total / limit) }, data: users };
};

const updateUserStatus = async (userId: string, activeStatus: "ACTIVE" | "BLOCKED") => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role === "ADMIN") {
    throw new ApiError(httpStatus.FORBIDDEN, "Admin accounts cannot be banned");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { activeStatus },
    select: { id: true, name: true, email: true, role: true, activeStatus: true },
  });

  return updated;
};

const getAllProperties = async (options: { page?: string; limit?: string; sortBy?: string; sortOrder?: "asc" | "desc" }) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        landlord: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.property.count(),
  ]);

  return { meta: { page, limit, total, totalPages: Math.ceil(total / limit) }, data: properties };
};

const getAllRentalRequests = async (options: { page?: string; limit?: string; sortBy?: string; sortOrder?: "asc" | "desc" }) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const [rentalRequests, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true, landlordId: true } },
        payment: true,
      },
    }),
    prisma.rentalRequest.count(),
  ]);

  return { meta: { page, limit, total, totalPages: Math.ceil(total / limit) }, data: rentalRequests };
};

const getDashboardSummary = async () => {
  const [totalUsers, totalTenants, totalLandlords, totalProperties, totalRentalRequests, totalCompletedPayments] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "TENANT" } }),
      prisma.user.count({ where: { role: "LANDLORD" } }),
      prisma.property.count({ where: { isDeleted: false } }),
      prisma.rentalRequest.count(),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
    ]);

  return { totalUsers, totalTenants, totalLandlords, totalProperties, totalRentalRequests, totalCompletedPayments };
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentalRequests,
  getDashboardSummary,
};