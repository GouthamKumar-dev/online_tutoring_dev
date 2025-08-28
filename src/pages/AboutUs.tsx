import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { COLOR_CLASSES } from "../constants/colors";
import bgWorld from "../assets/bg-world.png";
import illustrationImg1 from "../assets/Group_1.png";
import illustrationImg2 from "../assets/Group_2.png";
import illustrationImg3 from "../assets/Group_3.png";
import illustrationImg4 from "../assets/Group_4.png";
import illustrationImg5 from "../assets/Group_5.png";

const AboutUs: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const Reveal = (() => {
    const container = (stagger = 0.08, delayChildren = 0.08) => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: stagger,
          delayChildren,
          when: "beforeChildren",
        },
      },
    });

    const item = {
      hidden: { opacity: 0, y: 18 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
    };

    return { container, item };
  })();
  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Founder & CEO",
      education: "Ph.D. in Education Technology",
      experience: "15+ years in EdTech",
      image: illustrationImg1,
      description:
        "Passionate about transforming education through technology and personalized learning experiences.",
    },
    {
      name: "Prof. Michael Chen",
      role: "Head of Academics",
      education: "M.Sc. in Physics, B.Ed.",
      experience: "12+ years in Teaching",
      image: illustrationImg2,
      description:
        "Expert in curriculum development and creating engaging learning methodologies.",
    },
    {
      name: "Ms. Emma Wilson",
      role: "Learning Experience Designer",
      education: "M.A. in English Literature",
      experience: "8+ years in Education",
      image: illustrationImg3,
      description:
        "Specialist in designing interactive and effective learning experiences for students.",
    },
    {
      name: "Alex Rodriguez",
      role: "Technology Director",
      education: "M.Tech in Computer Science",
      experience: "10+ years in EdTech",
      image: illustrationImg4,
      description:
        "Leading our technology initiatives and platform development for seamless learning.",
    },
  ];

  const achievements = [
    {
      number: "10,000+",
      label: "Students Taught",
      icon: "👨‍🎓",
    },
    {
      number: "500+",
      label: "Expert Tutors",
      icon: "👨‍🏫",
    },
    {
      number: "50+",
      label: "Subjects Covered",
      icon: "📚",
    },
    {
      number: "95%",
      label: "Success Rate",
      icon: "🏆",
    },
  ];

  const values = [
    {
      title: "Quality Education",
      description:
        "We believe in providing high-quality, personalized education that adapts to each student's learning style and pace.",
      icon: "🎯",
    },
    {
      title: "Expert Tutors",
      description:
        "Our carefully selected tutors are subject matter experts with proven teaching experience and passion for education.",
      icon: "⭐",
    },
    {
      title: "Technology-Driven",
      description:
        "We leverage cutting-edge technology to create interactive, engaging, and effective learning experiences.",
      icon: "💻",
    },
    {
      title: "Student Success",
      description:
        "Our primary focus is on student success, measured not just by grades but by genuine understanding and growth.",
      icon: "🚀",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="py-12 md:py-16 lg:py-20 relative overflow-hidden"
        style={{
          backgroundImage: `url(${bgWorld})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        variants={shouldReduceMotion ? undefined : Reveal.container(0.06, 0.06)}
        initial={shouldReduceMotion ? undefined : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 md:mb-6"
            variants={Reveal.item}
          >
            About <span className={COLOR_CLASSES.textTertiary}>TutorLab</span>
          </motion.h1>
          <motion.p
            className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            variants={Reveal.item}
          >
            Transforming education through personalized learning experiences,
            expert tutors, and innovative technology to help every student
            achieve their full potential.
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        className="py-8 md:py-12 lg:py-16 bg-white"
        variants={shouldReduceMotion ? undefined : Reveal.container(0.06, 0.06)}
        initial={shouldReduceMotion ? undefined : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <motion.h2
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6"
                variants={Reveal.item}
              >
                Our <span className={COLOR_CLASSES.textTertiary}>Mission</span>
              </motion.h2>
              <motion.p
                className="text-base md:text-lg text-gray-600 mb-4 md:mb-6 leading-relaxed"
                variants={Reveal.item}
              >
                At TutorLab, we're on a mission to democratize quality education
                by making expert tutoring accessible to students everywhere. We
                believe that every student deserves personalized attention and
                the opportunity to learn at their own pace.
              </motion.p>
              <motion.p
                className="text-base md:text-lg text-gray-600 leading-relaxed"
                variants={Reveal.item}
              >
                Our platform connects students with passionate, qualified tutors
                who are committed to helping them succeed. We're not just about
                improving grades – we're about fostering a love for learning
                that lasts a lifetime.
              </motion.p>
            </div>
            <motion.div
              className="order-1 lg:order-2 flex justify-center"
              variants={Reveal.item}
            >
              <img
                src={illustrationImg5}
                alt="Our Mission"
                className="w-full max-w-md h-auto"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our <span className={COLOR_CLASSES.textTertiary}>Values</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape our approach to
              education
            </p>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={
              shouldReduceMotion ? undefined : Reveal.container(0.06, 0.06)
            }
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition duration-300"
                variants={Reveal.item}
              >
                <div className="text-4xl mb-4 text-center">{value.icon}</div>
                <h3
                  className={`text-xl font-bold ${COLOR_CLASSES.textPrimary} mb-4 text-center`}
                >
                  {value.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our <span className={COLOR_CLASSES.textTertiary}>Impact</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Numbers that reflect our commitment to educational excellence
            </p>
          </div>
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            variants={
              shouldReduceMotion ? undefined : Reveal.container(0.06, 0.06)
            }
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100"
                variants={Reveal.item}
              >
                <div className="text-4xl mb-4">{achievement.icon}</div>
                <div
                  className={`text-3xl font-bold ${COLOR_CLASSES.textTertiary} mb-2`}
                >
                  {achievement.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {achievement.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our <span className={COLOR_CLASSES.textTertiary}>Team</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate educators and technology experts working together to
              revolutionize learning
            </p>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={
              shouldReduceMotion ? undefined : Reveal.container(0.06, 0.06)
            }
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300 text-center"
                variants={Reveal.item}
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-20 h-20 object-cover"
                  />
                </div>
                <h3
                  className={`text-xl font-bold ${COLOR_CLASSES.textPrimary} mb-2`}
                >
                  {member.name}
                </h3>
                <p
                  className={`text-sm font-medium ${COLOR_CLASSES.textTertiary} mb-2`}
                >
                  {member.role}
                </p>
                <p className="text-sm text-gray-600 mb-2">{member.education}</p>
                <p className="text-sm text-gray-500 mb-3">
                  {member.experience}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose{" "}
              <span className={COLOR_CLASSES.textTertiary}>TutorLab</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="text-5xl mb-6">🎓</div>
              <h3
                className={`text-2xl font-bold ${COLOR_CLASSES.textPrimary} mb-4`}
              >
                Personalized Learning
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Every student is unique. Our tutors adapt their teaching methods
                to match your learning style, ensuring maximum understanding and
                retention.
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="text-5xl mb-6">📱</div>
              <h3
                className={`text-2xl font-bold ${COLOR_CLASSES.textPrimary} mb-4`}
              >
                Modern Technology
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our cutting-edge platform provides interactive tools, real-time
                collaboration, and seamless communication between students and
                tutors.
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="text-5xl mb-6">🌟</div>
              <h3
                className={`text-2xl font-bold ${COLOR_CLASSES.textPrimary} mb-4`}
              >
                Proven Results
              </h3>
              <p className="text-gray-600 leading-relaxed">
                With a 95% success rate and thousands of satisfied students, our
                track record speaks for itself. Join the TutorLab family today!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-16 bg-gradient-to-br from-purple-600 to-pink-600"
        variants={shouldReduceMotion ? undefined : Reveal.container(0.06, 0.06)}
        initial={shouldReduceMotion ? undefined : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-4xl font-bold text-white mb-6"
            variants={Reveal.item}
          >
            Ready to Start Your Learning Journey?
          </motion.h2>
          <motion.p
            className="text-xl text-white/90 mb-8 leading-relaxed"
            variants={Reveal.item}
          >
            Join thousands of students who have already transformed their
            academic success with TutorLab. Experience personalized learning
            today!
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={Reveal.item}
          >
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition duration-200">
              Book a Free Demo
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition duration-200">
              Explore Courses
            </button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutUs;
