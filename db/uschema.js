const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    gender: {
        type: String,
        required: true,
        lowercase: true,
        enum: {
            values: ['male', 'female'],
            message: '{VALUE} is not supported'
        }
    },
    age: {
        type: Number, required: true
    },
    email: {
        type: String, required: true, unique: true
    },
    phone: Number,
    pass: {
        type: String, required: true, min: 6
    },
    tokens: [{
        token: {type: String, required: true}
    }]
});

userSchema.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({_id:this._id.toString()}, process.env.SKEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (e) {res.send(e);}
};

userSchema.pre('save', async function(next){
    if(this.isModified('pass')){
        this.pass = await bcrypt.hash(this.pass, 10);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;