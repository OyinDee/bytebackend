const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../config/nodemailer');
const admin = require('../firebaseAdmin'); // Import Firebase admin

// Generate a 5-digit code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (request, response) => {
    const { username, email, password, phoneNumber } = request.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();

        // Create new user with the verification code
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            verificationCode, 
        });

        
        await sendEmail(email, 'Verify your email and start to byte!', `Ofc, not literally, haha.\nHere you go: ${verificationCode}.`);

        response.status(201).json({ message: 'Registration successful!' });
    } catch (error) {
        console.error(error.message);

        if (error.name === 'SequelizeUniqueConstraintError') {
            // Check if it's a unique constraint error
            const field = error.errors[0].path; // This gives you the field that caused the error (e.g., 'email' or 'username')
            response.status(400).json({ message: `${field} already exists` });
        } else {
            // Handle other types of errors
            response.status(500).json({ message: email.message });
        }
    }
};


// Login user
exports.login = async (request, response) => {
    const { username, password } = request.body;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return response.status(401).json({ message: 'Invalid username, you sure you wont have to signup?' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response.status(401).json({ message: 'Invalid password, chief!' });
        }

        // Check if email is verified
        if (user.isVerified == false) {
            // Generate new verification code
            const newVerificationCode = generateVerificationCode();

            // Update user record with the new verification code
            user.verificationCode = newVerificationCode;
            await user.save();

            // Send verification email with the new 5-digit code
            await sendEmail(user.email, 'Verify your email and start to byte!', `Here's your new code: ${newVerificationCode}.`);

            return response.status(200).json({
                message: 'Login successful, but email verification is pending. A new verification code has been sent to your email.',
                isVerified: false,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                }
            });
        }

        // Generate JWT token for verified users
        const token = jwt.sign({ user: user }, process.env.JWT_SECRET, { expiresIn: '48h' });

        response.status(202).json({
            message: 'Login successful!',
            token,
            isVerified: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
            }
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Internal server error' });
    }
};

// Verify email using verification code
exports.verifyEmail = async (request, response) => {
    const { code } = request.query;

    try {
        // Find user by verification code
        const user = await User.findOne({ where: { verificationCode: code } });
        if (!user) {
            return response.status(404).json({ message: 'Invalid or expired verification code' });
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationCode = null; // Clear the verification code
        await user.save();

        response.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        response.status(400).json({ message: 'Invalid or expired verification code' });
    }
};



// Verify phone number using Firebase
exports.verifyPhoneNumber = async (request, response) => {
    const { verificationId, verificationCode } = request.body;

    try {
        // Verify the code using Firebase
        const credential = admin.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
        const result = await admin.auth().signInWithCredential(credential);

        // Optionally, find the user based on the phone number and update the record
        const user = await User.findOne({ where: { phoneNumber: result.user.phoneNumber } });
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }

        user.phoneVerified = true;
        await user.save();

        response.json({ message: 'Phone number verified successfully' });
    } catch (error) {
        console.error(error);
        response.status(400).json({ message: 'Phone number verification failed' });
    }
};

exports.forgotPassword = async (request, response) => {
    const { email } = request.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return response.status(404).json({ message: 'No account with that email found' });
        }

        const resetCode = generateVerificationCode();

        // Save the reset code with the user
        user.resetCode = resetCode;
        user.resetCodeExpires = Date.now() + 3600000; // Code expires in 1 hour
        await user.save();

        // Send email with reset code
        await sendEmail(email, 'Password Reset Code', `Here is your password reset code: ${resetCode}`);

        response.status(200).json({ message: 'Password reset code sent to your email' });
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Internal server error' });
    }
};

exports.resetPassword = async (request, response) => {
    const { email, resetCode, newPassword } = request.body;

    try {
        const user = await User.findOne({ where: { email, resetCode } });

        if (!user) {
            return response.status(404).json({ message: 'Invalid email or reset code' });
        }

        // Check if reset code is expired
        if (Date.now() > user.resetCodeExpires) {
            return response.status(400).json({ message: 'Reset code has expired' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password and clear the reset code and its expiration
        user.password = hashedPassword;
        user.resetCode = null;
        user.resetCodeExpires = null;
        await user.save();

        response.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Internal server error' });
    }
};
