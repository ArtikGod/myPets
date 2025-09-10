import { mongoose } from "../connectdb";
import { RESERVATIONS_STATUS, RESERVATIONS_PRICE } from "../constants";

const ReservationsSchema = new mongoose.Schema({
    vehicleId: { type: 'ObjectId', ref: 'Vehicle' },
    userId: { type: 'ObjectId', ref: 'User' },
    leaseStart: Date,
    leaseEnd: Date,
    price: {
        type: Number,
        default: RESERVATIONS_PRICE.TG
        },
    status: {
        type: String,
        default: RESERVATIONS_STATUS.DONE,
    },
    userTgId: {
        type: Number,
        default: undefined,
    }
});

const Reservations = mongoose.model("Reservations", ReservationsSchema);

export { Reservations };