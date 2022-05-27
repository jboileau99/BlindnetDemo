/**
 * Simple Next.js app for connecting to Blindnet, sending and receiving encrypted messages.
 */

import {useEffect, useState} from 'react';
import {Blindnet} from '@blindnet/sdk-javascript'
import {createTempUserToken, createUserToken} from '@blindnet/token-generator'

// Blindnet app info - Test App
const appId = '3544e7cd-64a9-41b7-88dc-397bfdaeeaf3'
const appKey = 'zB5IiU0xzkVdsH4NMXxrF90ZISL5kJnTHlt7h/Wbi/qVhch7Fw8J5AQ5j2PazaG5q114uApZRH4X1/kTKVx0Cw=='
const endpoint = 'https://test.blindnet.io'
const groupId = 'test-group'

// App states
const AppStates = {
    LOGIN: 0,
    SEND: 1,
    RECEIVE: 2,
}

export default function Home() {

    // State to handle what components to show
    const [appState, setAppState] = useState(AppStates.LOGIN)

    // Sender/Recipient Variables
    const [userId, setUserId] = useState('')
    const [userPwd, setUserPwd] = useState('')
    const [loggedInUser, setLoggedInUser] = useState('')
    const [recipientId, setRecipientId] = useState('')
    const [token, setToken] = useState('')
    const [getMessages, setGetMessages] = useState(false)
    const [displayMessages, setDisplayMessages] = useState([])

    // Data variables
    const [data, setData] = useState('')

    /**
     * Encrypt some data using the Blindnet SDK
     * @returns {Promise<{dataId: string, encryptedData: ArrayBuffer}>}
     */
    async function encryptData() {

        // Get token for sending to recipient
        const tempToken = await createTempUserToken(groupId, appId, appKey)

        // Get a blindnet instance
        const tempBlindnet = Blindnet.init(tempToken, endpoint)

        // Encrypt the data and return promise
        return tempBlindnet.capture(data).forUser(recipientId).encrypt()
    }

    /**
     * Decrypt some encrypted data using the Blindnet SDK
     * @param encryptedData
     * @returns {Promise<string|JsonObj|File|ArrayBuffer>}
     */
    async function decryptData(encryptedData) {

        // Get a blindnet instance using token of logged in user
        const blindnet = Blindnet.init(token, endpoint)

        // Decrypt data and return promise
        const { data, metadata } = await blindnet.decrypt(toArrayBuffer(encryptedData.data))
        return data

    }

    /**
     * Get an array of decrypted message promises
     * @param encryptedData
     * @returns {*}
     */
    function decryptArray(encryptedData) {
        return encryptedData.message.map(message => decryptData(message.body))
    }

    /**
     * Encrypt message for a certain user then call POST endpoint to store in DB
     * @returns {Promise<void>}
     */
    async function send() {

        // Encrypt message
        encryptData()
            .then(async encryptedText => {

                // Message structure
                let message = {
                    to: recipientId,
                    from: loggedInUser,
                    body: toBuffer(encryptedText.encryptedData)
                }

                // Send request for server to save the message
                let response = await fetch('/api/messages', {
                    method: 'POST',
                    body: JSON.stringify(message)
                })
                let resp = await response.json()

                if (resp.success) {
                    // Clear fields
                    setRecipientId('')
                    setData('')
                } else {
                    // Do some kind of error display on the UI here
                    console.log(`Error sending message: ${resp.message}`)
                }

            }, e => {})


    }

    /**
     * Connect a user to Blindnet
     * @returns {Promise<void>}
     */
    async function login() {

        // Get token for user and init blindnet
        const token = await createUserToken(userId, groupId, appId, appKey)
        const blindnet = Blindnet.init(token, endpoint)

        // Connect user to blindnet
        const { blindnetSecret } = await Blindnet.deriveSecrets(userPwd)
        blindnet.connect(blindnetSecret)
            .then(() => {
                setAppState(AppStates.SEND)
                setToken(token)
                setLoggedInUser(userId)
            }, async e => {console.log("Invalid password")})

    }

    /**
     * Hook to asynchronously render received messages for the logged-in user
     */
    useEffect(() => {

        // Only update if user clicked receive button
        if (getMessages) {

            const fetchData = async () => {

                // Get array of messages and start decrypting
                const response = await fetch('/api/messages' + "?" + new URLSearchParams({recipient: loggedInUser}))
                const json = await response.json()
                const decrypted = decryptArray(json)

                // Rebuild the messages array once all data has been decrypted
                Promise.all(decrypted).then(messages => {
                    json.message.forEach((m, i) => {
                        m.body = messages[i]
                    })
                    setDisplayMessages(json.message)
                })
            }

            fetchData()
            setGetMessages(false)
        }

    }, [getMessages])

    return (
        <div className="container">
            <h1 className="title">Welcome to Blindnet!</h1>

            {/* Login/Create Account Block */}
            { appState === AppStates.LOGIN ? (
                <div className="grid">
                    <p className="prompt">Please login or create an account</p><hr/>
                    <p className="prompt">Username</p><hr/>
                    <input className="textEntree" type="text" onInput={event => setUserId(event.target.value)}/><hr/>
                    <p className="prompt">Password</p><hr/>
                    <input className="textEntree" type="password" onInput={event => setUserPwd(event.target.value)}/><hr/>
                    <div className="grid">
                        <button className="simpleButton" onClick={login}>Login</button>
                    </div>
                </div>) : null
            }

            {/* Send/Receive Selection Block */}
            { appState != AppStates.LOGIN ? (
                <div>
                    <p className="prompt">Send a messages or check yours?</p>
                    <div className="grid">
                    <button className="simpleButton" onClick={() => {setAppState(AppStates.SEND)}}>Send</button>
                    <button className="simpleButton" onClick={() => {
                        setAppState(AppStates.RECEIVE)
                        setGetMessages(true)
                    }}>Receive</button>
                    </div>

                </div>
            ): null
            }

            {/* Send Block */}
            { appState === AppStates.SEND ? (
                <div className="grid">
                    <p className="prompt">Who would you like to send to?</p><hr/>
                    <input className="textEntree" type="text" value={recipientId} onInput={event => setRecipientId(event.target.value)}/><hr/>
                    <p className="prompt">Enter your message below:</p><hr/>
                    <input className="textEntree" type="text" value={data} onInput={event => setData(event.target.value)}/><hr/>
                    <button className="simpleButton" onClick={send}>Send</button>
                </div>) : null
            }

            {/* Receive Block */}
            { appState === AppStates.RECEIVE ? (
                <div className="grid">
                    <p className="prompt">Your Messages:</p><hr/>
                    <ol>
                        {
                            displayMessages.map((message, i) => (
                                <li key={i}>{`From: ${message.from} | Content: ${message.body}`}</li>
                            ))}
                    </ol>

                </div>) : null
            }

            <style jsx>{`
              .container {
                min-height: 100vh;
                padding: 0 0.5rem;
                display: flex;
                flex-direction: column;
                align-items: center;
              }

              main {
                padding: 5rem 0;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
              }

              footer {
                width: 100%;
                height: 100px;
                border-top: 1px solid #eaeaea;
                display: flex;
                justify-content: center;
                align-items: center;
              }

              footer img {
                margin-left: 0.5rem;
              }

              footer a {
                display: flex;
                justify-content: center;
                align-items: center;
              }

              a {
                color: inherit;
                text-decoration: none;
              }

              .title a {
                color: #0070f3;
                text-decoration: none;
              }

              .title a:hover,
              .title a:focus,
              .title a:active {
                text-decoration: underline;
              }

              .title {
                margin: 0;
                line-height: 1.15;
                font-size: 4rem;
              }

              .title,
              .description {
                text-align: center;
              }

              .description {
                line-height: 1.5;
                font-size: 1.5rem;
              }

              .textEntree {
                margin: auto;
                display: block;
              }
              
              .simpleButton {
                margin: auto;
                display: block;
                margin: 20px;
              }
              
              .prompt {
                font-size: 1.1rem;
              }
              
              hr {
                width: 100%;
                flex-basis: 100%;
                height: 0;
                margin: 0;
                border: none;
              }

              code {
                background: #fafafa;
                border-radius: 5px;
                padding: 0.75rem;
                font-size: 1.1rem;
                font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
                DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
              }

              .grid {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-wrap: wrap;

                max-width: 800px;
                margin-top: 0rem;
              }

              .card {
                flex-basis: 45%;
                padding: 1.5rem;
                text-align: center;
                color: inherit;
                text-decoration: none;
                border: 2px solid #eaeaea;
                border-radius: 10px;
                transition: color 0.15s ease, border-color 0.15s ease;
              }

              .card:hover,
              .card:focus,
              .card:active {
                color: #0070f3;
                border-color: #0070f3;
              }

              .card h3 {
                margin: 0 0 1rem 0;
                font-size: 1.5rem;
              }

              .card p {
                margin: 0;
                font-size: 1.25rem;
                line-height: 1.5;
              }

              .logo {
                height: 1em;
              }

              @media (max-width: 600px) {
                .grid {
                  width: 100%;
                  flex-direction: column;
                }
              }
            `}</style>

            <style jsx global>{`
              html,
              body {
                padding: 0;
                margin: 0;
                font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
                sans-serif;
              }

              * {
                box-sizing: border-box;
              }
            `}</style>
        </div>
    )

}

/**
 * Helper function for converting ArrayBuffer to Buffer
 * @param ab
 * @returns {Buffer}
 */
function toBuffer(ab) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

/**
 * Helper function for converting Buffer to ArrayBuffer
 * @param buf
 * @returns {ArrayBuffer}
 */
function toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}