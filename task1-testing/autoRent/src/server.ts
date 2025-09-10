require("dotenv").config({ path: "./.env" });
import { app } from "./app";
import { connectDb } from "./connectdb";
const PORT = process.env.PORT || 3200;

(async () => {
	await connectDb();
	app.listen(PORT, () => {
		console.log(`App listening on port ${PORT}`);
	});
})();
