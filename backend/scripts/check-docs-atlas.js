require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    const docs = await Document.find({type: { $ne: 'food' }});
    console.log("Documents found:", docs.length);
    console.log(docs.map(d => ({id: d._id, type: d.type, phone: d.phone, date: d.date, hasImage: !!d.image})));
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
