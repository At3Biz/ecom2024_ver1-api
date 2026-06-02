
const e = require('express');
const prisma = require('../config/prisma')
exports.listUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                address: true,
                updatedAt: true,
                enabled: true

            }
        });
        console.log('List Users - retrieved users:', req.user); // Debugging log
        res.json(users);
    } catch (error) {

        console.log('List Users error', error);
        res.status(500).json({ message: 'Server error during user listing' });
    }
};

exports.changeStatus = async (req, res) => {

    try {
        const { id, enable } = req.body;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { enabled: enable }
        });
        res.send('Update status successful');
    } catch (error) {
        console.log('Change Status error', error);
        res.status(500).json({ message: 'Server error during status change' });
    }
};

exports.changeRole = async (req, res) => {
    try {
        const { id, role } = req.body;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { role }
        });
        res.send('Update role successful');
    } catch (error) {
        console.log('Change Role error', error);
        res.status(500).json({ message: 'Server error during role change' });
    }
};

exports.userCart = async (req, res) => {
    try {
        const { cart } = req.body;
        console.log('User Cart - received cart data:', cart); // Debugging log
        console.log('User Cart - user info from authCheck:', String(req.user.id));
        const user = await prisma.user.findFirst({
            where: {
                id: req.user.id
            }
        });
       // console.log('User Cart - found user:', user); // Debugging log

        // check quantity
        for (const item of cart) {
            const product = await prisma.product.findUnique({
                where: { id: item.id },
                select: { quantity: true, title: true }
            });
            // console.log(item)
            // console.log(product)
            if (!product || item.count > product.quantity) {
                return res.status(400).json({ 
                    ok: false,
                    message: `ขออภัย ${product.title} มีสินค้าในคลังไม่เพียงพอ` });
            }

            console.log(`Checking product ${product.title} - available quantity: ${product.quantity}, requested quantity: ${item.count}`); // Debugging log
        }




        //Delete old cart items
        await prisma.productOnCart.deleteMany({
            where: {
                cart: { orderedById: user.id }
            }
        });

        //Delete old cart
        await prisma.cart.deleteMany({
            where: {
                orderedById: user.id
            }
        });

        //เตีรยมข้อมูลสำหรับสร้าง cart และ productOnCart
        let products = cart.map((item) => {
            return {
                productId: item.id,
                count: item.count,
                price: item.price
            }
        });
        console.log('User Cart - prepared products for cart creation:', products); // Debugging log

        //หาผลรวม
        let cartTotal = products.reduce((sum, item) => sum + item.price * item.count, 0);
        console.log('User Cart - calculated cart total:', cartTotal); // Debugging log

        //สร้าง cart
        const newCart = await prisma.cart.create({
            data: {
                products: {
                    create: products
                },
                cartTotal: cartTotal,
                orderedById: user.id
            }
        });
        console.log('User Cart - created new cart:', newCart); // Debugging log


        res.send('User cart received successfully');


    }
    catch (error) {
        console.log('User Cart error', error);
        res.status(500).json({ message: 'Server error during user cart operation' });
    }
}

exports.getUserCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: {
                orderedById: req.user.id
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });
        console.log('Get User Cart - user info from authCheck:', req.user.id); // Debugging log
        console.log('Get User Cart - retrieved cart:', cart); // Debugging log

        res.json({
            products: cart ? cart.products : [],
            cartTotal: cart ? cart.cartTotal : 0
        });
    }
    catch (error) {
        console.log('Get User Cart error', error);
        res.status(500).json({ message: 'Server error during get user cart operation' });
    }
};




// exports.userCart = async (req, res) => {
//     try {
//         const { cart } = req.body;
//         //console.log('User Cart - received cart data:', cart); // Debugging log
//         //console.log('User Cart - user info from authCheck:', req.user); // Debugging log
//         const user = await prisma.user.findFirst({
//             where: {
//                 id: req.user.id
//             }
//         });
//        // console.log('User Cart - found user:', user); // Debugging log

//         // //Delete old cart
//         // await prisma.productOnCart.deleteMany({
//         //     where: { orderedById: user.id }
//         // });

//         // await prisma.cart.deleteMany({
//         //     where: { orderedById: user.id }
//         // });


//         //เตีรยมข้อมูลสำหรับสร้าง cart และ productOnCart
//         let products = cart.map((item) => {
//             return {
//                 productId: item.id,
//                 count: item.count,
//                 price: item.price
//             }
//         });
// console.log('User Cart - prepared products for cart creation:', products); // Debugging log

//         let cartTotal = products.reduce((sum, item) => sum + item.price * item.count, 0);
//         console.log('User Cart - calculated cart total:', cartTotal); // Debugging log

//         //สร้าง cart
//         const newCart = await prisma.cart.create({
//             data: { 
//                 products: {
//                     create:products
//                 },
//                 cartTotal: cartTotal,  
//                  orderedById: user.id 
//                 }
//         });


//         console.log('User Cart - created new cart:', newCart); // Debugging log 




//         res.send('User cart received successfully');



//     }
//     catch (error) {
//         console.log('User Cart error', error);
//         res.status(500).json({ message: 'Server error during user cart operation' });
//     }
// };




// exports.emptyCart = async (req, res) => {
//     try {
//         const cart = await prisma.cart.findFirst({
//             where: {
//                 orderedById: req.user.id    
//             }
//         });

//         console.log('Empty User Cart - found cart:', cart); // Debugging log
//         console.log('Empty User Cart - user info from authCheck:', req.user.id); // Debugging log


