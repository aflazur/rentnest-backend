import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { paginationHelper } from "../../utils/paginationHelper";
import { pick } from "../../utils/pick";
import { TPropertyFilters, propertySearchableFields } from "./property.interface";

const getAllProperties = async (
    filters: TPropertyFilters,
    options: { page?: string; limit?: string; sortBy?: string; sortOrder?: "asc" | "desc" }
) => {
    const { searchTerm, minPrice, maxPrice, bedrooms, ...restFilters } = filters;
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    const andConditions: Prisma.PropertyWhereInput[] = [
        { isDeleted: false },
        { status: "AVAILABLE" },
    ];

    if (searchTerm) {
        andConditions.push({
            OR: propertySearchableFields.map((field) => ({
                [field]: { contains: searchTerm, mode: "insensitive" },
            })),
        });
    }

    if (minPrice) {
        andConditions.push({ price: { gte: Number(minPrice) } });
    }

    if (maxPrice) {
        andConditions.push({ price: { lte: Number(maxPrice) } });
    }

    if (bedrooms) {
        andConditions.push({ bedrooms: Number(bedrooms) });
    }

    const filterEntries = Object.entries(restFilters).filter(([, value]) => value !== undefined && value !== "");

    for (const [field, value] of filterEntries) {
        andConditions.push({ [field]: { equals: value } } as Prisma.PropertyWhereInput);
    }

    const whereConditions: Prisma.PropertyWhereInput = { AND: andConditions };

    const [properties, total] = await Promise.all([
        prisma.property.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                category: true,
                landlord: { select: { id: true, name: true, email: true, phone: true } },
                _count: { select: { reviews: true } },
            },
        }),
        prisma.property.count({ where: whereConditions }),
    ]);

    return {
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        data: properties,
    };
};

const getPropertyById = async (id: string) => {
    const property = await prisma.property.findFirst({
        where: { id, isDeleted: false },
        include: {
            category: true,
            landlord: { select: { id: true, name: true, email: true, phone: true } },
            reviews: {
                include: { tenant: { select: { id: true, name: true } } },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!property) {
        throw new ApiError(httpStatus.NOT_FOUND, "Property not found");
    }

    return property;
};

const createProperty = async (landlordId: string, payload: Record<string, any>) => {
    const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });

    if (!category) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category selected");
    }

    const property = await prisma.property.create({
        data: { ...payload, landlordId },
        include: { category: true },
    });

    return property;
};

const getLandlordProperties = async (landlordId: string) => {
    return prisma.property.findMany({
        where: { landlordId, isDeleted: false },
        include: { category: true, _count: { select: { rentalRequests: true, reviews: true } } },
        orderBy: { createdAt: "desc" },
    });
};

const ensurePropertyOwnership = async (id: string, landlordId: string) => {
    const property = await prisma.property.findFirst({ where: { id, isDeleted: false } });

    if (!property) {
        throw new ApiError(httpStatus.NOT_FOUND, "Property not found");
    }

    if (property.landlordId !== landlordId) {
        throw new ApiError(httpStatus.FORBIDDEN, "You do not own this property");
    }

    return property;
};

const updateProperty = async (id: string, landlordId: string, payload: Record<string, any>) => {
    await ensurePropertyOwnership(id, landlordId);

    if (payload.categoryId) {
        const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
        if (!category) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category selected");
        }
    }

    const property = await prisma.property.update({
        where: { id },
        data: payload,
        include: { category: true },
    });

    return property;
};

const deleteProperty = async (id: string, landlordId: string) => {
    await ensurePropertyOwnership(id, landlordId);

    await prisma.property.update({ where: { id }, data: { isDeleted: true, status: "UNAVAILABLE" } });

    return null;
};

export const propertyService = {
    getAllProperties,
    getPropertyById,
    createProperty,
    getLandlordProperties,
    updateProperty,
    deleteProperty,
    ensurePropertyOwnership,
};