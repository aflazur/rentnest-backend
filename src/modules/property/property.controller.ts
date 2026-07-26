import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { pick } from "../../utils/pick";
import { sendResponse } from "../../utils/sendResponse";
import { propertyFilterableFields } from "./property.interface";
import { propertyService } from "./property.service";

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, propertyFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await propertyService.getAllProperties(filters, options as any);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Properties retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.getPropertyById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property retrieved successfully",
    data: result,
  });
});

export const propertyController = {
  getAllProperties,
  getSingleProperty,
};