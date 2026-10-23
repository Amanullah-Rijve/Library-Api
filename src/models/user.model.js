import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            trim: true,
            required: [true, 'name required']
        },
        email:{
            type: String,
            trim: true,
            required: [true, 'email  required'],
            unique: true,
            lowercase: true
        },
        password:{
            type: String,
            required: [true, 'password required'],
            trim: true,
            select: false,
            minLength: 6,
        },
        role:{
            type: String,
            enum: ['user','admin'],
            default: 'user'
        },
    },
    {
        timestamps: true
    },
)
// hashed password
    userSchema.pre('save',async function(){
        
            if(!this.isModified('password')){
                return ;
            }
            const hashed = await bcrypt.hash(this.password,10)
            this.password = hashed
    })
    // compare password
    userSchema.methods.comparePassword = async function(candidatePass){
        return await bcrypt.compare(candidatePass,this.password)
    }

const User = mongoose.model('User',userSchema)

export default User