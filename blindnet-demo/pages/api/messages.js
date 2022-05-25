const { connectToDatabase } = require('../../lib/mongodb')
const ObjectId = require('mongodb').ObjectId

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

async function getMessage(req, res) {

    try {

        // Get references to client, db, and collection
        let {db} = await connectToDatabase()
        const messages = db.collection('messages')

        // Messages
        const result = await messages.find({
            to: req.query.recipient
        })
        // console.log(result)
        // await result.forEach(console.dir);
        // console.log(result.toArray())
        // result.toArray().then(arr => {
        //     console.log(arr)
        // })

        // return res.json({
        //     message: result.toArray(),
        //     success: true
        // })

        return res.json({
            message: JSON.parse(JSON.stringify(await result.toArray())),
            success: true
        })
        // await result.forEach(console.dir)
    } catch (e) {
        console.log(`Error: ${e.message}`)
        return res.json({
            message: new Error(e).message,
            success: false,
        });
    }

}

async function sendMessage(req, res) {

    try {

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