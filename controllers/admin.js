const prisma = require('../config/prisma')


exports.changeOrderStatus = async (req, res) => {
    try {
      const { orderId, orderStatus } = req.body;
      console.log('Received order status change request:', { orderId, orderStatus });
      // Here you would typically update the order status in your database
      const orderUpdate=await prisma.order.update({
        where: { id: Number(orderId) },
        data: { orderStatus: orderStatus }
      });
      res.json(orderUpdate);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
}

exports.getOrderAdmin = async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        include:{
          products: {
            include: {
              product: true 
        }
      },
      orderedBy: {
        select: {
          id: true,
          name: true, 
          email: true,
          address: true
        }
      }
    }     
      });
      res.json(orders); 
    }
    catch (error) {
        console.log('Get Orders error', error);
        res.status(500).json({ message: 'Server error fetching orders' });  
    } 
  };



