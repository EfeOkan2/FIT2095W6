const mongodb=require('mongodb');
const express=require('express');
const ejs = require("ejs");
const app=express();
const path = require('path');
const MongoClient = mongodb.MongoClient;

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.use(express.static("public"));

const url = 'mongodb://localhost:27017/';

app.listen(8080);
app.use(express.urlencoded({extended:true}));
let db;

MongoClient.connect(url, {useNewUrlParser: true}, function (err, client) {
    if (err) {
        console.log('Err  ', err);
    } else {
        console.log("Connected successfully to server");
        db = client.db('ParcelWarehouse');
        
    }
});

app.get("/",function(req,res){
    res.sendFile(path.join(__dirname,"views/index.html"));

});

app.get("/index.html",function(req,res){
    res.sendFile(path.join(__dirname,"views/index.html"));

});

app.post("/addparcel",function(req,res){
    let parcelDetails = req.body;
    if(parcelDetails.sender.length < 3 || parcelDetails.address.length < 3 || parcelDetails.weight < 0){
        res.sendFile(path.join(__dirname,"views/invalid.html"));
    }else{

    db.collection("parcels").insertOne({
        sender: parcelDetails.sender,
        address: parcelDetails.address,
        weight: parcelDetails.weight,
        fragile: parcelDetails.fragile,
    });
    res.redirect("getparcel.html")
};

});

app.get("/getparcel.html",function(req, res){
    db.collection("parcels").find({}).toArray(function(err,data){
        res.render("getparcel.html",{parcelsDb : data});
    });

});


  app.get("/deleteparcel.html",function(req,res){
    res.sendFile(path.join(__dirname,"views/deleteparcel.html"));

});

app.post("/deleteparcel",function(req,res){
    let id = req.body.id;
    
    db.collection("parcels").deleteOne({_id:mongodb.ObjectId(id)});
    res.redirect("getparcel.html");


});

app.get("/updateparcel.html",function(req,res){
    res.sendFile(path.join(__dirname,"views/updateparcel.html"));

});

app.post("/updateparcel",function(req,res){
    let parcelDetails = req.body;
    let id = req.body.id
    let filter = {_id:mongodb.ObjectId(id)};
    let theUpdate ={
        $set: {
            sender: parcelDetails.newsender,
            address: parcelDetails.newaddress,
            weight: parcelDetails.newweight,
            fragile: parcelDetails.newfragile,
        },
    };
    db.collection("parcels").updateOne(filter,theUpdate);
    res.redirect("getparcel.html");

});






app.get('*', function(req, res){
    res.sendFile(path.join(__dirname,"views/404.html"));
  });