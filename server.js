const { ApolloServer, gql } = require('apollo-server-express')
const http = require('http')
const { initMongo, M } = require('./mongoose')

const { composeWithMongoose } = require('graphql-compose-mongoose/node8')
const { schemaComposer } = require('graphql-compose')

const app = require('express')()

initMongo()
const Department = M('department')
const Employee = M('employee')
const Company = M('company')

const CompanyTC = composeWithMongoose(Company, {})

schemaComposer.Query.addFields({
  companyById: CompanyTC.getResolver('findById'),
  companyByIds: CompanyTC.getResolver('findByIds'),
  companyOne: CompanyTC.getResolver('findOne'),
  companyMany: CompanyTC.getResolver('findMany'),
  companyCount: CompanyTC.getResolver('count'),
});

schemaComposer.Mutation.addFields({
  companyCreateOne: CompanyTC.getResolver('createOne'),
  companyCreateMany: CompanyTC.getResolver('createMany'),
  companyUpdateById: CompanyTC.getResolver('updateById'),
  companyUpdateOne: CompanyTC.getResolver('updateOne'),
  companyUpdateMany: CompanyTC.getResolver('updateMany'),
  companyRemoveById: CompanyTC.getResolver('removeById'),
  companyRemoveOne: CompanyTC.getResolver('removeOne'),
  companyRemoveMany: CompanyTC.getResolver('removeMany'),
})

const EmployeeTC = composeWithMongoose(Employee, {})
const DepartmentTC = composeWithMongoose(Department, {})

CompanyTC.addRelation('employees', {
  resolver: () => EmployeeTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: source => source.employees || []
  },
  projection: { employees: true },
})

EmployeeTC.addRelation('department', {
  resolver: () => DepartmentTC.getResolver('findById'),
  prepareArgs: {
    _id: source => source.department || []
  },
  projection: { department: true },
})

const graphqlSchema = schemaComposer.buildSchema()

const server = new ApolloServer({ schema: graphqlSchema })
server.applyMiddleware({ app })

const httpServer = http.createServer(app)
httpServer.listen({ port: 3040 }, () => {
  console.log(` Server ready at http://0.0.0.0:${3040}${server.graphqlPath}`)
  console.log(` Subscriptions ready at ws://0.0.0.0:${3040}${server.subscriptionsPath}`)
})
