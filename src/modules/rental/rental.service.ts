import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

const createRentalRequest = async (
  tenantId: string,
  payload: { propertyId: string; moveInDate: Date; message?: string }
) => {
  const property = await prisma.property.findFirst({
    where: { id: payload.propertyId, isDeleted: false },
  });

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, "Property not found");
  }

  if (property.status !== "AVAILABLE") {
    throw new ApiError(httpStatus.BAD_REQUEST, "This property is not currently available for rent");
  }

  if (property.landlordId === tenantId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You cannot submit a rental request for your own property");
  }

  const existingPendingRequest = await prisma.rentalRequest.findFirst({
    where: { tenantId, propertyId: payload.propertyId, status: { in: ["PENDING", "APPROVED", "ACTIVE"] } },
  });

  if (existingPendingRequest) {
    throw new ApiError(httpStatus.CONFLICT, "You already have an active or pending request for this property");
  }

  const rentalRequest = await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      moveInDate: payload.moveInDate,
      message: payload.message,
    },
    include: { property: true },
  });

  return rentalRequest;
};

const getMyRentalRequests = async (tenantId: string) => {
  return prisma.rentalRequest.findMany({
    where: { tenantId },
    include: {
      property: { include: { category: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getRentalRequestById = async (
  id: string,
  requester: { id: string; role: string }
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      property: { include: { category: true, landlord: { select: { id: true, name: true, email: true } } } },
      tenant: { select: { id: true, name: true, email: true, phone: true } },
      payment: true,
      review: true,
    },
  });

  if (!rentalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rental request not found");
  }

  const isTenant = rentalRequest.tenantId === requester.id;
  const isLandlord = rentalRequest.property.landlordId === requester.id;
  const isAdmin = requester.role === "ADMIN";

  if (!isTenant && !isLandlord && !isAdmin) {
    throw new ApiError(httpStatus.FORBIDDEN, "You do not have access to this rental request");
  }

  return rentalRequest;
};

export const rentalService = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
};