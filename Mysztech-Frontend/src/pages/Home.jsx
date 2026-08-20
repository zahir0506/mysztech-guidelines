import React from 'react';
import { Link } from 'react-router-dom';

// --- KOMPONEN MATERIAL-UI (MUI) ---
import {
  CssBaseline, Box, Container, Typography, 
  Card, CardActionArea, CardContent
} from '@mui/material';

// --- IKON MUI ---
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BuildIcon from '@mui/icons-material/Build';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';

const Home = () => {
  const quickLinks = [
    {
      title: 'Documentation',
      desc: 'Read the complete guide and manual on how to use the system from A to Z.',
      path: '/docs',
      color: '#3b82f6', // Biru
      icon: <MenuBookIcon sx={{ fontSize: 55, color: '#3b82f6', mb: 2 }} />
    },
    {
      title: 'Troubleshooting',
      desc: 'Rapid resolution steps for technical issues and system errors.',
      path: '/troubleshooting',
      color: '#ef4444', // Merah
      icon: <BuildIcon sx={{ fontSize: 55, color: '#ef4444', mb: 2 }} />
    },
    {
      title: 'FAQ',
      desc: 'Find quick answers to the questions most frequently asked by staff.',
      path: '/faq',
      color: '#10b981', // Hijau
      icon: <LiveHelpIcon sx={{ fontSize: 55, color: '#10b981', mb: 2 }} />
    }
  ];

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ py: 8 }}>
          
          {/* --- BAHAGIAN 1: BAR CARIAN (HERO SECTION) --- */}
          <Box sx={{ textAlign: 'center', mb: 8, mt: 2 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: '900', color: '#1f2937', mb: 2, letterSpacing: '-1px' }}>
              MYSZTECH POS HELP CENTER
            </Typography>
            <Typography variant="h6" sx={{ color: '#4b5563', fontWeight: 'normal' }}>
              How can we help resolve your issue today?
            </Typography>
          </Box>

          {/* --- BAHAGIAN 2: KAD AKSES PANTAS (QUICK LINKS) --- */}
          {/* KEMAS KINI: Kita gunakan CSS Grid yang lebih stabil berbanding MUI Grid */}
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
              gap: '30px'
            }}
          >
            {quickLinks.map((link, index) => (
              <Card 
                key={index}
                sx={{ 
                  height: '100%',
                  borderRadius: '16px',
                  borderTop: `6px solid ${link.color}`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: `0 15px 30px ${link.color}33` 
                  }
                }}
              >
                <CardActionArea 
                  component={Link} 
                  to={link.path}
                  sx={{ height: '100%', p: 3, textAlign: 'center' }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {link.icon}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1.5 }}>
                      {link.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                      {link.desc}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>

        </Box>
      </Container>
    </React.Fragment>
  );
};

export default Home;