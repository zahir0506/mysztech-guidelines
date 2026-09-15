import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { client } from '../../tina/__generated__/client'; // Sesuaikan path relative mengikut folder awak
import './Sidebar.css';

const Sidebar = ({ language, onMobileClose }) => {
  const [panduan, setPanduan] = useState([]);
  const [expandedTopic, setExpandedTopic] = useState(null);

  // Guna useSearchParams untuk baca '?id=nama-fail'
  const [searchParams] = useSearchParams();
  const activeId = searchParams.get('id');

  // Tarik data dari TinaCMS secara automatik apabila Sidebar dimuatkan
  useEffect(() => {
    const ambilDataTina = async () => {
      try {
        const respons = await client.queries.guidelinesConnection();
        let items = respons.data.guidelinesConnection.edges.map(edge => edge.node);

        // Susun mengikut nombor "order" yang awak tetapkan di admin panel
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

  // Asingkan mengikut Kumpulan Utama (Section)
  const userGuidelines = panduan.filter(item => item.section === "USER GUIDELINES");
  const support = panduan.filter(item => item.section === "SUPPORT");

  // Asingkan Topik Bapa dan Anak untuk User Guidelines
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
        {/* USER GUIDELINES (Ambil dari TinaCMS) */}
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

            // Cari senarai anak-anak untuk bapa ini
            const anakAnakTopik = subTopik.filter(sub => sub.parentTopic === item.title);

            // LOGIK BARU: Semak jika anak sedang aktif, atau jika bapa diklik
            const isChildActive = anakAnakTopik.some(anak => activeId === anak._sys.filename);
            const isExpanded = expandedTopic === filename || isChildActive;

            return (
              <React.Fragment key={filename}>
                {/* PAPARAN BAPA (TOPIK INDUK) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Link
                    to={pathPautan}
                    onClick={() => {
                      handleLinkClick();
                      // Buka atau tutup menu anak jika ada
                      if (anakAnakTopik.length > 0) {
                        toggleTopic(filename);
                      }
                    }}
                    style={{ textDecoration: 'none', flexGrow: 1 }}
                  >
                    <Typography className={`sidebar-item ${isActive ? 'active-item' : ''}`}>
                      {item.title}
                    </Typography>
                  </Link>
                </div>

                {/* PAPARAN ANAK (SUB-TOPIK) - Akan disorok jika isExpanded adalah palsu */}
                {isExpanded && anakAnakTopik.length > 0 && (
                  <Box className="sidebar-submenu" sx={{ pl: 2, mt: 0.5, mb: 1, animation: 'fadeIn 0.2s ease-in-out' }}>
                    {anakAnakTopik.map((anak) => {
                      const subFilename = anak._sys.filename;
                      const subPath = `/docs?id=${subFilename}`;
                      const subIsActive = activeId === subFilename;

                      return (
                        <Link
                          key={subFilename}
                          to={subPath}
                          onClick={handleLinkClick}
                          style={{ textDecoration: 'none', display: 'block' }}
                        >
                          <Typography
                            className={`sidebar-subitem ${subIsActive ? 'active-subitem' : ''}`}
                            sx={{ fontSize: '0.9em', opacity: 0.8 }}
                          >
                            <span style={{ color: 'var(--global-accent)', marginRight: '6px' }}>•</span>
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