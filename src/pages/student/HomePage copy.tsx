import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import bgWorld from "../../assets/bg-world.png";
import illustrationImg1 from "../../assets/Group_1.png";
import illustrationImg2 from "../../assets/Group_2.png";
import illustrationImg3 from "../../assets/Group_3.png";
import default_user_profile from "../../assets/default_user_profile.png";
import calendar_month from "../../assets/calendar_month.png";
import video_conference from "../../assets/video_conference.png";
import pay_cheque from "../../assets/pay_cheque.png";
import stepper_tutor from "../../assets/stepper_tutor.png";
import googlePlay from "../../assets/google_play.png";
import COLORS, { COLOR_CLASSES } from "../../constants/colors";
import { fetchCategories } from "../../features/category/categorySlice";
import { fetchPremiumStaffs } from "../../features/staff/staffSlice";
import type { RootState, AppDispatch } from "../../app/store";
import baseAxios from "../../features/auth/baseAxios";
import { motion } from "framer-motion";

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state: RootState) => state.category);
  const {
    staffs: premiumStaffs,
    loading: staffsLoading,
    error: staffsError,
  } = useSelector((state: RootState) => state.staff);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Fetch categories and premium staff on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchPremiumStaffs());
  }, [dispatch]);


  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    console.log("Contact form submitted:", contactForm);
    // Reset form
    setContactForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1, type: "tween", stiffness: 120, duration: 1 }}
      >
        <section
          className="relative min-h-[34rem] flex items-center"
          style={{
            backgroundImage: `url(${bgWorld})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-28 bg-white/90 backdrop-blur-none">
            <div className="max-w-7xl mx-auto py-12 sm:py-16 md:py-20 lg:py-28">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8  lg:gap-12 items-center">
                <motion.div
                  initial={{ x: -100 }}
                  animate={{ x: 0 }}
                  transition={{
                    delay: 0.1,
                    type: "tween",
                    stiffness: 120,
                    duration: 1,
                  }}
                >
                  <div className="order-2 lg:order-1">
                    <h1
                      className={`text-center text-lg sm:text-3xl md:text-xl lg:text-xl font-bold text-[${COLORS.primary}] mb-4 md:mb-6 leading-tight`}
                    >
                      Join Live Online or Offline Classes with the best Tutors
                    </h1>

                    {/* Search Bar */}
                    <div
                      className={`bg-white rounded-2xl border border-[${COLORS.secondary}] p-2 shadow-sm mb-6`}
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <input
                          type="text"
                          placeholder="What you want to learn"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSearch()
                          }
                          className="flex-1 text-sm md:text-base text-gray-700 placeholder-gray-400 border-none outline-none"
                        />
                        <button
                          onClick={handleSearch}
                          className={`ml-2 px-3 py-1 md:px-4 md:py-2 ${COLOR_CLASSES.bgPrimary} text-white rounded-lg text-sm md:text-base font-medium hover:opacity-90 transition-opacity`}
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div
                      className={`grid grid-cols-3 justify-items-center text-sm md:text-sm text-[${COLORS.primary}]`}
                    >
                      <div className="text-center sm:text-left">
                        <span
                          className={`font-semibold text-[${COLORS.primary}] block md:inline`}
                        >
                          7.5 Lakh+
                        </span>
                        <span className="ml-0 text-xs md:ml-1 block md:inline">
                          Verified Tutors
                        </span>
                      </div>
                      <div className="text-center sm:text-left">
                        <span
                          className={`font-semibold text-[${COLORS.primary}] block md:inline`}
                        >
                          55 Lakh+
                        </span>
                        <span className="ml-0 text-xs md:ml-1 block md:inline">
                          Students
                        </span>
                      </div>
                      <div className="text-center sm:text-left">
                        <span
                          className={`font-semibold text-[${COLORS.primary}] block md:inline`}
                        >
                          4 Lakh+
                        </span>
                        <span className="ml-0 text-xs md:ml-1 block md:inline">
                          Reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Hero Illustration */}
                <motion.div
                  initial={{ x: 100 }}
                  animate={{ x: 0 }}
                  transition={{
                    delay: 0.1,
                    type: "spring",
                    duration: 2,
                  }}
                >
                  <div className="order-1 lg:order-2 w-full max-w-md mx-auto lg:max-w-none">
                    <img
                      src={illustrationImg1}
                      alt="Hero Illustration"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
      {/* Categories Section */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{
          delay: 0.1,
          type: "tween",
          duration: 1,
        }}
      >
        <section className="py-8 md:py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-2">
                Categories
              </h2>
            </div>

            {categoriesLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400">Loading categories...</div>
              </div>
            )}

            {categoriesError && (
              <div className="text-center py-12">
                <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                  Error loading categories: {categoriesError}
                </div>
              </div>
            )}

            {!categoriesLoading && !categoriesError && (
              <motion.div
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                transition={{
                  delay: 0.1,
                  type: "tween",
                  duration: 1,
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4 md:gap-6">
                  {categories.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="text-gray-500">No categories found</div>
                    </div>
                  ) : (
                    categories.map((category: any, index: number) => (
                      <Link
                        key={category.categoryId || category.id || index}
                        to={`/courses?category=${category.categoryName}`}
                        className="group"
                      >
                        <div className="rounded-2xl h-32 md:h-36 lg:h-40 flex flex-col justify-end p-3 md:p-4 text-white font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition duration-200 hover:scale-105 relative overflow-hidden">
                          {/* Background image if available */}
                          {category.categoryImageUrl && (
                            <div
                              className="absolute inset-0 bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${baseAxios.defaults.baseURL?.replace(
                                  "/api",
                                  ""
                                )}${category.categoryImageUrl})`,
                              }}
                            />
                          )}

                          {/* Gradient overlay */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-t from-[#582F4D] via-[#582F4D]/50 to-transparent`}
                          />

                          {/* Category name */}
                          <div className="relative z-10">
                            <span className="text-base md:text-lg font-bold">
                              {category.categoryName}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </motion.div>
      {/* Premium Tutors Section */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{
          delay: 0.1,
          type: "tween",
          duration: 1,
        }}
      >
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl  text-gray-900 mb-2">
                Our Premium Faculties
              </h2>
            </div>

            {staffsLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400">Loading premium staff...</div>
              </div>
            )}

            {staffsError && (
              <div className="text-center py-12">
                <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                  Error loading premium staff: {staffsError}
                </div>
              </div>
            )}

            {!staffsLoading && !staffsError && (
              <motion.div
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                transition={{
                  delay: 0.1,
                  type: "tween",
                  duration: 1,
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {premiumStaffs.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="text-gray-500">
                        No premium staff found
                      </div>
                    </div>
                  ) : (
                    premiumStaffs.map((staff: any) => (
                      <div
                        key={staff.staffId}
                        className="bg-white rounded-xl p-4 md:p-6 text-center shadow-md hover:shadow-lg transition duration-200 sm:min-w-[15rem]"
                      >
                        <div className="w-32 h-32 bg-yellow-400 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center overflow-hidden">
                          {staff.staffImageUrl ? (
                            <img
                              src={`${baseAxios.defaults.baseURL?.replace(
                                "/api",
                                ""
                              )}${staff.staffImageUrl}`}
                              alt={staff.staffName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center overflow-hidden">
                              <img
                                src={default_user_profile}
                                alt="staff"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {staff.staffName}
                        </h3>
                        <div className="flex justify-center">
                          <p className="text-sm text-black text-center font-normal w-[12rem]">
                            {staff.staffDetails}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </motion.div>
      {/* How We Work Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
            <div className="order-2 lg:order-1 w-full max-w-md mx-auto lg:max-w-none">
              <img
                src={illustrationImg2}
                alt="Work Illustration"
                className="w-full h-auto object-contain"
              />
            </div>

            <div className="order-1 lg:order-2">
              <div className="mb-6 md:mb-8">
                <h2
                  className={`text-2xl md:text-3xl font-medium ${COLOR_CLASSES.textPrimary}`}
                >
                  Wanna see
                </h2>
                <h2
                  className={`text-2xl md:text-3xl font-semibold ${COLOR_CLASSES.textTertiary} mb-4 md:mb-6`}
                >
                  HOW WE WORKS
                </h2>
              </div>

              {/* Video Player Mockup */}
              <div className="aspect-video bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/vrU6YJle6Q4?si=HdfRZ4LXyP9wKz5S"
                  title="How We Work"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full rounded"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* How to Book Section */}
      <section className="py-8 bg-white my-[3rem]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* mobile Stepper */}
          <div className="flex items-center justify-center mb-8 lg:hidden">
            <div className="flex items-center space-x-4 md:space-x-8 overflow-x-auto pb-2">
              {/* Step 1 */}
              <div className="flex items-center flex-shrink-0">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 bg-[#f4f4f4] ${COLOR_CLASSES.textPrimaryLight} rounded-full flex items-center justify-center text-lg md:text-xl font-bold`}
                >
                  1
                </div>
              </div>

              {/* Line 1-2 */}
              <div
                className={`w-10 md:w-16 h-0.5 ${COLOR_CLASSES.bgSecondary} flex-shrink-0`}
              ></div>

              {/* Step 2 */}
              <div className="flex items-center flex-shrink-0">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 bg-[#f4f4f4] ${COLOR_CLASSES.textPrimaryLight} rounded-full flex items-center justify-center text-lg md:text-xl font-bold`}
                >
                  2
                </div>
              </div>

              {/* Line 2-3 */}
              <div
                className={`w-10 md:w-16 h-0.5 ${COLOR_CLASSES.bgSecondary} flex-shrink-0`}
              ></div>

              {/* Step 3 */}
              <div className="flex items-center flex-shrink-0">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 bg-[#f4f4f4] ${COLOR_CLASSES.textPrimaryLight} rounded-full flex items-center justify-center text-lg md:text-xl font-bold`}
                >
                  3
                </div>
              </div>
            </div>
          </div>
          {/* desktop Stepper */}
          <div className="hidden lg:block h-full max-w-[30rem] md:max-w-[50rem] my-8 justify-self-center">
            <img
              src={stepper_tutor}
              alt="stepper tutor"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-4 md:mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <div
                    className={`w-10 h-10 md:w-18 md:h-18  rounded-xl flex items-center justify-center`}
                  >
                    <img
                      src={calendar_month}
                      alt="Join LIVE Demo Class"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3
                  className={`text-lg md:text-2xl font-medium ${COLOR_CLASSES.textPrimary} mb-2 md:mb-3`}
                >
                  Book a demo
                </h3>
                <p className={`w-[12rem] text-sm md:text-base text-gray-700`}>
                  Book a Free Demo Class with a Tutor.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-4 md:mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <div
                    className={`w-10 h-10 md:w-18 md:h-18  rounded-xl flex items-center justify-center`}
                  >
                    <img
                      src={video_conference}
                      alt="Join LIVE Demo Class"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3
                  className={`text-lg md:text-2xl font-medium ${COLOR_CLASSES.textPrimary} mb-2 md:mb-3`}
                >
                  Join LIVE Demo Class
                </h3>
                <p className={`w-[12rem] text-sm md:text-base text-gray-700`}>
                  Attend the Demo class as scheduled.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-4 md:mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <div
                    className={`w-10 h-10 md:w-18 md:h-18  rounded-xl flex items-center justify-center`}
                  >
                    <img
                      src={pay_cheque}
                      alt="Join LIVE Demo Class"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3
                  className={`text-lg md:text-2xl font-medium ${COLOR_CLASSES.textPrimary} mb-2 md:mb-3`}
                >
                  Pay and Start
                </h3>
                <p className={`w-[12rem] text-sm md:text-base text-gray-700`}>
                  Our executive will contact and classes are started after
                  payment.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 md:mt-12">
            <button
              className={`${COLOR_CLASSES.bgPrimary} ${COLOR_CLASSES.hoverBgPrimary} text-white px-8 md:px-12 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
      {/* Tutor Signup Section */}
      <section className="relative py-8 bg-gray-50 h-[22rem] my-[10rem] sm:my-[18rem]">
        <div className="absolute top-[-5rem] left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 sm:top-[-10rem] lg:px-8">
          <div className="py-[2rem] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1 flex flex-col items-center text-center ">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Are you a{" "}
                <span className={COLOR_CLASSES.textPrimary}>TUTOR !</span>
              </h2>
              <Link
                to="/tutor/signup"
                className={`inline-block bg-[#6C8EFF] hover:bg-[#5A7DFF] text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold text-base md:text-lg transition duration-200  md:mt-6`}
              >
                Click here to Signup
              </Link>
            </div>

            <div className="order-1 lg:order-2 w-full max-w-xs mx-auto lg:max-w-none">
              <img
                src={illustrationImg3}
                alt="Signup Illustration"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>
      {/* App Download Section */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-3xl lg:text-4xl  text-gray-900 mb-3 md:mb-4">
            Download the Online Tutoring App
          </h2>
          <p
            className={`text-base md:text-xl ${COLOR_CLASSES.textTertiary} mb-6 md:mb-8`}
          >
            Manage your Class Schedule, Learn on the go
          </p>

          <a
            href="#"
            className="inline-block hover:scale-105 transition duration-200"
          >
            <img
              src={googlePlay}
              alt="Get it on Google Play"
              className="h-28 md:h-34 w-auto mx-auto"
            />
          </a>
        </div>
      </section>
      {/* Contact Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl  text-gray-900 mb-3 md:mb-4">
              Contact Us
            </h2>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="bg-white rounded-xl shadow-lg p-6 md:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  placeholder="Daniel Roger"
                  className={`w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${COLOR_CLASSES.focusRingPrimary} text-sm md:text-base`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  placeholder="danielroger@gmail.com"
                  className={`w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${COLOR_CLASSES.focusRingPrimary} text-sm md:text-base`}
                  required
                />
              </div>
            </div>

            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                placeholder="Type your message here"
                rows={4}
                className={`w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${COLOR_CLASSES.focusRingPrimary} text-sm md:text-base resize-none`}
                required
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className={`w-full ${COLOR_CLASSES.bgPrimary} ${COLOR_CLASSES.hoverBgPrimary} text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-base md:text-lg transition duration-200`}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Section - Logo and Social Links */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-gray-700">
            <div className="mb-4 md:mb-0">
              <Link
                to="/about"
                className="text-lg font-semibold text-white hover:text-blue-400 transition-colors duration-200"
              >
                About OnlineTutoring.com
              </Link>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Middle Section - Countries */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-white mb-3">India</h3>
              <p className="text-gray-400 text-sm">Mumbai, Delhi, Bangalore</p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-bold text-white mb-3">UK</h3>
              <p className="text-gray-400 text-sm">London, Manchester</p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-bold text-white mb-3">USA</h3>
              <p className="text-gray-400 text-sm">New York, California</p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-bold text-white mb-3">Europe</h3>
              <p className="text-gray-400 text-sm">Berlin, Paris, Amsterdam</p>
            </div>
          </div>

          {/* Description Section */}
          <div className="text-sm text-gray-400 mb-8 leading-relaxed">
            <p className="text-justify">
              UrbanPro.com is India's largest network of most trusted tutors and
              institutes. Over 55 lakh students rely on UrbanPro.com to fulfil
              their learning requirements across 1,000+ categories. Using
              UrbanPro.com, parents, and students can compare multiple Tutors
              and Institutes and choose the one that best suits their
              requirements. More than 7.5 lakh verified Tutors and Institutes
              are helping millions of students every day and growing their
              tutoring business on UrbanPro.com. Whether you are looking for a
              tutor to learn mathematics, a German language trainer to brush up
              your German language skills or an institute to upgrade your IT
              skills, we have got the best selection of Tutors and Training
              Institutes for you.
            </p>
          </div>

          {/* Bottom Section - Copyright */}
          <div className="border-t border-gray-700 pt-6">
            <p className="text-center text-gray-400 text-sm">
              UrbanPro Pvt Ltd © 2010-2025 All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default HomePage;
