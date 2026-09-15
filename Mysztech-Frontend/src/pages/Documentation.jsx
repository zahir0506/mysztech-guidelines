import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { client } from '../../tina/__generated__/client'; 
import { TinaMarkdown } from 'tinacms/dist/rich-text'; 

import Troubleshooting from './Troubleshooting';
import Sidebar from '../components/Sidebar';
import PageLayout from '../components/PageLayout';

import { Typography, CircularProgress, Box, Link as MuiLink } from '@mui/material';

const Documentation = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const articleId = searchParams.get('id');

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('mysztech_lang');
    if (savedLang) setLanguage(savedLang);
    const savedTheme = localStorage.getItem('mysztech_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ms' : 'en';
    setLanguage(newLang);
    localStorage.setItem('mysztech_lang', newLang);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('mysztech_theme', newTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
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

  // TARIK DATA DARI TINACMS
  useEffect(() => {
    const fetchDocsFromTina = async () => {
      setLoading(true);
      try {
        const response = await client.queries.guidelinesConnection();
        const docs = response.data.guidelinesConnection.edges.map(edge => edge.node);
        
        // Susun mengikut nombor "order"
        docs.sort((a, b) => (a.order || 99) - (b.order || 99));
        setArticles(docs);
        setLoading(false);
      } catch (error) {
        console.error("Ralat ketika menarik data dari TinaCMS:", error);
        setLoading(false);
      }
    };
    fetchDocsFromTina();
  }, [language]);

  // Tetapkan artikel pertama secara automatik jika tiada ID dipilih
  useEffect(() => {
    if (loading || articles.length === 0) return;
    
    const isValid = articleId === 'troubleshooting_page' || articles.some(item => item._sys.filename === articleId);
    if (!articleId || !isValid) {
      setSearchParams({ id: articles[0]._sys.filename }, { replace: true });
    }
  }, [loading, articleId, articles, setSearchParams]);

  // Carian ringkas
  const searchResults = useMemo(() => {
    if (searchTerm.trim().length < 2) return [];
    const lowerQuery = searchTerm.toLowerCase();
    return articles
      .filter(item => item.title && item.title.toLowerCase().includes(lowerQuery))
      .map(item => ({
        id: item._sys.filename,
        type: 'article',
        articleId: item._sys.filename,
        title: item.title,
        snippet: 'Panduan MYSZTECH'
      }));
  }, [searchTerm, articles]);

  const highlightMatch = (text) => {
    if (!searchTerm || !text) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <Box component="span" key={i} sx={{ color: theme.accent, fontWeight: '700' }}>{part}</Box>
      ) : part
    );
  };

  const handleSearchResultClick = (result) => {
    setSearchParams({ id: result.articleId });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: theme.bg, flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: theme.accent }} />
        <Typography sx={{ color: theme.textMuted, fontFamily: "'Inter', sans-serif" }}>
          {language === 'ms' ? 'Memuatkan panduan MYSZTECH...' : 'Loading MYSZTECH guidelines...'}
        </Typography>
      </Box>
    );
  }

  const isTroubleshootActive = articleId === 'troubleshooting_page';
  
  // Cari artikel yang sedang dipilih berdasarkan nama fail (_sys.filename)
  let selectedArticle = null;
  if (!isTroubleshootActive) {
    selectedArticle = articles.find(item => item._sys.filename === articleId) || articles[0];
  }

  const sidebarProps = {
    language,
    onMobileClose: () => {}
  };

  return (
    <PageLayout
      theme={theme} isDarkMode={isDarkMode} toggleTheme={toggleTheme} language={language} toggleLanguage={toggleLanguage}
      searchTerm={searchTerm} setSearchTerm={setSearchTerm}
      searchFocused={searchFocused} setSearchFocused={searchFocused}
      searchResults={searchResults} onSearchResultClick={handleSearchResultClick} highlightMatch={highlightMatch}
      setSearchParams={setSearchParams} sidebarProps={sidebarProps}
    >
      {isTroubleshootActive ? (
        <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <Troubleshooting isDarkMode={isDarkMode} language={language} />
        </Box>
      ) : selectedArticle ? (
        <Box>
          <Typography variant="h2" sx={{ fontFamily: "'Sora', sans-serif", color: theme.textMain, fontWeight: '700', mb: 4, letterSpacing: '-1px', fontSize: { xs: '32px', md: '42px' }, maxWidth: '850px' }}>
            {selectedArticle.title}
          </Typography>
          
          <Box sx={{ color: theme.textBody, fontFamily: "'Inter', sans-serif", lineHeight: 1.8 }}>
            {selectedArticle.body ? (
              <Box 
                className="tina-content"
                sx={{
                  // Gaya automatik untuk semua gambar yang keluar dari TinaCMS
                  '& img': {
                    maxWidth: '100%',    // Pastikan gambar tak lebih lebar dari skrin
                    height: 'auto',      // Kekalkan nisbah (ratio) gambar
                    borderRadius: '8px',
                    my: 3,               
                    display: 'block',
                    border: `1px solid ${theme.border}`
                  }
                }}
              >
                <TinaMarkdown 
                  content={selectedArticle.body} 
                  components={{
                    // ====================================================
                    // PEMBACA KOTAK INFO (BIRU/OREN)
                    // ====================================================
                    KotakInfo: (props) => {
                      const isOrange = props.jenis === 'oren';
                      const bgColor = isOrange ? '#fd7e14' : '#0c6b8a';
                      const textColor = isOrange ? '#111827' : '#ffffff';
                      const borderColor = isOrange ? '#111827' : '#064459';

                      return (
                        <Box
                          sx={{
                            backgroundColor: bgColor,
                            border: `1.5px solid ${borderColor}`,
                            borderRadius: '6px',
                            p: { xs: 2, sm: 2.5, md: 3.5 },
                            mb: 4,
                            maxWidth: '850px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            '& p, & span, & strong, & em, & li, & h1, & h2, & h3': { color: `${textColor} !important` },
                            '& ul, & ol': { paddingLeft: '24px', marginBottom: 0 },
                            '& ul': { listStyleType: 'disc' },
                            '& ul ul': { listStyleType: 'circle', mt: 1 },
                            '& ul ul ul': { listStyleType: 'square', mt: 1 }
                          }}
                        >
                          <TinaMarkdown content={props.kandungan} />
                        </Box>
                      );
                    }
                    // ====================================================
                  }}
                />
              </Box>
            ) : (
              <Typography sx={{ color: theme.textMuted, fontStyle: 'italic' }}>Tiada isi kandungan.</Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Typography sx={{ color: theme.textMuted, fontStyle: 'italic' }}>Tiada kandungan dijumpai.</Typography>
      )}
    </PageLayout>
  );
};

export default Documentation;