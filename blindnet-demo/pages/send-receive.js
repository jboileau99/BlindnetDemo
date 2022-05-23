import { useState, useEffect } from 'react'
import { Blindnet } from '@blindnet/sdk-javascript'
import { createTempUserToken } from '@blindnet/token-generator'

// Blindnet app info - Justin's App
// const appId = '088cb9cc-50b1-450c-901d-2c59a8819d6c'
// const appKey = 'GGGO67rP8dbKV8Xo+d60tpQFdlrdyuWtV6EmARrjYaSpwDCM2ZvnaN6HRlrZI8WX+cNT+I8WStY4PN4Mx0LyLg=='
// const endpoint = 'https://test.blindnet.io'

// Blindnet app info - Test App
const appId = '3544e7cd-64a9-41b7-88dc-397bfdaeeaf3'
const appKey = 'zB5IiU0xzkVdsH4NMXxrF90ZISL5kJnTHlt7h/Wbi/qVhch7Fw8J5AQ5j2PazaG5q114uApZRH4X1/kTKVx0Cw=='
const endpoint = 'https://test.blindnet.io'


function Send() {

    const [dataMode, setDataMode] = useState(0)     // 0 == text, 1 == file
    const [recipient, setRecipient] = useState('')
    const [data, setData] = useState('')
    const [tempToken, setTempToken] = useState()

    // Should expand this to send to multiple users
    async function sendData() {

        // Get token for sending to recipient
        const token = await createTempUserToken([recipient], appId, appKey)

        // Get a blindnet instance
        console.log(`Recipient: ${recipient}, text: ${data}, token: ${token}`)
        const blindnet = Blindnet.init(tempToken, endpoint)

        // Debuging why we get the blindnet.encrypt is not a function error
        console.log(`Methods of blindnet object: ${Object.getOwnPropertyNames(blindnet)}`)
        console.log(`Methods of blindnet object: ${Object.getOwnPropertyNames(Blindnet)}`)

        // Encrypt the text or file
        const { encryptedText } = await blindnet.encrypt(data)
    }

    return (

        <div className="container">
            {/* Recipient Selection */}
            <p className="description">Who would you like to send to?</p>
            <input onInput={e => setRecipient(e.target.value)}/>

            {/* Text or File Mode */}
            <p className="description">What type of data would you like to send?</p>
            <div className="grid">
                <a className="card" onClick={() => setDataMode(0)}>
                    <h3>Text</h3>
                </a>
                <a className="card" onClick={() => setDataMode(1)}>
                    <h3>File</h3>
                </a>
            </div>

            <input type={dataMode == 0 ? 'text' : 'file'} onInput={e => setData(e.target.value)}/>

            <div className="grid">
                <a className="card" onClick={ sendData }>Send</a>
            </div>

            <style jsx>{`
            .container {
              min-height: 1vh;
              padding: 0 0.5rem;
              display: flex;
              flex-direction: column;
              justify-content: center;
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
    
              max-width: 2000px;
              margin-top: 0rem;
            }
    
            .card {
              margin: 1rem;
              flex-basis: 15%;
              padding: 15px;
              text-align: center;
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
              margin: 0 0 0 0;
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
      `   }</style>

        </div>
    )

}

export default function SendReceive() {

    const [sendReceiveMode, setSendReceiveMode] = useState(0)   // 0 == send, 1 == receive

    return (
        <div className="container">
            <h1 className="title">Send data securely with Blindnet!</h1>

            {/* Send or Receive Mode */}
            <p className="description">Do you want to send or receive data?</p>
            <div className="grid">
                <a className="card" onClick={() => setSendReceiveMode(0)}>
                    <h3>Send</h3>
                </a>
                <a className="card" onClick={() => setSendReceiveMode(1)}>
                    <h3>Receive</h3>
                </a>
            </div>

            {sendReceiveMode == 0 ? (

                <Send></Send>

            ) : null }



        <style jsx>{`
            .container {
              padding: 0 0.5rem;
              display: flex;
              flex-direction: column;
              justify-content: center;
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
    
              max-width: 2000px;
              margin-top: 1rem;
            }
    
            .card {
              margin: 1rem;
              flex-basis: 5%;
              padding: 15px;
              text-align: center;
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
              margin: 0 0 0 0;
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
      `   }</style>
        </div>
    )

}