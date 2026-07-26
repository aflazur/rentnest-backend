import httpStatus from "http-status";
import config from "../../config";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { generateTransactionId } from "../../utils/generateTransactionId";
import { TCreatePaymentPayload } from "./payment.interface";

const getApprovedRentalRequestOrThrow = async (rentalRequestId: string, userId: string) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rentalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rental request not found");
  }

  if (rentalRequest.tenantId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "This rental request does not belong to you");
  }

  if (rentalRequest.status !== "APPROVED") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment can only be made for an approved rental request");
  }

  if (rentalRequest.payment) {
    throw new ApiError(httpStatus.CONFLICT, "A payment has already been initiated for this rental request");
  }

  return rentalRequest;
};

const createStripeCheckoutSession = async (transactionId: string, amount: number, title: string) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: title },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${config.base_url}/api/payments/confirm?transactionId=${transactionId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.base_url}/api/payments/cancel?transactionId=${transactionId}`,
    metadata: { transactionId },
  });

  return { checkoutUrl: session.url, gatewaySessionId: session.id };
};

const createPayment = async (userId: string, payload: TCreatePaymentPayload) => {
  const rentalRequest = await getApprovedRentalRequestOrThrow(payload.rentalRequestId, userId);

  const transactionId = generateTransactionId("STR");
  const amount = Number(rentalRequest.property.price);

  const { checkoutUrl, gatewaySessionId } = await createStripeCheckoutSession(
    transactionId,
    amount,
    rentalRequest.property.title
  );

  const payment = await prisma.payment.create({
    data: {
      transactionId,
      amount,
      provider: "STRIPE",
      status: "PENDING",
      gatewaySessionId,
      rentalRequestId: rentalRequest.id,
      userId,
    },
  });

  return { payment, checkoutUrl };
};

const confirmPayment = async (transactionId: string, sessionId?: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
    include: { rentalRequest: true },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment record not found");
  }

  if (payment.status === "COMPLETED") {
    return payment;
  }

  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Stripe session_id is required to confirm payment");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const isVerified = session.payment_status === "paid";

  if (!isVerified) {
    const failedPayment = await prisma.payment.update({
      where: { transactionId },
      data: { status: "FAILED" },
    });
    throw new ApiError(httpStatus.PAYMENT_REQUIRED, "Payment could not be verified", { payment: failedPayment });
  }

  const updatedPayment = await prisma.$transaction(async (tx: any) => {
    const result = await tx.payment.update({
      where: { transactionId },
      data: { status: "COMPLETED", paidAt: new Date() },
    });

    await tx.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: "ACTIVE" },
    });

    await tx.property.update({
      where: { id: payment.rentalRequest.propertyId },
      data: { status: "RENTED" },
    });

    return result;
  });

  return updatedPayment;
};

const getUserPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    include: {
      rentalRequest: { include: { property: { select: { id: true, title: true, city: true, area: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (id: string, requester: { id: string; role: string }) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalRequest: { include: { property: true } },
    },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
  }

  const isOwner = payment.userId === requester.id;
  const isLandlord = payment.rentalRequest.property.landlordId === requester.id;
  const isAdmin = requester.role === "ADMIN";

  if (!isOwner && !isLandlord && !isAdmin) {
    throw new ApiError(httpStatus.FORBIDDEN, "You do not have access to this payment record");
  }

  return payment;
};

export const paymentService = {
  createPayment,
  confirmPayment,
  getUserPayments,
  getPaymentById,
};
