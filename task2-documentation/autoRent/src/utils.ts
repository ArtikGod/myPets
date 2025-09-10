import { User } from "./users/userModel";
import { Vehicle } from "./vehicle/vehicleModel";
import {
    VEHICLE_NOT_EXIST, USER_NOT_EXIST, FORBIDDEN, EMAIL_EXIST, LICENS_EXIST,
} from "./constants"; 


const userExist = async (userId: string | undefined) => {
    const findUser = await User.findOne({ _id: userId });
    if (!findUser) {
        throw new Error(USER_NOT_EXIST);
    }
};

const isAdmin = async (userId: string | undefined) => {
    await userExist(userId);
    const user = await User.findOne({ _id: userId });    
    if (user?.isAdmin === true) {
        return "Admin"
    } else {
        return "User"
    }
  };

const checkAdminId = async (userId: string | undefined, id?: string) => {    
    await userExist(userId);
    const findAdmin = await User.findById({ _id: userId }) ;
    if (!findAdmin || !findAdmin.isAdmin && userId !== id) {
        throw new Error(FORBIDDEN);
    }
};

const checkEmailExists = async (email: string) => {
    if (!email || email.trim() === '') {
        throw new Error('Email is required');
    }
    const findEmail = await User.findOne({ email: email });
    if (findEmail) {
        throw new Error(EMAIL_EXIST);
    }
};

const checkUserLicensExist = async (userId: string | undefined) => {
    await userExist(userId);
    const findLicens = await User.findOne({ _id: userId });
    if (!findLicens || (findLicens.licens && findLicens.licens.length > 0)) {
        throw new Error(LICENS_EXIST);
    }
};

const vehicleExist = async (id: string | undefined) => {
    const findVehicle = await Vehicle.findOne({ _id: id });
    if (!findVehicle) {
        throw new Error(VEHICLE_NOT_EXIST);
    }
};

export default {
    userExist,
    isAdmin,
    checkAdminId,
    checkEmailExists,
    checkUserLicensExist,
    vehicleExist,
};
