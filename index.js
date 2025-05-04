import app from "./app.js"
import dbConnect from "./database/dbConnect.js"
import dotenv from "dotenv"
dotenv.config();
app.listen(process.env.PORT || 5000,async()=>{
    await dbConnect();
    console.log("server is running on port 3000")
})