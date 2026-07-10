import PublicLayout from '../layouts/PublicLayout';
import Hero from '../components/public/Hero';
import FeaturedRooms from '../components/public/FeaturedRooms';
import Amenities from '../components/public/Amenities';
import Gallery from '../components/public/Gallery';
import Reviews from '../components/public/Reviews';
import BookingSection from '../components/public/BookingSection';

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <FeaturedRooms />
      <Amenities />
      <Gallery />
      <Reviews />
      <BookingSection />
    </PublicLayout>
  );
}