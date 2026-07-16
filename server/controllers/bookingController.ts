
import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Resturant } from "../models/Resturant.js";
import { Booking } from "../models/Booking.js";

// Create a new booking
// POST /api/bookings
// @access Private
export const createBooking = async(req: AuthRequest, res:Response): Promise<void>=>{
    try {
        const {resturantId, date, time, guests, occasion, specialRequests} = req.body;


        if(!resturantId || !date || !time || !guests){
            res.status(499).json({message:"Please provide all required reservation details"});
            return;
        }

        // Check if resturant exists
        const resturant = await Resturant.findById(resturantId)
        if(!resturant){
            res.status(404).json({message: "Resturant not found"});
            return;
        }

        // Verify resturant is approved
        if(resturant.status !== "approved"){
            res.status(400).json({message:"Reservation are not open fot this resturant yet"});
            return;
        }

        // Verify seat availability
        const requestedGuests = Number(guests);

        const existingBookings = await Booking.find({
            resturant: resturantId,
            date: new Date(date),
            time,
            status:"confirmed",
        })

        const bookedSeats = existingBookings.reduce((sum,b)=> sum + b.guests, 0)

        const totalSeats = resturant.totalSeats || 20;
        const availableSeats = totalSeats - bookedSeats;

        if(requestedGuests > availableSeats){
            res.status(400).json({
                message:`Unable to reserve. Only ${availableSeats} seats are available for this time slot.`,
            })
        }

        const booking = await Booking.create({
            user: req.user?._id,
            resturant: resturantId,
            date: new Date(date),
            time,
            guests: Number(guests),
            occasion,
            specialRequests,
            status: "confirmed",

        })

        // Populate resturant info before returning
        const populatedBooking = await booking.populate("resturant", "name location image address");

        res.status(201).json(populatedBooking);
    } catch (error:any) {
        console.log(error)
        res.status(400).json({message: error.message});
    }
}

// Get logged inuser bookings
// POST /api/bookings/my
// @access Private
export const getMyBookings = async(req: AuthRequest, res:Response): Promise<void>=>{
    try {
        const bookings = await Booking.find({user: req.user?._id}).populate("resturant", "name location image address slug").sort({date: -1, time:-1})

        res.json(bookings);
    } catch (error:any) {
        console.log(error)
        res.status(400).json({message: error.message});
    }
}

// Cancel a booking
// PUT /api/bookings/:id/cancel
// @access Private
export const cancelBooking = async(req: AuthRequest, res:Response): Promise<void>=>{
    try {
        const booking = await Booking.findById(req.params.id);
        
        if(!booking){

            res.status(404).json({message: "Booking not found"});
            return;
        }

        // Verify user owns the booking
        if(booking.user.toString() !==  req.user?._id.toString()){
            res.status(401).json({message: "Not authorized to cancel this booking"});
            return;
        }

        booking.status = "cancelled";
        await booking.save();

        const populatedBooking = await booking.populate("resturant","name location image address")
        res.json(populatedBooking);
    } catch (error:any) {
        console.log(error)
        res.status(400).json({message: error.message});
    }
}