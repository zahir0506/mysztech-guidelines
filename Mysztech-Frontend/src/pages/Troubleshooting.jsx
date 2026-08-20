import React, { useEffect, useState } from 'react';
import { getWhatToDos, getWhatNotToDos } from '../services/api';

// --- KOMPONEN MATERIAL-UI (MUI) ---
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';

// --- IKON MUI ---
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const Troubleshooting = ({ isDarkMode = false }) => {
  const [whatToDos, setWhatToDos] = useState([]);
  const [whatNotToDos, setWhatNotToDos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todoResponse, notTodoResponse] = await Promise.all([
          getWhatToDos(),
          getWhatNotToDos()
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
  }, []);

  const parseRichText = (contentData) => {
    if (!contentData) return "Tiada Penerangan";
    if (typeof contentData === 'string') return contentData;
    
    if (Array.isArray(contentData)) {
        try {
            return contentData.map(block => {
                if (block.children) {
                    return block.children.map(child => child.text).join('');
                }
                return '';
            }).join('\n');
        } catch (e) {
            return "Format teks tidak disokong.";
        }
    }
    return "Tiada Penerangan";
  };

  // --- PEMBOLEH UBAH WARNA DINAMIK (DARK MODE) ---
  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const textMuted = isDarkMode ? '#d4d4d8' : '#4b5563';
  
  const dosColor = isDarkMode ? '#4ade80' : '#16a34a'; 
  const dontsColor = isDarkMode ? '#f87171' : '#dc2626'; 
  
  const dosBg = isDarkMode ? '#1a1a1a' : '#f0fdf4';
  const dontsBg = isDarkMode ? '#1a1a1a' : '#fef2f2';

  const dosBorder = isDarkMode ? 'rgba(74, 222, 128, 0.3)' : 'rgba(22, 163, 74, 0.2)';
  const dontsBorder = isDarkMode ? 'rgba(248, 113, 113, 0.3)' : 'rgba(220, 38, 38, 0.2)';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: '#f97316' }} />
        <Typography sx={{ fontFamily: "'Inter', sans-serif", color: textMuted }}>
          Memuatkan panduan...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', // Center secara menegak
        width: '100%',
        minHeight: { xs: 'auto', md: 'calc(100vh - 200px)' },
        pb: 5
    }}>
      
      <Typography 
        variant="h2" 
        sx={{ 
          mb: 2, 
          fontWeight: '700', 
          fontFamily: "'Sora', sans-serif",
          letterSpacing: '-1px',
          color: textColor,
          fontSize: { xs: '32px', md: '42px' },
          textAlign: 'center' // Tajuk di tengah
        }}
      >
        Usage Guide
      </Typography>
      
      <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', mb: 6, color: textMuted, lineHeight: 1.6, textAlign: 'center', maxWidth: '600px', mx: 'auto' }}>
        Sila patuhi amalan terbaik di bawah ketika mengendalikan sistem POS untuk mengelakkan sebarang ralat atau isu teknikal.
      </Typography>

      {/* --- KOTAK FLEXBOX UTAMA (DIJAMIN CENTER) --- */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 4, 
        justifyContent: 'center',
        alignItems: 'stretch',
        width: '100%', 
        maxWidth: '850px', // Had lebar supaya nampak proporsional
        mx: 'auto' // Tolak ke kiri dan kanan sama rata
      }}>
        
        {/* --- KOTAK 1: DO'S (WHAT TO DO) --- */}
        <Paper 
          elevation={0} 
          sx={{ 
            flex: 1, // Pastikan saiz sama dengan kotak sebelah
            p: { xs: 3, md: 4 }, 
            borderRadius: '16px', 
            bgcolor: dosBg, 
            border: `1px solid ${dosBorder}`,
            borderTop: `5px solid ${dosColor}`, 
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'left', // Pastikan teks di dalam kembali ke kiri
            transition: 'all 0.3s ease'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CheckCircleIcon sx={{ color: dosColor, fontSize: 32, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: '700', color: dosColor, fontFamily: "'Sora', sans-serif" }}>
              Do's
            </Typography>
          </Box>

          <Divider sx={{ mb: 3, borderColor: dosBorder }} />

          <Box sx={{ flexGrow: 1 }}>
            {whatToDos.length === 0 ? (
              <Typography sx={{ fontFamily: "'Inter', sans-serif", color: textMuted, fontStyle: 'italic' }}>Tiada panduan diletakkan.</Typography>
            ) : (
              whatToDos.map((item, index) => {
                const attr = item.attributes || item;
                const tajuk = attr.title || attr.Title || "Tiada Tajuk";
                const penerangan = parseRichText(attr.Content || attr.content);
                
                return (
                  <Box key={item.id} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                    {tajuk !== "Tiada Tajuk" && (
                      <Typography variant="subtitle1" sx={{ color: dosColor, fontWeight: '700', mb: 0.5, fontFamily: "'Inter', sans-serif" }}>
                        {index + 1}. {tajuk}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: textMuted, whiteSpace: 'pre-wrap', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", pl: tajuk !== "Tiada Tajuk" ? 2 : 0 }}>
                      {penerangan}
                    </Typography>
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
            flex: 1, // Pastikan saiz sama dengan kotak sebelah
            p: { xs: 3, md: 4 }, 
            borderRadius: '16px', 
            bgcolor: dontsBg, 
            border: `1px solid ${dontsBorder}`,
            borderTop: `5px solid ${dontsColor}`, 
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'left', // Pastikan teks di dalam kembali ke kiri
            transition: 'all 0.3s ease'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CancelIcon sx={{ color: dontsColor, fontSize: 32, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: '700', color: dontsColor, fontFamily: "'Sora', sans-serif" }}>
              Don'ts
            </Typography>
          </Box>

          <Divider sx={{ mb: 3, borderColor: dontsBorder }} />

          <Box sx={{ flexGrow: 1 }}>
            {whatNotToDos.length === 0 ? (
              <Typography sx={{ fontFamily: "'Inter', sans-serif", color: textMuted, fontStyle: 'italic' }}>Tiada panduan diletakkan.</Typography>
            ) : (
              whatNotToDos.map((item, index) => {
                const attr = item.attributes || item;
                const tajuk = attr.title || attr.Title || "Tiada Tajuk";
                const penerangan = parseRichText(attr.Content || attr.content);
                
                return (
                  <Box key={item.id} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                    {tajuk !== "Tiada Tajuk" && (
                      <Typography variant="subtitle1" sx={{ color: dontsColor, fontWeight: '700', mb: 0.5, fontFamily: "'Inter', sans-serif" }}>
                        {index + 1}. {tajuk}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: textMuted, whiteSpace: 'pre-wrap', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", pl: tajuk !== "Tiada Tajuk" ? 2 : 0 }}>
                      {penerangan}
                    </Typography>
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