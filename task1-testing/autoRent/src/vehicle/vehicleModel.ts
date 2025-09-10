import { mongoose } from "../connectdb";

const VehicleSchema = new mongoose.Schema({
    make: String,
    model: String,
    year: Number,
    price: Number,
    photo: String,
});

const Vehicle = mongoose.model("Vehicle", VehicleSchema);

export { Vehicle };
