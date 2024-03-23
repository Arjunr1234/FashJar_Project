const order = require("../models/orderModel");




const loadSalesReport = async(req, res)=>{
                console.log("Entered into loadSalesReport in adminSalesReportController");
                
                res.render("salesreport")
                 
}

module.exports = {
              loadSalesReport
}