const order = require("../models/orderModel");
const user = require("../models/userModel");
const product = require("../models/productModel");




const loadSalesReport = async(req, res)=>{
                console.log("Entered into loadSalesReport in adminSalesReportController");

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

                console.log("This is the final Data : ",salesData);

                console.log("This is total Price: ",totalRegularPrice);
                console.log("This is totalDiscountedProductPrice: ",totalDiscountedProductPrice);
                console.log("This is the overall discount: ",totalDiscountPrice)


                
                res.render("salesReport",{salesData, totalDiscountedProductPrice, totalDiscountPrice})
                 
}

const filterReport = async (req, res)=>{
                console.log("Entered into fileterReport in salesReportController");
                const receivedData =  req.body.timePeriod;
                console.log("This is received data: ", receivedData);

                if(receivedData === 'week'){
                  console.log("Entered in to week");

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
                  console.log("Entered into the month");


                  const startOfMonth = new Date();
                  startOfMonth.setDate(1); // Set to the first day of the current month
                  startOfMonth.setHours(0, 0, 0, 0); // Set to the beginning of the day
                  
                  const endOfMonth = new Date();
                  endOfMonth.setMonth(endOfMonth.getMonth() + 1); // Move to the next month
                  endOfMonth.setDate(0); // Set to the last day of the current month
                  endOfMonth.setHours(23, 59, 59, 999); // Set to the end of the day

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
                  console.log("Entered in to year ");

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
                  console.log("Entered into day ");

                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Set to the beginning of today
                  
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
          
          console.log("This si the salesData at the end: ",salesData)

          console.log("This is total Price: ",totalRegularPrice);
          console.log("This is totalDiscountedProductPrice: ",totalDiscountedProductPrice);
          console.log("This is the overall discount: ",totalDiscountPrice)
                res.render("salesReport",{salesData,totalDiscountPrice,totalDiscountedProductPrice})



}

const filterCustomDateOrder = async (req, res)=>{
  console.log("Entered into filter cusotom date order in salesReportController");
//console.log("This is the received data: ",req.body);
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


console.log("This si the custom sales data: ",salesData)
res.render("salesReport",{salesData, totalDiscountedProductPrice, totalDiscountPrice})

                      

}

module.exports = {
              loadSalesReport,
              filterReport,
              filterCustomDateOrder
               }