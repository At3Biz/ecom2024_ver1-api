const prisma = require('../config/prisma')
const cloudinary = require('cloudinary').v2;

exports.create = async (req, res) => {
    try {
        const { title, description, price, quantity, categoryId, images } = req.body;
        // Validate required fields
        console.log("req.body xxx:", req.body);
        console.log("Images xxxx:", images);
        const product = await prisma.product.create({
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseInt(categoryId),

                images: {
                    create: images.map(item => ({

                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url,


                    })) // Assuming images is an array of URLs


                } 


            }
        });
        res.status(201).json(product);
    } catch (error) {
        console.log('Create Product error', error);
        res.status(500).json({ message: 'Server error during product creation' });
    }
};




exports.list = async (req, res) => {
    try {
        const { count } = req.params;
        console.log('Count parameter:', count);
        const products = await prisma.product.findMany({
            take: parseInt(count) || 10, // Default to 10 if count is not provided or invalid
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                category: true,
                images: true
            }
        });
        res.json(products);

    } catch (error) {
        console.log('List Product error', error);
        res.status(500).json({ message: 'Server error during product listing' });
    }
};


exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, quantity, categoryId, images } = req.body;



        await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseInt(categoryId),
                images: images && images.length > 0 ? {
                    deleteMany: {}, // Remove existing images
                    create: images.map(item => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url,
                    }))
                } : undefined
            }
        });
        res.send("Product updated successfully");
    } catch (error) {
        console.log('Update Product error', error);
        res.status(500).json({ message: 'Server error during product update' });
    }
};



exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        res.send("Product removed successfully");
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
}


exports.listby = async (req, res) => {
    try {
        const { sort, order, limit } = req.body;
        const products = await prisma.product.findMany({
            take: parseInt(limit) || 10,
            orderBy: {
                [sort]: order === 'desc' ? 'desc' : 'asc'
            },
            include: {
                category: true,
                images: true
            }
        });

        res.json(products);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
}

const handleQuery = async (req, res, query) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                title: { contains: query, mode: 'insensitive' }
            },
            include: {
                category: true,
                images: true
            }
        });
        return products;
    } catch (error) {

        console.log('Search Product error', error);
        res.status(500).json({ message: 'Server error during product search' });
    }
}

const handlePrice = async (req, res, priceRang) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                price: {
                    gte: priceRang[0],
                    lte: priceRang[1]
                }
            },
            include: {
                category: true,
                images: true
            }
        });
        res.send(products)

    } catch (error) {
        console.log('Search Product error', error);
        res.status(500).json({ message: 'Server error during product search' });
    }
}

const handleCategory = async (req, res, categoryId) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                categoryId: {
                    in: categoryId.map(id => parseInt(id))
                }
            },
            include: {
                category: true,
                images: true
            }
        });
        res.send(products)
    } catch (error) {
        console.log('Search Product error', error);
        res.status(500).json({ message: 'Server error during product search' });
    }
}



exports.searchFilterter = async (req, res) => {
    try {
        const { query, categoryId, priceMin, priceMax, price } = req.body;
        const filters = {};

        if (query) {
            console.log('Search query:', query);
            await handleQuery(req, res, query);
        }

        if (categoryId && categoryId.length > 0) {
            await handleCategory(req, res, categoryId);
        }
        if (price) {
            console.log('Exact price filter:', price);
            await handlePrice(req, res, price);
        }

        if (priceMin !== undefined && priceMax !== undefined) {
            console.log('Price range:', priceMin, priceMax);
            // filters.price = {
            //     gte: parseFloat(priceMin),
            //     lte: parseFloat(priceMax)
            // };
        }

        const products = await prisma.product.findMany({
            where: filters,
            include: {
                category: true,
                images: true
            }
        });

        res.json(products);

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
}

exports.read = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true,
                images: true
            }
        });
        res.json(product);
    } catch (error) {
        console.log('Read Product error', error);
        res.status(500).json({ message: 'Server error during product read' });
    }
};

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUNDINARY_CLOUD_NAME,
    api_key: process.env.CLOUNDINARY_API_KEY,
    api_secret: process.env.CLOUNDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

exports.createImages = async (req, res) => {
    try {
        console.log('Received image data:', req.body.image);
        const result = await cloudinary.uploader.upload(req.body.image, {
            public_id: `products/${Date.now()}`,
            resource_type: 'auto', // Automatically detect the file type (image, video, etc.)
            folder: 'Ecom2024' // Optional: specify a folder in Cloudinary to organize your uploads


        });
        console.log('Cloudinary upload result:', result);
        res.send("Test Images add", result)

    } catch (error) {
        console.log('Create Images error', error);
        res.status(500).json({ message: 'Server error during image creation' });
    }
}

exports.removeImages = async (req, res) => {
    try {
        // const { public_id } = req.body;
        // await prisma.productImage.deleteMany({
        //     where: { public_id }
        // });
        // res.json({ message: 'Image removed successfully' });    
        res.send("Image removed successfully")
    }

    catch (error) {
        console.log('Remove Images error', error);
        res.status(500).json({ message: 'Server error during image removal' });
    }
}


