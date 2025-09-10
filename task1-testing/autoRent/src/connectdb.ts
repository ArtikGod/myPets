import { config } from "dotenv";
import mongoose from "mongoose";
config();

const url = process.env.DB_CONNECTION_STRING || "";

const connectDb = async (): Promise<void> => {
	if (!url) {
		return;
	}
	await mongoose.connect(url);
};

export { mongoose, connectDb };
