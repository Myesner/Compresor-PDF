import InfoHero from '@/sections/info/InfoHero'
import Pipeline from '@/sections/info/Pipeline'
import CompressionAnatomy from '@/sections/info/CompressionAnatomy'
import FreeSoftware from '@/sections/info/FreeSoftware'
import HonestLimits from '@/sections/info/HonestLimits'
import InfoCta from '@/sections/info/InfoCta'

export default function ComoFunciona() {
  return (
    <>
      <InfoHero
        eyebrow="Transparencia técnica"
        eyebrowClassName="text-violet"
        words={[
          { text: 'Sin' },
          { text: 'servidores.' },
          { text: 'Sin' },
          { text: 'trucos.' },
          { text: 'Solo' },
          { text: 'tu' },
          { text: 'navegador.', className: 'text-violet' },
        ]}
        lead="PDFácil funciona como una app instalada, pero vive en una pestaña. Todo el trabajo pesado lo hacen bibliotecas de código abierto ejecutándose en tu dispositivo."
        imageSrc={`${import.meta.env.BASE_URL}local-shield.png`}
        imageAlt="Portátil protegido por un escudo: tus archivos nunca se suben a la nube"
        imageWidthClassName="max-w-[480px]"
      />
      <Pipeline />
      <CompressionAnatomy />
      <FreeSoftware />
      <HonestLimits />
      <InfoCta
        title="Compruébalo con tu propio PDF"
        note="Abre las herramientas de desarrollo (F12) → pestaña Red: verás que no se sube nada."
      />
    </>
  )
}
