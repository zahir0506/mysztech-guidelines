import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import './Sidebar.css';

// KEMAS KINI: Fungsi baru untuk baca sub-topik tanpa perlu pergi ke page
const getSubMenuItems = (item) => {
  const attr = item.attributes || item;
  const contentData = attr.Content || attr.content || attr.Description || attr.description;
  let subs = [];

  if (Array.isArray(contentData)) {
    const headings = contentData.filter(n => n.type === 'heading');
    const sliceLevel = headings.length > 0 ? Math.min(...headings.map(n => n.level || 2)) : 2;

    contentData.forEach((node, index) => {
      if (node.type === 'heading' && (node.level || 2) === sliceLevel) {
        const text = node.children ? node.children.map(c => c.text).join('') : '';
        subs.push({ id: `sub-${index}`, text });
      }
    });
  }
  return subs;
};

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
  
  // KEMAS KINI: State untuk kawal menu dropdown mana yang terbuka
  const [expandedTopic, setExpandedTopic] = useState(null);

  // KEMAS KINI: Buka dropdown secara automatik jika pengguna me-refresh page
  useEffect(() => {
    if (articleId) {
      setExpandedTopic(String(articleId));
    }
  }, [articleId]);

  const handleNavigate = (params) => {
    setSearchParams(params);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  // KEMAS KINI: Fungsi untuk butang toggle (buka/tutup) dropdown
  const toggleTopic = (id) => {
    setExpandedTopic(prev => prev === String(id) ? null : String(id));
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
        {/* USER GUIDELINES (1, 2, 3, 4, 5, 6, 7) */}
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
            const isExpanded = expandedTopic === String(item.id); // Check jika menu ni sedang kembang
            const attr = item.attributes || item;
            const menuTajuk = item.isEmptySlot ? item.fallbackTitle : (attr.title || attr.Title || "Tanpa Tajuk");
            
            // Dapatkan senarai sub-topik
            const subItems = getSubMenuItems(item);

            return (
              <React.Fragment key={item.id}>
                <Typography
                  // KEMAS KINI: Klik sekarang hanya toggle menu (tidak menukar URL page)
                  onClick={() => !item.isEmptySlot && toggleTopic(item.id)}
                  className={`sidebar-item ${item.isEmptySlot ? 'item-disabled' : ''} ${(isActive && !activeSub) ? 'active-item' : ''}`}
                  sx={{ 
                    cursor: item.isEmptySlot ? 'not-allowed' : 'pointer'
                  }}
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
                ) : (isExpanded && subItems.length > 0) ? (
                  // KEMAS KINI: Akan memaparkan senarai jika butang diklik (isExpanded)
                  <Box className="sidebar-submenu">
                    {subItems.map(heading => {
                      const isSubActive = isActive && activeSub === heading.id;
                      return (
                        <Typography
                          key={heading.id}
                          // Ini baru tukar URL page ke sub-topik sebenar
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