//         if(!cart) {
//             return res.status(404).json({ message: 'Cart not found for user.' });
//         }   

//         if (cart) {
//             await prisma.productOnCart.deleteMany({
//                 where: { cartId: cart.id }          
//             });

//             console.log("Empty User Cart - user ID:", req.user.id); // Debugging log

//           const result=  await prisma.cart.createMany({
//                 where: { orderedById: Number(req.user.id) }
//             });
//         }   

//         console.log('Empty User Cart - cart emptied successfully'); // Debugging log

//         res.json({ 
//             message: 'User cart emptied successfully',
//             DeleteCount: result ? result.count : 0
//          });
//     }
//     catch (error) {
//         console.log('Empty User Cart error', error);
//         res.status(500).json({ message: 'Server error during empty user cart operation' });
//     }
// };


exports.emptyCart = async (req, res) => {
    try {
        //code
        console.log("User ID check:", req.user.id);
        const cart = await prisma.cart.findFirst({
            where: { orderedById: Number(req.user.id) },
        });
        if (!cart) {
            return res.status(400).json({ message: "No cart" });
        }
        await prisma.productOnCart.deleteMany({
            where: { cartId: cart.id },
        });
        const result = await prisma.cart.deleteMany({
            where: { orderedById: Number(req.user.id) },
        });

        console.log(result);
        res.json({
            message: "Cart Empty Success",
            deletedCount: result.count,
        });


    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.saveAddress = async (req, res) => {
    try {
        //code
        const { address } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { address }
        });
        console.log('Save Address - updated user address:', address); // Debugging log
        res.send(' Hello Save Address endpoint');
    }
    catch (error) {
        console.log('Save Address error', error);
        res.status(500).json({ message: 'Server error during save address operation' });
    }
};

exports.saveOrder = async (req, res) => {
    try {

        const { id, amount, status, currency } = req.body.paymentIntent;

        //code
        const userCart = await prisma.cart.findFirst({
            where: {
                orderedById: Number(req.user.id)
            },
            include: { products: true }
        });
        if (!userCart || userCart.products.length === 0) {
            return res.status(400).json({ message: 'No cart found for user.' });
        }

        // check quantity
        // for (const item of userCart.products) {
        //     const product = await prisma.product.findUnique({
        //         where: { id: item.productId },
        //         select: { quantity: true, title: true }
        //     });
        //     console.log(item)
        //     console.log(product)
        //     if (!product || item.count > product.quantity) {
        //         return res.status(400).json({ message: `Product with ID ${item.productId} not found or insufficient quantity.` });
        //     }

        //     console.log(`Checking product ${product.title} - available quantity: ${product.quantity}, requested quantity: ${item.count}`); // Debugging log
        // }

        // create order
        const amountTHB = Number(amount) / 100; // Convert to cents

        const order = await prisma.order.create({
            data: {
                products: {
                    create: userCart.products.map(item => ({
                        productId: item.productId,
                        count: item.count,
                        price: item.price
                    }))
                },
                orderedBy: {
                    connect: { id: req.user.id }
                },
                cartTotal: userCart.cartTotal,
                stripePaymentId: id, // Placeholder for Stripe payment ID
                amount: amountTHB,
                status: status,
                currentcy: currency
            }
        });


        //   stripePaymentId String
        //   amount          Int
        //   status          String
        //   currency        String

        // update product quantity
        const update = userCart.products.map((item) => ({
            where: { id: item.productId },
            data: {
                quantity: { decrement: item.count },
                sold: { increment: item.count }
            }
        }))

        console.log('Update product quantity operations:', update); // Debugging log

        await Promise.all(update.map(u => prisma.product.update(u)));
        await prisma.cart.deleteMany({
            where: { orderedById: Number(req.user.id) }
        });
        res.json({ message: 'Order saved successfully', orderId: order.id });


    }
    catch (error) {
        console.log('Save Order error', error);
        res.status(500).json({ message: 'Server error during save order operation' });
    }
};


exports.getOrder = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { orderedById: Number(req.user.id) },
            include: {
                products: {
                    include: { product: true, },
                },
            },


        });
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for user.' });
        }

        console.log(orders)
        res.json({ orders });

    }
    catch (error) {
        console.log('Get Orders error', error);
        res.status(500).json({ message: 'Server error during get orders operation' });
    }
};

exports.getOrder2 = async (req, res) => {
    try {
        //code
        const orders = await prisma.order.findMany({
            where: { orderedById: Number(req.user.id) },
            include: {
                products: {
                    include: { product: true, },
                },
            },

        });
        if (orders.length === 0) {
            return res.status(400).json({ ok: false, message: "No orders" });
        }
        console.log(orders)
        res.json({ ok: true, orders });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};


exports.address = async (req, res) => {
    try {
        res.send(' Hello User Address endpoint');
    }
    catch (error) {
        console.log('User Address error', error);
        res.status(500).json({ message: 'Server error during user address operation' });
    }
};

exports.order = async (req, res) => {
    try {
        res.send(' Hello User Order endpoint');
    }
    catch (error) {
        console.log('User Order error', error);
        res.status(500).json({ message: 'Server error during user order operation' });
    }
};
exports.orders = async (req, res) => {
    try {
        res.send(' Hello User Orders endpoint');
    }
    catch (error) {
        console.log('User Orders error', error);
        res.status(500).json({ message: 'Server error during user orders operation' });
    }
};




