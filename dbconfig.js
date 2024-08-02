const mongoose = require("mongoose");

dbconfig = ()=>{
   try {
    
       mongoose.connect('mongodb://localhost:27017/jobportal')
       .then(() => console.log('Connected to MongoDB...job portal'))
} catch (error) {
    console.log(error,"error connecting to mongodb")


}
    
} 
module.exports = dbconfig;