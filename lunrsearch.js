const fs = require('mz/fs'),
      lunr = require('lunr');

const indexFile = 'evernote-index.json';
const docsFile = 'evernote-docs.json';

async function init() {
  if (await Promise.all([fs.access(indexFile), fs.access(docsFile)])) {
    let index = await fs.readFile(indexFile)
      .then(data => lunr.Index.load(JSON.parse(data)))
      .catch(console.error);

    let docs = await fs.readFile(docsFile)
      .then(data => {
        let docs = new Map();
        JSON.parse(data).forEach(doc => {
          docs.set(doc.guid, doc);
        })

        return docs;
      })
      .catch(console.error);

      let results = index.search("write");
      return results.map(result => docs.get(result.ref));
  }
}

init()
  .then(JSON.stringify)
  .then(console.log)
  .catch(console.error);