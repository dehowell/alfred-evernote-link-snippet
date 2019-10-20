#!/usr/bin/osascript -l JavaScript


function formatRichTextLink(linkText, url) {
return `{\\rtf1\\ansi\\ansicpg1252\\cocoartf1671\\cocoasubrtf600{\\fonttbl\\f0\\fnil\\fcharset0 HelveticaNeue;}{\\colortbl;\\red255\\green255\\blue255;}{\\*\\expandedcolortbl;;}\\vieww12000\\viewh15840\\viewkind0\\deftab720\\pard\\pardeftab720\\partightenfactor0{\\field{\\*\\fldinst{HYPERLINK "${url}"}}{\\fldrslt\\f0\\fs28\\cf0${linkText}}}}`
}


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
          url: url,
          linkAsRtf: formatRichTextLink(title, url)
        }
      }
    })
  });
}