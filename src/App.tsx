import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Education from './components/Education'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Connect from './components/Connect'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 font-sans">
      <Navbar />
      <main>
        <Hero />
        <Education />
        <Experience />
        <Projects />
        <Skills />
        <Connect />
      </main>
      <Footer />
    </div>
  )
}
