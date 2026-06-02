const express = require('express');
const router = express.Router();
const { create, list, remove,update, listby, searchFilters,read,createImages,removeImage } = require('../controllers/products');
const{authCheck,adminCheck} = require('../middlewares/authCheck')
//const {images, removeImages} = require('../controllers/cloudinary');


router.post('/product', create);
router.get('/products/:count', list);
router.put('/product/:id', update);
router.delete('/product/:id', remove);
router.post('/productby', listby);
router.post('/search/filters', searchFilters );
router.get('/product/:id', read);

router.post('/images', createImages);
//router.post('/images',authCheck,adminCheck, createImages);
router.post('/removeimages',authCheck,adminCheck,  removeImage);

module.exports = router;