const order = require("../models/orderModel");
const user = require("../models/userModel");
const product = require("../models/productModel");




const loadSalesReport = async(req, res, next)=>{
                

              try {

                const salesData = await order.aggregate([
                  {
                    $lookup: {
                      from: "users",
                      localField: "userId",
                      foreignField: "_id",
                      as: "user",
                    },
                    
                  },
                  { $unwind: "$user" },
                  { $sort: { orderedOn: -1 } },
                  { $unwind: "$products" },
                  {
                    $lookup: {
                      from: "products",
                      localField: "products.product",
                      foreignField: "_id",
                      as: "productNew",
                    },
                  },
                  { $unwind: "$productNew" },
                 { 
                   $match: { "products.status": "Delivered" } 
                 },
                  {
                    $project: {
                        orderId: 1,
                        "user.name": 1,
                        "productNew.productName": 1,
                        "productNew.regularPrice":1,
                        "productNew.discount":1,
                        orderedOn: 1,
                        paymentMethod: 1,
                        coupon: 1, 
                        "products.productPrice": 1,
                        "products.status":1,
                        "products.quantity":1
                    }
                }
                ])

                let totalRegularPrice = 0;
                let totalDiscountedProductPrice = 0;

                for(let i=0; i<salesData.length; i++){
                          totalRegularPrice = totalRegularPrice + (salesData[i].productNew.regularPrice * salesData[i].products.quantity);
                          totalDiscountedProductPrice = totalDiscountedProductPrice + (salesData[i].products.productPrice * salesData[i].products.quantity);
                }
               const totalDiscountPrice = totalRegularPrice - totalDiscountedProductPrice

               


                
                res.render("salesReport",{salesData, totalDiscountedProductPrice, totalDiscountPrice})
                
              } catch (error) {
                console.error("Error in loadSalesReport: ", error);
                next(error);
                
              }
                 
}

