"use client";
import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  FiArrowRight,
  FiCheckCircle,
  FiHeadphones,
  FiLayers,
  FiMapPin,
  FiMonitor,
  FiShoppingBag,
  FiShield,
  FiStar,
  FiTruck,
} from "react-icons/fi";
import "primeicons/primeicons.css";

const Home = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const letters = "The Accesories Emporium".split("");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.5, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    hidden: { opacity: 0, y: "0.25em" },
    visible: {
      opacity: 1,
      y: "0em",
      transition: { duration: 2, ease: [0.2, 0.65, 0.3, 0.9] },
    },
  };

  const cardGroup = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.11, delayChildren: 0.12 },
    },
  };

  const cardItem = {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || auth.isLoading) return;
    ran.current = true;
    if (!auth.isAuthenticated) {
      router.replace("/components/authentication/login");
    } else if (auth.role !== "customer") {
      router.replace("/components/dashboard/admin");
    }
  }, [auth, router]);

  if (auth.isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-700">
      <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
    </div>;
  }

  const productCategories = [
    {
      name: "Computer accessories",
      image: "/assets/Image/accessories.png",
      description: "Keyboards, mice, power solutions, and practical upgrades for daily setups.",
    },
    {
      name: "Laptops",
      image: "/assets/Image/laptop.png",
      description: "Work-ready and performance-focused machines for study, office, and gaming.",
    },
    {
      name: "Mobile accessories",
      image: "/assets/Image/cellphone.png",
      description: "Cables, chargers, earbuds, and everyday carry tech that lasts.",
    },
  ];

  const trustPoints = [
    { icon: FiTruck, title: "Fast fulfillment", text: "Quick handling on orders so customers spend less time waiting." },
    { icon: FiShield, title: "Reliable sourcing", text: "Products chosen with durability, compatibility, and value in mind." },
    { icon: FiHeadphones, title: "Human support", text: "Helpful guidance for upgrades, accessories, and after-sales needs." },
  ];

  const stats = [
    { label: "Popular categories", value: "3+" },
    { label: "Support coverage", value: "7 days" },
    { label: "Store confidence", value: "Top rated" },
  ];

  return (
    <div className="min-h-screen text-black">
      <section className="ambient-grid relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="absolute left-[8%] top-20 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute right-[10%] top-24 h-56 w-56 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="section-shell grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div className="relative">
            <span className="pill-label mb-6">
              <FiStar className="text-[var(--brand)]" />
              Premium Tech Store
            </span>
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="max-w-3xl text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl lg:text-5xl"
            >
              {letters.map((char, index) => (
                <motion.span key={index} variants={child}>
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.div>
            <p className="mt-6 max-w-2xl text-base text-stone-600 sm:text-lg">
              A cleaner way to shop for laptops, accessories, and everyday performance gear with support that still feels personal.
            </p>

            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              variants={cardGroup}
              initial="hidden"
              animate="visible"
            >
              <button
                onClick={() => router.push("/components/customerComponents/products")}
                className="brand-button hover-lift inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg shadow-orange-900/15"
              >
                Explore Products
                <FiArrowRight />
              </button>
              <button
                onClick={() => router.push("/components/customerComponents/order")}
                className="hover-lift inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-6 py-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-white"
              >
                View My Orders
                <FiShoppingBag />
              </button>
            </motion.div>

            <motion.div
              className="mt-10 grid gap-4 sm:grid-cols-3"
              variants={cardGroup}
              initial="hidden"
              animate="visible"
            >
              {stats.map((item) => (
                <motion.div key={item.label} variants={cardItem} className="surface-card hover-lift rounded-3xl p-5">
                  <p className="text-3xl font-extrabold text-stone-900">{item.value}</p>
                  <p className="mt-2 text-sm text-stone-600">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="glass-panel relative rounded-[2rem] p-5 sm:p-7"
            whileHover={{ y: -8, rotateX: 6, rotateY: -6, scale: 1.01 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="rounded-[1.75rem] bg-[linear-gradient(160deg,#201611_0%,#3d2414_55%,#7b431d_100%)] p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-orange-200">Why customers return</p>
                  <h2 className="mt-3 text-3xl font-bold">Built for dependable upgrades</h2>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <FiMonitor className="text-2xl text-orange-100" />
                </div>
              </div>

              <motion.div
                className="mt-8 space-y-4"
                variants={cardGroup}
                initial="hidden"
                animate="visible"
              >
                {trustPoints.map(({ icon: Icon, title, text }) => (
                  <motion.div key={title} variants={cardItem} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-xl bg-white/10 p-2">
                        <Icon className="text-lg text-orange-100" />
                      </div>
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="mt-1 text-sm text-stone-200">{text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-8 rounded-2xl bg-white/10 p-4 text-sm text-stone-100">
                <div className="flex items-center gap-2 text-orange-100">
                  <FiMapPin />
                  <span>Rawalpindi storefront support</span>
                </div>
                <p className="mt-2 text-stone-200">
                  Visit the branch, ask for recommendations, and get help choosing the right setup for your budget.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="section-shell grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            className="surface-card hover-lift rounded-[2rem] p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="pill-label mb-4">
              <FiLayers className="text-[var(--brand)]" />
              About the store
            </span>
            <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">A modern storefront with practical recommendations</h2>
            <p className="mt-5 text-base text-stone-600">
              The Accesories Emporium focuses on gear people actually need: dependable accessories, strong-value laptops, and upgrades that improve day-to-day performance without unnecessary complexity.
            </p>
            <div className="mt-6 space-y-4">
              {[
                "Performance-focused accessories for office, home, and gaming setups.",
                "Helpful guidance for compatibility, upgrades, and replacement parts.",
                "A curated selection designed around value instead of clutter.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-orange-100 p-1.5 text-[var(--brand)]">
                    <FiCheckCircle />
                  </div>
                  <p className="text-sm text-stone-700 sm:text-base">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="grid gap-5 md:grid-cols-3"
            variants={cardGroup}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            {productCategories.map((item) => (
              <motion.div
                key={item.name}
                variants={cardItem}
                className="surface-card hover-lift group overflow-hidden rounded-[2rem]"
                whileHover={{ y: -10, rotateX: 6, rotateY: -6, scale: 1.02 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f8efe2_0%,#efe0ca_100%)] p-6">
                  <div className="absolute inset-x-8 top-4 h-24 rounded-full bg-orange-200/50 blur-3xl transition duration-300 group-hover:scale-110" />
                  <img
                    src={item.image}
                    alt={item.name}
                    className="relative z-10 h-full w-full object-contain transition duration-300 group-hover:scale-110 group-hover:-translate-y-2"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-stone-900">{item.name}</h3>
                  <p className="mt-2 text-sm text-stone-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <footer id="Footer" className="bg-[#1d1813] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="section-shell grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-orange-200">The Accesories Emporium</p>
            <h3 className="mt-3 text-2xl font-bold">Tech that feels curated, not crowded.</h3>
            <p className="mt-4 text-sm text-stone-300">
              Shop reliable accessories and systems with real guidance before and after purchase.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold">Contact</h4>
            <div className="mt-4 space-y-3 text-sm text-stone-300">
              <p className="flex items-center gap-2"><FiMapPin /> Satellite 6th Road, Rawalpindi</p>
              <p>03353411153</p>
              <p>theaccessories@gmail.com</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold">Links</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-stone-300">
              <button onClick={() => router.push("/components/dashboard/customer")} className="text-left transition hover:text-white">Home</button>
              <button onClick={() => router.push("/components/customerComponents/products")} className="text-left transition hover:text-white">Products</button>
              <button onClick={() => router.push("/components/customerComponents/profile")} className="text-left transition hover:text-white">Profile</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
