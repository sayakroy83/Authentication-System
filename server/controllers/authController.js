import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from '../config/emailTemplates.js';

export const register = async(req, res)=>{
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({sucess: false, message: "missing required details"})
    }

    try{
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.status(400).json({success: false, message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            email,
            password: hashedPassword
        });
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxage: 7 * 24 * 60 * 60 * 1000 //7 days
        });

        // Sending welcome email logic
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to this site',
            //text: `Welcome to the site. your account has been created with email id: ${email}`
            html: WELCOME_EMAIL_TEMPLATE.replace('{email}', user.email)
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({success: true, message: "Registration Successfull"})

    } catch(error){
        return res.status(500).json({success: false, message: error.message})
    }
}

export const login = async(req, res)=> {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({sucess: false, message: "email or password is required"})
    }

    try{
        const user = await userModel.findOne({email});

        if(!user){
            return res.status(400).json({sucess: false, message: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({success: false, message: "Invalid password"});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxage: 7 * 24 * 60 * 60 * 1000 //7 days
        });

        return res.status(200).json({success: true, message: "Login Successfull"})

    }catch(error){
        return res.status(500).json({success: false, message: error.message});
    }
}

export const logout = async(req, res)=> {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.status(200).json({success: true, messsage: "Logged Out"});
    }catch(error){
        return res.status(500).json({success: false, message: error.message});
    }
}

// Function to send OTP for email verification
export const sendVerifyOtp = async(req, res)=>{
    try{
        const userId = req.userId;
        const user = await userModel.findById(userId);

        if(user.isVerified){
            return res.status(400).json({success: false, message: "User already verified"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a 6-digit OTP

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // OTP valid for 10 minutes

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify your account',
            //text: `Your verification OTP is: ${otp}. Verify your Account with this OTP.`,
            html: EMAIL_VERIFY_TEMPLATE.replace('{{email}}', user.email).replace('{{otp}}', otp)
        }

        await transporter.sendMail(mailOptions);
        return res.status(200).json({success: true, message: "OTP sent to your email"});
        
    }catch(error){
        return res.status(500).json({success: false, message: error.message});
    }
}

// Function to verify the OTP sent to the user's email
export const verifyEmail = async(req, res)=> {
    const userId = req.userId;
    const {otp} = req.body;

    if(!userId || !otp){
        return res.status(400).json({success: false, message: "User ID or OTP is required"});
    }

    try{
        const user = await userModel.findById(userId);
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        if(user.verifyOtp === '' || user.verifyOtp != otp){
            return res.status(400).json({success: false, message: "Invalid OTP"});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.status(400).json({success: false, message: "OTP expired"});
        }

        user.isVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        return res.status(200).json({success: true, message: "Email verified successfully"});
    }catch(error){
        return res.status(500).json({success: false, message: error.message});
    }
}

// Function to check if the user is authenticated
export const isAuthenticated = async(req, res)=> {
    try{
        return res.status(200).json({success: true, message: "User is authenticated"});
    }catch(error){
        return res.status(500).json({sucess: false, message: error.message});
    }
}

// Function to reset password otp
export const sendResetOtp = async(req, res)=> {
    const {email} = req.body;

    if(!email){
        return res.status(400).json({success: false, message: "Email is required"});
    }

    try{
        const user = await userModel.findOne({email});

        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a 6-digit OTP

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Reset your password',
            //text: `Your reset password OTP is: ${otp}. Use this OTP to reset your password.`
            html: PASSWORD_RESET_TEMPLATE.replace('{{email}}', user.email).replace('{{otp}}', otp)
        }

        await transporter.sendMail(mailOptions);
        return res.status(200).json({success: true, message: "OTP sent to your email"});

    }catch(error){
        return res.status(500).json({success: false, message: error.message});
    }
}

// Function to reset the password using the OTP
export const resetPassword = async(req, res)=> {
    const {email, otp, password} = req.body;

    if(!email || !otp || !password){
        return res.status(400).json({success: false, message: "Email, OTP and Password are required"});
    }

    try{
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        if(user.resetOtp === '' || user.resetOtp != otp){
            return res.status(400).json({success: false, message: "Invalid OTP"});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.status(400).json({success: false, message: "OTP expired"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();
        return res.status(200).json({success: true, message: "Password reset successfully"});
    }catch(error){
        return res.status(500).json({success: false, message: error.message});
    }
}