const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/nodeexp', {
    useNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false
})
.then(() => console.log('Connection Successful.'))
.catch((err) => console.log(err));