const prisma = require('../config/prisma')

exports.create=async(req, res) => {
    try {
const {name}=req.body;
const category = await prisma.category.create({
    data: { name }
});

    res.json({message: 'Category created successfully', category});  } 
catch (error) {
    console.log('Create Category error', error);
    res.status(500).json({message: 'Server error during category creation'});  
}} ;




exports.list=async(req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        console.log('List Category error', error);
        res.status(500).json({message: 'Server error during category listing'});  
}} ;



exports.remove = async(req,res)=>{
    try{
        // code
        const { id } = req.params
     console.log('Attempting to remove category with ID:', id);
        const category = await prisma.category.delete({
            where:{ 
                id: Number(id)
             }
        })
        res.send(category)
    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server error" })
    }
}






// exports.remove=async(req, res) => {
//     try {
//       const {id}=req.params;
//       console.log('Attempting to remove category with ID:', id);
//     await prisma.category.delete({ where: { id: Number(id) } });
    
//     res.json({message: `Category with ID ${id} removed successfully`} );  } catch (error) {
//     console.log('Remove Category error', error);
//     res.status(500).json({message: 'Server error during category removal'});  
// }} ;


// exports.remove = async(req,res)=>{
//     try{
//         // code
//         const { id } = req.params
//         const category = await prisma.category.delete({
//             where:{ 
//                 id: Number(id)
//              }
//         })
//         res.send(category)
//     }catch(err){
//         console.log(err)
//         res.status(500).json({ message : "Server error" })
//     }
// }