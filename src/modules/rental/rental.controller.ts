import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";

const createRentalRequest = catchAsync(async (req: Request, res: Response) => {
    const result = await rentalService.createRentalRequest(req.user!.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Rental request submitted successfully",
        data: result,
    });
});

const getMyRentalRequests = catchAsync(async (req: Request, res: Response) => {
    const result = await rentalService.getMyRentalRequests(req.user!.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests retrieved successfully",
        data: result,
    });
});

const getSingleRentalRequest = catchAsync(async (req: Request, res: Response) => {
    const result = await rentalService.getRentalRequestById(req.params.id, req.user!);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request retrieved successfully",
        data: result,
    });
});

const getLandlordRentalRequests = catchAsync(async (req: Request, res: Response) => {
    const result = await rentalService.getLandlordRentalRequests(req.user!.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests for your properties retrieved successfully",
        data: result,
    });
});

const updateRentalRequestStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await rentalService.updateRentalRequestStatus(req.params.id, req.user!.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Rental request ${result.status.toLowerCase()} successfully`,
        data: result,
    });
});

export const rentalController = {
    createRentalRequest,
    getMyRentalRequests,
    getSingleRentalRequest,
    getLandlordRentalRequests,
    updateRentalRequestStatus,
};