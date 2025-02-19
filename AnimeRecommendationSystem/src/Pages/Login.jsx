import { useState } from "react";
import {
  TextField,
  Button,
  Typography
} from "@mui/material";
import API_URLS from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({setMessage, userServices}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const new_user = {
      username:formData.username,
      password:formData.password
    }

    console.log(new_user)
    userServices.login(new_user).then(()=>{
      setMessage("Successfully Logged In")
      navigate("/")
    }
    ).catch(err=>{
      console.log(err)
      if(err.response?.data?.errors){
        const errors = err.response.data.errors
        Object.keys(errors).forEach(field=>setMessage(errors[field]))
      }
      else if(err.response?.data?.error){
          setMessage(err.response.data.error)
      }
      else{
        setMessage("Login Failed")
      }
    })
    }

  return (
    <div style={{display: "flex", width: "100vw", height: "60vh", justifyContent: "center", alignItems: "center" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <Typography variant="h5" mb={3} style={{
          position: "relative",
          zIndex: 1,
          background: "white",
          marginBlock: "0px",
          width: "6em",
          color: "#849e9f"
        }}>
          Login
        </Typography>
        <div>
          <TextField
            fullWidth
            label="Username"
            name="username"
            variant="outlined"
            margin="normal"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            variant="outlined"
            margin="normal"
            type="password"
            value={formData.password1}
            onChange={handleInputChange}
            required
          />
          {<Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Submit
          </Button>}
        </div>
      </form>
    </div>
  );
};

export default Login;
