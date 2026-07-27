import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { pick } from "../../utils/pick";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";


const paginationFields = ["page", "limit", "sortBy", "sortOrder"];

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, paginationFields);
  const result = await adminService.getAllUsers(options as any);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.updateUserStatus(req.params.id, req.body.activeStatus);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `User ${result.activeStatus === "BLOCKED" ? "banned" : "unbanned"} successfully`,
    data: result,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, paginationFields);
  const result = await adminService.getAllProperties(options as any);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All properties retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, paginationFields);
  const result = await adminService.getAllRentalRequests(options as any);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All rental requests retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getDashboardSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getDashboardSummary();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Dashboard summary retrieved successfully",
    data: result,
  });
});

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentalRequests,
  getDashboardSummary,
};