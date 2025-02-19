import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput
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
    <div style={{display: "flex", width: "auto", height: "95vh", justifyContent: "center", alignItems: "center" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexFlow:"column" }}>
        <Typography variant="h5" mb={3} style={{
          position: "relative",
          zIndex: 1,
          marginBlock: "0px",
          width: "6em",
          color: "#849e9f"
        }}>
          Register
        </Typography>

        <FormControl sx={{borderBottom:"2px solid #9f9f9f", mt:"2vh", mb:"2vh"}}>
          <InputLabel
            sx={{color:"#9f9f9f", "&.Mui-focused": { color: "transparent" }, "&.MuiFormLabel-filled": { color: "transparent" }}}
          >
              Username
          </InputLabel>
          <OutlinedInput  sx={{
                              color: "#9f9f9f",
                              "& fieldset": { border: "none" }, // Removes the border
                              "&:hover fieldset": { border: "none" }, // Prevents border on hover
                              "&.Mui-focused fieldset": { border: "none" }, 
                              }}
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
        </FormControl>

        <FormControl sx={{borderBottom:"2px solid #9f9f9f", mt:"2vh", mb:"2vh"}}>
          <InputLabel
            sx={{color:"#9f9f9f", "&.Mui-focused": { color: "transparent" }, "&.MuiFormLabel-filled": { color: "transparent" }}}
          >
              Password
          </InputLabel>
          <OutlinedInput  sx={{
                              color: "#9f9f9f",
                              "& fieldset": { border: "none" }, // Removes the border
                              "&:hover fieldset": { border: "none" }, // Prevents border on hover
                              "&.Mui-focused fieldset": { border: "none" }, 
                              }}
              
              label="Password"
              name="password1"
              type="password"
              value={formData.password1}
              onChange={handleInputChange}
              required
            />

        </FormControl>

        <FormControl sx={{borderBottom:"2px solid #9f9f9f", mt:"2vh", mb:"2vh"}}>
          <InputLabel
            sx={{color:"#9f9f9f", "&.Mui-focused": { color: "transparent" }, "&.MuiFormLabel-filled": { color: "transparent" }}}
          >
              Username
          </InputLabel>
          <OutlinedInput  sx={{
                              color: "#9f9f9f",
                              "& fieldset": { border: "none" }, // Removes the border
                              "&:hover fieldset": { border: "none" }, // Prevents border on hover
                              "&.Mui-focused fieldset": { border: "none" }, 
                              }}
              label="Confirm Password"
              name="password2"
              type="password"
              value={formData.password2}
              onChange={handleInputChange}
              required
            />
        </FormControl>
        <button
          type="submit"
          style={{marginTop:"15px", 
            background: "#d5d5d5",
            color: "#494242",
            fontSize:"15px"}}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
