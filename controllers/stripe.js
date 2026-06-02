
const e = require('express');
const stripe = require('stripe')('sk_test_51SywpmD3WmUONXe8dzCbibvTOzulwrepfsFyM6cHwVoB2RLIajgouJlbt3hRdLM1TVLuWqyc2HeLJcjltAWqjMhE00SyFlKGxh');
const express = require('express');
const prisma = require('../config/prisma');
const app = express();



exports.payment = async (req, res) => {
  try {

    //Code
    //Check User
    console.log('User ID check:', req.user.id); // Log the user ID to verify it's being received correctly


    const cart=await prisma.cart.findFirst({
      where:{
        orderedById:req.user.id  
      }
    });

    const amountTHB = cart.cartTotal*100; // Convert to satang (1 THB = 100 satang)

    const paymeantIntent = await stripe.paymentIntents.create({
      amount: amountTHB,
      currency: 'thb',
      automatic_payment_methods: {
        enabled: true,
      },

    });


    res.send({
      clientSecret: paymeantIntent.client_secret,
    });


    // const session = await stripe.checkout.sessions.create({
    //   line_items: [
    //     {
    //       // Provide the exact Price ID (for example, price_1234) of the product you want to sell
    //       price: '10000',
    //       quantity: 1,
    //     },
    //   ],
    //   mode: 'payment',
    //   success_url: `${YOUR_DOMAIN}?success=true`,
    // });

    // res.redirect(303, session.url);



  } catch (error) {


    res.status(500).json({ message: 'Server error during user listing' });
  }
};
