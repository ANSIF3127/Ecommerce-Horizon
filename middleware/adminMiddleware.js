const Checksession=(req,res,next)=>{
    if(req.session.admin){
        next();
    }else{
        res.redirect('/admin_Login')
    }
};
module.exports =Checksession;