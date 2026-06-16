import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/userContext'
import DashboardLayout from '../../Components/Layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { LuCalendar, LuFileQuestion, LuFolderOpen, LuMail, LuUser, LuBriefcase, LuPencil, LuCamera } from 'react-icons/lu'
import moment from 'moment'
import Modal from '../../Components/Modal'
import Input from '../../Components/Inputs/Input'
import toast from 'react-hot-toast'
import { uploadImage } from '../../utils/uploadImage'

const Profile = () => {
  const { user, updateUser } = useContext(UserContext)
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalQuestions: 0,
    totalTopics: 0,
    pinnedQuestions: 0,
    recentActivities: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    profileImageUrl: '',
    about: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    fetchUserStats()
  }, [])

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        profileImageUrl: user.profileImageUrl || '',
        about: user.about || ''
      })
      setImagePreview(user.profileImageUrl || null)
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL)
      const userSessions = response.data

      // Calculate statistics
      const totalQuestions = userSessions.reduce((sum, session) => sum + (session.questions?.length || 0), 0)
      const pinnedQuestions = userSessions.reduce((sum, session) => {
        return sum + (session.questions?.filter(q => q.isPinned)?.length || 0)
      }, 0)
      
      // Get unique topics
      const uniqueTopics = new Set()
      userSessions.forEach(session => {
        if (session.topicToFocus) {
          session.topicToFocus.split(',').forEach(topic => uniqueTopics.add(topic.trim()))
        }
      })

      // Get top 5 most recent activities
      const recentActivities = userSessions
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 3)

      setStats({
        totalSessions: userSessions.length,
        totalQuestions,
        totalTopics: uniqueTopics.size,
        pinnedQuestions,
        recentActivities
      })

      setSessions(userSessions)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      
      let profileImageUrl = editForm.profileImageUrl

      // Upload image if a new one was selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        profileImageUrl = uploadedUrl
      }

      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        name: editForm.name,
        email: editForm.email,
        profileImageUrl,
        about: editForm.about
      })

      // Update user context with new data
      updateUser({ ...user, ...response.data })
      
      toast.success('Profile updated successfully!')
      setIsEditModalOpen(false)
      setImageFile(null)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div 
      className={`${bgColor} border border-gray-200/50 rounded-lg p-4 hover:shadow-lg transition-shadow`}
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
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 ${color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
          <Icon className={`text-xl ${color}`} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-xs text-gray-600 font-medium">{label}</p>
    </div>
  )

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#FF9324] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <DashboardLayout>
        <div className="container mx-auto px-2 md:px-4 lg:px-20 py-4 md:py-6">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-5">
              {/* Profile Image */}
              <div className="relative shrink-0">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.name}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-linear-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center border-4 border-gray-100 shadow-lg">
                    <span className="text-2xl md:text-4xl font-bold text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left w-full min-w-0">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-3 mb-2">
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate w-full md:w-auto">
                    {user?.name || 'User'}
                  </h1>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:opacity-90 transition-all text-xs md:text-sm font-semibold shadow-md shrink-0"
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
                    <LuPencil className="text-sm md:text-base" />
                    Edit Profile
                  </button>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <LuMail className="text-sm md:text-base shrink-0" />
                    <span className="text-xs md:text-sm truncate max-w-[200px] md:max-w-none">{user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuCalendar className="text-sm md:text-base shrink-0" />
                    <span className="text-xs md:text-sm whitespace-nowrap">
                      Joined {user?.createdAt ? moment(user.createdAt).format('MMM Do, YYYY') : 'N/A'}
                    </span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-700 max-w-2xl leading-relaxed">
                  {user?.about || 'Welcome to your profile! Track your interview preparation progress and manage your personalized sessions.'}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Your Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard
                icon={LuFolderOpen}
                label="Total Sessions"
                value={stats.totalSessions}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={LuFileQuestion}
                label="Total Questions"
                value={stats.totalQuestions}
                color="text-green-600"
                bgColor="bg-green-50"
              />
              <StatCard
                icon={LuBriefcase}
                label="Unique Topics"
                value={stats.totalTopics}
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
              <StatCard
                icon={LuUser}
                label="Pinned Questions"
                value={stats.pinnedQuestions}
                color="text-orange-600"
                bgColor="bg-orange-50"
              />
            </div>
          </div>

          {/* Recent Activity */}
          {stats.recentActivities && stats.recentActivities.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Recent Activity</h2>
              <div className="space-y-2">
                {stats.recentActivities.map((activity, index) => (
                  <div
                    key={activity._id}
                    className="bg-linear-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200/50 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.location.href = `/interview-prep/${activity._id}`}
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
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          {activity.topicToFocus || 'No topics specified'}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Updated {moment(activity.updatedAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {stats.totalSessions === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-10 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <LuFolderOpen className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start your interview preparation journey by creating your first session!
              </p>
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setImageFile(null)
            setImagePreview(user?.profileImageUrl || null)
          }}
          title="Edit Profile"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-linear-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center border-4 border-gray-100 shadow-lg">
                    <span className="text-4xl font-bold text-white">
                      {editForm.name ? editForm.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 w-9 h-9 bg-[#FF9324] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#e99a4b] transition-colors shadow-lg"
                >
                  <LuCamera className="text-white text-base" />
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-600">Click camera to change picture</p>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <Input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* About Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                About You
              </label>
              <textarea
                value={editForm.about}
                onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                placeholder="Tell us about yourself..."
                rows="3"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9324] focus:border-transparent resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setImageFile(null)
                  setImagePreview(user?.profileImageUrl || null)
                }}
                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-[#FF9324] to-[#e99a4b] rounded-full hover:opacity-90 transition-all disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      </DashboardLayout>
    </>
  )
}

export default Profile
