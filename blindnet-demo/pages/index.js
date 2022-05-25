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

    // Current state
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

    async function encryptData() {

        // Get token for sending to recipient
        const tempToken = await createTempUserToken(groupId, appId, appKey)

        // Get a blindnet instance
        const tempBlindnet = Blindnet.init(tempToken, endpoint)

        // Encrypt the text or file and return promise
        return tempBlindnet.capture(data).forUser('justin').encrypt()
    }

    async function decryptData(encryptedData) {

        // Have to create/rename variables to have both dataToEncrypt (send) and dataToDecrypt (receive)
        const blindnet = Blindnet.init(token, endpoint)
        const { data, metadata } = await blindnet.decrypt(toArrayBuffer(encryptedData.data))

        return data

    }

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
                    setUserId('')
                    setData('')
                } else {
                    // Do some kind of error display on the UI here
                    console.log(`Error sending message: ${resp.message}`)
                }

            }, e => {})


    }

    /**
     * Get an array of decrypted message promises
     * @param encryptedData
     * @returns {*}
     */
    function decryptArray(encryptedData) {
        return encryptedData.message.map(message => decryptData(message.body))
    }

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
            }, async e => {console.log("Error")})

    }



    return (
        <div className="container">
            <h1 className="title">Welcome to Blindnet!</h1>

            {/* Login/Create Account Block */}
            { appState === AppStates.LOGIN ? (
                <div>
                    <p className="description">Please login or create an account</p>
                    <p className="description">Username</p>
                    <input className="textEntree" type="text" onInput={event => setUserId(event.target.value)}/>
                    <p className="description">Password</p>
                    <input className="textEntree" type="password" onInput={event => setUserPwd(event.target.value)}/>
                    <a className="card" onClick={login}>Login</a>
                </div>) : null
            }

            {/* Send/Receive Selection Block */}
            { appState != AppStates.LOGIN ? (
                <div>
                    <button onClick={() => {setAppState(AppStates.SEND)}}>Send</button>
                    <button onClick={() => {
                        setAppState(AppStates.RECEIVE)
                        setGetMessages(true)
                    }}>Receive</button>

                </div>
            ): null
            }

            {/* Send Block */}
            { appState === AppStates.SEND ? (
                <div>
                    <p className="prompt">Who would you like to send to?</p>
                    <input type="text" onInput={event => setRecipientId(event.target.value)}/>
                    <p className="prompt">Enter your message below</p>
                    <input type="text" onInput={event => setData(event.target.value)}/>
                    <button onClick={send}>Send</button>
                </div>) : null
            }

            {/* Receive Block */}
            { appState === AppStates.RECEIVE ? (
                <div>
                    <p className="prompt">Your Messages:</p>
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
                text-align: center;
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
                margin-top: 3rem;
              }

              .card {
                margin: 1rem;
                flex-basis: 45%;
                padding: 1.5rem;
                text-align: left;
                color: inherit;
                text-decoration: none;
                border: 1px solid #eaeaea;
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

function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function toBuffer(ab) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

function toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}


// export async function getServerSideProps(ctx) {
//
// }

// export default function Home() {
//
//   return (
//     <div className="container">
//       <Head>
//         <title>Create Next App</title>
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//
//       <main>
//         <h1 className="title">
//           Learn <a href="https://www.blindnet.io/">Blindnet!</a>
//         </h1>
//
//         <p className="description">
//           Get started by hitting <code>Connect to blindnet</code>
//         </p>
//
//         <div className="grid">
//           <Link href="/connect">
//             <a className="card">
//               <h3>Register with blindnet</h3>
//               <p>Do this to allow other users to send encrypted messages to you!</p>
//             </a>
//           </Link>
//
//           <Link href="/send-receive">
//             <a href="https://nextjs.org/learn" className="card">
//               <h3>Send/Receive Messages</h3>
//               <p>Send an encrypted message or decrypt those sent to you</p>
//             </a>
//           </Link>
//
//           {/*<Link href="receive">*/}
//           {/*  <a href="https://github.com/vercel/next.js/tree/master/examples" className="card">*/}
//           {/*    <h3>Receive a message</h3>*/}
//           {/*    <p>Decrypt and read any messages sent to you</p>*/}
//           {/*  </a>*/}
//           {/*</Link>*/}
//
//           <a
//             href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//             className="card"
//           >
//             <h3>Logout</h3>
//             <p>
//               Disconnect from blindnet
//             </p>
//           </a>
//         </div>
//       </main>
//
//       <footer>
//         <a
//           href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Powered by Blindnet
//           {/*<img src="/vercel.svg" alt="Vercel" className="logo" />*/}
//         </a>
//       </footer>
//
//       <style jsx>{`
//         .container {
//           min-height: 100vh;
//           padding: 0 0.5rem;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//         }
//
//         main {
//           padding: 5rem 0;
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//         }
//
//         footer {
//           width: 100%;
//           height: 100px;
//           border-top: 1px solid #eaeaea;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//
//         footer img {
//           margin-left: 0.5rem;
//         }
//
//         footer a {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//
//         a {
//           color: inherit;
//           text-decoration: none;
//         }
//
//         .title a {
//           color: #0070f3;
//           text-decoration: none;
//         }
//
//         .title a:hover,
//         .title a:focus,
//         .title a:active {
//           text-decoration: underline;
//         }
//
//         .title {
//           margin: 0;
//           line-height: 1.15;
//           font-size: 4rem;
//         }
//
//         .title,
//         .description {
//           text-align: center;
//         }
//
//         .description {
//           line-height: 1.5;
//           font-size: 1.5rem;
//         }
//
//         code {
//           background: #fafafa;
//           border-radius: 5px;
//           padding: 0.75rem;
//           font-size: 1.1rem;
//           font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
//             DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
//         }
//
//         .grid {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-wrap: wrap;
//
//           max-width: 800px;
//           margin-top: 3rem;
//         }
//
//         .card {
//           margin: 1rem;
//           flex-basis: 45%;
//           padding: 1.5rem;
//           text-align: left;
//           color: inherit;
//           text-decoration: none;
//           border: 1px solid #eaeaea;
//           border-radius: 10px;
//           transition: color 0.15s ease, border-color 0.15s ease;
//         }
//
//         .card:hover,
//         .card:focus,
//         .card:active {
//           color: #0070f3;
//           border-color: #0070f3;
//         }
//
//         .card h3 {
//           margin: 0 0 1rem 0;
//           font-size: 1.5rem;
//         }
//
//         .card p {
//           margin: 0;
//           font-size: 1.25rem;
//           line-height: 1.5;
//         }
//
//         .logo {
//           height: 1em;
//         }
//
//         @media (max-width: 600px) {
//           .grid {
//             width: 100%;
//             flex-direction: column;
//           }
//         }
//       `}</style>
//
//       <style jsx global>{`
//         html,
//         body {
//           padding: 0;
//           margin: 0;
//           font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
//             Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
//             sans-serif;
//         }
//
//         * {
//           box-sizing: border-box;
//         }
//       `}</style>
//     </div>
//   )
// }