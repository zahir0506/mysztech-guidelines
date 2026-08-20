import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getArticles } from '../services/api';

// --- IMPORT KOMPONEN TROUBLESHOOTING KASTAM AWAK DI SINI ---
import Troubleshooting from './Troubleshooting'; 

// --- KOMPONEN MATERIAL-UI (MUI) ---
import {
  CssBaseline, Box, Typography, CircularProgress, Divider, Button, IconButton, InputBase
} from '@mui/material';

// --- IKON MUI ---
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SearchIcon from '@mui/icons-material/Search';

const Documentation = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const articleId = searchParams.get('id');
  const activeSub = searchParams.get('sub'); 

  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('mysztech_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('mysztech_theme', !isDarkMode ? 'dark' : 'light');
  };

  const theme = {
    bg: isDarkMode ? '#111111' : '#ffffff',
    sidebarBg: isDarkMode ? '#111111' : '#f9fafb',
    headerBg: isDarkMode ? '#111111' : '#ffffff',
    searchBg: isDarkMode ? '#1f1f1f' : '#f3f4f6',
    textMain: isDarkMode ? '#ffffff' : '#111827',
    textBody: isDarkMode ? '#d4d4d8' : '#374151',
    textMuted: isDarkMode ? '#a1a1aa' : '#6b7280',
    border: isDarkMode ? '#27272a' : '#e5e7eb',
    borderHover: isDarkMode ? '#3f3f46' : '#d1d5db',
    accent: '#f97316', 
    accentHover: '#ea580c',
    cardBg: isDarkMode ? '#18181b' : '#ffffff',
    cardHover: isDarkMode ? '#27272a' : '#f3f4f6',
  };

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await getArticles();
        setArticles(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Ralat ketika menarik data dokumentasi:", error);
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); 
        if (searchInputRef.current) searchInputRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderNode = (node, index) => {
    if (!node) return null;

    const getFullText = (n) => {
      if (n.text !== undefined) return n.text;
      if (n.children) return n.children.map(getFullText).join('');
      return '';
    };

    if (node.type === 'heading') {
      const fullString = getFullText(node);
      const level = node.level || 2;
      const HeadingTag = `h${level}`;
      const fontSize = level === 1 ? '28px' : level === 2 ? '22px' : '18px';

      return (
        <HeadingTag
          key={index}
          id={`heading-${index}`}
          style={{
            fontFamily: "'Sora', sans-serif",
            color: theme.textMain,
            marginTop: '25px',
            marginBottom: '15px',
            fontSize: fontSize,
            fontWeight: '700',
            scrollMarginTop: '100px'
          }}
        >
          {fullString}
        </HeadingTag>
      );
    }

    if (node.type === 'paragraph' || node.type === 'list-item') {
      const fullString = getFullText(node);

      if (fullString.includes('![')) {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const matches = [...fullString.matchAll(imageRegex)];
        let textOnly = fullString.replace(imageRegex, '').trim();

        if (matches.length === 1) {
          let htmlText = '';
          if (textOnly) htmlText += `<span style="display: block; margin-bottom: 10px; font-family: 'Inter', sans-serif;">${textOnly}</span>`;
          htmlText += fullString.replace(imageRegex, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 25px auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: block; border: 1px solid ' + theme.border + '" />');
          
          const marginB = node.type === 'list-item' ? '8px' : '20px';
          if (node.type === 'list-item') {
            return <li key={index} style={{ marginBottom: marginB, lineHeight: '1.8', fontFamily: "'Inter', sans-serif" }} dangerouslySetInnerHTML={{ __html: htmlText }}></li>;
          }
          return <p key={index} style={{ marginBottom: marginB, lineHeight: '1.8', color: theme.textBody, fontFamily: "'Inter', sans-serif" }} dangerouslySetInnerHTML={{ __html: htmlText }}></p>;
        }

        let imagesHtml = '';
        if (textOnly) imagesHtml += `<p style="margin-bottom: 15px; color: ${theme.textBody}; font-family: 'Inter', sans-serif;">${textOnly}</p>`;
        
        imagesHtml += '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start; margin: 25px 0;">';
        matches.forEach(match => {
          const alt = match[1];
          const src = match[2];
          imagesHtml += `<img src="${src}" alt="${alt}" style="max-width: 47%; flex: 1 1 300px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); object-fit: contain; border: 1px solid ${theme.border}" />`;
        });
        imagesHtml += '</div>';

        const marginB = node.type === 'list-item' ? '8px' : '20px';
        if (node.type === 'list-item') {
          return <li key={index} style={{ marginBottom: marginB, lineHeight: '1.8', fontFamily: "'Inter', sans-serif" }} dangerouslySetInnerHTML={{ __html: imagesHtml }}></li>;
        }
        return <div key={index} style={{ marginBottom: marginB }}>
          <div dangerouslySetInnerHTML={{ __html: imagesHtml }} />
        </div>;
      }

      if (node.type === 'list-item') {
        return (
          <li key={index} style={{ marginBottom: '10px', lineHeight: '1.8', color: theme.textBody, fontFamily: "'Inter', sans-serif" }}>
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
          </li>
        );
      }

      return (
        <p key={index} style={{ marginBottom: '20px', lineHeight: '1.8', color: theme.textBody, fontFamily: "'Inter', sans-serif" }}>
          {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
        </p>
      );
    }

    if (node.text !== undefined) {
      let el = node.text;
      if (node.bold) el = <strong key={index} style={{ color: theme.textMain, fontFamily: "'Inter', sans-serif" }}>{el}</strong>;
      if (node.italic) el = <em key={index} style={{ fontFamily: "'Inter', sans-serif" }}>{el}</em>;
      return el;
    }

    if (node.type === 'link') {
      return (
        <a key={index} href={node.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.accent, textDecoration: 'underline', fontFamily: "'Inter', sans-serif" }}>
          {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
        </a>
      );
    }

    if (node.type === 'list') {
      const ListTag = node.format === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag key={index} style={{ paddingLeft: '20px', marginBottom: '25px', color: theme.textBody, fontFamily: "'Inter', sans-serif" }}>
          {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
        </ListTag>
      );
    }

    if (node.type === 'image') {
      const imgUrl = node.image?.url;
      if (!imgUrl) return null;
      const fullUrl = imgUrl.startsWith('http') ? imgUrl : `http://localhost:1337${imgUrl}`;
      return (
        <Box
          component="img"
          key={index}
          src={fullUrl}
          alt={node.image?.alternativeText || 'Gambar Panduan'}
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', md: '800px' },
            height: 'auto',
            borderRadius: '8px',
            display: 'block',
            mx: 'auto',
            my: 5,
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.border}`
          }}
        />
      );
    }

    return null;
  };

  const parseRichText = (contentData) => {
    if (!contentData) return null;
    if (typeof contentData === 'string') return <Typography sx={{ fontFamily: "'Inter', sans-serif" }}>{contentData}</Typography>;
    if (Array.isArray(contentData)) {
      return contentData.map((block, index) => renderNode(block, index));
    }
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: theme.bg, flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: theme.accent }} />
        <Typography sx={{ color: theme.textMuted, fontFamily: "'Inter', sans-serif" }}>Memuatkan manual sistem...</Typography>
      </Box>
    );
  }

  // ==========================================
  // CARI ARTIKEL INTRODUCTION DI DALAM STRAPI
  // ==========================================
  const introArticle = articles.find(item => {
    const attr = item.attributes || item;
    const title = attr.title || attr.Title || "";
    return title.toLowerCase().includes('introduction') || title.toLowerCase().includes('prologue');
  });

  // Tapis senarai panduan biasa (kecualikan Introduction dari senarai nombor 1-7 di bawahnya)
  const guidelineArticles = articles.filter(item => {
    const attr = item.attributes || item;
    const title = attr.title || attr.Title || "";
    return !title.toLowerCase().includes('introduction') && !title.toLowerCase().includes('prologue');
  });

  const totalSlots = 7;
  const displayCards = [];

  for (let i = 0; i < totalSlots; i++) {
    if (guidelineArticles[i]) {
      displayCards.push(guidelineArticles[i]);
    } else {
      displayCards.push({
        isEmptySlot: true,
        id: `empty-${i}`,
        slotNumber: i + 1,
        fallbackTitle: `${i + 1}. Topik Belum Ditetapkan`,
        fallbackContent: "Maaf, panduan untuk langkah ini masih belum dimasukkan oleh admin ke dalam sistem Strapi."
      });
    }
  }

  const filteredCards = displayCards.filter(item => {
    const attr = item.attributes || item;
    const title = item.isEmptySlot ? item.fallbackTitle : (attr.title || attr.Title || "Tanpa Tajuk");
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // ==========================================
  // PEMILIHAN ARTIKEL AKTIF & TROUBLESHOOTING
  // ==========================================
  const isTroubleshootActive = articleId === 'troubleshooting_page';
  let selectedArticle = null;

  if (!isTroubleshootActive) {
    // KEMASKINI: Sentiasa auto pergi ke introduction jika tiada articleId (buang halaman grid)
    if (!articleId || articleId === 'introduction') {
      selectedArticle = introArticle || {
        id: 'intro-fallback',
        attributes: {
          title: 'Introduction',
          Content: [{ type: 'paragraph', children: [{ text: 'Sila buat dan Publish satu artikel bertajuk "Introduction" di dalam Strapi awak.' }] }]
        }
      };
    } else {
      selectedArticle = displayCards.find((item) => String(item.id) === String(articleId)) || null;
    }
  }

  let tajuk = "";
  let kandungan = null;
  let chunks = [];
  let leftSubMenu = []; 
  let rightPageToc = []; 

  if (selectedArticle && !isTroubleshootActive) {
    if (selectedArticle.isEmptySlot) {
      tajuk = selectedArticle.fallbackTitle;
      kandungan = <Typography sx={{ color: theme.textMuted, fontStyle: 'italic', mt: 2, fontFamily: "'Inter', sans-serif" }}>{selectedArticle.fallbackContent}</Typography>;
    } else {
      const attr = selectedArticle.attributes || selectedArticle;
      tajuk = attr.title || attr.Title || "Tanpa Tajuk";
      const contentData = attr.Content || attr.content || attr.Description || attr.description;

      if (Array.isArray(contentData)) {
        const headings = contentData.filter(n => n.type === 'heading');
        const sliceLevel = headings.length > 0 ? Math.min(...headings.map(n => n.level || 2)) : 2;

        let currentSectionId = 'intro';
        let currentNodes = [];

        contentData.forEach((node, index) => {
          if (node.type === 'heading' && (node.level || 2) === sliceLevel) {
            chunks.push({ id: currentSectionId, nodes: currentNodes });
            currentSectionId = `sub-${index}`;
            currentNodes = [node];
            const text = node.children ? node.children.map(c => c.text).join('') : '';
            leftSubMenu.push({ id: currentSectionId, text, level: node.level || 2 });
          } else {
            currentNodes.push(node);
          }
        });
        chunks.push({ id: currentSectionId, nodes: currentNodes });
      } else {
        chunks.push({ id: 'intro', nodes: contentData });
      }

      let nodesToDisplay = [];
      if (activeSub) {
        const foundChunk = chunks.find(c => c.id === activeSub);
        nodesToDisplay = foundChunk ? foundChunk.nodes : [];
      } else {
        const introChunk = chunks.find(c => c.id === 'intro');
        nodesToDisplay = introChunk ? introChunk.nodes : [];
      }

      if (Array.isArray(nodesToDisplay)) {
        nodesToDisplay.forEach((node, idx) => {
          if (node.type === 'heading' && idx !== 0) { 
            const text = node.children ? node.children.map(c => c.text).join('') : '';
            rightPageToc.push({ id: `heading-${idx}`, text, level: node.level || 3 });
          }
        });
      }

      kandungan = <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>{parseRichText(nodesToDisplay)}</Box>;
    }
  }

  const isIntroActive = !articleId || articleId === 'introduction';

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
        {/* LOGO MYSZTECH POS */}
        <Typography 
          onClick={() => setSearchParams({ id: 'introduction' })}
          sx={{ 
            fontFamily: "'Sora', sans-serif", color: theme.accent, fontWeight: '800', fontSize: '20px', 
            letterSpacing: '1px', width: { xs: 'auto', md: '248px' }, cursor: 'pointer', transition: 'opacity 0.2s',
            '&:hover': { opacity: 0.8 }
          }}
        >
          MYSZTECH POS
        </Typography>

        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, alignItems: 'center', bgcolor: theme.searchBg, borderRadius: '8px', px: 2, py: 0.5, 
            width: { md: '500px', lg: '650px' }, 
            border: `1px solid transparent`, '&:hover': { borderColor: theme.borderHover }, transition: 'border-color 0.2s'
          }}
        >
          <SearchIcon sx={{ color: theme.textMuted, fontSize: 20, mr: 1 }} />
          <InputBase
            inputRef={searchInputRef}
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ color: theme.textMain, flexGrow: 1, fontFamily: "'Inter', sans-serif", fontSize: '14px' }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: theme.bg, px: 1, py: 0.2, borderRadius: '4px', border: `1px solid ${theme.border}` }}>
            <Typography sx={{ fontSize: '12px', color: theme.textMuted, fontWeight: 'bold' }}>⌘K</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={toggleTheme} sx={{ color: theme.textMain }}>
            {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* BAHAGIAN KANDUNGAN BAWAH */}
      <Box sx={{ display: 'flex', maxWidth: '1440px', mx: 'auto' }}>
        
        {/* LAJUR 1: MENU NAVIGASI KIRI */}
        <Box 
          component="nav" 
          sx={{ 
            width: 280, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', flexShrink: 0, p: 4, bgcolor: theme.sidebarBg,
            height: 'calc(100vh - 64px)', position: 'sticky', top: '64px', overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: theme.borderHover, borderRadius: '4px' }
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            
            {/* INTRODUCTION */}
            <Typography 
              onClick={() => setSearchParams({ id: 'introduction' })}
              sx={{ 
                color: isIntroActive ? theme.accent : theme.textMain, 
                fontWeight: '700', mb: 3, fontFamily: "'Inter', sans-serif", fontSize: '16px',
                cursor: 'pointer', transition: 'color 0.2s',
                '&:hover': { color: theme.accent }
              }}
            >
              Introduction
            </Typography>

            {/* USER GUIDELINES */}
            <Typography sx={{ color: theme.textMain, fontWeight: '700', mb: 3, fontFamily: "'Inter', sans-serif", fontSize: '16px' }}>
              User Guidelines
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 2, borderLeft: `1px solid ${theme.borderHover}` }}>
              {filteredCards.length === 0 && (
                <Typography sx={{ color: theme.textMuted, fontSize: '13px', fontStyle: 'italic', py: 1 }}>
                  Tiada topik dijumpai.
                </Typography>
              )}
              {filteredCards.map(item => {
                const isActive = String(item.id) === String(articleId);
                const attr = item.attributes || item;
                const menuTajuk = item.isEmptySlot ? item.fallbackTitle : (attr.title || attr.Title || "Tanpa Tajuk");

                return (
                  <React.Fragment key={item.id}>
                    <Typography
                      onClick={() => !item.isEmptySlot && setSearchParams({ id: item.id })}
                      sx={{
                        fontFamily: "'Inter', sans-serif", cursor: item.isEmptySlot ? 'not-allowed' : 'pointer',
                        color: (isActive && !activeSub) ? theme.accent : (item.isEmptySlot ? theme.textMuted : theme.textBody),
                        ml: '-1px', borderLeft: (isActive && !activeSub) ? `2px solid ${theme.accent}` : '2px solid transparent',
                        pl: 1.5, py: 0.5, fontSize: '14px', fontWeight: isActive ? '600' : 'normal', transition: 'all 0.2s',
                        '&:hover': { color: item.isEmptySlot ? theme.textMuted : theme.textMain }
                      }}
                    >
                      {menuTajuk}
                    </Typography>

                    {isActive && leftSubMenu.length > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 3, mb: 1, mt: -0.5 }}>
                        {leftSubMenu.map(heading => {
                          const isSubActive = activeSub === heading.id;
                          return (
                            <Typography
                              key={heading.id}
                              onClick={() => setSearchParams({ id: item.id, sub: heading.id })}
                              sx={{
                                fontFamily: "'Inter', sans-serif", color: isSubActive ? theme.accent : theme.textMuted, 
                                fontWeight: isSubActive ? '600' : 'normal', cursor: 'pointer', fontSize: '13px',
                                display: 'block', transition: 'color 0.2s', '&:hover': { color: theme.textMain }
                              }}
                            >
                              {heading.text}
                            </Typography>
                          )
                        })}
                      </Box>
                    )}
                  </React.Fragment>
                );
              })}
            </Box>

            {/* TROUBLESHOOTING DARI KOMPONEN KASTAM */}
            <Typography sx={{ color: theme.textMain, fontWeight: '700', mt: 4, mb: 3, fontFamily: "'Inter', sans-serif", fontSize: '16px' }}>
              Support
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 2, borderLeft: `1px solid ${theme.borderHover}` }}>
              <Typography
                onClick={() => setSearchParams({ id: 'troubleshooting_page' })}
                sx={{
                  fontFamily: "'Inter', sans-serif", cursor: 'pointer',
                  color: isTroubleshootActive ? theme.accent : theme.textBody,
                  ml: '-1px', borderLeft: isTroubleshootActive ? `2px solid ${theme.accent}` : '2px solid transparent',
                  pl: 1.5, py: 0.5, fontSize: '14px', fontWeight: isTroubleshootActive ? '600' : 'normal', transition: 'all 0.2s',
                  '&:hover': { color: theme.textMain }
                }}
              >
                Troubleshooting
              </Typography>
            </Box>

          </Box>
        </Box>

        {/* LAJUR 2: KANDUNGAN TENGAH */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 3, sm: 5, md: 6, lg: 8 }, maxWidth: '850px', width: '100%' }}>
          
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 4, alignItems: 'center', bgcolor: theme.searchBg, borderRadius: '8px', px: 2, py: 0.5 }}>
            <SearchIcon sx={{ color: theme.textMuted, fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Cari topik..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ color: theme.textMain, flexGrow: 1, fontFamily: "'Inter', sans-serif", fontSize: '14px' }}
            />
          </Box>

          {/* JIKA TROUBLESHOOTING AKTIF, PAPARKAN KOMPONEN JSX TERSEBUT */}
          {isTroubleshootActive ? (
            <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
             {/* GANTIKAN BARIS INI */}
            <Troubleshooting isDarkMode={isDarkMode} />
            </Box>
          ) : selectedArticle ? (
            <Box>
              <Button
                onClick={() => { if (activeSub) setSearchParams({ id: articleId }); else setSearchParams({}); }}
                startIcon={<ArrowBackIcon />}
                sx={{ display: { xs: 'inline-flex', md: 'none' }, mb: 3, color: theme.textMuted, textTransform: 'none', fontWeight: '600', fontFamily: "'Inter', sans-serif", '&:hover': { color: theme.textMain } }}
              >
                {activeSub ? 'Back to Topic Menu' : 'Back to Guidelines'}
              </Button>

              <Typography variant="h2" sx={{ fontFamily: "'Sora', sans-serif", color: theme.textMain, fontWeight: '700', mb: 4, letterSpacing: '-1px', fontSize: { xs: '32px', md: '42px' } }}>
                {tajuk}
              </Typography>
              
              {kandungan}
            </Box>
          ) : (
            <Typography sx={{ color: theme.textMuted, fontStyle: 'italic' }}>Tiada kandungan dijumpai.</Typography>
          )}
        </Box>

        {/* LAJUR 3: ISI KANDUNGAN KANAN (TOC) */}
        <Box 
          component="aside" 
          sx={{ 
            display: { xs: 'none', lg: 'block' }, width: 280, flexShrink: 0, p: 4,
            height: 'calc(100vh - 64px)', position: 'sticky', top: '64px', overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: theme.borderHover, borderRadius: '4px' }
          }}
        >
          {/* TOC Disembunyikan semasa Troubleshooting aktif */}
          {!isTroubleshootActive && rightPageToc.length > 0 && (
            <Box>
              <Typography sx={{ fontFamily: "'Inter', sans-serif", color: theme.textMain, fontWeight: '600', fontSize: '14px', mb: 3, display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', display: 'inline-block', width: '16px', height: '2px', backgroundColor: theme.textMuted }}></span>
                On this page
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '13px' }}>
                {rightPageToc.map(heading => (
                  <Typography
                    key={heading.id}
                    component="a"
                    href={`#${heading.id}`}
                    sx={{
                      fontFamily: "'Inter', sans-serif", color: theme.textMuted, textDecoration: 'none',
                      pl: (heading.level - 2) * 1.5, borderLeft: '2px solid transparent', transition: 'all 0.2s',
                      '&:hover': { color: theme.textMain, borderLeft: `2px solid ${theme.accent}`, pl: ((heading.level - 2) * 1.5) + 1 }
                    }}
                  >
                    {heading.text}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <style>{`
        body { 
          background-color: ${theme.bg}; 
          margin: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default Documentation;