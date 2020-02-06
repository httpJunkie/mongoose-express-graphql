const mongoose = require('mongoose')
const { model, Schema } = mongoose

module.exports = {
  M: modelName => (mongoose.model(modelName)),
  initMongo: () => {
    mongoose.connect('mongodb://localhost:27017/relation', { useNewUrlParser: true })
    const Department = model('department',
      new Schema({
        name: String,
        location: String
      }))

    const Employee = model('employee',
      new Schema({
        firstName: String,
        lastName: String,
        mobile: String,
        department: { type: Schema.Types.ObjectId, ref: 'department' }
      }))

    const Company = model('company',
      new Schema({
        name: String,
        address: String,
        employees: [{ type: Schema.Types.ObjectId, ref: 'employee' }]
      }))
  }
}

