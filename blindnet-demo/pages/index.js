import Head from 'next/head'
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Blindnet } from '@blindnet/sdk-javascript'
import { createTempUserToken, createUserToken } from '@blindnet/token-generator'

// Blindnet app info - Test App
const appId = '3544e7cd-64a9-41b7-88dc-397bfdaeeaf3'
const appKey = 'zB5IiU0xzkVdsH4NMXxrF90ZISL5kJnTHlt7h/Wbi/qVhch7Fw8J5AQ5j2PazaG5q114uApZRH4X1/kTKVx0Cw=='
const endpoint = 'https://test.blindnet.io'
const groupId = 'test-group'

export default function Home() {

  // Sender/Recipient Variables
  const [senderId, setSenderId]
  const [senderPwd, setSenderPwd]
  const [recipientId, setRecipientId]
  const [recipientPwd, setRecipientPwd]

  // Data variables
  const [dataMode, setDataMode] = useState(0)     // 0 == text, 1 == file
  const [data, setData] = useState('')

  async function encryptData() {

    // Get token for sending to recipient
    console.log(`recipient: ${recipient}, appId: ${appId}, appKey: ${appKey}`)
    const token = await createTempUserToken(groupId, appId, appKey)

    // Get a blindnet instance
    console.log(`token: ${token}\n endpoint: ${endpoint}\ndata: ${data}`)
    const blindnet = Blindnet.init(token, endpoint)

    // Encrypt the text or file
    const { encryptedText } = await blindnet.capture(data).forUser(recipient).encrypt()
    console.log(`Encrypting - Data: ${data} Recipient: ${recipient}`)
    console.log(`encryptedText: ${encryptedText.value}`)
    console.log(`encryptedText type: ${typeof encryptedText}`)

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



  }

  async function recieve() {

  }

  async function login() {

    // Get token for user and init blindnet
    const token = await createUserToken(userId, groupId, appId, appKey)
    const blindnet = Blindnet.init(token, endpoint)

    // Connect user to blindnet
    const { appSecret, blindnetSecret } = await Blindnet.deriveSecrets(password)
    await blindnet.connect(blindnetSecret)
  }

  return (

  )

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