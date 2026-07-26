import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.createReview(req.user!.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review submitted successfully",
    data: result,
  });
});

const getPropertyReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.getPropertyReviews(req.params.propertyId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property reviews retrieved successfully",
    data: result,
  });
});

export const reviewController = {
  createReview,
  getPropertyReviews,
};