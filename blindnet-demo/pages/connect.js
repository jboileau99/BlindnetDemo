import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Blindnet } from '@blindnet/sdk-javascript'
import { createTempUserToken, createUserToken } from '@blindnet/token-generator'

export default function Connect() {

    // Form variables
    const [userId, setUserId] = useState('')
    const [pwd, setPwd] = useState('')

    // Router to allow us to send token and secrets to other pages
    // NOTE: This is insecure but fine for learning the SDK
    const router = useRouter()

    // // Blindnet app info - Justin's app
    // const appId = '088cb9cc-50b1-450c-901d-2c59a8819d6c'
    // const appKey = 'GGGO67rP8dbKV8Xo+d60tpQFdlrdyuWtV6EmARrjYaSpwDCM2ZvnaN6HRlrZI8WX+cNT+I8WStY4PN4Mx0LyLg=='
    // const groupId = 'test-group'

    // Blindnet app info - Test App
    const appId = '3544e7cd-64a9-41b7-88dc-397bfdaeeaf3'
    const appKey = 'zB5IiU0xzkVdsH4NMXxrF90ZISL5kJnTHlt7h/Wbi/qVhch7Fw8J5AQ5j2PazaG5q114uApZRH4X1/kTKVx0Cw=='
    const groupId = 'test-group'
    const endpoint = 'https://test.blindnet.io'

    async function getBlindnetToken(user) {
        console.log("In async get token function!")
        const token = await createUserToken(user, groupId, appId, appKey)
        console.log(`Got data: ${token}`)
        return token
    }

    async function connectBlindnet(password, token) {

        // Authenticate to blindnet
        console.log(`Authenticating to blindnet with token: ${token}`)
        const endpoint = 'https://test.blindnet.io'
        const blindnet = Blindnet.init(token, endpoint)
        console.log(`Type of blindnet: ${typeof blindnet}`)

        // Connect user to blindnet
        const { appSecret, blindnetSecret } = await Blindnet.deriveSecrets(password)
        await blindnet.connect(blindnetSecret)

        return [appSecret, blindnetSecret];
    }

    function handleSubmit(event) {

        // Verify that both userId and password were entered
        if (userId && pwd) {

            // Get blindnet token
            getBlindnetToken(userId).then(data => {

                // Connect user to blindnet, we pass the token as a param as setToken doesn't happen immediately
                connectBlindnet(pwd, data).then(secrets => {

                    console.log(`Got ${secrets[0]} and ${secrets[1]}`)

                    // Go back to main page
                    router.push({
                        pathname: '/',
                        query: { token: data, appSecret: secrets[0], blindnetSecret: secrets[1] }
                    })
                })
            })

        } else {
            console.log("Must enter both a userId and password!")
        }
    }

    return (
        <div>
            UserID:<br/>
            <input type="text" value={userId} onInput={e => setUserId(e.target.value)}/><br/><br/>
            Password:<br/>
            <input type="text" value={pwd} onInput={e => setPwd(e.target.value)}/><br/><br/>
            <button onClick={ handleSubmit }>Submit</button>
        </div>
    )
}