const filterReport = async (req, res, next)=>{
                
                try {

                  const receivedData =  req.body.timePeriod;
                

                if(receivedData === 'week'){
                  

                  const startOfWeek = new Date();
                  startOfWeek.setHours(0, 0, 0, 0); // Set to the beginning of today
                  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Set to the start of the week (Sunday)
                  
                  const endOfWeek = new Date();
                  endOfWeek.setHours(23, 59, 59, 999); // Set to the end of today
                  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay())); // Set to the end of the week (Saturday)
                  
                  var salesData = await order.aggregate([
                    {
                      $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
                      },
                      
                    }, {
                      $match: {
                        orderedOn: {
                          $gte: startOfWeek,
                          $lte: endOfWeek
                        }
                      }
                    },
                    { $unwind: "$user" },
                    { $sort: { orderedOn: -1 } },
                    { $unwind: "$products" },
                    {
                      $lookup: {
                        from: "products",
                        localField: "products.product",
                        foreignField: "_id",
                        as: "productNew",
                      },
                    },
                    { $unwind: "$productNew" },
                   { 
                     $match: { "products.status": "Delivered" } 
                   },
                    {
                      $project: {
                          orderId: 1,
                          "user.name": 1,
                          "productNew.productName": 1,
                          "productNew.regularPrice":1,
                          "productNew.discount":1,
                          orderedOn: 1,
                          paymentMethod: 1,
                          coupon: 1, 
                          "products.productPrice": 1,
                          "products.status":1,
                          "products.quantity":1
                      }
                  }
                  ]);
                  
                

                  
                  var totalRegularPrice = 0;
                  var totalDiscountedProductPrice = 0;
  
                  for(let i=0; i<salesData.length; i++){
                    totalRegularPrice = totalRegularPrice + (salesData[i].productNew.regularPrice * salesData[i].products.quantity);
                    totalDiscountedProductPrice = totalDiscountedProductPrice + (salesData[i].products.productPrice * salesData[i].products.quantity);
          }
                 var totalDiscountPrice = totalRegularPrice - totalDiscountedProductPrice
  



                }else if(receivedData === 'month'){
                  


                  const startOfMonth = new Date();
                  startOfMonth.setDate(1); // Set to the first day of the current month
                  startOfMonth.setHours(0, 0, 0, 0); // Set to the beginning of the day
                  
                  const endOfMonth = new Date();
                  endOfMonth.setMonth(endOfMonth.getMonth() + 1); 
                  endOfMonth.setDate(0); 
                  endOfMonth.setHours(23, 59, 59, 999); 

                  var salesData = await order.aggregate([
                    {
                      $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
                      },
                      
                    }, {
                      $match: {
                        orderedOn: {
                          $gte: startOfMonth,
                          $lte: endOfMonth
                        }
                      }
                    },
                    { $unwind: "$user" },
                    { $sort: { orderedOn: -1 } },
                    { $unwind: "$products" },
                    {
                      $lookup: {
                        from: "products",
                        localField: "products.product",
                        foreignField: "_id",
                        as: "productNew",
                      },
                    },
                    { $unwind: "$productNew" },
                   { 
                     $match: { "products.status": "Delivered" } 
                   },
                    {
                      $project: {
                          orderId: 1,
                          "user.name": 1,
                          "productNew.productName": 1,
                          "productNew.regularPrice":1,
                          "productNew.discount":1,
                          orderedOn: 1,
                          paymentMethod: 1,
                          coupon: 1, 
                          "products.productPrice": 1,
                          "products.status":1,
                          "products.quantity":1
                      }
                  }
                  ]);

                  
                var totalRegularPrice = 0;
                var totalDiscountedProductPrice = 0;

                for(let i=0; i<salesData.length; i++){
                  totalRegularPrice = totalRegularPrice + (salesData[i].productNew.regularPrice * salesData[i].products.quantity);
                  totalDiscountedProductPrice = totalDiscountedProductPrice + (salesData[i].products.productPrice * salesData[i].products.quantity);
        }
               var totalDiscountPrice = totalRegularPrice - totalDiscountedProductPrice

               

              



                }else if(receivedData === 'year'){
                  

                  const startOfYear = new Date();
                  startOfYear.setMonth(0); // Set to January
                  startOfYear.setDate(1); // Set to the first day of the year
                  startOfYear.setHours(0, 0, 0, 0); // Set to the beginning of the day
                  
                  const endOfYear = new Date();
                  endOfYear.setMonth(11); // Set to December
                  endOfYear.setDate(31); // Set to the last day of the year
                  endOfYear.setHours(23, 59, 59, 999); // Set to the end of the day

                  var salesData = await order.aggregate([
                    {
                      $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
                      },
                      
                    }, {
                      $match: {
                        orderedOn: {
                          $gte: startOfYear,
                          $lte: endOfYear
                        }
                      }
                    },
                    { $unwind: "$user" },
                    { $sort: { orderedOn: -1 } },
                    { $unwind: "$products" },
                    {
                      $lookup: {
                        from: "products",
                        localField: "products.product",
                        foreignField: "_id",
                        as: "productNew",
                      },
                    },
                    { $unwind: "$productNew" },
                   { 
                     $match: { "products.status": "Delivered" } 
                   },
                    {
                      $project: {
                          orderId: 1,
                          "user.name": 1,
                          "productNew.productName": 1,
                          "productNew.regularPrice":1,
                          "productNew.discount":1,
                          orderedOn: 1,
                          paymentMethod: 1,
                          coupon: 1, 
                          "products.productPrice": 1,
                          "products.status":1,
                          "products.quantity":1
                      }
                  }
                  ]);

                  var totalRegularPrice = 0;
                  var totalDiscountedProductPrice = 0;
  
                  for(let i=0; i<salesData.length; i++){
                    totalRegularPrice = totalRegularPrice + (salesData[i].productNew.regularPrice * salesData[i].products.quantity);
                    totalDiscountedProductPrice = totalDiscountedProductPrice + (salesData[i].products.productPrice * salesData[i].products.quantity);
          }
                 var totalDiscountPrice = totalRegularPrice - totalDiscountedProductPrice
  

                  
                }else if(receivedData === 'day'){
                  

                  const today = new Date();
                  today.setHours(0, 0, 0, 0); 
                  
                  const tomorrow = new Date(today);
                  tomorrow.setDate(today.getDate() + 1);


                  var salesData = await order.aggregate([
                    {
                      $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
                      },
                      
                    }, {
                      $match: {
                        orderedOn: {
                          $gte: today,
                          $lt: tomorrow
                        }
                      }
                    },
                    { $unwind: "$user" },
                    { $sort: { orderedOn: -1 } },
                    { $unwind: "$products" },
                    {
                      $lookup: {
                        from: "products",
                        localField: "products.product",
                        foreignField: "_id",
                        as: "productNew",
                      },
                    },
                    { $unwind: "$productNew" },
                   { 
                     $match: { "products.status": "Delivered" } 
                   },
                    {
                      $project: {
                          orderId: 1,
                          "user.name": 1,
                          "productNew.productName": 1,
                          "productNew.regularPrice":1,
                          "productNew.discount":1,
                          orderedOn: 1,
                          paymentMethod: 1,
                          coupon: 1, 
                          "products.productPrice": 1,
                          "products.status":1,
                          "products.quantity":1
                      }
                  }
                  ]);

                  var totalRegularPrice = 0;
                  var totalDiscountedProductPrice = 0;
  
                  for(let i=0; i<salesData.length; i++){
                    totalRegularPrice = totalRegularPrice + (salesData[i].productNew.regularPrice * salesData[i].products.quantity);
                    totalDiscountedProductPrice = totalDiscountedProductPrice + (salesData[i].products.productPrice * salesData[i].products.quantity);
          }
                 var totalDiscountPrice = totalRegularPrice - totalDiscountedProductPrice
  




                }else if(receivedData === 'all'){


                  var salesData = await order.aggregate([
                    {
                      $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
                      },
                      
                    },
                    { $unwind: "$user" },
                    { $sort: { orderedOn: -1 } },
                    { $unwind: "$products" },
                    {
                      $lookup: {
                        from: "products",
                        localField: "products.product",
                        foreignField: "_id",
                        as: "productNew",
                      },
                    },
                    { $unwind: "$productNew" },
                   { 
                     $match: { "products.status": "Delivered" } 
                   },
                    {
                      $project: {
                          orderId: 1,
                          "user.name": 1,
                          "productNew.productName": 1,
                          "productNew.regularPrice":1,
                          "productNew.discount":1,
                          orderedOn: 1,
                          paymentMethod: 1,
                          coupon: 1, 
                          "products.productPrice": 1,
                          "products.status":1,
                          "products.quantity":1
                      }
                  }
                  ]);

                  var totalRegularPrice = 0;
                  var totalDiscountedProductPrice = 0;
  
                  for(let i=0; i<salesData.length; i++){
                    totalRegularPrice = totalRegularPrice + (salesData[i].productNew.regularPrice * salesData[i].products.quantity);
                    totalDiscountedProductPrice = totalDiscountedProductPrice + (salesData[i].products.productPrice * salesData[i].products.quantity);
          }
                 var totalDiscountPrice = totalRegularPrice - totalDiscountedProductPrice
  





                }
          
         
                res.render("salesReport",{salesData,totalDiscountPrice,totalDiscountedProductPrice})
                  
                } catch (error) {
                  console.error("Error in filter report: ",error);
                  next(error);
                  
                }



}

