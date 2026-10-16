import express from 'express'
import dotenv from 'dotenv'
import helmet from 'helmet'
import connectDB from './config/db.js'

dotenv.config()

const app = express()

// db connection
connectDB()

// middleware
app.use(helmet())
app.use(express.json({limit: '10kb'}))

// 404
app.use((req,res)=>{
    res.status(404).json({success: false, message: 'router not found'})
})

// err handeler 500
app.use((err,req,res,next)=>{
    res.status(500).json({success: false, message: err.message})
})

const PORT = process.env.PORT || 3000

// server connection
app.listen(PORT, ()=>{
    console.log(` Server: http://localhost:${PORT}`)
})