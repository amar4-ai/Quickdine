import { Router } from "express";
import { approveResturant, getAdminStats, getAllResturants } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middlewares/auth.js";


const adminRouter = Router();

adminRouter.use(protect)
adminRouter.use(adminOnly)

adminRouter.get("/resturants", getAllResturants)
adminRouter.put("/resturants/:id/approve", approveResturant)
adminRouter.get("/stats", getAdminStats)

export default adminRouter;