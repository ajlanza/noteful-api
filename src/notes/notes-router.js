const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()

module.exports = notesRouter
const jsonParser = express.json()

const serializeNote = note => ({
  id: note.id,
  name: xss(note.name),
  content: xss(note.content),
  date_modified: note.date_modified,
  folder: note.folder,
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes.map(serializeNote))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name, content, folder, date_modified } = req.body
    const newNote = { name, content, folder}

    for(const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      
    newNote.date_modified = date_modified;

    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note))
      })
      .catch(next)
  })

  notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
      NotesService.getById(
        req.app.get('db'),
        req.params.note_id
      )
        .then(note => {
          if(!note){
            return res
              .status(404)
              .json({ error: { message: `Note doesn't exist` } })
          }
          res.note = note
          next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
      res.json({
        id: res.note.id,
        name: xss(res.note.name),
        content: xss(res.note.content),
        folder: xss(res.note.folder),
        date_modified: res.note.date_modified
      })
    })
    .delete((req, res, next) => {
      NotesService.deleteNote(
        req.app.get('db'),
        req.params.note_id
      )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
    })

module.exports = notesRouter