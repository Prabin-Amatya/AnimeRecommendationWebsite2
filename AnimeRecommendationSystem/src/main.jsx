import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  
  <QueryClientProvider client={queryClient}>
    <Router>
        <App />
    </Router>
</QueryClientProvider>
)
