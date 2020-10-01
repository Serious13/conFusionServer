const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');

const Favorites = require('../models/favorites');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

//FAVORITES
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    Favorites.find({})
    .populate('user')
    .populate('dishes') 
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user:req.user._id},(err,favorites)=>{
        if (err) return next(err);
        if (!favorites) {
            Favorites.create({user:req.user._id})
            .then((favorites)=>{
                for (i=0;i<req.body.length;i++) {
                    if (favorites.dishes.indexOf(req.body[i]._id) < 0) {
                        favorites.dishes.push(req.body[i]);
                    }
                }
                favorites.save()
                .then((favorites) => {
                    Favorites.findById(favorites._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                })
                .catch((err) => {
                    return next(err);
                });

            })
        }
        else {
            for (i=0;i<req.body.length;i++) {
                if (favorites.dishes.indexOf(req.body[i]._id) < 0) {
                    favorites.dishes.push(req.body[i]);
                }
            }
            favorites.save()
            .then((favorites) => {
                Favorites.findById(favorites._id)
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
            })
            .catch((err) => {
                return next(err);
            });
        }
    })
})

.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');

})

.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user:req.user._id}) 
    .then((favorites) => {
        if (favorites != null) {
            Favorites.remove({})
            .then((favorites) =>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }
        
    }, (err) => next(err))
    .catch((err) => next(err));    
});

//DISH ID
favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

.post(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user:req.user._id}, (err,favorites)=> {
        if(err) return next(err);

        if (!favorites) {
            Favorites.create({ user: req.user._id, dishes:req.params.dishId})
            .then((favorites)=> {
                favorites.dishes.push({"_id":req.params.dishId});
                favorites.save
                .then((favorites) => {
                    Favorites.findById(favorites._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
            })
            
        }
        else {    
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                favorites.dishes.push({"_id": req.params.dishId});
                favorites.save()
                .then((favorites) => {
                    Favorites.findById(favorites._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
            }
            else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish'+ req.params.dishId + 'already created');
            }
        }
    })
})


.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user:req.user._id}, (err,favorites) => {
        if (err) return next(err);

        if (favorites != null) {
            Favorites.remove({user:req.user._id,dishes:req.params.dishId})
            favorites.save()
            .then((favorites) => {
                Favorites.findById(favorites._id)
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
            })
            .catch((err) => {
                return next(err);
            });
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        } 
    })    
});

module.exports = favoriteRouter;