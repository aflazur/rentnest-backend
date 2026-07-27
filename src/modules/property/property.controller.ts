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

const createProperty = catchAsync(async (req: Request, res: Response) => {
    const result = await propertyService.createProperty(req.user!.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Property listing created successfully",
        data: result,
    });
});

const getLandlordProperties = catchAsync(async (req: Request, res: Response) => {
    const result = await propertyService.getLandlordProperties(req.user!.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Landlord properties retrieved successfully",
        data: result,
    });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
    const result = await propertyService.updateProperty(req.params.id, req.user!.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property updated successfully",
        data: result,
    });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
    await propertyService.deleteProperty(req.params.id, req.user!.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property removed successfully",
        data: null,
    });
});

export const propertyController = {
    getAllProperties,
    getSingleProperty,
    createProperty,
    getLandlordProperties,
    updateProperty,
    deleteProperty,
};