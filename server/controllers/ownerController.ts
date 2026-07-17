import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Resturant } from "../models/Resturant.js";
import { v2 as cloudinary } from 'cloudinary'
import { Booking } from "../models/Booking.js";


// Hlper function to upload buffer to cloudinary
const uploadToCloudinary = (fileBuffer: Buffer): Promise<{ secure_url: string }> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "QuickDine" }, (error,
            result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("Upload failed"));
            resolve({ secure_url: result.secure_url })
        })
        stream.end(fileBuffer)
    })
}


// Get owner's resturant
// Get /api/owner/resturant
export const getOwnerResturant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const resturant = await Resturant.findOne({ wner: req.user?._id })
        if (!resturant) {
            res.status(200).json(null);
            return;
        }
    } catch (error: any) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
}

// Create owner's resturant (submitted to pending)
// POST /api/owner/resturant
export const createOwnerResturant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const existing = await Resturant.findOne({ owner: req.user?._id })
        if (existing) {
            res.status(400).json({ message: "You already have a resturant registered" });
            return;
        }

        const { name, description, cuisine, priceRange, location, address, chef, tags, availableSlots, totalSeats } = req.body;

        if (!name || !description || !cuisine || !priceRange || !location || !address || !chef || !tags || !availableSlots || !totalSeats) {
            res.status(400).json({ message: "Please provide all required fields" })
            return;
        }

        //  Generate slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        const slugExists = await Resturant.findOne({ slug });
        if (slugExists) {
            res.status(400).json({ message: "A resturant with this name already exists" });
            return;
        }

        // Handle image
        let imageUrl = "";
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;

        }

        // Setup parsed tags and slots
        const parsedTags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()) :
            tags || [];
        const parsedSlots = typeof availableSlots === "string" ? availableSlots.split(",").
            map((s) => s.trim()) : availableSlots || ["17:00", "18:00", "19:00", "20:00", "21:00"];

        const resturant = await Resturant.create({
            name,
            slug,
            description,
            cuisine,
            priceRange,
            location,
            address,
            chef,
            image: imageUrl,
            tags: parsedTags,
            availableSlots: parsedSlots,
            totalSeats: totalSeats ? Number(totalSeats) : 20,
            owner: req.user?._id,
            status: "pending",

        })

        res.status(201).json(resturant);
    } catch (error: any) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
}
//Update owner's resturant
// PUT /api/owner/resturant
export const updateOwnerResturant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const resturant = await Resturant.findOne({ owner: req.user?._id })
        if (!resturant) {
            res.status(404).json({ message: "Resturant profile not found" });
            return;
        }

        const { name, description, cuisine, priceRange, location, address, chef, tags, availableSlots, totalSeats } = req.body;
        if (name) resturant.name = name;
        if (description) resturant.description = description;
        if (cuisine) resturant.cuisine = cuisine;
        if (priceRange) resturant.priceRange = priceRange;
        if (location) resturant.location = location;
        if (address) resturant.address = address;
        if (chef) resturant.chef = chef;
        if (totalSeats) resturant.totalSeats = (totalSeats);

        if (tags) {
            resturant.tags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags;
        }
        if (availableSlots) {
            resturant.availableSlots =
                typeof availableSlots === "string" ? availableSlots.split(",").map((s) => s.trim()) : availableSlots;
        }

        // Handle new image upload if any

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            resturant.image = result.secure_url;

        }

        const updated = await resturant.save();

        res.json(updated);

    } catch (error: any) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
}
//Get bookings for owner's resturant
// GET /api/owner/Bookings
export const getOwnerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const resturant = await Resturant.findOne({ owner: req.user?._id });

        if (!resturant) {
            res.status(404).json({ message: "Resturant profile not found" });
            return;
        }

        const bookings = await Booking.find({ resturant: resturant._id }).populate("user",
            "name email phone").sort({ date: -1, time: -1 })
        res.json(bookings);
    } catch (error: any) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
}
//Updaate status of a booking
// PUT /api/owner/Bookings/:id/status
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        if (!status || !["confirmed", "cancelled", "completed"].includes(status)) {
            res.status(400).json({ message: "Please enter a valid booking status" });
            return;
        }
        const booking = await Booking.findById(req.params.id)
        if (!booking) {
            res.status(404).json({ message: "Booking not found" });
            return;
        }

        // Verify booking belongs to the owner's resturant
        const resturant = await Resturant.findById(booking.resturant)
        if (!resturant || resturant.owner.toString() !== req.user?._id.toString()) {
            res.status(401).json({ message: "Not authorized to manage this booking" });
            return;
        }

        booking.status = status;
        await booking.save();
        res.json(booking);
    } catch (error: any) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
}