import React from 'react';
import Welcome from './Components/welcome.js';
import Register from './Components/register.js';
import Chat from './Components/chat.js';
import { Route, Routes, BrowserRouter } from "react-router-dom";

function App() {
  // function will route users to specific pages depending on the path in the url
  return (
    <BrowserRouter>
      <Routes path="/">
        <Route index element={<Welcome />} />
        <Route path='/register' element={ <Register />} />
        <Route path='/chat' element={ <Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;