const filterCustomDateOrder = async (req, res, next)=>{
  

   try {

    const { startingDate, endingDate} = req.body;

const startDate = new Date(startingDate);
const endDate = new Date(endingDate);
endDate.setDate(endDate.getDate() + 1);

var salesData = await order.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
    
  }, {
    $match: {
      orderedOn: {
        $gte: startDate,
        $lt: endDate
      }
    }
  },
  { $unwind: "$user" },
  { $sort: { orderedOn: -1 } },
  { $unwind: "$products" },
  {
    $lookup: {
      from: "products",
      localField: "products.product",
      foreignField: "_id",
      as: "productNew",
    },
  },
  { $unwind: "$productNew" },
 { 
   $match: { "products.status": "Delivered" } 
 },
  {
    $project: {
        orderId: 1,
        "user.name": 1,
        "productNew.productName": 1,
        "productNew.regularPrice":1,
        "productNew.discount":1,
        orderedOn: 1,
        paymentMethod: 1,
        coupon: 1, 
        "products.productPrice": 1,
        "products.status":1,
        "products.quantity":1
    }
}
]);

var totalRegularPrice = 0;
var totalDiscountedProductPrice = 0;

for(let i=0; i<salesData.length; i++){
  totalRegularPrice = totalRegularPrice + (salesData[i].productNew.regularPrice * salesData[i].products.quantity);
  totalDiscountedProductPrice = totalDiscountedProductPrice + (salesData[i].products.productPrice * salesData[i].products.quantity);
}
var totalDiscountPrice = totalRegularPrice - totalDiscountedProductPrice



res.render("salesReport",{salesData, totalDiscountedProductPrice, totalDiscountPrice})
    
   } catch (error) {
       console.error("Error in filterCustomDateOrder: ", error);
       next(error)
    
   }

                      

}

module.exports = {
              loadSalesReport,
              filterReport,
              filterCustomDateOrder
               }