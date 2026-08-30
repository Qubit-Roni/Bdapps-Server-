const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/bdapps_auth').then(async () => {
  const db = mongoose.connection.db;
  const result = await db.collection('users').updateOne({ phone: '01734042131' }, { $set: { role: 'admin', status: 'active' } });
  console.log('Update result:', result);
  process.exit(0);
}).catch(console.error);
