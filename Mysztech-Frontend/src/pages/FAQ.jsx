import React, { useState, useEffect } from 'react';
import { getFaq1, getFaq2, getFaq3, getFaq4 } from '../services/api';

// --- KOMPONEN MATERIAL-UI (MUI) ---
import {
    CssBaseline, Box, Container, Typography,
    Card, CardActionArea, Alert,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';

// --- IKON MUI ---
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DesktopMacIcon from '@mui/icons-material/DesktopMac';
import StorefrontIcon from '@mui/icons-material/Storefront';    
import InventoryIcon from '@mui/icons-material/Inventory';
import DescriptionIcon from '@mui/icons-material/Description';

const FAQ = () => {
    const [faq1Data, setFaq1Data] = useState(null);
    const [faq2Data, setFaq2Data] = useState(null);
    const [faq3Data, setFaq3Data] = useState(null);
    const [faq4Data, setFaq4Data] = useState(null);

    const [activeCategory, setActiveCategory] = useState(null);
    const [activeQnA, setActiveQnA] = useState(null);

    useEffect(() => {
        const fetchFaq1 = async () => {
            try {
                const response = await getFaq1();
                if (response.data.data && response.data.data.length > 0) {
                    setFaq1Data(response.data.data[0]);
                }
            } catch (error) {
                console.error("Ralat menarik data FAQ 1:", error);
            }
        };

        const fetchFaq2 = async () => {
            try {
                const response = await getFaq2();
                if (response.data.data && response.data.data.length > 0) {
                    setFaq2Data(response.data.data[0]);
                }
            } catch (error) {
                console.error("Ralat menarik data FAQ 2:", error);
            }
        }

        const fetchFaq3 = async () => {
            try {
                const response = await getFaq3();
                if (response.data.data && response.data.data.length > 0) {
                    setFaq3Data(response.data.data[0]);
                }
            } catch (error) {
                console.error("Ralat menarik data FAQ 3:", error);
            }
        }

        const fetchFaq4 = async () => {
            try {
                const response = await getFaq4();
                if (response.data.data && response.data.data.length > 0) {
                    setFaq4Data(response.data.data[0]);
                }
            } catch (error) {
                console.error("Ralat menarik data FAQ 4:", error);
            }
        }

        fetchFaq1();
        fetchFaq2();
        fetchFaq3();
        fetchFaq4();
    }, []);

    const handleCategoryClick = (id) => {
        setActiveCategory(activeCategory === id ? null : id);
        setActiveQnA(null);
    };

    // FUNGSI PENGGALI Q&A
    const extractQnA = (contentData) => {
        if (!contentData) return [];
        let rawText = "";

        if (Array.isArray(contentData)) {
            rawText = contentData.map(block => {
                if (block.type === 'paragraph' || block.type === 'heading') {
                    return block.children ? block.children.map(c => c.text || '').join('') : '';
                }
                if (block.type === 'list') {
                    return block.children.map(li => li.children ? li.children.map(c => c.text || '').join('') : '').join('\n');
                }
                if (block.children) {
                    return block.children.map(c => c.text || '').join('');
                }
                return '';
            }).join('\n');
        } else if (typeof contentData === 'string') {
            rawText = contentData;
        }

        const parts = rawText.split(/Q\s*:\s*/).filter(p => p.trim() !== '');

        return parts.map(part => {
            const splitA = part.split(/A\s*:\s*/);
            return {
                q: splitA[0] ? splitA[0].trim() : "Soalan tidak lengkap",
                a: splitA[1] ? splitA[1].trim() : "Jawapan belum disediakan"
            };
        });
    };

    // BINA 4 KAD KATEGORI
    const cards = [
        {
            id: 1,
            title: faq1Data ? (faq1Data.Title || faq1Data.title || faq1Data.attributes?.Title || 'Kategori 1') : 'Memuatkan...',
            desc: 'Operational, hardware, and offline mode issues.',
            color: '#3b82f6',
            icon: <DesktopMacIcon sx={{ fontSize: 45, color: '#3b82f6' }} />,
            qnaList: faq1Data ? extractQnA(faq1Data.Content || faq1Data.content || faq1Data.attributes?.Content) : [],
            isEmpty: !faq1Data
        },
        {
            id: 2,
            title: faq2Data ? (faq2Data.Title || faq2Data.title || faq2Data.attributes?.Title || 'Kategori 2') : 'Memuatkan...',
            desc: 'Kategori ini akan disambung ke koleksi FAQ 2 nanti.',
            color: '#ef4444',
            icon: <StorefrontIcon sx={{ fontSize: 45, color: '#ef4444' }} />,
            qnaList: faq2Data ? extractQnA(faq2Data.Content || faq2Data.content || faq2Data.attributes?.Content) : [],
            isEmpty: !faq2Data
        },
        {
            id: 3,
            title: faq3Data ? (faq3Data.Title || faq3Data.title || faq3Data.attributes?.Title || 'Kategori 3') : 'Memuatkan...',
            desc: 'Kategori ini akan disambung ke koleksi FAQ 3 nanti.',
            color: '#10b981',
            icon: <InventoryIcon sx={{ fontSize: 45, color: '#10b981' }} />,
            qnaList: faq3Data ? extractQnA(faq3Data.Content || faq3Data.content || faq3Data.attributes?.Content) : [],
            isEmpty: !faq3Data
        },
        {
            id: 4,
            title: faq4Data ? (faq4Data.Title || faq4Data.title || faq4Data.attributes?.Title || 'Kategori 4') : 'Memuatkan...',
            desc: 'Kategori ini akan disambung ke koleksi FAQ 4 nanti.',
            color: '#8b5cf6',
            icon: <DescriptionIcon sx={{ fontSize: 45, color: '#8b5cf6' }} />,
            qnaList: faq4Data ? extractQnA(faq4Data.Content || faq4Data.content || faq4Data.attributes?.Content) : [],
            isEmpty: !faq4Data
        }
    ];

    const selectedData = cards.find(cat => cat.id === activeCategory);

    return (
        <React.Fragment>
            <CssBaseline />
            <Container maxWidth="md">
                <Box sx={{ py: 5 }}>

                    {/* BAHAGIAN 1: TAJUK UTAMA */}
                    <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
                            Frequently Asked Questions (FAQ)
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: '#6b7280' }}>
                            Select a category below to find the answer to your problem.
                        </Typography>
                    </Box>

                    {/* BAHAGIAN 2: KAD KATEGORI */}
                    {/* KEMAS KINI: Gunakan 'display: grid' untuk saiz kotak seragam */}
                    <Box
                        sx={{
                            display: 'grid',
                            // Memaksa 2 kotak sebaris di skrin besar, 1 kotak di telefon
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                            gap: '24px',
                            mb: 5
                        }}
                    >
                        {cards.map((category) => {
                            const isActive = activeCategory === category.id;

                            return (
                                <Card
                                    key={category.id}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        minHeight: '230px', // Ini memastikan semua kotak mempunyai tinggi seragam
                                        borderRadius: '12px',
                                        border: `2px solid ${isActive ? category.color : 'transparent'}`,
                                        boxShadow: isActive ? `0 8px 16px ${category.color}33` : '0 4px 6px -1px rgba(0,0,0,0.05)',
                                        transform: isActive ? 'translateY(-5px)' : 'none',
                                        transition: 'all 0.2s ease',
                                        opacity: category.isEmpty ? 0.6 : 1
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => handleCategoryClick(category.id)}
                                        sx={{
                                            flexGrow: 1, // Kembangkan kawasan klik sepenuhnya
                                            p: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center', // Tukar kepada tengah supaya sama macam muka surat Home
                                            textAlign: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Box sx={{ mb: 2 }}>{category.icon}</Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: category.isEmpty ? '#6b7280' : '#1f2937', mb: 1 }}>
                                            {category.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#9ca3af', lineHeight: 1.6 }}>
                                            {category.desc}
                                        </Typography>
                                    </CardActionArea>
                                </Card>
                            );
                        })}
                    </Box>

                    {/* BAHAGIAN 3: SENARAI SOALAN JAWAPAN */}
                    {selectedData && (
                        <Box sx={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            p: 4,
                            borderTop: `5px solid ${selectedData.color}`,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #e5e7eb', pb: 2, mb: 3 }}>
                                Related questions: {selectedData.title}
                            </Typography>

                            {selectedData.qnaList.length === 0 ? (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Tiada rekod soalan ditemui. Admin belum mengisinya atau format soalan tidak tepat.
                                </Alert>
                            ) : (
                                <Box>
                                    {selectedData.qnaList.map((item, index) => {
                                        const isQnAOpen = activeQnA === index;

                                        return (
                                            <Accordion
                                                key={index}
                                                expanded={isQnAOpen}
                                                onChange={() => setActiveQnA(isQnAOpen ? null : index)}
                                                sx={{
                                                    mb: 1,
                                                    borderRadius: '8px !important',
                                                    '&:before': { display: 'none' }, // Buang garisan default MUI
                                                    border: `1px solid ${isQnAOpen ? selectedData.color : '#e5e7eb'}`,
                                                    boxShadow: 'none'
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon sx={{ color: isQnAOpen ? selectedData.color : '#9ca3af' }} />}
                                                    sx={{
                                                        backgroundColor: isQnAOpen ? '#f9fafb' : '#ffffff',
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    <Typography sx={{ fontWeight: '600', color: isQnAOpen ? selectedData.color : '#374151' }}>
                                                        {item.q}
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
                                                    <Typography sx={{ color: '#4b5563', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                                        {item.a}
                                                    </Typography>
                                                </AccordionDetails>
                                            </Accordion>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    )}

                </Box>
            </Container>
        </React.Fragment>
    );
};

export default FAQ;