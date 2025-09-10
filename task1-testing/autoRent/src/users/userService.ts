import { User } from "./userModel";
import _default from "../utils";
const { checkAdminId, checkEmailExists, checkUserLicensExist } = _default;

const createUser = async ( username: string, email: string, password: string, isAdmin: boolean ) => {
    await checkEmailExists(email);
    return User.create({ username, email, password, isAdmin });
};

const createLicens = async (
    userId: string | undefined,
    numberLicens: string,
    dateRelease: string,
    dateValidity: string
) => {
    await checkUserLicensExist(userId);
    return User.updateOne(
        { _id: userId },
        { $push: { licens: numberLicens, dateRelease, dateValidity } }
    );
};

const getUser = async (userId: string | undefined, id: string) => {
    await checkAdminId(userId, id);
    return User.findOne({ _id: id });
};

const editUser = async (
    userId: string | undefined,
    id: string,
    email: string,
    numberLicens: number,
    dateRelease: string,
    dateValidity: string
) => {
    await checkAdminId(userId, id);
    return User.findOneAndUpdate(
        { _id: id },
        { $set: { email, licens: { numberLicens, dateRelease, dateValidity } } }
    );
};

const deleteUser = async (userId: string | undefined, id: string) => {
    await checkAdminId(userId);
    return User.findByIdAndDelete(id);
};

export { createUser, createLicens, getUser, editUser, deleteUser };
