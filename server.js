const mongoose = require('mongoose')
const { model, Schema } = mongoose

const app = require('express')()

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

app.use("/", async (req, res) => {

  await Department.remove({})
  await Department.create({
    name: 'IT Department',
    location: 'Biliding A'
  })
  await Department.create({
    name: 'Marketng Department',
    location: 'Biliding B'
  })

  await Employee.remove({})
  await Employee.create({
    firstName: 'eric',
    lastName: 'bishard',
    mobile: '321-123-0001',
    department: await Department.findOne({ name: 'IT Department' })
  })
  await Employee.create({
    firstName: 'gina',
    lastName: 'bishard',
    mobile: '321-123-0002',
    department: await Department.findOne({ name: 'Marketng Department' })
  })

  await Company.remove({})
  await Company.create({
    name: 'Bigco Ink',
    address: '123 Anywhere St',
    employees: await Employee.find()
  })

  res.json({
    deartments: await Department.find(),
    employees: await Employee.find(),
    employeesWithDepartmentNested: await Employee.find().populate('department', 'name'),
    company: await Company.find(),
    companyWithEmployeesAndDepartmentsNested: 
      await Company.find()
        .populate(
          {
            path: 'employees', 
            model: 'employee', 
            populate: {
              path: 'department', 
              model: 'department'
            }
          }),
  })
})
app.listen(7777, () => console.log("running on 7777"))