import React from 'react';
import { Box, Typography } from '@mui/material';
import './Sidebar.css';

const Sidebar = ({
  isIntroActive,
  prologueSubs,
  prologueMainId,
  filteredCards,
  articleId,
  activeSub,
  leftSubMenu,
  setSearchParams,
  isTroubleshootActive,
  onMobileClose,
  language
}) => {
  const handleNavigate = (params) => {
    setSearchParams(params);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <Box 
      component="nav" 
      className="doc-sidebar-nav"
    >
      <Box sx={{ flexGrow: 1 }}>
        
        {/* ======================================= */}
        {/* PROLOGUE & SUB-PAGES DARI STRAPI */}
        {/* ======================================= */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            onClick={() => handleNavigate({ id: prologueMainId || 'prologue' })}
            className={`sidebar-heading sidebar-clickable ${isIntroActive && (String(articleId) === String(prologueMainId) || articleId === 'prologue' || !articleId) ? 'active-main' : ''}`}
            sx={{ color: isIntroActive ? 'var(--global-accent)' : 'inherit' }}
          >
            {language === 'ms' ? 'Prolog' : 'Prologue'}
          </Typography>

          {/* Paparkan sub-page Prologue jika ada */}
          {(prologueSubs && prologueSubs.length > 0) ? (
            <Box className="sidebar-submenu">
              {prologueSubs.map(item => {
                const attr = item.attributes || item;
                const fullTitle = attr.title || attr.Title || "Tanpa Tajuk";
                
                // Buang perkataan "Prologue: " dari menu supaya nampak kemas
                const displayTitle = fullTitle.replace(/^(Prologue|Prolog)\s*[:-]\s*/i, '');
                const isSubPageActive = String(item.id) === String(articleId);

                return (
                  <Typography
                    key={item.id}
                    onClick={() => handleNavigate({ id: item.id })}
                    className={`sidebar-subitem ${isSubPageActive ? 'active-subitem' : ''}`}
                  >
                    {displayTitle}
                  </Typography>
                )
              })}
            </Box>
          ) : (isIntroActive && leftSubMenu.length > 0) ? (
            <Box className="sidebar-submenu">
              {leftSubMenu.map(heading => {
                const isSubActive = activeSub === heading.id;
                return (
                  <Typography
                    key={heading.id}
                    onClick={() => handleNavigate({ id: 'prologue', sub: heading.id })}
                    className={`sidebar-subitem ${isSubActive ? 'active-subitem' : ''}`}
                  >
                    {heading.text}
                  </Typography>
                )
              })}
            </Box>
          ) : null}
        </Box>

        {/* ======================================= */}
        {/* USER GUIDELINES */}
        {/* ======================================= */}
        <Typography className="sidebar-heading" sx={{ mt: 3 }}>
          {language === 'ms' ? 'Panduan Pengguna' : 'User Guidelines'}
        </Typography>
        
        <Box className="sidebar-list">
          {filteredCards.length === 0 && (
            <Typography className="sidebar-empty">
              {language === 'ms' ? 'Tiada topik dijumpai.' : 'No topic found.'}
            </Typography>
          )}
          {filteredCards.map(item => {
            const isActive = String(item.id) === String(articleId);
            const attr = item.attributes || item;
            const menuTajuk = item.isEmptySlot ? item.fallbackTitle : (attr.title || attr.Title || "Tanpa Tajuk");

            return (
              <React.Fragment key={item.id}>
                <Typography
                  onClick={() => !item.isEmptySlot && handleNavigate({ id: item.id })}
                  className={`sidebar-item ${item.isEmptySlot ? 'item-disabled' : ''} ${(isActive && !activeSub) ? 'active-item' : ''}`}
                >
                  {menuTajuk}
                </Typography>

                {(item.matchedHighlights && item.matchedHighlights.length > 0) ? (
                  <Box className="sidebar-submenu">
                    {item.matchedHighlights.map(highlight => (
                        <Typography
                          key={highlight.id}
                          onClick={() => handleNavigate({ id: item.id, sub: highlight.id })}
                          className="sidebar-subitem"
                        >
                          <span style={{ color: 'var(--global-accent)', marginRight: '6px', fontSize: '16px', verticalAlign: 'middle' }}>•</span>
                          {highlight.text}
                        </Typography>
                    ))}
                  </Box>
                ) : (isActive && leftSubMenu.length > 0) ? (
                  <Box className="sidebar-submenu">
                    {leftSubMenu.map(heading => {
                      const isSubActive = activeSub === heading.id;
                      return (
                        <Typography
                          key={heading.id}
                          onClick={() => handleNavigate({ id: item.id, sub: heading.id })}
                          className={`sidebar-subitem ${isSubActive ? 'active-subitem' : ''}`}
                        >
                          {heading.text}
                        </Typography>
                      )
                    })}
                  </Box>
                ) : null}
              </React.Fragment>
            );
          })}
        </Box>

        {/* ======================================= */}
        {/* TROUBLESHOOTING DARI KOMPONEN KASTAM */}
        {/* ======================================= */}
        <Typography className="sidebar-heading sidebar-mt">
          {language === 'ms' ? 'Sokongan' : 'Support'}
        </Typography>

        <Box className="sidebar-list">
          <Typography
            onClick={() => handleNavigate({ id: 'troubleshooting_page' })}
            className={`sidebar-item ${isTroubleshootActive ? 'active-item' : ''}`}
          >
            Troubleshooting
          </Typography>
        </Box>

      </Box>
    </Box>
  );
};

export default Sidebar;