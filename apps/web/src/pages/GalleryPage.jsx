import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ImageModal from '@/components/ImageModal.jsx';

const galleryImages = [
  {
    id: 1,
    src: '/gallery/gallery-image-1.jpg',
    alt: 'Love cake with red ribbon topper, chocolate drip, cream frosting, red rose, and gold chocolate'
  },
  {
    id: 2,
    src: '/gallery/gallery-image-2.jpg',
    alt: 'Elegant two-tier cake with gold frame photo topper, gold bow, black glitter jacket, marble base, gold decorative balls'
  },
  {
    id: 3,
    src: '/gallery/gallery-image-3.jpg',
    alt: 'Colorful multi-tier celebration cake with photo topper, red balloon, yellow flowers, gold accents'
  },
  {
    id: 4,
    src: '/gallery/gallery-image-4.jpg',
    alt: 'White and gold elegant cake with religious cross decorations, purple ribbon, white flowers'
  },
  {
    id: 5,
    src: '/gallery/gallery-image-5.jpg',
    alt: 'Chocolate bark textured cake with red berries, white flowers, gold bottle topper'
  },
  {
    id: 6,
    src: '/gallery/gallery-image-6.jpg',
    alt: 'Pink fluffy teddy bear cake with white bow, gold number 3'
  },
  {
    id: 7,
    src: '/gallery/gallery-image-7.jpg',
    alt: 'Chocolate textured cake with red rose, red berries, yellow fern, gold topper'
  },
  {
    id: 8,
    src: '/gallery/gallery-image-8.jpg',
    alt: 'Colorful pencil and graduation cap cake with school logo, multicolor design'
  },
  {
    id: 9,
    src: '/gallery/gallery-image-11.jpg',
    alt: 'Chocolate cake with red rose, red berries, gold Happy Birthday topper'
  },
  {
    id: 10,
    src: '/gallery/gallery-image-12.jpg',
    alt: 'Red and gold layered cake with decorative elements'
  }
];

const GalleryPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (index) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const handleNavigate = (direction) => {
    if (direction === 'prev') {
      setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    } else {
      setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <>
      <Helmet>
        <title>{`Gallery - Custom Cake Creations`}</title>
        <meta name="description" content="Explore our gallery of custom cake creations, featuring elegant designs, colorful celebrations, and delicious treats." />
      </Helmet>

      <div className="min-h-screen bg-[#FFF8F0] flex flex-col">
        <Header />

        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-[#3D2817] text-white text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#FCD34D]">
              Our Custom Cake Creations
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Browse through our portfolio of handcrafted, beautifully designed cakes. Each creation is a unique masterpiece tailored to make your special moments unforgettable.
            </p>
          </motion.div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16 flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {galleryImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={() => openModal(index)}
                >
                  <img
                    src={image.src}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMjUwIiBjeT0iMjUwIiByPSIyNTAiIGZpbGw9IiNlZWUiIC8+CiAgPHRleHQgeD0iMjUwIiB5PSIyNzUiIGZvbnQtc2l6ZT0iNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4ODgiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD4KPC9zdmc+';
                    }}
                    alt={image.alt}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white font-medium bg-black/50 px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      View Full Size
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />

        <ImageModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          images={galleryImages}
          currentIndex={currentIndex}
          onNavigate={handleNavigate}
        />
      </div>
    </>
  );
};

export default GalleryPage;