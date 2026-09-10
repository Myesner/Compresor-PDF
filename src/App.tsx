import { Routes, Route } from 'react-router'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Comprimir from '@/pages/Comprimir'
import Editor from '@/pages/Editor'
import ComoFunciona from '@/pages/ComoFunciona'
import Privacidad from '@/pages/Privacidad'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="comprimir" element={<Comprimir />} />
        <Route path="editor" element={<Editor />} />
        <Route path="como-funciona" element={<ComoFunciona />} />
        <Route path="privacidad" element={<Privacidad />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
