require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()


app.use(cors())

app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :body'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response,next) => {
  const id = request.params.id

  Person.findById(id).then(result => {
    response.json(result)
  })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.countDocuments().then( persons => {
    let now = new Date()
    response.send(`Phonebook has info for ${persons} people <p>${now}</p>`)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id

  Person.findByIdAndDelete(id).then(() => {
    response.status(204).end()
  })
})

app.post('/api/persons', (request,response,next) => {
  const body = request.body

  if(!body.name){
    const error = new Error('name missing')
    return next(error)
  }

  if(!body.number){
    const error = new Error('number missing')
    return next(error)
  }

  if (body.name.length < 3){
    const error = new Error('Name must be at least 3 characters long!')
    return next(error)
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => response.json(savedPerson))
    .catch(error => next(error))

  morgan.token()
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response,next) => {
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'CastError') {
    return response.status(400).json({ error: 'id not found' })
  } else if (error){
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})