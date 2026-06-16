import React from 'react'

const DeleteAlertContent = ({content,onDelete}) => {
    return (
        <div className='py-2 md:py-3'>
                <p className="text-sm md:text-[15px] text-gray-700 mb-5 md:mb-6 text-center leading-relaxed">
                        {content}
                </p>

                <div className="flex justify-center">
                        <button
                                type='button'
                                className='bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium px-8 md:px-10 py-2 md:py-2.5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md text-sm md:text-base touch-manipulation'
                                onClick={onDelete}
                        >
                                Delete
                        </button>
                </div>
        </div>
    )
}

export default DeleteAlertContent