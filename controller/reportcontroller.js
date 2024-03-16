

const Ordercollection= require('../model/admin/order')
const addresscollection=require('../model/admin/address')

// const ExcelJS = require('exceljs')

// const PDFDocument  = require('pdfkit-table')



//// sales 
const sales= async(req,res)=>{
    try{
    const orderdetalist = await Ordercollection.find()
    
    console.log("orderdetalist",orderdetalist);
    
    
    res.render("Sales", { orderdetalist});
    }catch (err) {
      console.error(err);
      return res.status(500).send("Failed to order page.");
    }
    }
  
    //// SalesReportFilter
    const SalesReportFilter = async (req, res) => {
      try {
          const startDate = new Date(req.body.start_date);
          const endDate = new Date(req.body.end_date);
          const orderdetalist  = await Ordercollection.find({
              
  orderDate: { $gte: startDate, $lte: endDate }
          }).sort({ 
            orderDate: -1 });
  
          res.render('Sales', { orderdetalist });
      } catch (error) {
          console.log(error);
          // Handle the error appropriately
          res.status(500).send("Internal Server Error");
      }
  };
  


module.exports = {
    sales,
    SalesReportFilter,
}