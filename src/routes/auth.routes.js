import {Router} from 'express'
import jwt from 'jsonwebtoken'
import {body,validationResult} from 'express-validator'
import rateLimit from 'express-rate-limit'
import User from '../models/user.model.js'
import {protect} from '../middleware/auth.middleware.js'


const router = Router()

// token
const generateToken = (userId)=>{
    return jwt.sign(
        {id: userId},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    )
}
        // signup limiting
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message:{
        message: 'try again after 1 hr'
    },
    standardHeaders: true,
    legacyHeaders: false
}) 
// login limiting
            const loginLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 5,
            message:{
                message: 'try again after 15 mints'
            },
            standardHeaders: true,
            legacyHeaders: false
})

//  signup router
router.post('/signup', signupLimiter,
    [
    body('name').notEmpty().withMessage('name reuired'),
    body('email').isEmail().withMessage('give correct email'),
    body('password').isLength({min:6}).withMessage('minimum password 6 required')
    ],
    async(req,res,next)=>{
    try {

    const errors = validationResult(req)
    // validation
    if(!errors.isEmpty()){
    return res.status(400).json({ success: false, errors: errors.array() });
}
    
    const {name,email,password} = req.body

    const isUserExsist = await User.findOne({email})

    if(isUserExsist){
    return res.status(401).json({success: false, message: 'user exsists'})
    }

    const user = await User.create({name,email,password})
    const token = generateToken(user.id)
    // success response
    res.status(201).json({
        success: true,
        message: 'user created',
        token: token,
        user:{
            id: user.id,
            email: user.email,
            name: user.name
        }
    })
    } catch (error) {
        next(error)
    }
})

    //  login router
    router.post('/login',loginLimiter,
        [
        body('email').isEmail().withMessage('give correct email'),
        body('password').notEmpty().withMessage("give correct password")
        ],
        async(req,res,next)=>{
        try {
            
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({success: false, errors: errors.array()})
        }

        const {email,password} = req.body

        const isUser = await User.findOne({email}).select('+password')
        // validation
        if(!isUser){
        return res.status(401).json({success: false,message: 'invalid email or password'})
        }
      // match password
        const isMatched = await isUser.comparePassword(password)
        // password validation
        if(!isMatched){
            return res.status(401).json({success: false,message: 'invalid email or password'})
        }
        // token
        const token = generateToken(isUser.id)

        // Login success response
        res.status(200).json({
            success: true,
            message: 'login successful',
            token: token,
            user:{
                id: isUser.id,
                email: isUser.email
            }
        })
        } catch (error) {
            next(error)
        }
    })

    // get profile
    router.get('/profile',protect,async(req,res)=>{
        res.status(200).json({
            success: true,
            user:{
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        })
    })

export default router


