import Cube from "../components/index/cube"
import ResponsiveAppBar from "../components/index/navbar"

const Index = ({user, userServices, setMessage}) =>{
  return(
  <div>
    <ResponsiveAppBar user={user} userServices={userServices}/> 
    {user && <Cube user={user} setMessage={setMessage}/>}
  </div>)
}

export default Index