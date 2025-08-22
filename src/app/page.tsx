import Banner from "@/components/landing-page/banner";
import AppFeatures from "@/components/landing-page/app-features";
import InsideLifeing from "@/components/landing-page/inside-lifeing";
import HowItWorks from "@/components/landing-page/how-it-works";
import FoundersMessage from "@/components/landing-page/founders-message";
import VideoMessage from "@/components/landing-page/video-message";
import Testimonials from "@/components/landing-page/testimonials";
import FAQ from "@/components/landing-page/faq";
import ThankYouNote from "@/components/landing-page/thank-you-note";
import Footnote from "@/components/landing-page/footnote";
import Footer from "@/components/landing-page/footer";

export default function Page() {
  return (
    <main className="bg-[#F6F0ED]">
      <Banner />
      <AppFeatures />
      <InsideLifeing />
      <HowItWorks />
      <FoundersMessage />
      <ThankYouNote />
      <VideoMessage />
      <Testimonials />
      <FAQ />
      <Footnote />
      <Footer />
    </main>
  );
}
