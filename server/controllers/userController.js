import userModel from "../models/userModel.js";

export const getUserData = async(req, res)=> {
    try{

        const userId = req.userId; 

        const user = await userModel.findById(userId);

        if(!user){
            return res.status(404).json({success: false, message: "user not found"});
        }

        res.json({
            success: true,
            getUserData: {
                name: user.name,
                isVerified: user.isVerified,
            }
        })

        

    }catch(error){
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}