import { Request, Response } from "express";



//Get all resturants with search and filters
// Get /api/ resturants
export const getResturants = async(req:Request, res: Response): Promise<void>=>{
    try {
        
    } catch (error:any) {
        console.error(error)
        res.status(400).json({message: error.message})
    }
}

//Get featured and exclusive resturants
// Get /api/resturants/featured
export const getFeaturedResturants = async(req:Request, res: Response): Promise<void>=>{
    try {
        
    } catch (error:any) {
        console.error(error)
        res.status(400).json({message: error.message})
    }
}

//Get single resturant by slug
// Get /api/resturants/:slug
export const getResturantBySlug = async(req:Request, res: Response): Promise<void>=>{
    try {
        
    } catch (error:any) {
        console.error(error)
        res.status(400).json({message: error.message})
    }
}