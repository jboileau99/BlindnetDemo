// Initialize next.js server
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {

            // Initiate Blindnet Session
            const Blindnet = require('@blindnet/sdk-node')
            const appKey = 'GGGO67rP8dbKV8Xo+d60tpQFdlrdyuWtV6EmARrjYaSpwDCM2ZvnaN6HRlrZI8WX+cNT+I8WStY4PN4Mx0LyLg=='
            const appId = '088cb9cc-50b1-450c-901d-2c59a8819d6c'
            const blindnet = await Blindnet.init(appKey, appId, 'https://test.blindnet.io')

            // Create tokens for a registered user and an anonymous user
            const userId = 'your_user_id'
            const groupId = 'test-group'
            const regUserToken = await blindnet.createUserToken(userId, groupId)
            const anonUserToken = await blindnet.createTempUserToken(groupId)

            // // Be sure to pass `true` as the second argument to `url.parse`.
            // // This tells it to parse the query portion of the URL.
            // const parsedUrl = parse(req.url, true)
            // const { pathname, query } = parsedUrl
            //
            // if (pathname === '/a') {
            //     await app.render(req, res, '/a', query)
            // } else if (pathname === '/b') {
            //     await app.render(req, res, '/b', query)
            // } else {
            //     await handle(req, res, parsedUrl)
            // }
        } catch (err) {
            // console.error('Error occurred handling', req.url, err)
            // res.statusCode = 500
            // res.end('internal server error')
        }
    }).listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready on http://${hostname}:${port}`)
    })
})

