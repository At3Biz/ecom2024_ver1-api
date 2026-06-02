const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { token } = require('morgan');


// const { use } = require('react');

exports.register = async (req, res) => {
    try {

        const { email, password } = req.body;
        if (!email || !password) { return res.status(400).json({ message: 'Email and password are required' }); }

        console.log('Attempting to find user with email:', email);
        const user = await prisma.user.findFirst({
            where: { email }
        });
        console.log('User found:', user);
        if (user) { return res.status(400).json({ message: 'User already exists with this email' }); }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });
        console.log('Registering user with email:', email);
        res.send(' Hello Register endpoint');
    } catch (error) {
        console.log('Register error', error);
        res.status(500).json({ message: 'Server error during registration' });

    }
};



exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;
        if (!email || !password) { return res.status(400).json({ message: 'Email and password are required' }); }
        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) { return res.status(400).json({ message: 'No user found with this email' }); }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(400).json({ message: 'Invalid password' }); }
        // Creat payload for JWT
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.SECRET || 'worawut_d5s', { expiresIn: '1d' }, (err, token) => {
            if (err) {
                console.log('JWT sign error', err);
                return res.status(500).json({ message: 'Error generating token' });
            }
            res.json({ payload, token });
        });


    } catch (error) {
        console.log('Login error', error);
        res.status(500).json({ message: 'Server error during login' });

    }
};

exports.currentUser = async (req, res) => {
    try {
        const user =await prisma.user.findFirst({
            where:{email:req.user.email},
            select:{
                id:true,
                email:true,
                name:true,
                role:true,
            }
        })
        res.json(user);
    }
    catch (error) {
        console.log('Current User error', error);
        res.status(500).json({ message: 'Server error fetching current user' });
    }
};


// exports.currentAdmin = async (req, res) => {
//     try {
//         res.send(' Hello Current Admin endpoint');
//     }
//     catch (error) {
//         console.log('Current Admin error', error);
//         res.status(500).json({ message: 'Server error fetching current admin' });
//     }
// };

