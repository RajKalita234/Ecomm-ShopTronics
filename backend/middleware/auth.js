const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors( async(req, res, next)=>{
    const { token } = req.cookies;       // during login time we have saved the token in cookiestore
    
    if(!token){
        return next(new ErrorHandler("Please Login to access this resource",401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);     // so when user is logged in we can easily access user data
    console.log('requested User',req.user);
    next();
});

exports.authorizeRoles = (...roles) =>{

    return (req,res,next)=> {

    if(!roles.includes(req.user.role)){ // req.user.role = 'user' from DB.
      return next(
        new ErrorHandler(
        `Role: ${req.user.role} is not allowed to access this resource`,403
        )
      );
    }       
    
     next();    // if role includes then skip and proceed next and normal request is returned.
    };
};
