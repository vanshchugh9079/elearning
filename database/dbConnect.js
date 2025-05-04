import mongoose from "mongoose";
let connect=async()=>{    
    try{
        await mongoose.connect(process.env.URI);
        console.log("database connected succesfully")
    }
    catch(err){
        console.log("databse connection failed");
        console.log(err)
    }
}

export default connect