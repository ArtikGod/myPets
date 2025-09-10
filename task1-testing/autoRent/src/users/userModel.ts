import { mongoose } from "../connectdb";

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    licens: [{ numberLicens: Number, dateRelease: Date, dateValidity: Date }],
    isAdmin: {
        type: Boolean,
        default: false,
    },
});

const User = mongoose.model("User", UserSchema);

export { User };
