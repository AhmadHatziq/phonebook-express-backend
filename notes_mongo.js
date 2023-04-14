const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

// const url =
//   `mongodb+srv://fullstack:${password}@cluster0.o1opl.mongodb.net/?retryWrites=true&w=majority`
const url = `mongodb+srv://hatziq:${password}@cluster0.d3igiqp.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

/* 
// Creates a new Note 
const note = new Note({
  content: 'HTML is Easy',
  important: true,
})
// Saves the new Note 
note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})
*/ 

// Searches for Notes stored
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})