import { useState, useEffect } from 'react'
import { Blindnet } from '@blindnet/sdk-javascript'
import { createTempUserToken } from '@blindnet/token-generator'

export default function send() {

    const [mode, setMode] = useState(0) // 0 == text, 1 == file
    const [recipient, setRecipient] = useState('')
    const [textData, setTextData] = useState('')
    const [fileData, setFileData] = useState('')

    // Blindnet app info
    const appId = '088cb9cc-50b1-450c-901d-2c59a8819d6c'
    const appKey = 'GGGO67rP8dbKV8Xo+d60tpQFdlrdyuWtV6EmARrjYaSpwDCM2ZvnaN6HRlrZI8WX+cNT+I8WStY4PN4Mx0LyLg=='
    const endpoint = 'https://test.blindnet.io'

    // Should expand this to send to multiple users
    async function sendText(recipientId, text) {

        // Get token for sending to recipient
        const token = await createTempUserToken([recipientId], appId, appKey)
        const blindnet = Blindnet.init(token, endpoint)
        console.log(`RecipientId: ${recipientId}, text: ${text}, token: ${token}`)
        console.log(`Blindnet: ${blindnet}`)
        console.log(`Type of blindnet: ${typeof blindnet}`)


        // Encrypt data
        const { encryptedText } = await blindnet.encrypt({data: text})

    }

    return (
        <div className="container">
            <h1 className="title">Send a message securely with Blindnet!</h1>

            <p className="description">Who would you like to send to?</p>

            <input onInput={e => setRecipient(e.target.value)}/>

            <p className="description">What type of data would you like to send?</p>

            <div className="grid">
                <a className="card" onClick={() => setMode(0)}>
                    <h3>Text</h3>
                </a>
                <a className="card" onClick={() => setMode(1)}>
                    <h3>File</h3>
                </a>
            </div>

            {mode == 0 ?
                (
                    <div>
                        <input onInput={e => setTextData(e.target.value)}/>
                        <button onClick={() => sendText(recipient, textData)}>Send</button>
                    </div>
                ) : null
            }

            { mode == 1 ?
                (
                    <div>
                        <input type='file' onInput={e => setFileData(e.target.files[0])}/>
                    </div>
                ) : null
            }

        <style jsx>{`
            .container {
              min-height: 100vh;
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
              margin-top: 3rem;
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
        </div>
    )

}