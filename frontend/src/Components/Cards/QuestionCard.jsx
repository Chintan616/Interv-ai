import React, { useEffect, useRef, useState } from "react";
import { LuChevronDown ,LuPin,LuPinOff,LuSparkles } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import AIResponsePreview from "../../pages/InterviewPrep/components/AIResponsePreview";

const QuestionCard = ({
  question,
  answer,
  onLearnMore,
  isPinned,
  onTogglePin,
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [height, setHeight] = useState(0)
    const contentRef = useRef(null)

    useEffect(() => {
        if(isExpanded){
            const contentHeight = contentRef.current.scrollHeight;
            setHeight(contentHeight + 10);
        }else{
            setHeight(0);
        }
    },[isExpanded])

    const toggleExpand = () => {
        setIsExpanded(! isExpanded)
    }
  return <>
            <div className="bg-white rounded-lg mb-3 md:mb-4 overflow-hidden py-3 md:py-4 px-4 md:px-5 shadow-xl shadow-gray-100/70 border border-gray-100/60 group">
                <div className="flex items-start justify-between cursor-pointer">
                    <div className="flex items-start gap-2 md:gap-3.5 flex-1 min-w-0">
                        <span className="text-xs md:text-[15px] font-semibold text-gray-400 leading-[18px] shrink-0">
                            Q
                        </span>

                        <h3 className="text-xs md:text-[14px] font-medium text-gray-800 mr-0 md:mr-20 flex-1 min-w-0"
                        onClick={toggleExpand}>
                            {question}
                        </h3>
                    </div>

                <div className="flex items-center justify-end ml-2 md:ml-4 relative shrink-0">
                    <div className={`flex transition-opacity duration-300 ease-in-out ${
                        isExpanded ? "md:opacity-100" : "md:opacity-0 md:group-hover:opacity-100"}`}>
                            <button
                                className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-indigo-800 font-medium bg-indigo-50 px-2 md:px-3 py-1 mr-1 md:mr-2 rounded border border-indigo-50 hover:border-indigo-200 cursor-pointer transition-all duration-200 whitespace-nowrap"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePin();
                                }}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={isPinned ? 'pinned' : 'unpinned'}
                                        initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                        exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="inline-flex"
                                    >
                                        {isPinned ? 
                                        (<LuPinOff className="text-xs md:text-sm" />) : 
                                        (<LuPin className="text-xs md:text-sm" />)    
                                        }
                                    </motion.span>
                                </AnimatePresence>
                                <span className="hidden md:inline">{isPinned ? "Unpin" : "Pin"}</span>
                            </button>

                            <button
                                className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-cyan-800 font-medium bg-cyan-50 px-2 md:px-3 py-1 mr-1 md:mr-2 rounded border border-cyan-50 hover:border-cyan-200 cursor-pointer transition-all duration-200 whitespace-nowrap"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(true);
                                    onLearnMore();
                                }}
                            >
                                <LuSparkles className="text-xs md:text-sm" />
                                <span className="hidden sm:inline">Learn More</span>
                            </button>
                        </div>

                        <button
                        className="text-gray-400 hover:text-gray-500 cursor-pointer shrink-0"
                        onClick={toggleExpand}
                        >
                            <LuChevronDown
                                size={18}
                                className={`transform transition-transform duration-300 
                                    ${isExpanded ? "rotate-180" : ""}`}
                            />
                        </button>
                </div>
                </div>

                <div className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{maxHeight : `${height}px`}}>
                    <div className="mt-3 md:mt-4 text-gray-700 bg-gray-50 px-3 md:px-5 py-2 md:py-3 rounded-lg text-xs md:text-[13px] leading-relaxed"
                        ref={contentRef}>
                        <AIResponsePreview content = {answer} />
                    </div>
                </div>
            </div>
        </>
};

export default QuestionCard;
