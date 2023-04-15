const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

// Register a custom token to display the data sent in HTTP POST requests 
// morgan.token('type', function (req, res) { return req.headers['content-type'] })
morgan.token('posted_data', (req)  => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" - :posted_data '))

// Generic error handler 
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    let errorMessage = `Number must be of the form: {2_or_3_digits}-{5_digits}. Eg 12-12345 ${error.message}`
    return response.status(400).send({ error: errorMessage })
  }

  next(error)
}

// Unknown endpoint error handler
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Query the schema for all Person objects, transform it and send it to the front-end. 
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})  

// Using the String ID, query the Person schema for matching ID.
app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  // Query the Person model for the ID and return the person json 
  Person.findById(id)
    .then(person => {
      response.json(person)
    })
    .catch(error => {
      next(error)
    })
})

// When the frontend/POSTMAN sends a DELETE request, extract the ID (via the URL) and remove from DB.  
app.delete('/api/persons/:id', (request, response, next) => {
  const id = String(request.params.id)

  console.log(`Attempting to delete person ID: ${id}`)

  // Use findByIdAndRemove 
  Person.findByIdAndRemove(id)
    .then(result => {
      console.log(`Successfully deleted person ${result}`)
      response.status(204).end()
    })
    .catch(error => next(error))
})

// Generate a random ID from the largest current ID to positive infinity. 
// No longer in use as ID generation is done by the DB, not the backend. 
/*
const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(p => p.id))
    : 0
  const randomId = maxId + 1 + Math.floor(Math.random() * 10000)
  return randomId
}
*/

// The PUT endpoint is to update any existing Person. 
// Uses the findByIdAndUpdate() method, which requires a JS object, not Person. 
// Is called by the front-end when there is an existing person with the same name. 
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body 
  const id = request.params.id 

  // Create the updated object 
  const person = {
    name: body.name, 
    number: body.number, 
    toShow: body.toShow 
  }

  // Update the DB. 
  // By default, updatedPerson will be the old version. We set new:true to get the updated version. 
  Person.findByIdAndUpdate(id, person, { new: true })
    .then(updatedPerson => {
      console.log(`Update: ${JSON.stringify(updatedPerson)}`)
      response.json(updatedPerson)
    })
    .catch(error => next(error))
  
})

// Create a new person in the DB. 
app.post('/api/persons', (request, response, next) => {
  const body = request.body 

  // Check if there is missing name 
  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  // Checks if there is missing number 
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  // Create a new person object. ID is now handled by the backend. 
  const newPerson = new Person({
    name: body.name, 
    number: body.number, 
    toShow: true 
  })

  // Save person to DB. 
  newPerson
    .save()
    .then(savedPerson => {
      console.log(`Created new person: ${JSON.stringify(savedPerson)}`)
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

// Returns the total number of people in the phonebook and time of request. 
app.get('/info', (request, response, next) => {
  const currentDateTime = new Date() 

  // Queries the DB to get the total row counts 
  Person.find({}).then(persons => {
    const totalNumber = persons.length 
    
    const responseHtml = 
      `
      <p>Phonebook has info for ${totalNumber} people</p>
      <p> ${currentDateTime.toString()}  </p>
      `
    response.send(responseHtml)
  })
    .catch(error => next(error))
})

// Use the error handling functions. 
app.use(unknownEndpoint)
app.use(errorHandler)

// Make the server listen on port 3001 or the environment variable (for deployment)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})