var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var User = require('../models/user');
//var passportLocalMongoose = require('passport-local-mongoose');

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'        
    }]
},
{
    timestamps: true
});

//favoriteSchema.plugin(passportLocalMongoose);
var Favorites = mongoose.model('Favorites', favoriteSchema);

module.exports = Favorites;

