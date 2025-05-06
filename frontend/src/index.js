import React from 'react';
import { createRoot } from 'react-dom/client'// Updated import for React 18
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import router from './route/mainRoute'
import './index.css';
import { store } from './store/store.js'

// Create a root and render the app
createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={store}>
    <RouterProvider router={router}/>
  </Provider>
  // </StrictMode>,
)