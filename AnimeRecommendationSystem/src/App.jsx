import { useEffect, useState } from 'react'
import  {Container} from '@mui/material'
import { useUser } from './hooks/index.js'
import API_URLS from './config.js'
import { Route, Routes } from 'react-router-dom'
import Index from './Pages/Index.jsx'
import Register from './Pages/Register.jsx'
import AutohideSnackbar from './components/notification.jsx'
import Login from './Pages/Login.jsx'

function App() {
  const [user, userServices] =  useUser(API_URLS.login);
  const [message, setMessage] = useState("");

  useEffect(()=>{
    const loggedInUser = window.localStorage.getItem('loggedInUser')
    if(loggedInUser)
    {
      const user = JSON.parse(loggedInUser)
      userServices.setUser(user)
      userServices.setToken(user.token)
    }
  },[])

  return (
    <Container>
      <div>
        <Routes>
            <Route path="/" element={<Index user={user} userServices={userServices} setMessage={setMessage}/>}/>
            <Route path="/Register" element={<Register setMessage={setMessage}/>}/>
            <Route path="/Login" element={<Login setMessage={setMessage} userServices={userServices}/>}/>
        </Routes>
      </div>
        <AutohideSnackbar message={message} setMessage={setMessage}/>
    </Container>
  )
}

export default App
