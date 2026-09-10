import Hero from '@/sections/home/Hero'
import StatsMarquee from '@/sections/home/StatsMarquee'
import Tools from '@/sections/home/Tools'
import HowItWorks from '@/sections/home/HowItWorks'
import PrivacySection from '@/sections/home/PrivacySection'
import SavingsDemo from '@/sections/home/SavingsDemo'
import Faq from '@/sections/home/Faq'
import FinalCta from '@/sections/home/FinalCta'

export default function Home() {
  return (
    <>
      <Hero />
      <StatsMarquee />
      <Tools />
      <HowItWorks />
      <PrivacySection />
      <SavingsDemo />
      <Faq />
      <FinalCta />
    </>
  )
}
