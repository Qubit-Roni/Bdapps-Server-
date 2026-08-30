const mongoose = require('mongoose');
const Document = require('./models/Document');

mongoose.connect('mongodb://localhost:27017/healthcare_plus')
.then(async () => {
    const docs = await Document.find({type: { $ne: 'food' }});
    console.log(docs.map(d => ({id: d._id, type: d.type, phone: d.phone, date: d.date, hasImage: !!d.image})));
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
