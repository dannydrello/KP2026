
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Calendar, Clock, Store, Sparkles, ChefHat, Leaf } from 'lucide-react';

const features = [
  {
    id: 1,
    title: 'Order Online',
    icon: ShoppingBag,
    bgColor: 'bg-[#10B981]', // Green
  },
  {
    id: 2,
    title: 'Make Reservations',
    icon: Calendar,
    bgColor: 'bg-[#FBBF24]', // Yellow
  },
  {
    id: 3,
    title: '24/7 Service',
    icon: Clock,
    bgColor: 'bg-[#FBBF24]', // Yellow
  },
  {
    id: 4,
    title: 'Visit Our Cafe',
    icon: Store,
    bgColor: 'bg-[#D97706]', // Orange/Rust
  },
  {
    id: 5,
    title: 'Clean Kitchen',
    icon: Sparkles,
    bgColor: 'bg-[#10B981]', // Green
  },
  {
    id: 6,
    title: 'Super Chefs',
    icon: ChefHat,
    bgColor: 'bg-[#B45309]', // Rust/Brown
  },
];

const WhyChooseUs = () => {
  return (
    <section className="relative bg-[#3D2817] py-16 md:py-24 overflow-hidden w-full z-10">
      {/* Decorative Leaves */}
      <motion.div 
        initial={{ opacity: 0, rotate: -45 }}
        whileInView={{ opacity: 0.2, rotate: 0 }}
        transition={{ duration: 1 }}
        className="absolute top-10 left-10 text-[#10B981]"
      >
        <Leaf size={64} />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, rotate: 45 }}
        whileInView={{ opacity: 0.15, rotate: 90 }}
        transition={{ duration: 1.2 }}
        className="absolute bottom-20 left-1/3 text-[#10B981]"
      >
        <Leaf size={48} />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, rotate: 180 }}
        whileInView={{ opacity: 0.2, rotate: 135 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/2 right-10 text-[#10B981] hidden md:block"
      >
        <Leaf size={80} />
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Enugu's Premier Destination for Delicious Cakes and Desserts
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              We bring your sweetest dreams to life with expertly baked, beautifully crafted cakes and desserts. Whether you're celebrating a milestone birthday, a wedding, a corporate event, or just a special moment, our bakers ensure that every treat is made with love, using the finest ingredients.
            </p>
            <div className="pt-4">
              <Link 
                to="/order"
                className="inline-block bg-[#FCD34D] text-gray-900 font-bold text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
              >
                ORDER NOW
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Feature Icons Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-soft-lg group-hover:scale-110 transition-transform duration-300 ${feature.bgColor}`}>
                  <feature.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                </div>
                <span className="text-white font-medium text-sm md:text-base max-w-[100px] leading-tight">
                  {feature.title}
                </span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
