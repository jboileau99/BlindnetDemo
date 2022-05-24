import Head from 'next/head'
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Blindnet } from '@blindnet/sdk-javascript'
import { createTempUserToken, createUserToken } from '@blindnet/token-generator'
import { error as blindnetError} from '@blindnet/sdk-javascript'
import clientPromise from "../lib/mongodb";

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
  const [recipientId, setRecipientId] = useState('')
  const [recipientPwd, setRecipientPwd] = useState('')  // Not needed?

  // Data variables
  const [dataMode, setDataMode] = useState(0)     // 0 == text, 1 == file
  const [data, setData] = useState('')

  async function encryptData() {

    // Get token for sending to recipient
    console.log(`recipient: ${recipientId}, appId: ${appId}, appKey: ${appKey}`)
    const tempToken = await createTempUserToken(groupId, appId, appKey)

    // Get a blindnet instance
    console.log(`tempToken: ${tempToken}\n endpoint: ${endpoint}\ndata: ${data}`)
    const tempBlindnet = Blindnet.init(tempToken, endpoint)

    // Encrypt the text or file and return promise
    return tempBlindnet.capture(data).forUser('Justin').encrypt()
  }

  async function decryptData() {

    // Have to create/rename variables to have both dataToEncrypt (send) and dataToDecrypt (receive)
    const encryptedBytes = await dataToDecrypt.arrayBuffer()
    const { data, metadata } = await blindnet.decrypt(encryptedFileBytes)

    // Handle save or view case here
    saveAs(data, metadata.name)
    this.setState({ ...this.state, file: undefined, formState: FILE_DECRYPTED })

  }

  async function send() {

    // Encrypt message
    encryptData()
      .then(async encryptedText => {

        console.log(encryptedText)

        await saveMessage(encryptedText)

      }, e => {})


  }

  async function recieve() {

    // Get message(s?) from DB
    // const client = await clientPromise
    // const database = client.db('')
    // const messages = database.collection('messages')
    //
    // const query = { to: '' };
    // const message = await messages.findOne(query);
    // console.log(message);

    // Decrypt and return

  }

  async function login() {

    // Get token for user and init blindnet
    const token = await createUserToken(userId, groupId, appId, appKey)
    const blindnet = Blindnet.init(token, endpoint)

    // Connect user to blindnet
    const { blindnetSecret } = await Blindnet.deriveSecrets(userPwd)
    blindnet.connect(blindnetSecret)
        .then(() => setAppState(AppStates.SEND), async e => {console.log("Error")})

  }



  return (
      <div>
        <h1>Welcome to Blindnet!</h1>

        {/* Login/Create Account Block */}
        { appState === AppStates.LOGIN ? (
          <div>
            <p className="prompt">Please login or create an account</p>
            <p className="description">Username</p>
            <input type="text" onInput={event => setUserId(event.target.value)}/>
            <p className="description">Password</p>
            <input type="password" onInput={event => setUserPwd(event.target.value)}/>
            <button onClick={login}>Login</button>
          </div>) : null
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
          </div>) : null
        }


      </div>
  )

}

export async function getServerSideProps(context) {
  try {
    const client = await clientPromise
    const db = client.db('')
    const messages = database.collection('messages')

    // Insert message
    const doc = { to: recipientId, from: userId, body: data }
    const result = await messages.insertOne(doc)
    console.log(`Inserted document with _id: ${result.insertId}`)

    // Can do the above way
    // But must use an api endpoint for sending the messages, see below
    // https://www.section.io/engineering-education/build-nextjs-with-mongodb-and-deploy-on-vercel/

    // Connect to db and get collection reference
    // await client.connect()
    // const client = await clientPromise
    // const database = client.db('')
    // const messages = database.collection('messages')
    //
    // // Insert message
    // const doc = { to: recipientId, from: userId, body: data }
    // const result = await messages.insertOne(doc)
    // console.log(`Inserted document with _id: ${result.insertId}`)

    // `await clientPromise` will use the default database passed in the MONGODB_URI
    // However you can use another database (e.g. myDatabase) by replacing the `await clientPromise` with the following code:
    //
    // `const client = await clientPromise`
    // `const db = client.db("myDatabase")`
    //
    // Then you can execute queries against your database like so:
    // db.find({}) or any of the MongoDB Node Driver commands

    return {
      props: { isConnected: true },
    }
  } catch (e) {
    console.error(e)
    return {
      props: { isConnected: false },
    }
  }
}

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