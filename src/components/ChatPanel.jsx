import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, Paper, Typography, TextField, IconButton, CircularProgress, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useAI } from '../hooks/useAI';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatPanel = forwardRef(({ onClose, onInsertIntoNotes }, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { performAIAction, loading, error } = useAI();
  const chatEndRef = useRef(null);

  useImperativeHandle(ref, () => ({
    addInitialMessage: (initialPrompt, isUser) => {
      setMessages((prev) => [...prev, { role: isUser ? 'user' : 'assistant', content: initialPrompt }]);
    },
    startConversation: async (initialPrompt) => {
      setMessages([{ role: 'user', content: initialPrompt }]);
      try {
        const aiResponse = await performAIAction('chat', initialPrompt);
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      } catch (err) {
        console.error("AI conversation failed:", err);
        setMessages(prev => [...prev, { role: 'assistant', content: "Error: Failed to get a response from the AI." }]);
      }
    }
  }));

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const aiResponse = await performAIAction('chat', userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      console.error("AI action failed:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: Failed to get a response from the AI." }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (msg, index) => {
    const isCode = msg.content.includes('```');

    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          mb: 1,
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 1,
            bgcolor: (theme) => msg.role === 'user' ? theme.palette.action.selected : theme.palette.background.paper,
            maxWidth: '80%',
            wordBreak: 'break-word',
            color: 'text.primary',
          }}
        >
          {isCode ? (
            <SyntaxHighlighter style={materialLight} language="javascript">
              {msg.content.replace(/```/g, '')}
            </SyntaxHighlighter>
          ) : (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </Typography>
          )}

          {msg.role === 'assistant' && onInsertIntoNotes && (
            <Button onClick={() => onInsertIntoNotes(msg.content)} size="small" sx={{ mt: 1 }}>
              Insert into Notes
            </Button>
          )}
        </Paper>
      </Box>
    );
  };

  return (
    <Box className="chat-panel-root"
      sx={{
        p: 2,
        border: theme => `1px solid ${theme.palette.divider}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pt: 1, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
        <Typography variant="h6">AI Chat</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{
        flexGrow: 1,
        overflowY: 'auto',
        p: 1,
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '4px',
      }}>
        {messages.map(renderMessage)}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={20} />
          </Box>
        )}
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: 'center' }}>
            Error: {error.message || 'An unknown error occurred.'}
          </Typography>
        )}
        <div ref={chatEndRef} />
      </Box>
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ display: 'flex' }}>
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI anything..."
          disabled={loading}
        />
        <IconButton type="submit" color="primary" disabled={loading || !input.trim()}>
          <SendIcon />
        </IconButton>
      </form>
    </Box>
  );
});

export default ChatPanel;