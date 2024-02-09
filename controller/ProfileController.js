const addressCollection = require('../model/admin/address')
const User = require('../model/admin/User')
const Categorymgm = require("../model/admin/Category")



//// Profile Render
const Profile = async (req, res) => {
    const UsersId = req.session.userid;
    const profileData = await User.findOne({ _id: UsersId })
    const Categorie = await Categorymgm.find({});
  const address=await addressCollection.findOne()
    res.render("Profile", { profileData, Categorie,address })
}


//// Change Password get
const PasswordChange = async (req, res) => {
    const userid = req.session.userid
    console.log(userid);
    res.render('changePassword')
}
///// Change Password post
const PasswordChangepost = async (req, res) => {
    const userId = req.session.userid;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        const currentPassword = req.body.currentPassword.trim();
        const newPassword = req.body.newPassword.trim();
        const confirmPassword = req.body.confirmPassword.trim();

        // Validate current password against the user's actual current password
        if (currentPassword !== user.password) {
            return res.status(400).send('Incorrect current password');
        }

        // Compare passwords directly
        if (newPassword === confirmPassword) {
            // Update user password
            user.password = newPassword;
            await user.save();

            res.redirect('/Profile'); 
        } else {
            res.status(400).send('New passwords do not match');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

///// change profile
const changeProfile=async(req,res)=>{
    res.render('editProfile')
}

///// change profile 
const postEditProfile = async (req, res) => {
    try {
      const userId = req.session.userid;
  
      // Update User data
      await User.findOneAndUpdate({ _id: userId }, { Username: req.body.username, email: req.body.email });
  
      // Update Address data
      await addressCollection.findOneAndUpdate({ userid: userId }, { phone: req.body.phone });
  
      res.redirect('/Profile');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };









//// Address Get
const Address = async (req, res) => {
    const userId = req.session.userid;
    const userProfileData = await addressCollection.find({ userid: userId });
    const Categorie = await Categorymgm.find();
    res.render('address', { userProfileData, Categorie });
}



/// Add Address Get 
const addAdressGet = async (req, res) => {
    const address = await addressCollection.find()
    res.render('addAddress', { address });

}

/// Add Address Post
const addAddressPost = async (req, res) => {
    try {
        const userId = req.session.userid;
        const userProfile = {
            userid: req.session.userid,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            phone: req.body.phone,
        }
        console.log("addresspost", userProfile);

        await addressCollection.insertMany([userProfile])
            .then(x => {
                res.redirect('/address')
            })
    } catch (error) {
        console.log(error);
    }
}



///Edit Address Get
const EditAddressGet = async (req, res) => {
    const addressId = req.params.id;
    console.log("getrequestid:", addressId);
    const oldaddress = await addressCollection.findById(addressId)
    res.render('editAddress', { oldaddress });
}
///Edit Address Post
const EditAddressPost = async (req, res) => {
    try {
        const addressId = req.params.id;
        console.log(addressId);
        const { firstname, lastname, address, city, state, pincode, email, phone } = req.body;
        await addressCollection.findByIdAndUpdate(addressId, {

            firstname,
            lastname,
            address,
            city,
            pincode,
            phone,
            email,
        });
        res.redirect('/address');
    } catch (error) {
        console.error(error);

        res.render('EditAddress')
    }
}

///// address delete
const deleteaddress = async (req, res) => {
    const id = req.params.id
    await addressCollection.findByIdAndDelete(id)
        .then(() => {
            console.log('deleted')
            res.redirect('/address')
        })
}

/// profile logout
const profilelogout = (req, res) => {
    req.session.destroy().then(() => { res.redirect('/') })
}




module.exports = {
    Profile,
    PasswordChange,
    PasswordChangepost,
    changeProfile,
    postEditProfile,

    Address,
    addAdressGet,
    addAddressPost,
    EditAddressGet,
    EditAddressPost,
    deleteaddress,
    profilelogout,
}