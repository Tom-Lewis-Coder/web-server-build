const http = require('http')
const path = require('path')
const fs = require('fs')
const fsPromises = require('fs').promises

const logEvents = require('./logEvents')
const EventEmitter = require('events')
class Emitter extends EventEmitter {}

const myEmitter = new Emitter()

const PORT = process.env.PORT || 3500

const serveFile = async (filePath, contentType, response) => {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8')
        response.writeHead(200, {'Content-Type': contentType})
        response.end(data)
    } catch (err) {
        console.log(err)
        response.statusCode = 500
        response.end()
    }
}

const server = http.createServer((req, res) => {
    console.log(req.url, req.method)

    const extension = path.extname(req.url)

    let contentType;

    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        default:
            contentType = 'text/html';
    }

    let filePath = 
        contentType === 'text/html' && req.url === '/' 
            ? path.join(__dirname, 'views', 'index.html') 
            : contentType === 'text/html' && req.url.slice(-1) === '/' 
                ? path.join(__dirname, 'views', req.url, 'index.html') 
                : contentType === 'text/html' 
                    ? path.join(__dirname, 'views', req.url) 
                    : path.join(__dirname, req.url)

    if (!extension && req.url.slice(-1) !== '/') filePath += '.html'

    const fileExists = fs.existsSync(filePath)

    if (fileExists){
        serveFile(filePath, contentType, res)
    } else {
        switch(path.parse(filePath).base){
            case 'old-page.html':
                Response.writeHead(301, {'Location': '/new-page.html'});
                res.end();
                break;
            case 'www-page.html':
                Response.writeHead(301, {'Location': '/'});
                res.end();
                break;
            default:
                serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res)
        }
    }
})

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Alternatives to switch (extension) statement on ln 29

//Potential too large

// let path
    // if (req.url === '/' || req.url === 'index.html'){
    //     res.statusCode = 200
    //     res.setHeader('Content-Type', 'text/html')
    //     path = path.join(__dirname, 'views', 'iindex.html')
    //     fs.readFile(path, 'utf8', (err, data) => {
    //         res.end(data)
    //     })
    // }
    
//Potential too large
    //     switch (req.url) {
    //         case '/':
    //             res.statusCode = 200
    //             path = path.join(__dirname, 'views', 'index.html')
    //             fs.readFile(path, 'utf8', (err, data) => {
    //             res.end(data)
    //     })
    //     break
    // }
