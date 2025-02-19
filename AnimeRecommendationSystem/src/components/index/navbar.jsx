import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { useSpecificQuery } from '../../hooks';
import { Link } from 'react-router-dom';

const pages = ['Home', 'Anime', 'Staff'];


function ResponsiveAppBar({user, userServices}) {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleLogOut = () =>{
    userServices.logout();
    handleCloseUserMenu()
  }

  const playAudio = () =>{
    document.getElementById("backgroundAudio").play();
    document.getElementById("backgroundAudio").volume = 0.1;

    setAudioPlayed(true)
  }

  const stopAudio = () =>{
    document.getElementById("backgroundAudio").pause();
    setAudioPlayed(false)
  }
 

  return (
    <AppBar position="static" sx={{background: 'black'}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            ARS
          </Typography>
            
            
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'flex' }}}>
              <Button
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                
              <Link
                to="/"
              >
                Home
              </Link>
              </Button>
          </Box>
          
          <Button onClick={audioPlayed? stopAudio: playAudio} 
                    sx={{color:"white"}}>{audioPlayed? "Stop": "Play"} Audio
          </Button>
            {
            user?
            <Button
                  onClick={handleOpenUserMenu}
                  sx={{color: 'white', display: 'block' }}
            >
              User
            </Button>:
            
            (<>
              <Button
                sx={{color: 'white', display: 'block' }}
              >
                <Link
                  to="/Register"
                >
                  Register
                </Link>
              </Button>

              <Button
              sx={{color: 'white', display: 'block' }}
              >
                <Link
                  to="/Login"
                >
                  Login
                </Link>
              </Button>
            </>)}
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleLogOut}>
                <Typography sx={{ textAlign: 'center' }}>Log Out</Typography>
              </MenuItem>
            </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
