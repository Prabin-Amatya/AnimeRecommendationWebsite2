import { useState } from "react";
import {
  TextField,
  Button,
  Typography
} from "@mui/material";
import API_URLS from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = ({setMessage}) => {
  const [formData, setFormData] = useState({
    username: "",
    password1: "",
    password2: "",
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
      password1:formData.password1,
      password2:formData.password2
    }

    console.log(new_user)
    axios.post(API_URLS.register, new_user).then(()=>{
      setMessage("You Have Been Registered")
      navigate("/Login")
    }
    ).catch(err=>{
      console.log(err)
      if(err.response?.data?.errors){
        const errors = err.response.data.errors
        Object.keys(errors).forEach(field=>setMessage(errors[field]))
      }
      else{
        setMessage("Registration Failed")
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
          Register
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
            name="password1"
            variant="outlined"
            margin="normal"
            type="password"
            value={formData.password1}
            onChange={handleInputChange}
            required
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="password2"
            variant="outlined"
            margin="normal"
            type="password"
            value={formData.password2}
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

export default Register;
