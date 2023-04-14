const mongoose = require('mongoose')

// Define the usage. 
const usage = `Usage:
node mongo.js <Password>
node mongo.js <Password> <PersonName> <PersonNumber>`

// Check the number of arguments.
// First argument is node.exe, second argument is the file mongo.js
// 3rd argument will be the password. 
// If there are  3 arguments, show the phonebook 
// If there are 5 arguments, add the personName and number to the db.  
if (process.argv.length != 3 && process.argv.length != 5) {
  console.log(`Incorrect number of arguments. `)
  console.log(usage)
  process.exit(1)
} 

// Define the DB & URL. 
const password = process.argv[2]
const dbName = 'phonebookApp'
const url = `mongodb+srv://hatziq:${password}@cluster0.d3igiqp.mongodb.net/${dbName}?retryWrites=true&w=majority`

// Connect to the database. 
mongoose.set('strictQuery',false)
mongoose.connect(url)

// Create schema of People. number represents a phoneNumber. 
const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
  toShow: Boolean
})

// Create the model using the schema
const Person = mongoose.model('Person', personSchema)

// Function to get maxID from DB. 
const getMaxId = () => {
  
}

// If length is 3, only show the contents of the database. 
if (process.argv.length === 3) { 

  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })

} else if (process.argv.length === 5) {

  // Retrieve the person arguments  
  const personName = process.argv[3]
  const personNumber = process.argv[4]

  // Commented out as not sure how to implement currentId
  /*
  let currentMaxId = -1
  Person.find({}).then(result => {
    if (result.length === 0) {
      currentMaxId = 0
    } else {
      currentMaxId = Number(result[0].id) 
  }})

  console.log(currentMaxId)
  */ 

  // Create & save the person 
  const newPerson = new Person({
    id:1, 
    name: personName,
    number: personNumber,
    toShow: true
  })
  newPerson.save().then(result => {    
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })

} else {
  console.log('Error.')
  mongoose.connection.close()
}





