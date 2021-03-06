var mongoose = require('mongoose');
var User = mongoose.model('users');
var Profile = mongoose.model('profile');
var express = require('express');

const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

var createUser = function(req, res) {

    var user = new User({
        "name": req.body.name,
        "email": req.body.email,
        "password": req.body.password
    });

    User.findOne({ email: user.email }, function(err, user1) {
        if (user1) {
            return res.status(401).json("Email already registered");
        } else {
            user.save(function(err, newUser) {
                if (!err) {
                    var profile = new Profile({
                        user: newUser,
                        name: user.name,
                        profile_picture: "https://it-project-bucket-2020.s3-ap-southeast-1.amazonaws.com/blank-profile.png",
                        transcript: "",
                        website: '',
                        gallery: [],
                        education: [],
                        subjects: [],
                        projects: [],
                        work: [],
                        intro: "",
                        email: user.email,
                        phone: '',
                        skills: [],
                        bio: '',
                        date: '',
                        sectionE: 'block',
                        sectionW: 'block',
                        sectionP: 'block',
                        sectionSk: 'block',
                        sectionSu: 'block',
                        sectionG: 'block'
                    });
                    profile.save();
                    return res.send("User created");
                } else {
                    res.sendStatus(400);
                }
            });
        }
    });
};

// Reset UserAcc
var resetUser = function(req, res) {

    User.findOne({ email: req.body.email }).then((user) => {
        if (user && (req.body.id != user.id)) {

            console.log(req.body.id);
            return res.status(409).json("Email already exists");

        } else {
            //If password is not changed 
            if (req.body.password == '') {
                //Update User name and email
                User.findOneAndUpdate({ _id: req.body.id }, {
                    name: req.body.name,
                    email: req.body.email
                }, function(err, updatedUser) {
                    console.log(updatedUser);
                    if (err) {

                        return res.status(409).json("Wrong");

                    } else {
                        //Update Profile name and email
                        Profile.findOne({ user: req.body.id }).then((file1) => {
                            if (!file1) {

                                return res.status(409).json("Profile not found");

                            } else {
                                Profile.findOneAndUpdate({ user: req.body.id }, {
                                    name: req.body.name,
                                    email: req.body.email
                                }, {}, function(err, updatedProfile) {
                                    if (err) {

                                        return res.status(400).json("Error: Can not update profile");

                                    } else {

                                        return null;

                                    }
                                });
                            }
                        });

                        res.send(updatedUser);

                    }
                });
            } else if (req.body.password != req.body.password2) {

                return res.status(409).json("Password doesn`t match");

            } else {
                //If password is changed 
                //Update User name and email
                User.findOneAndUpdate({ _id: req.body.id }, {
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                }, function(err, updatedUser2) {
                    if (err) {

                        return res.status(400).json("Wrong!");

                    } else {
                        //Update Profile name and email
                        Profile.findOne({ user: req.body.id }).then((file2) => {
                            if (!file2) {

                                return res.status(409).json("Profile not found");

                            } else {
                                Profile.findOneAndUpdate({ user: req.body.id }, {
                                    name: req.body.name,
                                    email: req.body.email
                                }, {}, function(err, updatedProfile2) {
                                    if (err) {

                                        return res.status(400).json("Error: Can not update profile");

                                    } else {

                                        return null;

                                    }
                                });
                            }
                        });

                        res.send(updatedUser2);

                    }
                });
            }
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

// Find one user by id/////////////////////?????????????????????????????????
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

//Find one user by name/////////////////////?????????????????????????????????
var findUserByName = function(req, res) {
    var userName = req.params.name;

    User.findOne({ name: userName }, function(err, user) {
        if (!err) {

            res.send(user);
        } else {
            res.sendStatus(404);

        }
    });
};


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

var getPasswordByEmail = function(req, res) {

    var useremail = req.params.email;
    console.log("getMail:" + useremail);
    User.findOne({ email: useremail }, function(err, user) {
        if (user) {
            res.send(user);
            console.log("Your password is : " + user.password);
        } else {
            console.log("cannotfind");
            res.sendStatus(404);
        }
    })
}

var findUserByEmail = function(req, res) {

    var useremail = req.params.email;

    Profile.find({ email: useremail }, function(err, user) {
        if (!err) {

            res.send(user);
        } else {

            res.sendStatus(404);
        }
    })
}

//Find user by name using fuzzy search
var FuzzySearchUserName = function(req, res) {
    const regex = new RegExp(escapeRegex(req.params.name), 'gi');
    Profile.find({ "name": regex }, function(err, foundusers) {
        if (err) {

        } else {
            res.send(foundusers);
        }
    });
}





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
    User.findOne({ email: user.email, password: user.password }, function(err, user1) {
        if (user1) {

            const payload = {
                _id: user1._id,
                name: user1.name,
                email: user1.email
            }
            let token = payload;
            res.send(token);




        } else {

            return res.status(401).json("Incorrect Email or Password")
        }

        // Validate password

    });

};


var gooLoginUser = function(req, res) {

    const user = req.body;

    //Check for existing user to login
    User.findOne({ email: user.email, password: user.password }, function(err, user1) {
        if (user1) {
            const payload = {
                _id: user1._id,
                name: user1.name,
                email: user1.email
            }
            let token = payload;
            res.send(token);
        } else {
            //Register for google login
            var user = new User({
                "name": req.body.name,
                "email": req.body.email,
                "password": req.body.password
            });

            User.findOne({ email: user.email }, function(err, user1) {
                if (user1) {
                    return res.status(401).json("Email already registered");
                } else {
                    user.save(function(err, newUser) {
                        if (!err) {
                            var profile = new Profile({
                                user: newUser,
                                name: user.name,
                                profile_picture: "https://it-project-bucket-2020.s3-ap-southeast-1.amazonaws.com/blank-profile.png",
                                transcript: "",
                                website: '',
                                gallery: [],
                                education: [],
                                subjects: [],
                                projects: [],
                                work: [],
                                intro: "",
                                email: user.email,
                                phone: '',
                                skills: [],
                                bio: '',
                                date: '',
                                sectionE: 'block',
                                sectionW: 'block',
                                sectionP: 'block',
                                sectionSk: 'block',
                                sectionSu: 'block',
                                sectionG: 'block'
                            });
                            profile.save();
                            return res.send("User created");
                        } else {
                            res.sendStatus(400);
                        }
                    });
                }
            });
        }
    });
};




var fbLoginUser = function(req, res) {

    const user = req.body;

    //Check for existing user to login
    User.findOne({ email: user.email, password: user.password }, function(err, user1) {
        if (user1) {
            const payload = {
                _id: user1._id,
                name: user1.name,
                email: user1.email
            }
            let token = payload;
            res.send(token);
        } else {
            //Register for fb login
            var user = new User({
                "name": req.body.name,
                "email": req.body.email,
                "password": req.body.password
            });


            User.findOne({ email: user.email }, function(err, user1) {
                if (user1) {

                    return res.status(401).json("Email already registered");
                } else {

                    user.save(function(err, newUser) {
                        if (!err) {

                            var profile = new Profile({
                                user: newUser,
                                name: user.name,
                                profile_picture: "https://it-project-bucket-2020.s3-ap-southeast-1.amazonaws.com/blank-profile.png",
                                transcript: "",
                                website: '',
                                gallery: [],
                                education: [],
                                subjects: [],
                                projects: [],
                                work: [],
                                intro: "",
                                email: user.email,
                                phone: '',
                                skills: [],
                                bio: '',
                                date: '',
                                sectionE: 'block',
                                sectionW: 'block',
                                sectionP: 'block',
                                sectionSk: 'block',
                                sectionSu: 'block',
                                sectionG: 'block'
                            });

                            profile.save();

                            return res.send("User created");
                        } else {
                            res.sendStatus(400);
                        }
                    });
                }
            });
        }
    });
};




//Get user`s profile
var getProfile = function(req, res) {

    var k = req.params.user;


    Profile.find({ user: k }, function(err, user2) {
        if (user2) {
            const payload = user2;

            res.send(payload);
        } else {
            res.send(k);
        }
    })
};

// GET one user`s account
var getUserAccount = function(req, res) {
    User.findById(req.params.id, function(err, user) {
        console.log(user.id);
        if (err) {

            return res.status(409).json("User not found");

        } else {

            res.send(user);

        }
    });
};

// var changeName= function(req,res){
//     var user1=req.params.user;

//     const name1= req.body.name;


//     Profile.findOneAndUpdate({user:user1},{$set:{name:name1}},{new: true},function(err,user2){
//         if(err){

//             res.send("wrong");

//         }else{

//            res.send(user2);
//         }
//     })
// };



var deleE = function(req, res) {
    var user1 = req.params.user;

    const sec = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $set: { sectionE: sec.sectionE } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    });
}

var deleW = function(req, res) {
    var user1 = req.params.user;

    const sec = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $set: { sectionW: sec.sectionW } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    });
}

