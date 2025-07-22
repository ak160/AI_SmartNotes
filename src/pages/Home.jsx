// src/pages/Home.jsx
   import React from 'react';
   import { Grid } from '@mui/material';
   import DocumentViewer from '../components/DocumentViewer.jsx';
   import NotesPanel from '../components/NotesPanel.jsx';

   const Home = () => (
     <Grid container spacing={2}>
       <Grid item xs={8}>
         <DocumentViewer />
       </Grid>
       <Grid item xs={4}>
         <NotesPanel />
       </Grid>
     </Grid>
   );

   export default Home;