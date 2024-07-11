const mongoose = require('mongoose');

const userSchema=new mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 10   
    },
    role:{
        type:String,
        enum:['superadmin','admin'],
        default:'admin'
    },
    ip_address:{
        type: String,
        required: false
    },
    highest_qualification:{
        type: String,
        required: true
    },
    subject:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true,
        unique:true
    }
},{
    timestamps:true
});

const User = mongoose.model("User", userSchema);

module.exports = User;