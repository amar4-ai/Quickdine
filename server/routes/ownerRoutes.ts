import { Router } from "express";
import { createOwnerResturant, getOwnerBookings, getOwnerResturant, updateBookingStatus, updateOwnerResturant } from "../controllers/ownerController.js";
import upload from "../config/multer.js";
import { owneronly, protect } from "../middlewares/auth.js";


const ownerRouter = Router();

ownerRouter.use(protect)
ownerRouter.use(owneronly)

ownerRouter.get("/resturant", getOwnerResturant)
ownerRouter.post("/resturant", upload.single("image"), createOwnerResturant)
ownerRouter.put("/resturant", upload.single("image"), updateOwnerResturant)
ownerRouter.get("/bookings",  getOwnerBookings)
ownerRouter.put("/bookings/:id/status",  updateBookingStatus)

export default ownerRouter;