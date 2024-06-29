import './App.css';
import ChessGame from './Components/ChessGame';
import Menu from './Components/Menu';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import React from "react";

// function will route users to specific pages depending on the path in the url
function App() {
  
  return (
    <BrowserRouter basename='/'>
      <Routes path="/">

        <Route index element={<Menu />} />

        <Route path='/play' element={
          <ChessGame
            x="50"
            y="200"
            colour="white"
            connected={false} />
        } />

        <Route path='/connect' element={
          <ChessGame
            x="50"
            y="200"
            connected={true} />
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App;