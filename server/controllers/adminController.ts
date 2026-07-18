
import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Resturant } from "../models/Resturant.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";

// Get all resturants for admin management
// Get /api/admin/resturants
export const getAllResturants = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const resturants = await Resturant.find({}).populate("owner", "name email phone").
            sort({ createdAt: -1 })
        res.json(resturants)
    } catch (error: any) {
        console.log(error)
        res.status(400).json({ message: error.message });
    }
}
// Approve/reject a resturant profile
// PUT /api/admin/resturants/:id/approve
export const approveResturant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        if (!status || !["approved", "rejected", "pending"].includes(status)) {
            res.status(400).json({ message: "Please provide a valid approval status" });
            return;
        }

        const resturant = await Resturant.findById(req.params.id);
        if (!resturant) {
            res.status(404).json({ message: "Resturant profile not found" });
            return;
        }

        resturant.status = status;
        await resturant.save();

        res.json(resturant);
    } catch (error: any) {
        console.log(error)
        res.status(400).json({ message: error.message });
    }
}
// Get system statistics
// PUT /api/admin/stats
export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
const totalUsers = await User.countDocuments({role:"user"});
const totalOwner = await User.countDocuments({role:"owner"});
const totalBookings = await Booking.countDocuments({});
const totalResturants = await Resturant.countDocuments({});

// Get latest 10 bookings
const latestBookings = await Booking.find({}).populate("user", "name email").
populate("resturant", "name").sort({createdAt: -1}).limit(10)

res.json({
    users:{
        totalUsers,
        totalOwner,
        total: totalUsers + totalOwner
    },
    resturants:{
        total: totalResturants,
    },
    bookings:{
        total: totalBookings
    }
})

    } catch (error: any) {
        console.log(error)
        res.status(400).json({ message: error.message });
    }
}