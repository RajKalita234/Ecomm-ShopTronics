const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");


// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    req.body.user = req.user.id;    // req.user.id is the id which we got after login
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product,
    });
});

// Get All Product
exports.getAllProducts =catchAsyncErrors(async (req,res)=>{
    const resultPerPage = 5;
    const productCount = await Product.countDocuments();    // async call to get the total count of products
    const apiFeature = new ApiFeatures(Product.find(), req.query)    // ApiFeatures is a common util
    .search()
    .filter()
    .pagination(resultPerPage);   
    const products = await apiFeature.query;            // ex: queryStr {"price":{"$lt":"2000","$gte":"1000"}}
    res.status(200).json({
        success: true,
        products
    });
});

 // Get Product Details
 exports.getProductDetails = catchAsyncErrors(async(req,res,next)=>{
    
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler('Product not found',404));    // next is a callback function
    }
    
    res.status(200).json({
        success:true,
        product,
        productCount,
    });
  });

// Update Product --
 exports.updateProduct = catchAsyncErrors(async (req,res,next) => {

    let product = await Product.findById(req.params.id);
    // if(!product){
    //     return res.status(500).json({
    //         success:false,
    //         message:"Product not found"
    //     })
    // }
    if(!product){
        return next(new ErrorHandler('Product not found',404));    // next is a callback function
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true, 
        runValidators:true, 
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        product
    });
 });

 // Delete Product
  exports.deleteProduct = catchAsyncErrors(async(req,res,next) => {
    
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler('Product not found',404));    // next is a callback function
    }

    await product.remove();

    res.status(200).json({
        success:true,
        message:"Product Delete Successfully"
    })

 });  

