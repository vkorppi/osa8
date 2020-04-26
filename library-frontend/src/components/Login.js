
import React, { useState } from 'react'




const LoginForm = ({show,setjsToken}) => {
 

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    if (!show) {
        return null
      }

    const submit = async (event) => {
    
        event.preventDefault()

      
        // aseta token

    }

    return (
        <div>
          <form onSubmit={submit}>
            <div>
              Username
              <input
                value={username}
                onChange={({ target }) => setUsername(target.value)}
              />
            </div>
            <div>
              Password
              <input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </div>
          </form>
        </div>
      )

}

export default LoginForm