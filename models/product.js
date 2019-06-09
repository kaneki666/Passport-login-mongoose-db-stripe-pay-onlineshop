var mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    email: String,
    pname: String,
    description: String,
    price: Number,
});

module.exports = mongoose.model('prods', UserSchema);