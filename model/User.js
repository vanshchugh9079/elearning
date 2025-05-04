import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        url: {
            type: String,
            required: true,
            default: 'https://res.cloudinary.com/dmvchwbdp/image/upload/v1745818513/uploads/tgkv3r0bvp3a4hlolrhz.png'
        },
        public_id: {
            type: String,
            required: true,
            default: Date.now()
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin'] // optional: limit roles
    },
    subscription: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course' // refers to the Course model
        }
    ],
    token: {
        type: String,
    },
    tokenCreatedAt:{
        type: Date,
    },
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
})
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
}
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
}
userSchema.methods.genrateToken = function () {
    let payload = {
        id: this._id,
        email: this.email,
        name: this.name,
        role: this.role
    }
    this.token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: '10d' })
    return this.token;
}
const User = mongoose.model('User', userSchema);
export default User;
