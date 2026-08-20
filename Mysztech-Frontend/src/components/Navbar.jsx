import React from 'react';
import { Link } from 'react-router-dom';

// --- KOMPONEN MATERIAL-UI (MUI) ---
import { AppBar, Toolbar, Typography, Box, IconButton, Button } from '@mui/material';

// --- IKON MUI ---
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  return (
    <AppBar 
      position="static" // atau 'fixed' jika nak ia sentiasa lekat di atas bila skrol
      sx={{ 
        backgroundColor: '#1f2937', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: (theme) => theme.zIndex.drawer + 1 // Pastikan Navbar duduk di atas elemen lain
      }}
    >
      <Toolbar sx={{ paddingX: { xs: 2, md: 4 } }}>
        
        {/* BAHAGIAN KIRI: Butang Hamburger Menu & Tajuk */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {!isSidebarOpen && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleSidebar}
              sx={{ mr: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: { xs: '20px', md: '24px' } }}
          >
            MYSZTECH POS
          </Typography>
        </Box>

        {/* BAHAGIAN KANAN: Pautan Navigasi */}
        {/* MUI membuang keperluan class "nav-links". Ia automatik tersembunyi (none) di skrin 'xs' (telefon) dan muncul (flex) di 'md' (laptop) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button 
            component={Link} 
            to="/" 
            sx={{ color: '#d1d5db', textTransform: 'none', fontSize: '15px', '&:hover': { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            Home
          </Button>
          <Button 
            component={Link} 
            to="/docs" 
            sx={{ color: '#d1d5db', textTransform: 'none', fontSize: '15px', '&:hover': { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            Documentation
          </Button>
          <Button 
            component={Link} 
            to="/faq" 
            sx={{ color: '#d1d5db', textTransform: 'none', fontSize: '15px', '&:hover': { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            FAQ
          </Button>
          <Button 
            component={Link} 
            to="/troubleshooting" 
            sx={{ color: '#d1d5db', textTransform: 'none', fontSize: '15px', '&:hover': { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            Usage Guide
          </Button>
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;