const addressCollection = require('../model/admin/address')
const User = require('../model/admin/User')
const Categorymgm = require("../model/admin/Category")
const Ordercollection = require('../model/admin/order')


//// Profile Render
const Profile = async (req, res) => {
    const UsersId = req.session.userid;
    const profileData = await User.findOne({ _id: UsersId })
    const Categorie = await Categorymgm.find({});
    const address = await addressCollection.findOne({ userid: UsersId });
    const order = await Ordercollection.findOne({ userid: UsersId });
    res.render("Profile", { profileData, Categorie,address })
}


//// Change Password get
const PasswordChange = async (req, res) => {
    const userid = req.session.userid
    console.log(userid);
    const Categorie = await Categorymgm.find({});
    res.render('changePassword',{ Categorie,errorMessage: '' })
}
///// Change Password post
const PasswordChangepost = async (req, res) => {
    const userId = req.session.userid;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    try {
        const user = await User.findById(userId);

        // Backend validation for current password
        if (user.Password !== currentPassword) {
            return res.render('changePassword', {
                errorMessage: {
                    currentPassword: 'Incorrect current password.',
                    newPassword: '',
                    confirmPassword: '',
                    general: '',
                },
                Categorie: await Categorymgm.find({})
            });
        }

        // Backend validation for new password and confirm password
        if (newPassword !== confirmPassword) {
            return res.render('changePassword', {
                errorMessage: {
                    currentPassword: '',
                    newPassword: 'New password and confirm password do not match.',
                    confirmPassword: '',
                    general: '',
                },
                Categorie: await Categorymgm.find({})
            });
        }

        if (newPassword.length < 5) {
            return res.render('changePassword', {
                errorMessage: {
                    currentPassword: '',
                    newPassword: 'New password must be at least 5 characters long.',
                    confirmPassword: '',
                    general: '',
                },
                Categorie: await Categorymgm.find({})
            });
        }

        // Update user password
        user.Password = newPassword;
        await user.save();

        res.redirect('/Profile');
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
            state,
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