import { Request, Response } from "express";
import { authService } from "./auth.service";


const signUpController = async (req: Request, res:Response) => {
    try{
        const {name, email, password, phone, role} = req.body;

        if(!name || !email || !password || !phone ){
            return res.status(400).json({
                success: false,
                error: "All fields are required",
            })
        }
        const result = await authService.signUp(name, email, password, phone, role);

        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            data: result.rows[0],
        });

    }catch(error: any){
        res.status(400).json({
            succsess: false,
            message: error.message,
        })
    }
}

const signInController = async (req:Request, res: Response)=>{
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success: false,
                error: "Email and password are required",
            });
        }
        const result = await authService.signIn(email, password);
        res.status(200).json({
            success: true,
            message: "Sign-in successful",
            data: result,
        });
    }catch(error: any){
        res.status(400).json({
            succsess: false,
            message: error.message,
        })
    }
}

export const authController = {
    signUpController,
    signInController
}
