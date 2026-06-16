import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse, LuLock } from "react-icons/lu";
import SpinnerLoader from "../../Components/Loader/SpinnerLoader";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../Components/Layouts/DashboardLayout";
import RoleInfoHeader from "./components/RoleInfoHeader";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import QuestionCard from "../../Components/Cards/QuestionCard";
import AIResponsePreview from "./components/AIResponsePreview";
import Drawer from "../../Components/Drawer";
import SkeltonLoader from "../../Components/Loader/SkeltonLoader";
import { UserContext } from "../../Context/userContext";
import { canPerformAction, getUpgradeMessage } from "../../utils/subscriptionFeatures";
import Modal from "../../Components/Modal";

const InterviewPrep = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({
    open: false,
    message: null,
  });

  const fetchSessionDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );

      if (response.data && response.data.session) {
        // Sort questions: pinned first, then unpinned
        const sortedQuestions = [...response.data.session.questions].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });
        
        setSessionData({
          ...response.data.session,
          questions: sortedQuestions
        });
      }
    } catch (error) {
      console.log("Error : ", error);
    }
  };

  const generateConceptExplanation = async (question) => {
      // Check if user has access to advanced explanations
      const hasAccess = canPerformAction(user, 'advancedExplanations');
      
      if (!hasAccess) {
        const upgradeMsg = getUpgradeMessage('advancedExplanations');
        setUpgradeModal({
          open: true,
          message: upgradeMsg,
        });
        return;
      }

      try {
        setErrorMsg("")
        setExplanation(null)
        setIsLoading(true)
        setOpenLearnMoreDrawer(true)

        const response = await axiosInstance.post(
          API_PATHS.AI.GENERATE_EXPLANATIONS,{
            question,
          }
        );

        if(response.data){
          console.log("API Response:", response.data);
          setExplanation(response.data);
        }

      } catch (error) {
          setExplanation(null)
          setErrorMsg("Failed to generate explanation. Try again later.")
          console.error("Error : ",error);
          
      }finally{
        setIsLoading(false)
      }
  };

  const toggleQuestionPinStatus = async (questionId, currentIsPinned) => {
    try {
      // If trying to pin a question, check the limit
      if (!currentIsPinned) {
        const pinnedCount = sessionData?.questions?.filter(q => q.isPinned).length || 0;
        const canPin = canPerformAction(user, 'pinQuestion', pinnedCount);
        
        if (!canPin) {
          const upgradeMsg = getUpgradeMessage('pinQuestion');
          setUpgradeModal({
            open: true,
            message: upgradeMsg,
          });
          return;
        }
      }

      console.log("Toggling pin for question:", questionId);
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );

      console.log("Pin response:", response);
      if (response.data && response.data.question) {
        await fetchSessionDetailsById();
      }
    } catch (error) {
      console.error("Error toggling pin: ",error);
      toast.error("Failed to toggle pin");
    }
  };

  const uploadMoreQuestions = async () => {
    // Check if user can load more questions
    const canLoadMore = canPerformAction(user, 'loadMoreQuestions');
    
    if (!canLoadMore) {
      const upgradeMsg = getUpgradeMessage('loadMoreQuestions');
      setUpgradeModal({
        open: true,
        message: upgradeMsg,
      });
      return;
    }

    try {
      setIsUpdateLoader(true)
      
      // Show toast with loading message
      toast.loading("Generating more questions... This can take up to 1 minute.", {
        id: 'load-more-toast'
      });

      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,{
                    role : sessionData?.role,
                    experience : sessionData?.experience,
                    topicToFocus : sessionData?.topicToFocus,
                    numberOFquestions : 5,
        }
      );

      const generatedQuestions = aiResponse.data

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,{
          sessionId,
          questions : generatedQuestions,
        }
      )

      if(response.data){
        toast.success("Added More Q&A!!", { id: 'load-more-toast' })
        fetchSessionDetailsById()
      }

    } catch (error) {
        toast.error("Failed to load more questions", { id: 'load-more-toast' });
        if(error.response && error.response.data.message){
          setErrorMsg(error.response.data.message)
        }else{
          setErrorMsg("Something went wrong. Please try again")
        }
    }finally{
      setIsUpdateLoader(false)
    }

  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }
    return () => {};
  }, []);

  return (
    <>
      <DashboardLayout>
      <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicToFocus || ""}
        experience={sessionData?.experience || "-"}
        questions={sessionData?.questions?.length || 0}
        description={sessionData?.description || "No description available"}
        lastUpdated={
          sessionData?.updatedAt
            ? moment(sessionData.updatedAt).format("Do MMM YYYY")
            : ""
        }
      />

      <div className="container mx-auto pt-4 pb-4 px-2 md:px-4 lg:px-0">
        <h2 className="text-base md:text-lg font-semibold color-black px-3 md:px-5 mb-3 md:mb-0">Interview Q & A</h2>

        <div className="grid grid-cols-12 gap-2 md:gap-4 mt-3 md:mt-5 mb-6 md:mb-10">
          <div
            className={`col-span-12 ${
              openLearnMoreDrawer
                ? "md:col-span-7"
                : "md:col-span-8"
            } `}
          >
            <AnimatePresence>
              {sessionData?.questions?.map((data, index) => {
                return (
                  <motion.div
                    key={data._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.5,
                      type: "spring",
                      stiffness: 100,
                      delay: index * 0.1,
                      damping: 15,
                    }}
                    layout
                    layoutId={`question-${data._id || index}`}
                  >
                    <QuestionCard
                      question={data?.question}
                      answer={data?.answer}
                      onLearnMore={() =>
                        generateConceptExplanation(data.question)
                      }
                      isPinned={data?.isPinned}
                      onTogglePin={() => toggleQuestionPinStatus(data._id, data?.isPinned)}
                    />

                      { !isLoading && 
                          sessionData?.questions?.length == index + 1 && (
                            <div className="flex items-center justify-center mt-4 md:mt-5">
                              <button
                                className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-white font-medium bg-black px-4 md:px-5 py-1.5 md:py-2 rounded cursor-pointer whitespace-nowrap disabled:opacity-50"
                                disabled={isLoading || isUpdateLoader}
                                onClick={uploadMoreQuestions}
                              >
                                {isUpdateLoader ? (
                                  <SpinnerLoader />
                                ) : (
                                  <LuListCollapse className="text-base md:text-lg" />
                                )}{" "}
                                Load More
                              </button>
                            </div>
                          )
                      }

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {!openLearnMoreDrawer && (
            <div className="hidden md:flex md:col-span-4">
              <div className="w-full border border-gray-200 rounded-lg p-[150px] pt-[220px]">
                <p className="text-gray-500 text-sm font-medium text-center mb-6">
                  Click on "Learn More" to generate detailed answer
                </p>
                <div className="flex items-center justify-center flex-1">
                  <LuListCollapse className="text-6xl text-gray-300" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="">
              <Drawer
                isOpen = {openLearnMoreDrawer}
                onClose= {() => setOpenLearnMoreDrawer(false)}
                title = {!isLoading && explanation?.title}
              >
                {errorMsg && (
                  <p className="flex gap-2 text-sm text-amber-600 font-medium">
                    <LuCircleAlert className="mt-1"/> {errorMsg}
                  </p>
                )}

                {isLoading && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-700 text-center">
                        ⏱️ Generating detailed explanation... This can take up to 1 minute.
                      </p>
                    </div>
                    <SkeltonLoader />
                  </>
                )}

                {!isLoading && explanation && (
                  <AIResponsePreview content={explanation?.explanation} />
                )}
              </Drawer>
        </div>

        <Modal
          isOpen={upgradeModal.open}
          onClose={() => setUpgradeModal({ open: false, message: null })}
          title={upgradeModal.message?.title}
        >
          <div className="w-full md:w-[30vw] p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-linear-to-r from-[#FF9324] to-[#e99a4b] flex items-center justify-center">
                <LuLock className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Premium Feature</p>
                <p className="text-lg font-semibold text-gray-900">Upgrade Required</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">{upgradeModal.message?.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setUpgradeModal({ open: false, message: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUpgradeModal({ open: false, message: null });
                  navigate('/pricing');
                }}
                className="px-6 py-2 bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-white rounded-lg hover:opacity-90 transition-all"
              >
                View Plans
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
    </>
  );
};

export default InterviewPrep;
