import React from 'react'
import { getInitials } from '../../../utils/helper'
import { LuArrowLeft } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'

const RoleInfoHeader = ({
        role,
        topicsToFocus,
        experience,
        questions,
        description,
        lastUpdated,
}) => {
  const navigate = useNavigate()

  return (
    <div 
      className='bg-white relative overflow-hidden'
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
    <div className='container mx-2 md:mx-7 px-4 md:px-10'>
        <div className="min-h-[180px] md:h-[200px] flex flex-col justify-center relative z-10 py-4">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 hover:text-black transition-colors mb-3 md:mb-4 group"
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
                <LuArrowLeft className="text-base md:text-lg group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
                <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl md:text-2xl font-bold text-white">
                        {role ? getInitials(role) : ''}
                    </span>
                </div>
                
                <div className="grow min-w-0 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                        <div className="min-w-0 w-full md:w-auto">
                            <h2 className="text-xl md:text-2xl font-medium truncate">{role}</h2>
                            <p className="text-xs md:text-sm text-medium text-gray-900 mt-1 line-clamp-1 md:line-clamp-none">{topicsToFocus}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-4">
                <div className="text-[9px] md:text-[10px] font-semibold text-white bg-black px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
                    Experience : {experience} {experience == 1 ? "Year" : "Years"}
                </div>
                <div className="text-[9px] md:text-[10px] font-semibold text-white bg-black px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
                    {questions} Q&A
                </div>
                <div className="text-[9px] md:text-[10px] font-semibold text-white bg-black px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
                    Last Updated : {lastUpdated}
                </div>
            </div>
        </div>

        <div className="w-full md:w-[40vw] h-[150px] md:h-[200px] flex items-center justify-center bg-white overflow-hidden absolute top-0 right-0 pointer-events-none">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-lime-400 blur-[45px] md:blur-[65px] animate-blob1" />
            <div className="w-12 h-12 md:w-16 md:h-16 bg-teal-400 blur-[45px] md:blur-[65px] animate-blob2"/>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-cyan-300 blur-[35px] md:blur-[45px] animate-blob3" />
            <div className="w-12 h-12 md:w-16 md:h-16 bg-fuchsia-200 blur-[35px] md:blur-[45px] animate-blob1" />
        </div>

    </div>
    </div>
  )
}

export default RoleInfoHeader