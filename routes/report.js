
const express = require('express')
const router = express.Router();
const reportcontroller = require('../controller/reportcontroller')
const Checksession=require('../middleware/adminMiddleware');





/////sales
router.get('/Sales', Checksession, reportcontroller. sales);
router.post('/salesreportfilter', reportcontroller.SalesReportFilter);

// router.get('/downloadPDF',Checksession, reportcontroller.downloadPDF);
// router.get('/downloadExcel',Checksession, reportcontroller.downloadExcel);





module.exports = router;