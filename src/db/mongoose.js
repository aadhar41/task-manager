const mongoose = require('mongoose');
 
mongoose.connect(String(process.env.MONGODB_URL) , {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true, 
    useFindAndModify: false
});

