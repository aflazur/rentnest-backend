import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

const createReview = async (
  tenantId: string,
  payload: { rentalRequestId: string; rating: number; comment?: string }
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    include: { review: true },
  });

  if (!rentalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rental request not found");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new ApiError(httpStatus.FORBIDDEN, "This rental request does not belong to you");
  }

  if (!["ACTIVE", "COMPLETED"].includes(rentalRequest.status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only leave a review after your rental has been paid for and is active"
    );
  }

  if (rentalRequest.review) {
    throw new ApiError(httpStatus.CONFLICT, "You have already reviewed this rental");
  }

  const review = await prisma.review.create({
    data: {
      tenantId,
      propertyId: rentalRequest.propertyId,
      rentalRequestId: rentalRequest.id,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: { tenant: { select: { id: true, name: true } } },
  });

  return review;
};

const getPropertyReviews = async (propertyId: string) => {
  return prisma.review.findMany({
    where: { propertyId },
    include: { tenant: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const reviewService = {
  createReview,
  getPropertyReviews,
};