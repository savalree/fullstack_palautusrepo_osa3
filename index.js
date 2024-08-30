require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')

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

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if(person){
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    const p = persons.length
    let now = new Date()
    response.send(`Phonebook has info for ${p} people <p>${now}</p>`)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id

    Person.findByIdAndDelete(id).then(result =>{
        response.status(204).end()
    })
})

app.post('/api/persons', (request,response,next) => {
    const body = request.body

    if(!body.name){
        const error = new Error('name missing');
        return next(error);
    }

    if(!body.number){
        const error = new Error('number missing');
        return next(error);
    }

    // if(persons.find(person => person.name === body.name)){
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }

    const person = new Person({
        id: Math.random(0,1000),
        name: body.name,
        number: body.number
    })
    
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))

    morgan.token()
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    return response.status(400).send({ error: error.message })

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})