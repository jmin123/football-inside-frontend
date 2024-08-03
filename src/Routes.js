import { Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import PopularPosts from './pages/PopularPosts';
import DomesticFootball from './pages/DomesticFootball';
import InternationalFootball from './pages/InternationalFootball';
import WritePost from './pages/WritePost';
import CategoryPosts from './pages/CategoryPosts';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Registration from './pages/Registration';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainPage />} />
    <Route path="/popular" element={<PopularPosts />} />
    <Route path='/domestic' element={<DomesticFootball/>}/>
    <Route path='/international' element={<InternationalFootball/>}/>
    <Route path="/write-post" element={<WritePost />} />
    <Route path="/:categoryName" element={<CategoryPosts />} />
    <Route path="/posts/:categoryName/:id" element={<PostDetail />} />
    <Route path="/posts/:id" element={<PostDetail />} />
    <Route path="/login" element={<Login />} />
    <Route path='/register' element={<Registration />} />
  </Routes>
);

export default AppRoutes;