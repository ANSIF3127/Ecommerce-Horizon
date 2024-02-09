const express = require('express')
const router = express.Router();
const ProfileController=require('../controller/ProfileController')
const checkSessionBlocked = require('../middleware/UserMiddleware')

/// render profile
router.get('/Profile',checkSessionBlocked, ProfileController.Profile);

///// Change Profile

///// Change Password
router.get('/changePassword', checkSessionBlocked,ProfileController.PasswordChange);
router.post('/changePassword', ProfileController.PasswordChangepost);

router.get('/editProfile', ProfileController.changeProfile);
router.post('/updateProfile', ProfileController.postEditProfile);

/// address render
router.get('/address',checkSessionBlocked, ProfileController.Address);

/// addaddress get and post 
router.get('/addAddress',checkSessionBlocked,ProfileController.addAdressGet);
router.post('/address', ProfileController.addAddressPost);


///   EDIT  Address (Get , POST)  
router.get('/addressedit/:id',checkSessionBlocked, ProfileController.EditAddressGet);
router.post('/addresseditpost/:id', ProfileController.EditAddressPost);
/// Delete Address
router.get('/deleteaddress/:id',checkSessionBlocked, ProfileController.deleteaddress);




//// profilelogout
router.get('/',checkSessionBlocked, ProfileController.profilelogout);

module.exports = router;