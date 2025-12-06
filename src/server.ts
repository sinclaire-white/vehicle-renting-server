import express, { Request, Response } from 'express'


const app = express();

// parser
app.use(express.json());

app.get('/', (req: Request, res: Response) =>{
    res.status(200).json({
        message: "Welcome to the Vehicle Server"
    })
})

app.listen(5000, ()=>{
    console.log("Server is running on port 5000");
})