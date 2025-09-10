import { Reservations } from "./reservationsModel";
import utils from "../utils";
import mongoose from "mongoose";

import { VEHICLE_RESERVED_DATE, FORBIDDEN_USER, CANCEL_DAY, RESERVATIONS_STATUS } from "../constants"; 
const { isAdmin, checkAdminId } = utils;

const createReservations = async ( vehicleId: string, userId: string, leaseStart: Date, leaseEnd: Date, price: number, status: string ) => {
    const start = new Date(leaseStart);
    const end = new Date(leaseEnd);
    const checkFreeDate = await getReservationsVehicleAvailable(vehicleId, start, end);
    if (checkFreeDate === true) {
        return Reservations.create({ vehicleId, userId, leaseStart: start, leaseEnd: end, price, status });
    } else {
        throw new Error(VEHICLE_RESERVED_DATE);
    }
};

const createReservationsTG = async ( vehicleId: string, leaseStart: string, leaseEnd: string, price: number | null | undefined, userTgId: number) => {
    const start = new Date(leaseStart);
    const end = new Date(leaseEnd);
    const checkFreeDate = await getReservationsVehicleAvailable(vehicleId, start, end);
    if (checkFreeDate === true) {
        return Reservations.create({ vehicleId, leaseStart: start, leaseEnd: end, price, userTgId });
    } else {
        return VEHICLE_RESERVED_DATE;
    }
};

const getReservationsVehicleAvailable = async (vehicleId: string | mongoose.Types.ObjectId, leaseStart: Date | string, leaseEnd: Date | string) => {
    const start = new Date(leaseStart);
    const end = new Date(leaseEnd);
    const reservation = await Reservations.findOne({
        vehicleId,
        status: RESERVATIONS_STATUS.DONE,
        $nor: [
            { leaseEnd: { $lt: start } },
            { leaseStart: { $gt: end } },
        ],
    });

    if (reservation) {
        return false;
    }

    return true;
};

const showVehiclesAvaibleReservation = async ( leaseStart: Date, leaseEnd: Date) => {
    const start = new Date(leaseStart);
    const end = new Date(leaseEnd);
    const reservations = await Reservations.find({
        status: RESERVATIONS_STATUS.DONE,
        $nor: [
            { leaseEnd: { $lt: start } },
            { leaseStart: { $gt: end } },
        ],
    });
    if (reservations.length > 0) {
        throw new Error(VEHICLE_RESERVED_DATE);
    }
    return reservations;
};

const getReservationsHistory = async (userId: string | undefined) => {
    return Reservations.find({ userId });
};

const getStatisticComletedReservations = async (userId: string | undefined) => {
    await checkAdminId(userId);
    const statistic = await Reservations.aggregate([
        { $match: { status: RESERVATIONS_STATUS.COMPLETED} },
        { $group: { _id: "$vehicleId", count: { $sum: 1 } } },
        { $lookup: { from: "vehicles",
            localField: "_id",
            foreignField: "_id",
            as: "vehicleInfo"
        }},
        { $unwind: "$vehicleInfo" },
        { $project: { _id: 0, "vehicleInfo.model": 1, "vehicleInfo.year": 1, count: 1}}
    ]);
    const result = statistic.map(item => 
        `${item.vehicleInfo.model} - ${item.vehicleInfo.year}: ${item.count},`
    );
    return result
};

const getStatisticUsers = async (userId?: string) => {
    await checkAdminId(userId);
    const statistic = await Reservations.aggregate([
        { $match: { status: RESERVATIONS_STATUS.DONE } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $lookup: { from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "usersInfo"
        }},
        { $unwind: "$usersInfo" },
        { $project: {
            _id: 0,
            username: "$usersInfo.username",
            isAdmin: "$usersInfo.isAdmin",
            count: 1 } }
    ]);
    const result = statistic.map(item => 
        `User Name: ${item.username}, is Admin: ${item.isAdmin}, Count reservations: ${item.count}`
    );
    return result;
};

const updateReservations = async (userId: string | undefined, reservationsId: string, vehicleId: string, leaseStart: Date, leaseEnd: Date, status: string) => {
    await checkAdminId(userId);
    const start = new Date(leaseStart);
    const end = new Date(leaseEnd);
    const isFree = await getReservationsVehicleAvailable(vehicleId, start, end);
    if (!isFree) {
        throw new Error(VEHICLE_RESERVED_DATE);
    }
    return Reservations.findByIdAndUpdate(
        reservationsId,
        { $set: { vehicleId, leaseStart: start, leaseEnd: end, status } },
        { new: true }
    );
};

const cancelReservations = async (userId: string | undefined, reservationsId: string, status: string) => {
    const userRole = await isAdmin(userId);
    if (userRole === 'Admin') {
        return Reservations.findByIdAndUpdate(reservationsId, { $set: { status } }, { new: true });
    }
    if (userRole === 'User') {
        const reservations = await Reservations.findById(reservationsId);
        const ownerUser = reservations?.userId;
        if (ownerUser?.toString() !== userId) {
            throw new Error(FORBIDDEN_USER);
        }
        const leaseStartDate = reservations?.leaseStart as Date | undefined;
        const currentDate = new Date();
        if (!leaseStartDate || currentDate <= leaseStartDate) {
            return Reservations.findByIdAndUpdate(
                reservationsId,
                { $set: { status } },
                { new: true }
            );
        } else {
            throw new Error(CANCEL_DAY);
        }
    }
};

export {createReservations, createReservationsTG, getReservationsVehicleAvailable, showVehiclesAvaibleReservation, getStatisticComletedReservations, getStatisticUsers, getReservationsHistory, updateReservations, cancelReservations};