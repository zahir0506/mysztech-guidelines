import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { getArticles, getPrologues } from '../services/api';

import Troubleshooting from './Troubleshooting';
import Sidebar from '../components/Sidebar';
import PageLayout from '../components/PageLayout';

import { Typography, CircularProgress, Button, Box, Link as MuiLink } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const getFullTextHelper = (n) => {
  if (!n) return '';
  if (n.text !== undefined) return n.text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');
  if (n.children) return n.children.map(getFullTextHelper).join('');
  return '';
};

const getArticleChunks = (contentData) => {
  let chunks = [];
  let leftSubMenu = [];

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

  return { chunks, leftSubMenu };
};

const Documentation = () => {
  const [articles, setArticles] = useState([]);
  const [prologueArticles, setPrologueArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const articleId = searchParams.get('id');
  const activeSub = searchParams.get('sub');

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

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const [docsResponse, prologuesResponse] = await Promise.all([
          getArticles(language),
          getPrologues(language)
        ]);
        setArticles(docsResponse.data.data);
        setPrologueArticles(prologuesResponse.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Ralat ketika menarik data dokumentasi:", error);
        setLoading(false);
      }
    };
    fetchDocs();
  }, [language]);

  useEffect(() => {
    if (!loading && (!articleId || articleId === 'prologue')) {
      const findMainPrologue = (sourceArray) => {
        return sourceArray.find(item => {
          const attr = item.attributes || item;
          const title = attr.title || attr.Title || "";
          return title.toLowerCase().trim() === 'prologue' || title.toLowerCase().trim() === 'prolog';
        });
      };

      const main = findMainPrologue(prologueArticles) || findMainPrologue(articles);
      const subs = prologueArticles.filter(item => {
        const title = (item.attributes || item).title || "";
        return title.toLowerCase().trim() !== 'prologue' && title.toLowerCase().trim() !== 'prolog';
      });

      if (main && String(main.id) !== articleId) {
        setSearchParams({ id: main.id }, { replace: true });
      } else if (!main && subs.length > 0 && String(subs[0].id) !== articleId) {
        setSearchParams({ id: subs[0].id }, { replace: true });
      }
    }
  }, [loading, articleId, articles, prologueArticles, setSearchParams]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchFocused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    if (searchTerm.trim().length < 2) return [];

    const lowerQuery = searchTerm.toLowerCase();
    const results = [];
    const allDocs = [...prologueArticles, ...articles];

    allDocs.forEach(item => {
      const attr = item.attributes || item;
      let rawTitle = attr.title || attr.Title || "";
      const displayTitle = rawTitle.replace(/^(Prologue|Prolog)\s*[:-]\s*/i, '');
      const contentData = attr.Content || attr.content || attr.Description || attr.description;

      const { chunks, leftSubMenu } = getArticleChunks(contentData);

      if (displayTitle.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `art-${item.id}`, type: 'article', articleId: item.id, subId: null,
          title: displayTitle, snippet: language === 'ms' ? 'Artikel Utama' : 'Main Article'
        });
      }

      chunks.forEach(chunk => {
        let headingText = chunk.id === 'intro' ? displayTitle : (leftSubMenu.find(s => s.id === chunk.id)?.text || displayTitle);
        let subId = chunk.id === 'intro' ? null : chunk.id;

        if (chunk.id !== 'intro' && headingText.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: `head-${item.id}-${chunk.id}`, type: 'heading', articleId: item.id, subId: subId,
            title: headingText, snippet: `${displayTitle} > ${headingText}`
          });
        }

        if (Array.isArray(chunk.nodes)) {
          let chunkText = chunk.nodes.map(node => getFullTextHelper(node)).join(' ');

          chunkText = chunkText
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '')
            .replace(/https?:\/\/[^\s]+/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          if (chunkText.toLowerCase().includes(lowerQuery)) {
            const matchIndex = chunkText.toLowerCase().indexOf(lowerQuery);
            const start = Math.max(0, matchIndex - 40);
            const end = Math.min(chunkText.length, matchIndex + 80);
            const snippet = "..." + chunkText.substring(start, end).replace(/\n/g, ' ') + "...";

            if (!results.some(r => r.type === 'content' && r.articleId === item.id && r.subId === subId)) {
              results.push({
                id: `txt-${item.id}-${chunk.id}`, type: 'content', articleId: item.id, subId: subId,
                title: headingText, snippet: snippet
              });
            }
          }
        }
      });
    });

    return results;
  }, [searchTerm, articles, prologueArticles, language]);

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
    setSearchParams(result.subId ? { id: result.articleId, sub: result.subId } : { id: result.articleId });
  };

  const highlightText = (text) => {
    if (!searchTerm || !text) return text;
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <Box component="mark" key={i} sx={{ backgroundColor: '#fef08a', color: '#111827', borderRadius: '3px', padding: '0 2px' }}>{part}</Box>
      ) : part
    );
  };

  const highlightHTML = (htmlString) => {
    if (!searchTerm || !htmlString) return htmlString;
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    return htmlString.replace(regex, '<mark style="background-color: #fef08a; color: #111827; border-radius: 3px; padding: 0 2px;">$1</mark>');
  };

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
      const fontSize = level === 1 ? '28px' : level === 2 ? '22px' : '18px';

      return (
        <Typography
          key={index}
          id={`heading-${index}`}
          variant={`h${level}`}
          sx={{ fontFamily: "'Sora', sans-serif", color: theme.textMain, mt: '25px', mb: '15px', fontSize: fontSize, fontWeight: '700', scrollMarginTop: '100px', maxWidth: '850px' }}
        >
          {highlightText(fullString)}
        </Typography>
      );
    }

    if (node.type === 'paragraph' || node.type === 'list-item') {
      const fullString = getFullText(node);

      if (fullString.includes('![')) {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const matches = [...fullString.matchAll(imageRegex)];
        let textOnly = fullString.replace(imageRegex, '').trim();
        let highlightedTextOnly = highlightHTML(textOnly);

        if (matches.length === 1) {
          let htmlText = '';
          if (textOnly) htmlText += `<span style="display: block; margin-bottom: 10px; font-family: 'Inter', sans-serif; max-width: 850px;">${highlightedTextOnly}</span>`;
          htmlText += fullString.replace(imageRegex, `<img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 25px auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: block; border: 1px solid ${theme.border}" />`);
          const marginB = node.type === 'list-item' ? '8px' : '20px';
          if (node.type === 'list-item') return <Box component="li" key={index} sx={{ mb: marginB, lineHeight: '1.8', fontFamily: "'Inter', sans-serif" }} dangerouslySetInnerHTML={{ __html: htmlText }} />;
          return <Box key={index} sx={{ mb: marginB, lineHeight: '1.8', color: theme.textBody, fontFamily: "'Inter', sans-serif" }} dangerouslySetInnerHTML={{ __html: htmlText }} />;
        }

        let imagesHtml = '';
        if (textOnly) imagesHtml += `<p style="margin-bottom: 15px; color: ${theme.textBody}; font-family: 'Inter', sans-serif; max-width: 850px;">${highlightedTextOnly}</p>`;
        imagesHtml += '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin: 25px 0;">';
        matches.forEach(match => {
          imagesHtml += `<img src="${match[2]}" alt="${match[1]}" style="max-width: 47%; flex: 1 1 300px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); object-fit: contain; border: 1px solid ${theme.border}" />`;
        });
        imagesHtml += '</div>';

        const marginB = node.type === 'list-item' ? '8px' : '20px';
        if (node.type === 'list-item') return <Box component="li" key={index} sx={{ mb: marginB, lineHeight: '1.8', fontFamily: "'Inter', sans-serif" }} dangerouslySetInnerHTML={{ __html: imagesHtml }} />;
        return <Box key={index} sx={{ mb: marginB }} dangerouslySetInnerHTML={{ __html: imagesHtml }} />;
      }

      if (node.type === 'list-item') {
        return (
          <Typography component="li" key={index} sx={{ mb: '10px', lineHeight: '1.8', color: theme.textBody, fontFamily: "'Inter', sans-serif", maxWidth: '850px' }}>
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
          </Typography>
        );
      }

      return (
        <Typography key={index} paragraph sx={{ mb: '20px', lineHeight: '1.8', color: theme.textBody, fontFamily: "'Inter', sans-serif", maxWidth: '850px' }}>
          {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
        </Typography>
      );
    }

    if (node.text !== undefined) {
      let el = highlightText(node.text);
      if (node.bold) el = <Box component="strong" sx={{ color: theme.textMain, fontFamily: "'Inter', sans-serif" }}>{el}</Box>;
      if (node.italic) el = <Box component="em" sx={{ fontFamily: "'Inter', sans-serif" }}>{el}</Box>;
      return <React.Fragment key={index}>{el}</React.Fragment>;
    }

    if (node.type === 'link') {
      const url = node.url || '';
      const linkText = node.children ? node.children.map(c => c.text || '').join('') : '';

      if (linkText.toLowerCase().includes('management hub')) {
        return (
          <MuiLink
            component="button"
            key={index}
            onClick={() => {
              const allDocs = [...prologueArticles, ...articles];
              let targetId, targetSub;
              for (const doc of allDocs) {
                const attr = doc.attributes || doc;
                const contentData = attr.Content || attr.content || attr.Description || attr.description;
                if (!contentData) continue;

                const { chunks, leftSubMenu } = getArticleChunks(contentData);
                const subItem = leftSubMenu.find(s => s.text.toLowerCase().includes('management hub'));

                if (subItem) {
                  targetId = doc.id;
                  targetSub = subItem.id;
                  break;
                }
              }

              if (targetId) {
                setSearchParams({ id: targetId, sub: targetSub });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                console.warn('Target section not found for Management Hub');
              }
            }}
            sx={{
              color: theme.accent,
              textDecoration: 'underline',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '600',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 'inherit',
              '&:hover': { opacity: 0.8 }
            }}
          >
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
          </MuiLink>
        );
      }

      if (url.includes('?id=')) {
        const queryString = url.substring(url.indexOf('?'));

        return (
          <MuiLink
            component={RouterLink}
            to={`/docs${queryString}`}
            key={index}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{
              color: theme.accent,
              textDecoration: 'underline',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '600',
              '&:hover': { opacity: 0.8 }
            }}
          >
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
          </MuiLink>
        );
      }

      return (
        <MuiLink key={index} href={url} target="_blank" rel="noopener noreferrer" sx={{ color: theme.accent, textDecoration: 'underline', fontFamily: "'Inter', sans-serif" }}>
          {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
        </MuiLink>
      );
    }

    if (node.type === 'list') {
      const ListTag = node.format === 'ordered' ? 'ol' : 'ul';
      return (
        <Box component={ListTag} key={index} sx={{ pl: '20px', mb: '25px', color: theme.textBody, fontFamily: "'Inter', sans-serif", maxWidth: '850px' }}>
          {node.children ? node.children.map((child, i) => renderNode(child, i)) : ''}
        </Box>
      );
    }

    if (node.type === 'image') {
      const imgUrl = node.image?.url;
      if (!imgUrl) return null;
      const fullUrl = imgUrl.startsWith('http') ? imgUrl : `http://localhost:1337${imgUrl}`;
      return (
        <Box component="img" key={index} src={fullUrl} alt={node.image?.alternativeText || 'Guide Image'} sx={{ width: '100%', maxWidth: { xs: '100%', md: '800px' }, height: 'auto', borderRadius: '8px', display: 'block', mx: 'auto', my: 5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: `1px solid ${theme.border}` }} />
      );
    }

    return null;
  };

  // ==========================================
  // KEMAS KINI: PARSER SISTEM TAG KOTAK WARNA
  // ==========================================
  const parseRichText = (contentData) => {
    if (!contentData) return null;
    if (typeof contentData === 'string') return <Typography sx={{ fontFamily: "'Inter', sans-serif" }}>{contentData}</Typography>;
    
    if (Array.isArray(contentData)) {
      const elements = [];
      let isInsideBox = false;
      let currentBoxNodes = [];
      let boxType = 'blue';

      contentData.forEach((block, index) => {
        const text = getFullTextHelper(block).trim();

        // 1. TANGKAP PEMBUKA KOTAK (Sekarang ia akan kenal [KOTAK] dan [KOTAK OREN])
        if (text.includes('[KOTAK]') || text.includes('[KOTAK OREN]')) {
          isInsideBox = true;
          boxType = text.toUpperCase().includes('OREN') ? 'orange' : 'blue';
          return; 
        }

        // 2. TANGKAP PENUTUP KOTAK
        if (text.includes('[/KOTAK]')) {
          isInsideBox = false;
          
          const bgColor = boxType === 'orange' ? '#fd7e14' : '#0c6b8a';
          const textColor = boxType === 'orange' ? '#111827' : '#ffffff';
          const borderColor = boxType === 'orange' ? '#111827' : '#064459';

          elements.push(
            <Box
              key={`box-${index}`}
              sx={{
                backgroundColor: bgColor,
                border: `1.5px solid ${borderColor}`,
                borderRadius: '6px',
                p: 3.5,
                mb: 4,
                maxWidth: '850px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                animation: 'fadeIn 0.4s ease-out',
                '& p, & span, & strong, & em, & li, & h1, & h2, & h3': { color: `${textColor} !important` },
                '& ul, & ol': { paddingLeft: '24px', marginBottom: 0 },
                '& ul': { listStyleType: 'disc' },
                '& ul ul': { listStyleType: 'circle', mt: 1 },
                '& ul ul ul': { listStyleType: 'square', mt: 1 }
              }}
            >
              {currentBoxNodes.map((n, i) => renderNode(n, `box-content-${index}-${i}`))}
            </Box>
          );
          currentBoxNodes = []; 
          return; 
        }

        // 3. KUMPUL ATAU PAPARKAN
        if (isInsideBox) {
          currentBoxNodes.push(block);
        } else {
          elements.push(renderNode(block, index));
        }
      });

      // Keselamatan jika terlupa letak [/KOTAK]
      if (currentBoxNodes.length > 0) {
        elements.push(<Box key="unclosed-box">{currentBoxNodes.map((n, i) => renderNode(n, `unclosed-${i}`))}</Box>);
      }

      return elements;
    }
    return null;
  };
  // ==========================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: theme.bg, flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: theme.accent }} />
        <Typography sx={{ color: theme.textMuted, fontFamily: "'Inter', sans-serif" }}>
          {language === 'ms' ? 'Memuatkan manual sistem...' : 'Loading system manual...'}
        </Typography>
      </Box>
    );
  }

  let introArticle = prologueArticles.find(item => {
    const title = (item.attributes || item).title || "";
    return title.toLowerCase().trim() === 'prologue' || title.toLowerCase().trim() === 'prolog';
  }) || articles.find(item => {
    const title = (item.attributes || item).title || "";
    return title.toLowerCase().trim() === 'prologue' || title.toLowerCase().trim() === 'prolog';
  });

  const prologueSubs = prologueArticles.filter(item => {
    const title = (item.attributes || item).title || "";
    return title.toLowerCase().trim() !== 'prologue' && title.toLowerCase().trim() !== 'prolog';
  });

  const guidelineArticles = articles.filter(item => {
    const lower = ((item.attributes || item).title || "").toLowerCase().trim();
    return lower !== 'prologue' && lower !== 'prolog' &&
      !lower.startsWith('prologue:') && !lower.startsWith('prologue -') &&
      !lower.startsWith('prolog:') && !lower.startsWith('prolog -');
  });

  const displayCards = [];
  for (let i = 0; i < 7; i++) {
    if (guidelineArticles[i]) displayCards.push(guidelineArticles[i]);
    else displayCards.push({ isEmptySlot: true, id: `empty-${i}`, fallbackTitle: `${i + 1}. ${language === 'ms' ? 'Topik Belum Ditetapkan' : 'Topic Not Set'}` });
  }

  const isTroubleshootActive = articleId === 'troubleshooting_page';
  let selectedArticle = null;

  if (!isTroubleshootActive) {
    if (!articleId || articleId === 'prologue') {
      selectedArticle = introArticle || {
        id: 'intro-fallback',
        attributes: { title: 'Prologue', Content: [{ type: 'paragraph', children: [{ text: language === 'ms' ? 'Sila buat artikel bertajuk "Prologue".' : 'Please create an article titled "Prologue".' }] }] }
      };
    } else {
      selectedArticle = guidelineArticles.find(item => String(item.id) === String(articleId)) ||
        prologueSubs.find(item => String(item.id) === String(articleId)) || null;
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
      kandungan = <Typography sx={{ color: theme.textMuted, fontStyle: 'italic', mt: 2, fontFamily: "'Inter', sans-serif" }}>Tiada panduan.</Typography>;
    } else {
      const attr = selectedArticle.attributes || selectedArticle;
      tajuk = (attr.title || attr.Title || "Tanpa Tajuk").replace(/^(Prologue|Prolog)\s*[:-]\s*/i, '');
      const contentData = attr.Content || attr.content || attr.Description || attr.description;

      if (Array.isArray(contentData)) {
        const parsed = getArticleChunks(contentData);
        chunks = parsed.chunks;
        leftSubMenu = parsed.leftSubMenu;
      } else {
        chunks.push({ id: 'intro', nodes: contentData });
      }

      let nodesToDisplay = [];
      if (activeSub) {
        const foundChunk = chunks.find(c => c.id === activeSub);
        const activeSubItem = leftSubMenu.find(s => s.id === activeSub);
        if (activeSubItem) tajuk = activeSubItem.text;
        if (foundChunk && Array.isArray(foundChunk.nodes)) nodesToDisplay = foundChunk.nodes.slice(1);
      } else {
        const introChunk = chunks.find(c => c.id === 'intro');
        nodesToDisplay = introChunk ? introChunk.nodes : [];
      }

      if (Array.isArray(nodesToDisplay)) {
        nodesToDisplay.forEach((node, idx) => {
          if (node.type === 'heading') rightPageToc.push({ id: `heading-${idx}`, text: node.children ? node.children.map(c => c.text).join('') : '', level: node.level || 3 });
        });
      }

      kandungan = <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>{parseRichText(nodesToDisplay)}</Box>;
    }
  }

  const isPrologueGroupActive = !articleId || articleId === 'prologue' || prologueSubs.some(item => String(item.id) === String(articleId));

  const sidebarProps = {
    isIntroActive: isPrologueGroupActive,
    prologueSubs: prologueSubs,
    prologueMainId: introArticle ? introArticle.id : 'prologue',
    filteredCards: displayCards,
    articleId, activeSub, leftSubMenu, setSearchParams, isTroubleshootActive, language
  };

  const rightTocContent = !isTroubleshootActive && rightPageToc.length > 0 ? (
    <Box>
      <Typography sx={{ fontFamily: "'Sora', sans-serif", color: theme.textMain, fontWeight: '700', fontSize: '14px', mb: 3 }}>
        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px', height: '2px', backgroundColor: theme.textMuted }}></span>
        {language === 'ms' ? 'Di halaman ini' : 'On this page'}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '13px' }}>
        {rightPageToc.map(heading => (
          <Typography key={heading.id} component="a" href={`#${heading.id}`} sx={{ fontFamily: "'Inter', sans-serif", color: theme.textMuted, textDecoration: 'none', pl: (heading.level - 2) * 1.5, borderLeft: '2px solid transparent', '&:hover': { color: theme.textMain, borderLeft: `2px solid ${theme.accent}` } }}>
            {heading.text}
          </Typography>
        ))}
      </Box>
    </Box>
  ) : null;

  return (
    <PageLayout
      theme={theme} isDarkMode={isDarkMode} toggleTheme={toggleTheme} language={language} toggleLanguage={toggleLanguage}
      searchTerm={searchTerm} setSearchTerm={setSearchTerm}
      searchFocused={searchFocused} setSearchFocused={setSearchFocused}
      searchResults={searchResults} onSearchResultClick={handleSearchResultClick} highlightMatch={highlightMatch}
      setSearchParams={setSearchParams} sidebarProps={sidebarProps} rightToc={rightTocContent}
    >
      {isTroubleshootActive ? (
        <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <Troubleshooting isDarkMode={isDarkMode} language={language} />
        </Box>
      ) : selectedArticle ? (
        <Box>

          <Typography variant="h2" sx={{ fontFamily: "'Sora', sans-serif", color: theme.textMain, fontWeight: '700', mb: 4, letterSpacing: '-1px', fontSize: { xs: '32px', md: '42px' }, maxWidth: '850px' }}>
            {highlightText(tajuk)}
          </Typography>
          {loading ? <CircularProgress sx={{ color: theme.accent }} /> : kandungan}
        </Box>
      ) : (
        <Typography sx={{ color: theme.textMuted, fontStyle: 'italic' }}>Tiada kandungan dijumpai.</Typography>
      )}
    </PageLayout>
  );
};

export default Documentation;