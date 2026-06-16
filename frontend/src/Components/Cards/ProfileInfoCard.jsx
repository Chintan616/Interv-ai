import React, { useContext } from 'react'
import { UserContext } from '../../Context/userContext'
import { useNavigate } from 'react-router-dom';

const ProfileInfoCard = () => {
    const {user,clearUser} = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear()
        clearUser();
        navigate("/")
    };

    // Return null if user is not loaded yet
    if (!user) {
        return null;
    }

  return (
    <div className='flex items-center gap-2 md:gap-3 overflow-hidden'>
        {user.profileImageUrl ? (
            <img 
                src={user.profileImageUrl}
                alt={user.name}
                className='w-9 h-9 md:w-11 md:h-11 bg-gray-300 rounded-full object-cover shrink-0'
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
        ) : null}
        <div 
            className={`w-9 h-9 md:w-11 md:h-11 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold shrink-0 ${user.profileImageUrl ? 'hidden' : ''}`}
            style={{display: user.profileImageUrl ? 'none' : 'flex'}}
        >
            <span className="text-base md:text-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
        </div>

        <div className='flex-col flex md:flex'>
            <div 
                className='text-xs md:text-sm font-medium text-gray-900 truncate'
            >
                {user.name || ""}
            </div>

            <button
                className='text-amber-600 text-[10px] md:text-xs font-semibold cursor-pointer hover:underline whitespace-nowrap text-left'
                onClick={handleLogout}
            >
                Logout
            </button>
        </div>
    </div>
  )
}

export default ProfileInfoCard