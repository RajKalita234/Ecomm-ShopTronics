const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//Register a User
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{

    const {name,email,password} = req.body;     // we're taking few attributes from req.body to make create request to 

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample id",
            url: "profilepicurl",
        }
    });

    sendToken(user, 201, res);
});


//Login User
exports.loginUser = catchAsyncErrors (async (req,res,next)=>{

    const {email,password} = req.body;
    // checking if user has given password and email both 

    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email & Password",401))
    }

    // const user = User.findOne({email, password});
    // DB will return User Data if email and password entered correctly matches DB datas.
    const user = await User.findOne({ email }).select("+password");
    if(!user || user == null){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    const isPasswordMatched = user.comparePassword(password);
    console.log("checkPass",isPasswordMatched);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid password",401));
    }

    sendToken(user, 200, res);
});


// Logout User
exports.logOut = catchAsyncErrors(async(req,res,next)=>{

    const options = {
        expires: new Date(Date.now()),
        httpOnly: true,
    };

    res.status(200).cookie("token",null,options).json({
            success:true,
            message:"Logged Out Successfully",
        });
});


//Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if(!user || user === undefined) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it`;

    try {

        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        });
        res.status(200).json({
           success: true,
           message: `Email sent to ${user.email} successfully`,
        });

    } catch(error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        
        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    // creating token Hash
    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    console.log('resPassToken',req);
    console.log('resPassToken',this.resetPasswordToken);

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire:{ $gt: Date.now() },
    });

    if(!user || user === undefined) {
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 400));
    }

     if(req.body.password !== req.body.confirmPassword){    // checking for new password and confirm password if they're equal.
        return next(new ErrorHandler("Password doesnot match", 400));
     }

     user.password = req.body.password;
     // Once password has be resetted successfully we'll make below fields as undefined untill user again clicks on reset password again.
     user.resetPasswordToken = undefined;   
     user.resetPasswordExpire = undefined;

    await user.save();
    
    sendToken(user, 200, res);

});

