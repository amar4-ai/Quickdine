import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { User } from "../models/User.js";
import bcrypt from 'bcrypt'

// Helper to generate JWT token
const generateToken = (id: string)=>{
    return jwt.sign({id}, process.env.JWT_SECRET as string, {expiresIn: "30d"})
}
// Register a new user
// Post /api/auth/register
export const registerUser = async(req: Request, res: Response): Promise<void> =>{
 try {
    const {name, email, password, phone,role} = req.body;
    if(!name || !email || !password){
        res.status(400).json({message:"Please enter all required fields"})
        return ;
    }

    // check if user exits
    const userExists = await User.findOne({email})
    if(userExists){
        res.status(400).json({message:"User already exists"})
        return;
    }
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // create user
    const user = await User.create({
        name, 
        email,
        password:hashedPassword,
        phone,
        role,
    })

    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id.toString())
            
        })
    } else {
        res.status(400).json({message:"Invalid user data"});
    }
 } catch (error: any) {
console.log(error);
res.status(400).json({message: error.message});    
 }
}

// Authenticate a user & get Token
// Post /api/auth/login
export const loginUser = async(req: Request, res: Response): Promise<void> =>{
 try {
    
 } catch (error) {
    
 }
}

// Get user profile
// Post /api/auth/me
// @access Private
export const getMe = async(req: Request, res: Response): Promise<void> =>{
 try {
    
 } catch (error) {
    
 }
}