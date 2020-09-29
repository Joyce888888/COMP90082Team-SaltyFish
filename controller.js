var mongoose = require('mongoose');
var User = mongoose.model('users');
var Profile =mongoose.model('profile');
var express = require('express');

const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')

var createUser = function(req, res) {

    var user = new User({
        "name":req.body.name,
        "email":req.body.email,
        "password":req.body.password
    });

    User.findOne({email:user.email}, function(err, user1) {
        if (user1) {
            console.log("User exists!");
     
            
        } else {
           
            user.save(function (err, newUser) {
                console.log(newUser);
                if (!err) {
                    var profile =new Profile({
                        user: newUser,
                        name: user.name,
                        profile_picture: "https://it-project-bucket-2020.s3-ap-southeast-1.amazonaws.com/blank-profile.png",
                        website:'',
                        education:[],
                        subjects:[],
                        email:user.email,
                        phone:'',
                        skills:[],
                        bio:'',
                        date:''});
                    
                    console.log(profile.save());
                    console.log("registered");
                } else {
                    res.sendStatus(400);
                }
            });
        }
    });
};

// Find all users
var findAllUsers = function(req, res) {
    Profile.find(function(err, users) {
        if (!err) {
            res.send(users);
        } else {
            res.sendStatus(404);
        }
    });
};

// Find one user by id
var findOneUser = function(req, res) {
    var userInx = req.params.id;
    Profile.findById(userInx, function(err, user) {
        if (!err) {
            res.send(user);
        } else {
            res.sendStatus(404);
        }
    });
};

//Find one user by name
var findUserByName = function(req, res) {
    var userName = req.params.name;
    console.log(userName);
    User.findOne({name:userName}, function(err, user) {
        if (!err) {
            console.log("errrr")
            res.send(user);
        } else {
            res.sendStatus(404);
            console.log("errrr1")
        }
    });
};





//Delete user by id
var deleteUserById = function(req, res) {
    var userId = req.query.id;
    User.findByIdAndRemove(userId, function(err, user) {
        if (!err) {
            res.send("delete user");
        } else {
            res.status(404).send(err);
        }
   });
};

var loginUser = function(req, res) {
    
    const user = req.body;
    
    //check for existing user
    User.findOne({email:user.email,password:user.password}, function(err, user1) {
        if (user1) {
            console.log("Successful login ");
            const payload = {
                _id: user1._id,
                name: user1.name,
                email: user1.email
              }
              let token = payload;
              res.send(token);

            
     
            
        }
        else{
            return res.status(400).json("Incorrect Email or Password")
        }

      // Validate password
      
         });
  
};
var getProfile =function(req,res){
    
    var k=req.params.user;

    
    Profile.find({user:k},function(err,user2){
        if(user2){
            const payload=user2;
            console.log(user2);
            res.send(payload);
        }else{
           res.send(k);
        }
    })

    
    

};
var addBio= function(req,res){
    var user1=req.params.user;
    
    const bio1= req.body.bio;

    
    Profile.findOneAndUpdate({user:user1},{$set:{bio:bio1}},{new: true},function(err,user2){
        if(err){
            console.log(user2);
            res.send("wrong");
            
        }else{
            console.log(user2);
           res.send("found");
        }
    })
};

var addSkills= function(req,res){
    var user1=req.params.user;
    
    const skill= req.body.skill;

    
    Profile.findOneAndUpdate({user:user1},{$push: {skills:skill}},{new: true},function(err,user2){
        if(err){
            console.log(user2);
            res.send("wrong");
            
        }else{
            console.log(user2);
           res.send("found");
        }
    })
};

var findSkillAndDelete = function(req, res) {
    var user1 = req.params.user;

    const skill = req.body.skill;

    Profile.findOneAndUpdate({user:user1},{$pull: {skills: {skill}}},{new: true},function(err,user2){
        if(err){
            console.log(user2);
            res.send("wrong");
            
        }else{
            console.log(user2);
           res.send("found");
        }
    })
}


var addEducation= function(req,res){
    var user1=req.params.user;
    
    const edu= req.body.education;

    
    Profile.findOneAndUpdate({user:user1},{$push: {education:{school:edu}}},{new: true},function(err,user2){
        if(err){
            console.log(user2);
            res.send("wrong");
            
        }else{
            console.log(user2);
           res.send("found");
        }
    })
};
var deleteEducation= function(req,res){
    var user1=req.params.user;
    
    const edu= req.body.education;

    
    Profile.findOneAndUpdate({user:user1},{$pull: {education:{school:edu}}},{new: true},function(err,user2){
        if(err){
            console.log(user2);
            res.send("wrong");
            
        }else{
            console.log(user2);
           res.send("found");
        }
    })
};
var addSubjects= function(req,res){
    var user1=req.params.user;
    
    const edu= req.body;

    Profile.findOneAndUpdate({user:user1},{$push: {subjects:{subjectname:edu.subjectname,subjectdescripition:edu.subjectdesc,subjectyear:edu.year}}},{new: true},function(err,user2){
        if(err){
            console.log(user2);
            res.send("wrong");
            
        }else{
            console.log(user2);
           res.send("found");
        }
    })
};

var findSubjectsAndDelete= function(req,res){
    var user1=req.params.user;
    
    const edu= req.body;

    
    Profile.findOneAndUpdate({user:user1},{$pull:{subjects:{subjectname:edu.subjectname,subjectdescripition:edu.subjectdesc,subjectyear:edu.year}}},{new: true},function(err,user2){
        if(err){
            console.log(user2);
            res.send("wrong");
            
        }else{
            console.log(user2);
           res.send("found");
        }
    })
};

var addProfilePicture = function(req, res) {
    var user1 = req.params.user;

    const profilePic = req.body.profilePic;

    Profile.findOneAndUpdate({user:user1},{$set:{profile_picture:profilePic}},{new: true},function(err,user2){
        if(err){
            console.log(user2);
            res.send("wrong");
            
        }else{
            console.log(user2);
           res.send("found");
        }
    })
}

module.exports.addProfilePicture=addProfilePicture;
module.exports.findSkillAndDelete=findSkillAndDelete;
module.exports.findSubjectsAndDelete=findSubjectsAndDelete;
module.exports.findSk
module.exports.addSubjects=addSubjects;
module.exports.addEducation=addEducation;
module.exports.addSkills=addSkills;
module.exports.addBio= addBio;
module.exports.getProfile =getProfile;
module.exports.loginUser =loginUser;
module.exports.createUser = createUser;
module.exports.findAllUsers = findAllUsers;
module.exports.findOneUser = findOneUser;
module.exports.findUserByName = findUserByName;
module.exports.deleteUserById = deleteUserById;