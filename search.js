#!/usr/bin/osascript -l JavaScript


function run(argv) {
  var query = argv[0];

  var results = Application("Evernote").findNotes(`intitle:${query}`);
  return JSON.stringify({
    variables: {
      title: "",
      url: ""
    },
    items: results.map(note => {
      let title = note.title();
    let url = note.noteLink();
      return {
        uid: note.guid(),
        title: title,
        arg: url,
        variables: {
          title: title,
          url: url
        }
      }
    })
  });
}