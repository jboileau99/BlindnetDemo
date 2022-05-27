/**
 * Server endpoints for storing and retrieving encrypted messages from MongoDB
 */

const { connectToDatabase } = require('../../lib/mongodb')
const ObjectId = require('mongodb').ObjectId

/**
 * Setup GET and POST endpoints
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
export default async function handler(req, res) {

    switch(req.method) {

        case 'GET': {
            return getMessage(req, res);
        }

        case 'POST': {
            return sendMessage(req, res)
        }

    }

}

/**
 * GET endpoint handler
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getMessage(req, res) {

    try {

        // Get references to client, db, and collection
        let { db } = await connectToDatabase()
        const messages = db.collection('messages')

        // Pull all the messages to the currently logged in user
        const result = await messages.find({
            to: req.query.recipient
        })

        // Return JSON response with all messages
        return res.json({
            message: JSON.parse(JSON.stringify(await result.toArray())),
            success: true
        })

    } catch (e) {
        console.log(`Error: ${e.message}`)
        return res.json({
            message: new Error(e).message,
            success: false,
        });
    }

}

/**
 * POST endpoint handler
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function sendMessage(req, res) {

    try {

        // Get references to client, db, and collection
        let { db } = await connectToDatabase()
        await db.collection('messages').insertOne(JSON.parse(req.body))

        return res.json({
            message: 'Message added successfully',
            success: true
        })

    } catch (e) {
        return res.json({
            message: new Error(e).message,
            success: false
        })
    }
}