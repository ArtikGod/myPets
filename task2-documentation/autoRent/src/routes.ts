import userRoutes from "./users/userRoutes";
import vehicleRoutes from "./vehicle/vehicleRoutes";
import reservationRoutes from "./reservations/reservationsRoutes";

const routes = {
    user: userRoutes,
    vehicle: vehicleRoutes,
    reservation: reservationRoutes,
};

export default { routes };
