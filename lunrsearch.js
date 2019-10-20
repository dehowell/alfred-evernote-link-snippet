#!/Users/dave/.nvm/versions/node/v8.14.0/bin/node

const fs = require('mz/fs'),
      lunr = require('lunr');

const indexFile = 'evernote-index.json';
const docsFile = 'evernote-docs.json';


function formatRichTextLink(linkText, url) {
  return `{\\rtf1\\ansi\\ansicpg1252\\cocoartf1671\\cocoasubrtf600{\\fonttbl\\f0\\fnil\\fcharset0 HelveticaNeue;}{\\colortbl;\\red255\\green255\\blue255;}{\\*\\expandedcolortbl;;}\\vieww12000\\viewh15840\\viewkind0\\deftab720\\pard\\pardeftab720\\partightenfactor0{\\field{\\*\\fldinst{HYPERLINK "${url}"}}{\\fldrslt\\f0\\fs28\\cf0${linkText}}}}`
}

async function init() {
  if (await Promise.all([fs.access(indexFile), fs.access(docsFile)])) {
    let index = await fs.readFile(indexFile)
      .then(data => lunr.Index.load(JSON.parse(data)))
      .catch(console.error);

    let corpus = await fs.readFile(docsFile)
      .then(data => {
        let docs = new Map();
        JSON.parse(data).forEach(doc => {
          docs.set(doc.guid, doc);
        })

        return docs;
      })
      .catch(console.error);

    return {corpus: corpus, index: index};
  }
}

async function search(query) {
  let {corpus, index} = await init();
  let results = index.search(query);
  return results.map(result => corpus.get(result.ref));
}


function convertToAlfredFormat(results) {
  return {
    variables: { title: "", url: "" },
    items: results.map(hit => ({
      uid: hit.guid,
      title: hit.title,
      arg: hit.guid,
      variables: {
        title: hit.title,
        url: hit.url,
        linkAsRtf: formatRichTextLink(hit.title, hit.url)
      }
    }))
  }
}

search(process.argv[2])
  .then(convertToAlfredFormat)
  .then(JSON.stringify)
  .then(console.log)
  .catch(console.error);