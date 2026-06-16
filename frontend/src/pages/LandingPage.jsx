import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import HERO_IMG from "../assets/session-photo.png";
import { APP_FEATURES } from "../utils/data";
import { LuSparkles } from "react-icons/lu";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import Modal from "../Components/Modal";
import CursorFollower from "../Components/Cursor/CursorFollower";
import { UserContext } from "../Context/userContext";
import ProfileInfoCard from "../Components/Cards/ProfileInfoCard";
import Footer from "../Components/Layouts/Footer";

// Rotating words component
const RotatingWord = () => {
  const words = ["Learning", "Knowledge", "Growth", "Exploration"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline relative min-w-max ml-1">
      {words.map((word, index) => (
        <span
          key={index}
          className={`absolute left-0 transition-all duration-500 ease-in-out whitespace-nowrap ${
            index === currentWordIndex
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          {word}
        </span>
      ))}
      <span className="invisible">{words[0]}</span>
    </span>
  );
};

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModel, setOpenAuthModel] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  const handleCTA = () => {
    if (!user) {
      setOpenAuthModel(true);
    } else {
      navigate("/dashboard");
    }
  };
  return (
    <>
      {/* Animated cursor overlay for the landing page */}
      <CursorFollower color="#e99a4b" />
      <div
        className="w-full min-h-full bg-[#FFFCEF] pb-4 overflow-hidden"
      >
        <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-amber-200/20 blur-[65px] absolute top-0 left-0 -translate-x-1/2" />
        <div className="container mx-auto pt-6 pb-32 relative z-10 px-4 md:px-20">
          {/* header */}
          <header className="flex justify-between items-center mb-16 gap-4">
            <div className="text-lg md:text-xl text-black font-bold whitespace-nowrap">Interv.ai</div>

            {user ? (
              <ProfileInfoCard />
            ) : (
              <button
                type="button"
                className="bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-xs md:text-sm font-semibold text-white px-4 md:px-7 py-2 md:py-2.5 rounded-full hover:opacity-90 border border-transparent transition-colors cursor-pointer shadow whitespace-nowrap"
                onClick={() => setOpenAuthModel(true)}
                onMouseEnter={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-hover", { detail: { active: true } })
                  )
                }
                onMouseLeave={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-hover", { detail: { active: false } })
                  )
                }
              >
                Login / Sign Up
              </button>
            )}
          </header>

          {/* hero content */}

          <div className="flex flex-col md:flex-row items-center mt-8 md:mt-[140px]">
            <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-8 md:mb-0">
              <div className="flex items-center justify-left mb-2">
                <div className="flex items-center gap-2 text-[11px] md:text-[13px] text-amber-600 font-semibold bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  <LuSparkles />
                  AI Powered
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl text-black font-medium mb-6 leading-tight">
                Ace Interviews with <br />
                <span className="text-transparent bg-clip-text bg-[radial-gradient(circle,#FF9324_0%,#FCD760_100%)] bg-size-[200%_200%] animate-text-shine font-semibold">
                  AI-Powered
                </span>{" "}
                <RotatingWord />
              </h1>
            </div>

            <div className="w-full md:w-1/2">
              <p className="text-[15px] md:text-[17px] text-gray-900 mr-0 md:mr-20 mb-6">
                Get role-specific questions, expand answers when you need them,
                dive deeper into concepts, and organize everything your way. From
                preparations to mastery - your ultimate interview toolkit is
                here.
              </p>

              <button
                className="bg-black text-xs md:text-sm font-semibold text-white px-5 md:px-7 py-2 md:py-2.5 rounded-full hover:bg-yellow-100 hover:text-black border border-yellow-50 hover:border-yellow-300 transition-colors cursor-pointer"
                onClick={handleCTA}
                onMouseEnter={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-hover", {
                      detail: { active: true },
                    })
                  )
                }
                onMouseLeave={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-hover", {
                      detail: { active: false },
                    })
                  )
                }
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Check the App Section */}
      <div className="w-full bg-[#FFFCEF] overflow-hidden">
        <div className="container mx-auto px-4 pt-16 pb-8 md:pt-20 md:pb-12">
          <section className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-black mb-3">
              Check Out Our App in Action
            </h2>
            

            
            <p className="text-gray-700 text-base md:text-lg">
              See how Interv.ai helps you prepare for your interviews with real-time AI feedback, structured Q&A, and comprehensive learning materials.
            </p>
                        {/* Animated Arrows */}
            <div className="flex items-center justify-center gap-8 mt-4">
              <div className="text-2xl md:text-3xl text-amber-600 animate-bounce" style={{animationDelay: '0s'}}>
                ↓
              </div>

            </div>
          </section>
        </div>
      </div>

      {/* Image */}

      <div className="w-full relative z-10 overflow-hidden bg-[#FFFCEF] py-10 pb-10">
        <div className="container mx-auto px-4 md:px-20">
          <section className="flex items-center justify-center">
            <div className="w-full max-w-[1000px] rounded-lg overflow-hidden shadow-2xl relative z-30">
              <img src={HERO_IMG} alt="Hero Image" className="w-full h-auto block" />
            </div>
          </section>
        </div>
      </div>

      {/* Interview Q&A Preview Section */}
      <div className="w-full bg-[#FFFCEF] overflow-hidden">
        <div className="container mx-auto px-4 pt-16 pb-16 md:pt-20 md:pb-20">
          <section className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 text-black">
              See How It Works
            </h2>
            <p className="text-center text-gray-600 mb-10 text-sm md:text-base">
              Get instant answers to interview questions with AI-powered explanations
            </p>

            {/* Q&A Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-amber-100">
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-amber-600 font-bold text-lg">Q</div>
                  <p className="text-gray-900 font-medium text-base md:text-lg">
                    Explain the concept of Virtual DOM in React. Why is it important?
                  </p>
                </div>
              </div>

              {/* Answer Preview */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-amber-600 font-bold text-lg">A</div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm md:text-base leading-relaxed mb-4">
                      The Virtual DOM (VDOM) is a lightweight in-memory representation of the actual DOM (Document Object Model). When there are changes in the React component's state, React first updates the Virtual DOM. Then, it compares the updated Virtual DOM with the previous version. The process is called 'diffing'. After identifying the differences, React efficiently updates only the parts of the actual DOM that have changed. This minimizes direct manipulation of the real DOM, which is slow.
                    </p>

                    {/* Key Points */}
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-900 text-sm">Why it's important:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base">
                        <li><span className="font-semibold">Performance:</span> Minimizes direct DOM manipulation, leading to faster updates and a smoother user experience.</li>
                        <li><span className="font-semibold">Efficiency:</span> Updates only the necessary parts of the DOM.</li>
                        <li><span className="font-semibold">Cross-Platform Development:</span> Makes it easier to develop cross-platform applications.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learn More Button */}
              <div className="flex justify-center">
                <button
                  className="bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-xs md:text-sm font-semibold text-white px-6 md:px-8 py-2 md:py-2.5 rounded-full hover:opacity-90 transition-colors cursor-pointer"
                  onClick={handleCTA}
                  onMouseEnter={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-hover", {
                        detail: { active: true },
                      })
                    )
                  }
                  onMouseLeave={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-hover", {
                        detail: { active: false },
                      })
                    )
                  }
                >
                  Learn More
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="w-full bg-[#FFFCEF] overflow-hidden">
        <div className="container mx-auto px-4 pt-10 pb-20">
          <section className="mt-5">
            <h2 className="text-xl md:text-2xl font-medium text-center mb-8 md:mb-12">
              Features That Make You Shine
            </h2>

            {/* first 3 cards */}
            <div className="flex flex-col items-center gap-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                {APP_FEATURES.slice(0, 3).map((feature) => (
                  <div
                    className="bg-[#FFFEF8] p-6 rounded-xl shadow-xs hover:shadow-lg shadow-amber-100 transition border border-amber-100 hover:border-[#e99a4b]"
                    key={feature.id}
                    onMouseEnter={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-hover", {
                          detail: { active: true },
                        })
                      )
                    }
                    onMouseLeave={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-hover", {
                          detail: { active: false },
                        })
                      )
                    }
                  >
                    <h3 className="text-sm md:text-base font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>

              {/* another 2 cards */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
                {APP_FEATURES.slice(3).map((feature) => (
                  <div
                    className="bg-[#FFFEF8] p-6 rounded-xl shadow-xs hover:shadow-lg shadow-amber-100 transition border border-amber-100 hover:border-[#e99a4b]"
                    key={feature.id}
                    onMouseEnter={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-hover", {
                          detail: { active: true },
                        })
                      )
                    }
                    onMouseLeave={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-hover", {
                          detail: { active: false },
                        })
                      )
                    }
                  >
                    <h3 className="text-sm md:text-base font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="w-full bg-[#FFFCEF] overflow-hidden">
        <div className="container mx-auto px-4 pt-16 pb-20 md:pt-20 md:pb-24">
          <section className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-3 text-black">
              Choose Your Plan
            </h2>
            <p className="text-center text-gray-600 mb-12 text-sm md:text-base">
              Start free and scale as you grow
            </p>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Free Plan */}
              <div className="bg-[#FFFEF8] rounded-2xl shadow-lg p-6 md:p-8 border border-amber-100 hover:border-[#e99a4b] transition-all duration-300">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-black mb-1">Free – Starter</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-black">$0</span>
                    <span className="text-sm text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Perfect for beginners exploring AI interview prep
                  </p>
                </div>

                <button
                  className="w-full bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-lg border-2 border-gray-300 hover:border-[#e99a4b] hover:bg-amber-50 transition-colors cursor-pointer mb-6"
                  onClick={() => navigate('/pricing')}
                  onMouseEnter={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-hover", {
                        detail: { active: true },
                      })
                    )
                  }
                  onMouseLeave={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-hover", {
                        detail: { active: false },
                      })
                    )
                  }
                >
                  Get Started
                </button>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">3 AI-generated interview sessions per month</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Basic question generation (5 questions/session)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Manual answer input + instant AI feedback</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Basic progress tracking</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Pin up to 5 questions</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-amber-100">
                  <p className="text-xs text-gray-600">
                    Great for students trying out Interv.ai for the first time.
                  </p>
                </div>
              </div>

              {/* Plus Plan - Most Popular */}
              <div className="bg-[#FFFEF8] rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-[#e99a4b] relative transition-all duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#e99a4b] text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most popular
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-black mb-1">Plus – Pro Learner</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-black">$2.99</span>
                    <span className="text-sm text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Best for active learners preparing for upcoming interviews
                  </p>
                </div>

                <button
                  className="w-full bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 shadow-lg transition-all cursor-pointer mb-6"
                  onClick={() => navigate('/pricing')}
                  onMouseEnter={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-hover", {
                        detail: { active: true },
                      })
                    )
                  }
                  onMouseLeave={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-hover", {
                        detail: { active: false },
                      })
                    )
                  }
                >
                  Get Started - ₹2.99
                </button>

                <p className="text-sm font-semibold text-black mb-4">
                  Everything in Free, plus:
                </p>

                <div className="space-y-2.5 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Unlimited interview sessions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Advanced AI explanations & hints</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Detailed progress stats</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Unlimited notes and pinned questions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Priority email support</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-100">
                  <p className="text-xs text-gray-600">
                    Ideal for job seekers preparing regularly.
                  </p>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-[#FFFEF8] rounded-2xl shadow-lg p-6 md:p-8 border border-amber-100 hover:border-[#e99a4b] transition-all duration-300">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-black mb-1">Pro – Interview Master</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-black">$5.99</span>
                    <span className="text-sm text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    For serious candidates preparing for top company interviews
                  </p>
                </div>

                <button
                  className="w-full bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 shadow-lg transition-all cursor-pointer mb-6"
                  onClick={() => navigate('/pricing')}
                  onMouseEnter={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-hover", {
                        detail: { active: true },
                      })
                    )
                  }
                  onMouseLeave={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-hover", {
                        detail: { active: false },
                      })
                    )
                  }
                >
                  Get Started - ₹5.99
                </button>

                <p className="text-sm font-semibold text-black mb-4">
                  Everything in Plus, plus:
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Company-specific interview questions (FAANG, startups, etc.)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">AI mock interview mode (coming soon)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Resume-based question generation (coming soon)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Cloud sync & data export</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#e99a4b] mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">Priority support with faster response times</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-amber-100">
                  <p className="text-xs text-gray-600">
                    For professionals aiming to crack high-level interviews.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />

      <Modal
        isOpen={openAuthModel}
        onClose={() => {
          setOpenAuthModel(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        <div>
          {currentPage === "login" && <Login setCurrentPage={setCurrentPage} />}
          {currentPage === "signup" && (
            <SignUp setCurrentPage={setCurrentPage} />
          )}
        </div>
      </Modal>
    </>
  );
};

export default LandingPage;