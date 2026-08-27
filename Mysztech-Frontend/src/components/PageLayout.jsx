import React, { useState } from 'react';
import { 
  Box, CssBaseline, Typography, IconButton, Drawer, Button, 
  InputBase, ClickAwayListener, Paper, List, ListItem, ListItemText, Dialog 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import SubjectOutlinedIcon from '@mui/icons-material/SubjectOutlined';
import Sidebar from './Sidebar';

const PageLayout = ({
  theme, isDarkMode, toggleTheme, language, toggleLanguage,
  searchTerm, setSearchTerm, searchFocused, setSearchFocused,
  searchResults, onSearchResultClick, highlightMatch,
  setSearchParams, sidebarProps, rightToc, children
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const renderSearchList = () => (
    <Box sx={{ p: 1 }}>
      {searchTerm.length === 0 && (
        <Typography sx={{ p: 3, textAlign: 'center', color: theme.textMuted, fontFamily: "'Inter', sans-serif", fontSize: '13.5px' }}>
          {language === 'ms' ? 'Taip untuk mula mencari...' : 'Type to start searching...'}
        </Typography>
      )}
      
      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <Typography sx={{ p: 3, textAlign: 'center', color: theme.textMuted, fontFamily: "'Inter', sans-serif", fontSize: '13.5px' }}>
          {language === 'ms' ? 'Taip sekurang-kurangnya 2 huruf...' : 'Type at least 2 characters...'}
        </Typography>
      )}
      
      {searchTerm.length >= 2 && searchResults.length === 0 && (
        <Typography sx={{ p: 4, textAlign: 'center', color: theme.textMuted, fontFamily: "'Inter', sans-serif", fontSize: '13.5px' }}>
          Tiada hasil untuk <strong style={{ color: theme.textMain }}>"{searchTerm}"</strong>
        </Typography>
      )}
      
      <List sx={{ pt: 0 }}>
        {searchResults.map((result) => (
          <ListItem 
            button 
            key={result.id} 
            onClick={() => {
              onSearchResultClick(result);
              setSearchFocused(false);
              setMobileSearchOpen(false);
            }}
            sx={{ 
              borderRadius: '6px', mb: 0.5, p: 1.2, 
              display: 'flex', alignItems: 'center', 
              bgcolor: 'transparent',
              transition: 'background 0.1s ease', 
              '&:hover': { 
                bgcolor: isDarkMode ? '#27272a' : '#f3f4f6',
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              width: 32, height: 32, borderRadius: '6px', 
              bgcolor: isDarkMode ? '#18181b' : '#e5e7eb', 
              color: theme.textMuted, mr: 2 
            }}>
              {result.type === 'article' && <ArticleOutlinedIcon sx={{ fontSize: 18 }} />}
              {result.type === 'heading' && <TagOutlinedIcon sx={{ fontSize: 18 }} />}
              {result.type === 'content' && <SubjectOutlinedIcon sx={{ fontSize: 18 }} />}
            </Box>

            <ListItemText 
              primary={
                <Typography sx={{ color: theme.textMain, fontWeight: result.type !== 'content' ? 600 : 400, fontSize: '14px', fontFamily: "'Inter', sans-serif", mb: 0.2 }}>
                  {highlightMatch(result.title)}
                </Typography>
              }
              secondary={
                <Typography sx={{ color: theme.textMuted, fontSize: '12px', fontFamily: "'Inter', sans-serif", display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {highlightMatch(result.snippet)}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: theme.bg, color: theme.textBody, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <CssBaseline />

      {/* TOP NAVIGATION BAR */}
      <Box 
        component="header" 
        sx={{ 
          position: 'sticky', top: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          height: '64px', px: { xs: 2, md: 4 }, bgcolor: theme.headerBg, borderBottom: `1px solid ${theme.border}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' }, color: theme.textMain }}>
            <MenuIcon />
          </IconButton>

          {/* LOGO GAMBAR GANTI TEKS MYSZTECH POS */}
          <Box 
            component="img"
            src="/company_banner.png" 
            alt="MYSZTECH Logo"
            onClick={() => setSearchParams({ id: 'prologue' })}
            sx={{ 
              height: '34px', 
              cursor: 'pointer', 
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 0.8 },
              width: { xs: 'auto', md: '248px' }, 
              objectFit: 'contain',
              objectPosition: 'left'
            }}
          />
        </Box>

        {/* SEARCH BAR MINIMALIS & ORGANIK */}
        <ClickAwayListener onClickAway={() => setSearchFocused(false)}>
          <Box sx={{ position: 'relative', display: { xs: 'none', md: 'block' }, width: { md: '420px', lg: '500px' }, zIndex: 1300 }}>
            <Box 
              sx={{ 
                display: 'flex', alignItems: 'center', 
                bgcolor: theme.searchBg, 
                borderRadius: '8px', 
                px: 2, py: 0.8, 
                border: `1px solid ${searchFocused ? (isDarkMode ? '#52525b' : '#9ca3af') : 'transparent'}`,
                transition: 'border-color 0.15s ease',
              }}
            >
              <SearchIcon sx={{ color: theme.textMuted, fontSize: 18, mr: 1.5 }} />
              <InputBase
                placeholder={language === 'ms' ? "Cari dokumentasi..." : "Search documentation..."}
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                sx={{ color: theme.textMain, flexGrow: 1, fontFamily: "'Inter', sans-serif", fontSize: '14px' }}
              />
            </Box>

            {/* DROPDOWN RINGKAS */}
            {searchFocused && (
              <Paper
                elevation={0}
                sx={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  bgcolor: isDarkMode ? '#18181b' : '#ffffff',
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '8px',
                  boxShadow: isDarkMode ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.08)',
                  maxH: '50vh', overflowY: 'auto', 
                  zIndex: 1200
                }}
              >
                {renderSearchList()}
              </Paper>
            )}
          </Box>
        </ClickAwayListener>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button onClick={toggleLanguage} sx={{ color: theme.textMain, minWidth: 'auto', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '14px' }}>
            {language === 'ms' ? 'MS' : 'EN'}
          </Button>
          <IconButton onClick={toggleTheme} sx={{ color: theme.textMain }}>
            {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* KANDUNGAN BAWAH */}
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <Box component="nav" sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, bgcolor: theme.bg, backgroundImage: 'none' } }}
          >
            {sidebarProps && <Sidebar {...sidebarProps} onMobileClose={handleDrawerToggle} />}
          </Drawer>
          <Box sx={{ display: { xs: 'none', md: 'block' }, height: '100%' }}>
            {sidebarProps && <Sidebar {...sidebarProps} />}
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <Box component="main" sx={{ p: { xs: 3, sm: 5, md: 6, lg: 8 }, flexGrow: 1, width: '100%' }}>
            <Box onClick={() => setMobileSearchOpen(true)} sx={{ display: { xs: 'flex', md: 'none' }, mb: 4, alignItems: 'center', bgcolor: theme.searchBg, borderRadius: '8px', px: 2, py: 1, cursor: 'pointer' }}>
              <SearchIcon sx={{ color: theme.textMuted, fontSize: 20, mr: 1 }} />
              <Typography sx={{ color: theme.textMuted, flexGrow: 1, fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
                {language === 'ms' ? "Cari topik..." : "Search topic..."}
              </Typography>
            </Box>
            {children}
          </Box>

          {rightToc && (
            <Box component="aside" sx={{ display: { xs: 'none', lg: 'block' }, width: 280, flexShrink: 0, p: 4, height: 'calc(100vh - 64px)', position: 'sticky', top: '64px', overflowY: 'auto' }}>
              {rightToc}
            </Box>
          )}
        </Box>
      </Box>

      <Dialog fullScreen open={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} PaperProps={{ sx: { bgcolor: theme.bg, backgroundImage: 'none' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.border}`, bgcolor: theme.headerBg }}>
          <IconButton onClick={() => setMobileSearchOpen(false)} sx={{ color: theme.textMain, mr: 1 }}><ArrowBackIcon /></IconButton>
          <InputBase autoFocus fullWidth placeholder={language === 'ms' ? "Cari..." : "Search..."} value={searchTerm || ''} onChange={(e) => setSearchTerm(e.target.value)} sx={{ color: theme.textMain, fontSize: '16px', fontFamily: "'Inter', sans-serif" }} />
        </Box>
        <Box sx={{ overflowY: 'auto' }}>
          {renderSearchList()}
        </Box>
      </Dialog>
    </Box>
  );
};

export default PageLayout;