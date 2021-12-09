import './App.css';
import FolderList from './components/FolderList/FolderList'
import FolderPage from './components/FolderPage/FolderPage'
import BookPage from './components/BookPage'
import BookSearch from './components/BookSearch';
import AddBook from './components/AddBook';
import SiteConfig from './components/SiteConfig/SiteConfig';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import MainMenu from './components/MainMenu';

function App() {
  return (
    <>
    <Router>
      <MainMenu/>
      <Routes>
        <Route path="/" element={<FolderList/>}/>
        <Route path="/folder/:folder" element={<FolderPage/>}/>
        <Route path="/book/:bookId" element={<BookPage/>}/>
        <Route path="/findbook" element={<BookSearch/>}/>
        <Route path="/newbook" element={<AddBook/>}/>
        <Route path="/config" element={<SiteConfig/>}/>
      </Routes>

    </Router>
    </>
  );
}

export default App;
