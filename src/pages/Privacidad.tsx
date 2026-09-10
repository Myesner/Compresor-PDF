import InfoHero from '@/sections/info/InfoHero'
import Checklist from '@/sections/info/Checklist'
import VerifyGuide from '@/sections/info/VerifyGuide'
import Honesty from '@/sections/info/Honesty'
import Contact from '@/sections/info/Contact'
import InfoCta from '@/sections/info/InfoCta'

export default function Privacidad() {
  return (
    <>
      <InfoHero
        eyebrow="Privacidad"
        eyebrowClassName="text-mint"
        words={[
          { text: 'No' },
          { text: 'podemos' },
          { text: 'ver' },
          { text: 'tus' },
          { text: 'archivos.' },
          { text: 'Literalmente.', className: 'text-mint' },
        ]}
        underlineWord="Literalmente."
        underlineColor="#25C685"
        lead="PDFácil no tiene servidores de procesamiento. Tus PDFs se abren, comprimen y editan dentro de tu navegador, y se evaporan al cerrar la pestaña. Esta página explica lo poco (casi nada) que recopilamos."
        imageSrc="/local-shield.png"
        imageAlt="Portátil protegido por un escudo: nada se sube a la nube"
        imageWidthClassName="max-w-[420px]"
      />
      <Checklist />
      <VerifyGuide />
      <Honesty />
      <Contact />
      <InfoCta title="Privado por diseño, gratis por principios." />
    </>
  )
}
