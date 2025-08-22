import PageBanner from "@/components/layout/page-banner";
import CoachingSkeleton from "@/components/coaching/skeleton";

const BANNER_IMAGE = "/images/banners/coaching.png";

export default function CoachingLoading() {
  return (
    <div className="w-full">
      <PageBanner
        title="Coaching Program"
        className="mb-0"
        backgroundImage={BANNER_IMAGE}
      />
      <main className="p-4">
        <CoachingSkeleton />
      </main>
    </div>
  );
}
