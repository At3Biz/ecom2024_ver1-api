
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// exports.authCheck = async (req, res, next) => {
//   try {
//     const headerToken = req.headers.authorization;

//     if (!headerToken) {
//       return res.status(401).json({ message: 'No token provided, authorization denied.' });
//     }

//     const token = headerToken.split(' ')[1]; // Assuming Bearer token format
//     const decoded = jwt.verify(token, process.env.SECRET);
//     console.log('Auth Check - decoded:', decoded); // Debugging log       
//     req.user = decoded;

//     const user = await prisma.user.findFirst({
//       where: {
//         email: req.user.email
//       }
//     });
//     if (!user.enabled) {
//       return res.status(404).json({ message: 'User not enabled.' });
//     }

//     next();



//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error during authentication check.' });
//   }
// };

exports.authCheck = async (req, res, next) => {
    try {
        //code
        const headerToken = req.headers.authorization        
        if (!headerToken) {
            return res.status(401).json({ message: "No Token, Authorization" })
        }
        const token = headerToken.split(" ")[1]
        const decode = jwt.verify(token, process.env.SECRET)
        req.user = decode

        const user = await prisma.user.findFirst({
            where: {
                email: req.user.email
            }
        })

                console.log("authCheck userID", user.id)
        if (!user.enabled) {
            return res.status(400).json({ message: 'This account cannot access' })
        }

        next()
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Token Invalid' })
    }
}


exports.adminCheck = async (req, res, next) => {
  try {

    const { email } = req.user;
    const adminUser = await prisma.user.findFirst({
      where: {
        email: email
      }
    });

    console.log('Admin Check - user role:', adminUser.role); // Debugging log
    if (adminUser.role !== 'admin') {
      console.log('Admin Check - access denied for user:', email); // Debugging log
      return res.status(403).json({ message: 'Access denied, admin only.' });

    } else {
      next();
    }

  } catch (error) {
    res.status(500).json({ message: 'Internal server error during admin check.' });

  }
};  
