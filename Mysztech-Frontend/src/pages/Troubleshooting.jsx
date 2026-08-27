import React, { useEffect, useState } from 'react';
import { getWhatToDos, getWhatNotToDos } from '../services/api';

// --- KOMPONEN MATERIAL-UI (MUI) ---
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Link as MuiLink // Ditambah untuk sokongan pautan
} from '@mui/material';

// --- IKON MUI ---
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const Troubleshooting = ({ isDarkMode = false, language = 'en' }) => {
  const [whatToDos, setWhatToDos] = useState([]);
  const [whatNotToDos, setWhatNotToDos] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- PEMBOLEH UBAH WARNA DINAMIK & PREMIUM ---
  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const textMuted = isDarkMode ? '#a1a1aa' : '#4b5563';

  const dosColor = isDarkMode ? '#4ade80' : '#16a34a';
  const dontsColor = isDarkMode ? '#f87171' : '#dc2626';

  const dosBg = isDarkMode
    ? 'linear-gradient(145deg, rgba(24, 24, 27, 0.6) 0%, rgba(22, 163, 74, 0.05) 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)';
  const dontsBg = isDarkMode
    ? 'linear-gradient(145deg, rgba(24, 24, 27, 0.6) 0%, rgba(220, 38, 38, 0.05) 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #fef2f2 100%)';

  const dosBorder = isDarkMode ? 'rgba(74, 222, 128, 0.15)' : 'rgba(22, 163, 74, 0.15)';
  const dontsBorder = isDarkMode ? 'rgba(248, 113, 113, 0.15)' : 'rgba(220, 38, 38, 0.15)';

  const dosGlow = isDarkMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(22, 163, 74, 0.08)';
  const dontsGlow = isDarkMode ? 'rgba(248, 113, 113, 0.1)' : 'rgba(220, 38, 38, 0.08)';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [todoResponse, notTodoResponse] = await Promise.all([
          getWhatToDos(language),
          getWhatNotToDos(language)
        ]);

        setWhatToDos(todoResponse.data.data);
        setWhatNotToDos(notTodoResponse.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Ralat ketika menarik data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [language]);

  // ==========================================
  // ENJIN PARSER MUI UNTUK STRAPI RICH TEXT
  // ==========================================
  const renderNode = (node, index) => {
    if (!node) return null;

    if (node.type === 'paragraph' || node.type === 'list-item') {
      if (node.type === 'list-item') {
        return (
          <Typography component="li" key={index} sx={{ mb: '8px', lineHeight: '1.7', color: textMuted, fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
          </Typography>
        );
      }
      return (
        <Typography key={index} paragraph sx={{ mb: '12px', lineHeight: '1.7', color: textMuted, fontFamily: "'Inter', sans-serif", fontSize: '14px', '&:last-child': { mb: 0 } }}>
          {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
        </Typography>
      );
    }

    if (node.text !== undefined) {
      let el = node.text;
      if (node.bold) el = <Box component="strong" sx={{ color: textColor, fontWeight: '700' }}>{el}</Box>;
      if (node.italic) el = <Box component="em">{el}</Box>;
      return <React.Fragment key={index}>{el}</React.Fragment>;
    }

    if (node.type === 'link') {
      return (
        <MuiLink key={index} href={node.url} target="_blank" rel="noopener noreferrer" sx={{ color: isDarkMode ? '#f97316' : '#ea580c', textDecoration: 'underline' }}>
          {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
        </MuiLink>
      );
    }

    if (node.type === 'list') {
      const ListTag = node.format === 'ordered' ? 'ol' : 'ul';
      return (
        <Box component={ListTag} key={index} sx={{ pl: '20px', mb: '16px', color: textMuted, fontFamily: "'Inter', sans-serif" }}>
          {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
        </Box>
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
          alt={node.image?.alternativeText || 'Guide Image'}
          sx={{ width: '100%', maxWidth: '100%', height: 'auto', borderRadius: '8px', display: 'block', mt: 2, mb: 2, border: `1px solid ${dosBorder}` }}
        />
      );
    }

    return null;
  };

  const parseRichText = (contentData) => {
    if (!contentData) return <Typography sx={{ color: textMuted, fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>{language === 'ms' ? "Tiada Penerangan" : "No description"}</Typography>;
    if (typeof contentData === 'string') return <Typography sx={{ color: textMuted, fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>{contentData}</Typography>;

    if (Array.isArray(contentData)) {
      return <Box>{contentData.map((block, index) => renderNode(block, index))}</Box>;
    }
    return null;
  };
  // ==========================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: '#f97316' }} />
        <Typography sx={{ fontFamily: "'Inter', sans-serif", color: textMuted }}>
          {language === 'ms' ? 'Memuatkan panduan...' : 'Loading guide...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      width: '100%',
      minHeight: { xs: 'auto', md: 'calc(100vh - 200px)' },
      pb: 5
    }}>

      <Typography
        variant="h2"
        sx={{
          mb: 2,
          fontWeight: '800',
          fontFamily: "'Sora', Inter",
          letterSpacing: '-1px',
          color: textColor,
          fontSize: { xs: '32px', md: '42px' },
          textAlign: 'left'
        }}
      >
        {language === 'ms' ? 'Panduan Penggunaan' : 'Usage Guide'}
      </Typography>

      <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', mb: 6, color: textMuted, lineHeight: 1.6, textAlign: 'left', maxWidth: '600px' }}>
        {language === 'ms'
          ? 'Sila patuhi amalan terbaik di bawah ketika mengendalikan sistem POS untuk mengelakkan sebarang ralat atau isu teknikal.'
          : 'Please adhere to the best practices below when handling the POS system to avoid any errors or technical issues.'}
      </Typography>

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 4,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: '1000px'
      }}>

        {/* --- KOTAK 1: DO'S (WHAT TO DO) --- */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: { xs: 3, md: 4 },
            borderRadius: '24px',
            background: dosBg,
            border: `1px solid ${dosBorder}`,
            boxShadow: `0 8px 32px ${isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)'}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 16px 40px ${dosGlow}`,
              borderColor: isDarkMode ? 'rgba(74, 222, 128, 0.3)' : 'rgba(22, 163, 74, 0.3)'
            }
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: dosColor }} />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: '14px',
              bgcolor: isDarkMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(22, 163, 74, 0.1)',
              mr: 2
            }}>
              <CheckCircleIcon sx={{ color: dosColor, fontSize: 28 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: '800', color: textColor, fontFamily: "'Sora', Inter" }}>
              Do's
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            {whatToDos.length === 0 ? (
              <Typography sx={{ fontFamily: "'Inter', sans-serif", color: textMuted, fontStyle: 'italic', textAlign: 'center', py: 4 }}>
                {language === 'ms' ? 'Tiada panduan diletakkan.' : 'No guide provided.'}
              </Typography>
            ) : (
              whatToDos.map((item, index) => {
                const attr = item.attributes || item;
                const tajuk = attr.title || attr.Title || (language === 'ms' ? "Tiada Tajuk" : "No Title");
                const penerangan = parseRichText(attr.Content || attr.content);

                return (
                  <Box key={item.id} sx={{ display: 'flex', gap: 2.5, mb: 3.5, '&:last-child': { mb: 0 } }}>
                    <Box sx={{
                      minWidth: '32px', height: '32px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      color: dosColor, fontWeight: '700', fontSize: '14px', fontFamily: "'Sora', Inter",
                      border: `1px solid ${dosBorder}`
                    }}>
                      {index + 1}
                    </Box>
                    <Box sx={{ pt: 0.5, flexGrow: 1 }}>
                      {tajuk !== (language === 'ms' ? "Tiada Tajuk" : "No Title") && (
                        <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: '700', mb: 1, fontFamily: "'Inter', sans-serif", fontSize: '16px' }}>
                          {tajuk}
                        </Typography>
                      )}
                      {/* PENERANGAN KINI DI-RENDER MENGGUNAKAN MUI */}
                      {penerangan}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Paper>

        {/* --- KOTAK 2: DON'TS (WHAT NOT TO DO) --- */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: { xs: 3, md: 4 },
            borderRadius: '24px',
            background: dontsBg,
            border: `1px solid ${dontsBorder}`,
            boxShadow: `0 8px 32px ${isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)'}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 16px 40px ${dontsGlow}`,
              borderColor: isDarkMode ? 'rgba(248, 113, 113, 0.3)' : 'rgba(220, 38, 38, 0.3)'
            }
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: dontsColor }} />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: '14px',
              bgcolor: isDarkMode ? 'rgba(248, 113, 113, 0.1)' : 'rgba(220, 38, 38, 0.1)',
              mr: 2
            }}>
              <CancelIcon sx={{ color: dontsColor, fontSize: 28 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: '800', color: textColor, fontFamily: "'Sora', Inter" }}>
              Don'ts
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            {whatNotToDos.length === 0 ? (
              <Typography sx={{ fontFamily: "'Inter', sans-serif", color: textMuted, fontStyle: 'italic', textAlign: 'center', py: 4 }}>
                {language === 'ms' ? 'Tiada panduan diletakkan.' : 'No guide provided.'}
              </Typography>
            ) : (
              whatNotToDos.map((item, index) => {
                const attr = item.attributes || item;
                const tajuk = attr.title || attr.Title || (language === 'ms' ? "Tiada Tajuk" : "No Title");
                const penerangan = parseRichText(attr.Content || attr.content);

                return (
                  <Box key={item.id} sx={{ display: 'flex', gap: 2.5, mb: 3.5, '&:last-child': { mb: 0 } }}>
                    <Box sx={{
                      minWidth: '32px', height: '32px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      color: dontsColor, fontWeight: '700', fontSize: '14px', fontFamily: "'Sora', Inter",
                      border: `1px solid ${dontsBorder}`
                    }}>
                      {index + 1}
                    </Box>
                    <Box sx={{ pt: 0.5, flexGrow: 1 }}>
                      {tajuk !== (language === 'ms' ? "Tiada Tajuk" : "No Title") && (
                        <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: '700', mb: 1, fontFamily: "'Inter', sans-serif", fontSize: '16px' }}>
                          {tajuk}
                        </Typography>
                      )}
                      {penerangan}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Paper>

      </Box>
    </Box>
  );
};

export default Troubleshooting;