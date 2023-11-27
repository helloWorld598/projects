import './App.css';
import ChessGame from './Components/ChessGame';
import Menu from './Components/Menu';
import Wait from './Components/Wait';
import { Route, Routes, BrowserRouter } from "react-router-dom"

function App() {
  // function will route users to specific pages depending on the path in the url
  
  return (
    <BrowserRouter>
      <Routes path="/">

        <Route index element={<Menu />} />

        <Route path='/play' element={
          <ChessGame
            x="50"
            y="200"
            colour="white"
            connected={false} />
        } />

        <Route path='/wait' element={<Wait />} />

        <Route path='/connected' element={
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