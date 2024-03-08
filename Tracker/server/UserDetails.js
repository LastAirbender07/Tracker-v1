const mongoose = require('mongoose');
// const LocSchema = new mongoose.Schema({
//     lat: {
//         type: Number,
//         required: true
//     },
//     long: {
//         type: Number,
//         required: true
//     },
//     time: {
//         type: String,
//         default: Date(Date.now()).toString()
//     }
// },{
//     timestamps: true
// });

const schema = new mongoose.Schema({ lat: Number, long: Number, time: String });
const Loc = mongoose.model('Loc', schema);

module.exports = Loc;