import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getArticles } from '../services/api';

// --- KOD BARU: Import Material-UI (MUI) ---
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

// --- KOD BARU: Import Ikon ---
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import BuildIcon from '@mui/icons-material/Build';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CircleIcon from '@mui/icons-material/Circle';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // State untuk simpan senarai artikel dari Strapi
  const [docArticles, setDocArticles] = useState([]);

  // State untuk buka/tutup sub-menu Documentation
  const [isDocOpen, setIsDocOpen] = useState(true);

  // Tarik data tajuk artikel dari Strapi
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getArticles();
        setDocArticles(response.data.data);
      } catch (error) {
        console.error("Ralat menarik senarai tajuk untuk sidebar:", error);
      }
    };

    fetchArticles();
  }, []);

  const handleLinkClick = () => {
    // Fungsi auto-tutup apabila pautan ditekan (HANYA pada skrin kecil)
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  // Lebar Sidebar
  const drawerWidth = 280;

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isOpen}
      sx={{
        width: isOpen ? drawerWidth : 0,
        flexShrink: 0,
        transition: 'width 0.3s',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#111827', // Warna gelap asal awak
          color: '#f9fafb',
          borderRight: '1px solid #1f2937',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* ========================================== */}
        {/* HEADER NAVIGASI & BUTANG TUTUP */}
        {/* ========================================== */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', pb: 2, mb: 1 }}>
          <Typography variant="overline" sx={{ letterSpacing: '1.5px', fontWeight: 'bold', color: '#9ca3af' }}>
            Menu Mysztech
          </Typography>
          <IconButton onClick={toggleSidebar} size="small" sx={{ color: '#9ca3af', backgroundColor: '#1f2937', '&:hover': { backgroundColor: '#374151' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <List sx={{ px: 1 }}>
          
          {/* ========================================== */}
          {/* MENU 1: MAIN PAGE */}
          {/* ========================================== */}
          {/*<ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link} 
              to="/" 
              onClick={handleLinkClick}
              selected={location.pathname === '/'}
              sx={{
                borderRadius: '8px',
                '&.Mui-selected': { backgroundColor: '#374151', color: '#ffffff' },
                '&.Mui-selected:hover': { backgroundColor: '#4b5563' },
                '&:hover': { backgroundColor: '#1f2937' },
                color: location.pathname === '/' ? '#ffffff' : '#9ca3af'
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Main Page" primaryTypographyProps={{ fontWeight: location.pathname === '/' ? '600' : '400' }} />
            </ListItemButton>
          </ListItem>*/}

          {/* ========================================== */}
          {/* MENU 2: DOCUMENTATION (DENGAN DROPDOWN) */}
          {/* ========================================== */}
          <ListItem disablePadding sx={{ mb: 1, display: 'block' }}>
            <ListItemButton 
              onClick={() => {
                setIsDocOpen(!isDocOpen); 
                navigate('/docs'); 
                if (window.innerWidth <= 768 && !isDocOpen) toggleSidebar(); 
              }}
              selected={location.pathname === '/docs'}
              sx={{
                borderRadius: '8px',
                '&.Mui-selected': { backgroundColor: '#374151', color: '#ffffff' },
                '&.Mui-selected:hover': { backgroundColor: '#4b5563' },
                '&:hover': { backgroundColor: '#1f2937' },
                color: location.pathname === '/docs' ? '#ffffff' : '#9ca3af'
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText primary="User Guidelines" primaryTypographyProps={{ fontWeight: location.pathname === '/docs' ? '600' : '400' }} />
              {isDocOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          {/* SUB-MENU ARTIKEL DARI STRAPI (Animasi Collapse) */}
          <Collapse in={isDocOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 4 }}>
              {docArticles.length === 0 ? (
                <Typography sx={{ fontSize: '13px', color: '#6b7280', py: 1, pl: 2 }}>
                  Memuatkan...
                </Typography>
              ) : (
                docArticles.map((item) => {
                  const attr = item.attributes || item;
                  const tajuk = attr.title || attr.Title || "Tanpa Tajuk";
                  const isActive = location.search.includes(`id=${item.id}`);

                  return (
                    <ListItemButton
                      key={item.id}
                      component={Link}
                      to={`/docs?id=${item.id}`}
                      onClick={handleLinkClick}
                      sx={{
                        borderRadius: '6px',
                        py: 0.5,
                        my: 0.5,
                        color: isActive ? '#ffffff' : '#9ca3af',
                        backgroundColor: isActive ? '#1f2937' : 'transparent',
                        '&:hover': { backgroundColor: '#374151', color: '#ffffff' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: '25px', color: 'inherit' }}>
                        <CircleIcon sx={{ fontSize: '6px' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={tajuk} 
                        primaryTypographyProps={{ 
                          fontSize: '14px', 
                          fontWeight: isActive ? '600' : '400',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} 
                      />
                    </ListItemButton>
                  );
                })
              )}
            </List>
          </Collapse>

          {/* ========================================== */}
          {/* MENU 3: FAQ */}
          {/* ========================================== */}
          {/*<ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link} 
              to="/faq" 
              onClick={handleLinkClick}
              selected={location.pathname === '/faq'}
              sx={{
                borderRadius: '8px',
                '&.Mui-selected': { backgroundColor: '#374151', color: '#ffffff' },
                '&.Mui-selected:hover': { backgroundColor: '#4b5563' },
                '&:hover': { backgroundColor: '#1f2937' },
                color: location.pathname === '/faq' ? '#ffffff' : '#9ca3af'
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                <LiveHelpIcon />
              </ListItemIcon>
              <ListItemText primary="FAQ" primaryTypographyProps={{ fontWeight: location.pathname === '/faq' ? '600' : '400' }} />
            </ListItemButton>
          </ListItem>*/}

          {/* ========================================== */}
          {/* MENU 4: USAGE GUIDE */}
          {/* ========================================== */}
          {/*<ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link} 
              to="/troubleshooting" 
              onClick={handleLinkClick}
              selected={location.pathname === '/troubleshooting'}
              sx={{
                borderRadius: '8px',
                '&.Mui-selected': { backgroundColor: '#374151', color: '#ffffff' },
                '&.Mui-selected:hover': { backgroundColor: '#4b5563' },
                '&:hover': { backgroundColor: '#1f2937' },
                color: location.pathname === '/troubleshooting' ? '#ffffff' : '#9ca3af'
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Usage Guide" primaryTypographyProps={{ fontWeight: location.pathname === '/troubleshooting' ? '600' : '400' }} />
            </ListItemButton>
          </ListItem>*/}

        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 