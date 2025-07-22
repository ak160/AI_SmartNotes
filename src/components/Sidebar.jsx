import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NotesIcon from '@mui/icons-material/Notes';
import ArticleIcon from '@mui/icons-material/Article';

import UploadButton from './UploadButton';
import ClearDataButton from './ClearDataButton';

import { useDoc } from '../context/useDoc';
import { getAllDocs, saveDoc, deleteDoc } from '../services/storageService';

const staticModules = import.meta.glob('../docs/*', { eager: true });

export default function Sidebar({ setLayoutMode }) {
  const { selectedDoc, setSelectedDoc } = useDoc();
  const [staticDocs, setStaticDocs] = useState([]);
  const [dynamicDocs, setDynamicDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  const handleRefreshDynamic = async () => {
    setLoading(true);
    const saved = await getAllDocs();
    setDynamicDocs(
      saved.map((d) => ({
        id: d.id,
        name: d.name,
        blob: d.blob,
        fileName: d.fileName,
        isStatic: false,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    const docs = Object.entries(staticModules).map(([path, module]) => ({
      id: path,
      name: path.split('/').pop(),
      url: module.default,
      isStatic: true,
    }));
    setStaticDocs(docs);
  }, []);

  useEffect(() => {
    handleRefreshDynamic();
  }, []);

  // filter separately
  const filteredDynamic = dynamicDocs.filter((doc) =>
    doc.name.toLowerCase().includes(filterText.toLowerCase())
  );
  const filteredStatic = staticDocs.filter((doc) =>
    doc.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (theme) => theme.palette.background.paper,
        color: (theme) => theme.palette.text.primary,
        boxSizing: 'border-box',
        borderRight: (theme) => `2px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(0,0,0,0.12)',
          flexShrink: 0,
          '& .MuiDrawer-paper': { boxSizing: 'border-box' },
        }}
      >
        <Typography variant="h6">My Documents</Typography>
        <TextField
          size="small"
          placeholder="Search..."
          fullWidth
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          sx={{ mt: 1, mb: 1 }}
        />
        <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'space-evenly' }}>
          <UploadButton onUpload={handleRefreshDynamic} />
          <ClearDataButton />
        </Box>
      </Box>

      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && filteredDynamic.length === 0 && filteredStatic.length === 0 && (
          <Typography sx={{ p: 2 }} color="textSecondary">
            {filterText ? 'No documents found.' : 'No documents yet.'}
          </Typography>
        )}

        {/* Dynamic Docs Section */}
        {!loading && filteredDynamic.length > 0 && (
          <>
            <Typography sx={{ mt: 2, ml: 2, fontWeight: 'bold' }}>Notes</Typography>
            {filteredDynamic.map((doc) => (
              <ListItem
                key={doc.id}
                disablePadding
                secondaryAction={
                  <Box>
                    <Tooltip title="View Notes Only">
                      <IconButton
                        onClick={() => {
                          setSelectedDoc(doc);
                          setLayoutMode('notes');
                        }}
                      >
                        <NotesIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Document and Notes">
                      <IconButton
                        onClick={() => {
                          setSelectedDoc(doc);
                          setLayoutMode('both');
                        }}
                      >
                        <ArticleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {!doc.isStatic && (
                      <>
                        <IconButton
                          onClick={async () => {
                            const newName = prompt('Rename to:', doc.name);
                            if (newName && newName !== doc.name) {
                              try {
                                await saveDoc({
                                  id: doc.id,
                                  name: newName,
                                  blob: doc.blob,
                                  fileName: doc.fileName,
                                  updatedAt: new Date().toISOString(),
                                });
                                handleRefreshDynamic();
                              } catch (err) {
                                alert('Failed to rename: ' + err.message);
                              }
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={async () => {
                            if (window.confirm('Delete this document?')) {
                              try {
                                await deleteDoc(doc.id);
                                if (selectedDoc?.id === doc.id) {
                                  setSelectedDoc(null);
                                }
                                handleRefreshDynamic();
                              } catch (err) {
                                alert('Failed to delete: ' + err.message);
                              }
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                }
              >
                <ListItemButton
                  selected={selectedDoc?.id === doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setLayoutMode('both');
                  }}
                  sx={{
                    borderRadius: '6px',
                    mx: 1,
                    my: 0.5,
                    backgroundColor: selectedDoc?.id === doc.id ? '#92bef7ff' : 'transparent',
                    '&:hover': {
                      backgroundColor: selectedDoc?.id === doc.id ? '#88b4eabb' : '#9ec4f7e2',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <ListItemText
                    primary={doc.name}
                    primaryTypographyProps={{
                      noWrap: true,
                      fontWeight: selectedDoc?.id === doc.id ? 'bold' : 'normal',
                      color: selectedDoc?.id === doc.id ? 'primary.main' : 'text.primary',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}

        {/* Static Docs Section */}
        {!loading && filteredStatic.length > 0 && (
          <>
            <Typography sx={{ mt: 2, ml: 2, fontWeight: 'bold' }}>Books</Typography>
            {filteredStatic.map((doc) => (
              <ListItem
                key={doc.id}
                disablePadding
                secondaryAction={
                  <>
                    <Tooltip title="View Document and Notes">
                      <IconButton
                        onClick={() => {
                          setSelectedDoc(doc);
                          setLayoutMode('both');
                        }}
                      >
                        <ArticleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              >
                <ListItemButton
                  selected={selectedDoc?.id === doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setLayoutMode('both');
                  }}
                  sx={{
                    borderRadius: '6px',
                    mx: 1,
                    my: 0.5,
                    backgroundColor: selectedDoc?.id === doc.id ? '#92bef7ff' : 'transparent',
                    '&:hover': {
                      backgroundColor: selectedDoc?.id === doc.id ? '#88b4eabb' : '#9ec4f7e2',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <ListItemText
                    primary={doc.name}
                    primaryTypographyProps={{
                      noWrap: true,
                      fontWeight: selectedDoc?.id === doc.id ? 'bold' : 'normal',
                      color: selectedDoc?.id === doc.id ? 'primary.main' : 'text.primary',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      </List>
    </Box>
  );
}
