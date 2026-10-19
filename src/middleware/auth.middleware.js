import jwt  from "jsonwebtoken";
import User  from '../models/user.model.js'


export const protect = async (req,res,next)=>{
    try {
        const authHeader = req.headers.authorization
        // check header
        if(!authHeader){
            return res.status(401).json({success: false, message:'Unauthorized user'})
        }
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)

        if(!user){
            return res.status(401).json({success: false, message:'user not found'})
        }
        req.user = user 
        next()
    } catch (error) {
        next(error)
    }
}



