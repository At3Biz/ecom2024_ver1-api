const express = require('express');
const router = express.Router();
const { create, list,remove} = require('../controllers/category');  
const {authCheck,adminCheck} =require('../middlewares/authCheck')

// router.get('/category', (req, res) => {
//   res.send('Category endpoint');
// });

// router.post('/category', (req, res) => {
//   res.send('Category POST endpoint');
// });

// router.delete('/category/:id', (req, res) => {
//   res.send('Category DELETE endpoint');
// });



router.post('/category',authCheck,adminCheck, create);
router.get('/category',  list);
router.delete('/category/:id', authCheck,adminCheck, remove);

module.exports = router;