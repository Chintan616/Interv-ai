import React, { useEffect } from 'react'

const Modal = ({ children, isOpen, onClose, title, hideHeader }) => {
    // Keep hooks unconditionally at the top level to preserve hook order across renders
    // Add keydown listener only when the modal is open
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose && onClose();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose && onClose();
        }
    };
    return (
        <>
            <div
                className='fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/40 backdrop-blur-[1px]'
                onClick={handleBackdropClick}
                role="dialog"
                aria-modal="true"
            >
                <div className="relative flex flex-col bg-white shadow-2xl rounded-2xl overflow-hidden max-h-[89.5vh] w-[calc(100vw-2rem)] max-w-[570px] ring-1 ring-black/5">
                    {!hideHeader && (
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="md:text-lg font-medium text-gray-900">{title}</h3>
                        </div>
                    )}

                    <button
                        type='button'
                        className='text-gray-400 bg-transparent hover:bg-orange-100 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center absolute top-4 right-4 cursor-pointer'
                        onClick={onClose}
                        aria-label='Close modal'
                    >
                        <svg className='w-3 h-3' aria-hidden="true" xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 14 14'>
                            <path
                                stroke='currentColor'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d="M1 1l12 12M13 1L1 13"
                            />
                        </svg>
                    </button>

                    <div className='flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 sm:p-6 md:p-8'>
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Modal