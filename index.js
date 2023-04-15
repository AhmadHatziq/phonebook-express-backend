const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv').config()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

// Register a custom token to display the data sent in HTTP POST requests 
// morgan.token('type', function (req, res) { return req.headers['content-type'] })
morgan.token('posted_data', logJsonPost = (req, res)  => {
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
  }

  next(error)
}

// Unknown endpoint error handler
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Hardcoded data. 
let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456", 
      "toShow": true
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523", 
      "toShow": true
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345", 
      "toShow": true
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122", 
      "toShow": true
    }
]

// Query the schema for all Person objects, transform it and send it to the front-end. 
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// Using the String ID, query the Person schema for matching ID.
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id

    // Query the Person model for the ID and return the person json 
    Person.findById(id)
      .then(person => {
        response.json(person)
      })
      .catch(error => {
        response.status(404).end()
        next(error)
      })
})

// When the frontend/POSTMAN sends a DELETE request, extract the ID (via the URL) and remove from DB.  
app.delete('/api/persons/:id', (request, response) => {
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

  // Generate a random ID from the largest current ID to positive infinity 
  const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(p => p.id))
      : 0
    const randomId = maxId + 1 + Math.floor(Math.random() * 10000)
    return randomId
  }

  // Add a new person when a POST request is made. 
  app.post('/api/persons', (request, response) => {
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

    /*
    // Checks if the name already exists. 
    const exists = persons.some(obj => obj.name === body.name); 
    if (exists) {
        return response.status(400).json({ 
            error: 'name must be unique' 
          })
    }
    */ 
    
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
        response.json(savedPerson)
      })
  })

// Returns the total number of people in the phonebook and time of request. 
app.get('/info', (request, response) => {
    const currentDateTime = new Date() 
    const responseHtml = `
        <p>Phonebook has info for ${persons.length} people</p>
        <p> ${currentDateTime.toString()}  </p>
    `
    response.send(responseHtml)
})

// Use the error handling functions. 
app.use(unknownEndpoint)
app.use(errorHandler)

// Make the server listen on port 3001 or the environment variable (for deployment)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})