var deleP = function(req, res) {
    var user1 = req.params.user;

    const sec = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $set: { sectionP: sec.sectionP } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
}
var deleSk = function(req, res) {
    var user1 = req.params.user;

    const sec = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $set: { sectionSk: sec.sectionSk } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
}

var deleSu = function(req, res) {
    var user1 = req.params.user;

    const sec = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $set: { sectionSu: sec.sectionSu } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
}

var deleG = function(req, res) {
    var user1 = req.params.user;

    const sec = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $set: { sectionG: sec.sectionG } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
}

var addweb = function(req, res) {
    var user1 = req.params.user;

    const web1 = req.body.web;


    Profile.findOneAndUpdate({ user: user1 }, { $set: { website: web } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};

var addBio = function(req, res) {
    var user1 = req.params.user;

    const bio1 = req.body.bio;


    Profile.findOneAndUpdate({ user: user1 }, { $set: { bio: bio1 } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};

var addPhone = function(req, res) {
    var user1 = req.params.user;

    const phone1 = req.body.bio;


    Profile.findOneAndUpdate({ user: user1 }, { $set: { phone: phone1 } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};
var addIntro = function(req, res) {
    var user1 = req.params.user;

    const intro1 = req.body.intro;


    Profile.findOneAndUpdate({ user: user1 }, { $set: { intro: intro1 } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};

var addSkills = function(req, res) {
    var user1 = req.params.user;

    const skill = req.body.skill;


    Profile.findOneAndUpdate({ user: user1 }, { $push: { skills: skill } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};

var findSkillAndDelete = function(req, res) {
    var user1 = req.params.user;

    const skill = req.body.skill;

    Profile.findOneAndUpdate({ user: user1 }, { $pull: { skills: skill } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
}

var addWork = function(req, res) {
    var user1 = req.params.user;

    const work1 = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $push: { work: { workplace: work1.workplace, position: work1.position, from: work1.from, to: work1.to } } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};
var findWorkAndDelete = function(req, res) {
    var user1 = req.params.user;

    const work1 = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $pull: { work: { workplace: work1.workplace, position: work1.position, from: work1.from, to: work1.to } } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};
var addproject = function(req, res) {
    var user1 = req.params.user;

    const work1 = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $push: { projects: { projectname: work1.projectname, projectdescription: work1.projectdescription, projectlink: work1.projectlink } } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};
var findProjectAndDelete = function(req, res) {
    var user1 = req.params.user;

    const work1 = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $pull: { projects: { projectname: work1.projectname, projectdescription: work1.projectdescription, projectlink: work1.projectlink } } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};

var addEducation = function(req, res) {
    var user1 = req.params.user;

    const edu = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $push: { education: { school: edu.school, qual: edu.qual } } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};
var deleteEducation = function(req, res) {
    var user1 = req.params.user;

    const edu = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $pull: { education: { school: edu.school, qual: edu.qual } } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};
var addSubjects = function(req, res) {
    var user1 = req.params.user;

    const edu = req.body;

    Profile.findOneAndUpdate({ user: user1 }, { $push: { subjects: { subjectname: edu.subjectname, subjectdescripition: edu.subjectdesc, subjectyear: edu.year } } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};

var findSubjectsAndDelete = function(req, res) {
    var user1 = req.params.user;

    const edu = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $pull: { subjects: { subjectname: edu.subjectname, subjectdescripition: edu.subjectdescripition, subjectyear: edu.subjectyear } } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};

var addProfilePicture = function(req, res) {
    var user1 = req.params.user;

    const profilePic = req.body.profilePic;

    Profile.findOneAndUpdate({ user: user1 }, { $set: { profile_picture: profilePic } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
}

var addTranscript = function(req, res) {
    var user1 = req.params.user;

    const transcript = req.body.transcript;

    Profile.findOneAndUpdate({ user: user1 }, { $set: { transcript: transcript } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
}


var addGallery = function(req, res) {
    var user1 = req.params.user;

    const galleryPic = req.body;

    Profile.findOneAndUpdate({ user: user1 }, { $push: { gallery: { imagesource: galleryPic.imagesource, description: galleryPic.description } } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
}
var contactTo = function(req, res) {
    const mailObj = req.body;
    const nodemailer = require('nodemailer');
    console.log(req.body);
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        secureConnection: true, //use SSL
        port: 465,
        secure: true, //secure: true for port 465, secure:false for port 587
        auth: {
            user: "saltyfish0000@gmail.com",
            pass: "goodsaltyfish"
        },
    });

    let mailOptions = {
        from: 'saltyfish<saltyfish0000@gmail.com>', 
        to: mailObj.mail, 
        subject: 'Someone want to contact you', 
        text: mailObj.info, 

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.send("cannotsend");
            console.log("failed" + error);
        } else {
            console.log("good");
        }

    });
}

var sendEmail = function(req, res) {
    const mailObj = req.body;
    const nodemailer = require('nodemailer');
    console.log(req.body);
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        secureConnection: true, //use SSL
        port: 465,
        secure: true, //secure: true for port 465, secure:false for port 587
        auth: {
            user: "saltyfish0000@gmail.com",
            pass: "goodsaltyfish"
        },
    });

    let mailOptions = {
        from: 'saltyfish<saltyfish0000@gmail.com>', 
        to: mailObj.mail, 
        subject: 'Your Password', 
        text: mailObj.pass, 

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.send("cannotsend");
            console.log("failed" + error);
        } else {
            console.log("good");
        }

    });
}

var findGalleryPicAndDelete = function(req, res) {
    var user1 = req.params.user;

    const gPic = req.body;


    Profile.findOneAndUpdate({ user: user1 }, { $pull: { gallery: { imagesource: gPic.imagesource, description: gPic.description } } }, { new: true }, function(err, user2) {
        if (err) {

            res.send("wrong");

        } else {

            res.send(user2);
        }
    })
};

module.exports.findUserByEmail = findUserByEmail;
module.exports.FuzzySearchUserName = FuzzySearchUserName;

module.exports.findGalleryPicAndDelete = findGalleryPicAndDelete;
module.exports.addGallery = addGallery;
module.exports.sendEmail = sendEmail;
module.exports.addWork = addWork;
module.exports.addweb = addweb;
//module.exports.changeName=changeName;
module.exports.addIntro = addIntro;
module.exports.addPhone = addPhone;
module.exports.addproject = addproject;
module.exports.findWorkAndDelete = findWorkAndDelete;
module.exports.findProjectAndDelete = findProjectAndDelete;
module.exports.deleteEducation = deleteEducation;

module.exports.addTranscript = addTranscript;
module.exports.addProfilePicture = addProfilePicture;
module.exports.findSkillAndDelete = findSkillAndDelete;
module.exports.findSubjectsAndDelete = findSubjectsAndDelete;
module.exports.findSk
module.exports.addSubjects = addSubjects;
module.exports.addEducation = addEducation;
module.exports.addSkills = addSkills;
module.exports.addBio = addBio;
module.exports.getProfile = getProfile;
module.exports.getUserAccount = getUserAccount;
module.exports.loginUser = loginUser;
module.exports.gooLoginUser = gooLoginUser;
module.exports.fbLoginUser = fbLoginUser;
module.exports.createUser = createUser;
module.exports.resetUser = resetUser;
module.exports.findAllUsers = findAllUsers;
module.exports.findOneUser = findOneUser;
module.exports.findUserByName = findUserByName;
module.exports.deleteUserById = deleteUserById;
module.exports.deleE = deleE;
module.exports.deleW = deleW;
module.exports.deleP = deleP;
module.exports.deleSk = deleSk;
module.exports.deleSu = deleSu;
module.exports.deleG = deleG;
module.exports.getPasswordByEmail = getPasswordByEmail;
module.exports.contactTo = contactTo;