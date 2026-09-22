import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { client } from '../../tina/__generated__/client'; // Sesuaikan path mengikut folder awak
import './Sidebar.css';

const Sidebar = ({ language, onMobileClose }) => {
  const [panduan, setPanduan] = useState([]);
  const [expandedTopic, setExpandedTopic] = useState(null);
  
  const [searchParams] = useSearchParams();
  const activeId = searchParams.get('id');

  // Tarik data dari TinaCMS
  useEffect(() => {
    const ambilDataTina = async () => {
      try {
        const respons = await client.queries.guidelinesConnection();
        let items = respons.data.guidelinesConnection.edges.map(edge => edge.node);
        
        items.sort((a, b) => (a.order || 99) - (b.order || 99));
        setPanduan(items);
      } catch (error) {
        console.error("Gagal menarik data dari TinaCMS:", error);
      }
    };

    ambilDataTina();
  }, []);

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const toggleTopic = (filename) => {
    setExpandedTopic(prev => prev === filename ? null : filename);
  };

  const userGuidelines = panduan.filter(item => item.section === "USER GUIDELINES");
  const support = panduan.filter(item => item.section === "SUPPORT");

  const topikUtama = userGuidelines.filter(item => !item.isSubTopic);
  const subTopik = userGuidelines.filter(item => item.isSubTopic);

  return (
    <Box component="nav" className="doc-sidebar-nav">
      <Box sx={{ flexGrow: 1 }}>
        
        {/* ======================================= */}
        {/* PROLOGUE / INTRO */}
        {/* ======================================= */}
        <Box sx={{ mb: 2 }}>
          <Link 
            to="/docs?id=prologue" 
            onClick={handleLinkClick}
            style={{ textDecoration: 'none' }}
          >
            <Typography className={`sidebar-heading sidebar-clickable ${activeId === 'prologue' || !activeId ? 'active-main' : ''}`}>
              {language === 'ms' ? 'Prolog' : 'Prologue'}
            </Typography>
          </Link>
        </Box>

        {/* ======================================= */}
        {/* USER GUIDELINES */}
        {/* ======================================= */}
        <Typography className="sidebar-heading" sx={{ mt: 3 }}>
          {language === 'ms' ? 'Panduan Pengguna' : 'User Guidelines'}
        </Typography>
        
        <Box className="sidebar-list">
          {topikUtama.length === 0 && (
            <Typography className="sidebar-empty">
              {language === 'ms' ? 'Tiada topik dijumpai.' : 'No topic found.'}
            </Typography>
          )}

          {topikUtama.map((item) => {
            const filename = item._sys.filename;
            const pathPautan = `/docs?id=${filename}`;
            const isActive = activeId === filename;
            
            // Cari anak-anak
            const anakAnakTopik = subTopik.filter(sub => sub.parentTopic === item.title);
            const hasChildren = anakAnakTopik.length > 0;

            const isChildActive = anakAnakTopik.some(anak => activeId === anak._sys.filename);
            const isExpanded = expandedTopic === filename || isChildActive;

            return (
              <React.Fragment key={filename}>
                {/* PAPARAN BAPA (TOPIK INDUK) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  
                  {hasChildren ? (
                    // JIKA ADA ANAK: Cuma buka/tutup menu (Jangan tukar muka surat)
                    <div 
                      onClick={() => toggleTopic(filename)}
                      style={{ flexGrow: 1, cursor: 'pointer' }}
                    >
                      <Typography className={`sidebar-item ${isExpanded ? 'active-item' : ''}`}>
                        {item.title}
                      </Typography>
                    </div>
                  ) : (
                    // JIKA TIADA ANAK: Bertindak sebagai Link biasa (Tukar muka surat)
                    <Link 
                      to={pathPautan} 
                      onClick={handleLinkClick}
                      style={{ textDecoration: 'none', flexGrow: 1 }}
                    >
                      <Typography className={`sidebar-item ${isActive ? 'active-item' : ''}`}>
                        {item.title}
                      </Typography>
                    </Link>
                  )}

                </div>

                {/* PAPARAN ANAK (SUB-TOPIK) */}
                {isExpanded && hasChildren && (
                  <Box className="sidebar-submenu" sx={{ pl: 2.5, mt: 0.5, mb: 1, animation: 'fadeIn 0.2s ease-in-out' }}>
                    {anakAnakTopik.map((anak) => {
                      const subFilename = anak._sys.filename;
                      const subPath = `/docs?id=${subFilename}`;
                      const subIsActive = activeId === subFilename;

                      return (
                        <Link 
                          key={subFilename}
                          to={subPath} 
                          onClick={handleLinkClick}
                          style={{ textDecoration: 'none', display: 'block', padding: '4px 0' }}
                        >
                          <Typography 
                            className={`sidebar-subitem ${subIsActive ? 'active-subitem' : ''}`}
                            sx={{ 
                              fontSize: '0.95em', 
                              // KEMAS KINI: Tukar warna kelabu supaya lebih terang (#d1d5db) dan oren bila aktif
                              color: subIsActive ? '#f97316' : '#d1d5db', 
                              transition: 'color 0.2s',
                              '&:hover': {
                                color: '#f97316'
                              }
                            }}
                          >
                            {/* TITIK BULLET TELAH DIPADAM DI SINI */}
                            {anak.title}
                          </Typography>
                        </Link>
                      );
                    })}
                  </Box>
                )}
              </React.Fragment>
            );
          })}
        </Box>

        {/* ======================================= */}
        {/* SUPPORT / TROUBLESHOOTING */}
        {/* ======================================= */}
        <Typography className="sidebar-heading sidebar-mt">
          {language === 'ms' ? 'Sokongan' : 'Support'}
        </Typography>

        <Box className="sidebar-list">
          {support.length > 0 ? (
            support.map((item) => {
              const pathPautan = `/docs?id=${item._sys.filename}`;
              const isActive = activeId === item._sys.filename;
              return (
                <Link key={item._sys.filename} to={pathPautan} onClick={handleLinkClick} style={{ textDecoration: 'none' }}>
                  <Typography className={`sidebar-item ${isActive ? 'active-item' : ''}`}>
                    {item.title}
                  </Typography>
                </Link>
              );
            })
          ) : (
            <Link to="/docs?id=troubleshooting_page" onClick={handleLinkClick} style={{ textDecoration: 'none' }}>
              <Typography className={`sidebar-item ${activeId === 'troubleshooting_page' ? 'active-item' : ''}`}>
                Troubleshooting
              </Typography>
            </Link>
          )}
        </Box>

      </Box>
    </Box>
  );
};

export default Sidebar;