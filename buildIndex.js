#!/usr/bin/env node
const fs = require('mz/fs'),
      lunr = require('lunr'),
      osa = require('./osa');

const indexFile = 'evernote-index.json';
const docsFile = 'evernote-docs.json';

// I could make this faster by only pulling notes created since last indexing,
// but what about notes that get deleted?
let notes = osa(() => {
    return Application("Evernote").findNotes().map(note => ({
      guid: note.guid(),
      title: note.title(),
      url: note.noteLink()
    }));
});

notes().then(documents => {

  // Cache the note metadata
  fs.writeFile(docsFile, JSON.stringify(documents))
    .then(_ => console.log('Wrote out fields to return.'))
    .catch(err => { throw err });

  // Build the search index for note metadata
  let index = lunr(function() {
    this.ref('guid');
    this.field('title');
    documents.forEach(doc => this.add(doc), this);
  })

  fs.writeFile(indexFile, JSON.stringify(index))
    .then(_ => console.log('Wrote out search index.'))
    .catch(err => { throw err });
});

