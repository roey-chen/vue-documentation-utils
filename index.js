// Import parser function
const fs = require("fs")
const path = require("path")
const { parser } = require('@vuese/parser')
const { Render } = require('@vuese/markdown-render')

// Read vue file content
const statFile = (pathToFileOrDirectory) => {
  return new Promise((resolve, reject) => {
    fs.lstat(pathToFileOrDirectory, (error, stats) => {
      if (error){
        reject(error)
        return
      }
      resolve({ isDirectory: stats.isDirectory() })
    })
  })
}

const collectComponents = (pathToFileOrDirectory) => {
  return new Promise((resolve, reject) => {
    statFile(pathToFileOrDirectory).then(({ isDirectory }) => {
      if (isDirectory) {
        fs.readdir(pathToFileOrDirectory, { encoding: 'utf-8', withFileTypes: false }, (err, files) => {
          resolve(files.map((value) => path.join(pathToFileOrDirectory, value)).filter((value) => value.match(/^.+\.vue\/?$/g)))
        })
      } else {
        resolve([pathToFileOrDirectory])
      }
    })
  })
}

const renderMarkdown = (source) => {
  const parserRes = parser(source)
  const r = new Render(parserRes)
  r.render() 
  return r.renderMarkdown()
}

// Parse and get the result using the parser function
async function main () {
  let componentsFiles = []
  const pathToFileOrDirectory = process.argv.length > 2 ? process.argv[2] : 'example.vue'
  await collectComponents(pathToFileOrDirectory).then((componentsFiles) => {
    componentsFiles.forEach((file) => {
      try {
        const source = fs.readFileSync(file, 'utf-8')
        const markdown = renderMarkdown(source)
        console.log(markdown.content)
      } catch (err) {
        console.error(file)  
        console.error(err)  
      }
    })
  }).catch(error => console.error(error))
}

try {
  main()
} catch (err) {
  console.error(err)
}

