import React, { useEffect, useState, useContext } from 'react'
import { LuPlus } from 'react-icons/lu'
import {CARD_BG} from '../../utils/data'
import toast from 'react-hot-toast'
import DashboardLayout from '../../Components/Layouts/DashboardLayout'
import { data, useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import SummaryCard from '../../Components/Cards/SummaryCard'
import SubscriptionCard from '../../Components/Cards/SubscriptionCard'
import moment from "moment"
import Modal from '../../Components/Modal'
import CreateSessionForm from './CreateSessionForm'
import DeleteAlertContent from '../../Components/DeleteAlertContent'
import { UserContext } from '../../Context/userContext'
import { canPerformAction, getUpgradeMessage } from '../../utils/subscriptionFeatures'

const Dashboard = () => {
  const navigate = useNavigate();  
  const { user } = useContext(UserContext);
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open : false,
    data : null,
  });
  const [upgradeModal, setUpgradeModal] = useState({
    open: false,
    message: null,
  });

  const fetchAllSessions = async () => {
    try{
      setIsLoading(true)
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data);
    }catch(error){
      console.error("Error fetching session data : ",error)
    }finally{
      setIsLoading(false)
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(
        API_PATHS.SESSION.DELETE(sessionData?._id)
      );

      toast.success("Session Deleted Sucessfully");
      setOpenDeleteAlert({
        open : false,
        data : null,
      });

      fetchAllSessions();
    } catch (error) {
      console.error("Error deleting session data : ",error);
    }
  };

  const handleCreateSession = () => {
    const canCreate = canPerformAction(user, 'createSession', sessions.length);
    
    if (!canCreate) {
      const upgradeMsg = getUpgradeMessage('createSession');
      setUpgradeModal({
        open: true,
        message: upgradeMsg,
      });
      return;
    }
    
    setOpenCreateModal(true);
  };

  useEffect(() => {
    fetchAllSessions();
  },[])

  return (
    <>
      <DashboardLayout>
      <div className="container mx-auto pt-4 pb-4">
        {/* Subscription Card */}
        <div className="mb-8 px-2 md:px-0">
          <SubscriptionCard />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#FF9324] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading sessions...</p>
            </div>
          </div>
        ) : sessions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-linear-to-br from-[#FF9324] to-[#e99a4b] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <LuPlus className='text-5xl text-white' />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
                Add Your Personalized Interview Session
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by creating your first interview preparation session tailored to your role and experience.
              </p>
              <button
                className='inline-flex items-center justify-center gap-3 bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-8 py-3 rounded-full hover:opacity-90 transition-all cursor-pointer shadow-lg hover:shadow-xl'
                onClick={handleCreateSession}
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
                <LuPlus className='text-xl text-white' />
                Create Your First Session
              </button>
            </div>
          </div>
        ) : (
          <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-7 pt-1 pb-2 px-2 md:px-0">

          {sessions?.map((data,index) => (
              <SummaryCard
                key={data?._id}
                colors={CARD_BG[index % CARD_BG.length]}
                role={data?.role || ""}
                topicsToFocus={data?.topicToFocus || ""}
                experience={data?.experience || "-"}
                questions={data?.questions?.length || 0}
                description={data?.description || "No description available"}
                lastUpdated={
                  data?.updatedAt? moment(data.updatedAt).format("Do MMM YYYY") : ""
                }
                onSelect={() => navigate(`/interview-prep/${data?._id}`)}
                onDelete={() => setOpenDeleteAlert({open:true,data})}
                />
          ))}

        </div>

        <button
          className='h-12 md:h-12 flex items-center justify-center gap-3 bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-orange-300 fixed 
          bottom-10 md:bottom-20 right-10 md:right-20'
          onClick={handleCreateSession}
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
          <LuPlus className='text-2xl text-white' />
          Add New
        </button>
        </>
        )}
      </div>


      <Modal
        isOpen={openCreateModal}
        onClose={ () => {
          setOpenCreateModal(false)
        }}
        hideHeader
        >
          <div className=''>
            <CreateSessionForm onClose={() => setOpenCreateModal(false)} />
          </div>

        </Modal>


        <Modal
          isOpen={openDeleteAlert?.open}
          onClose={() => {
            setOpenDeleteAlert({open : false , data : null});
          }}
          title = "Delete Alert"
        >
          <div className="w-full md:w-[30vw]">
            <DeleteAlertContent content="Are you sure you want to delete this session detail ?"
            onDelete={() => deleteSession(openDeleteAlert.data)}

            />
          </div>

        </Modal>

        <Modal
          isOpen={upgradeModal.open}
          onClose={() => setUpgradeModal({ open: false, message: null })}
          title={upgradeModal.message?.title}
        >
          <div className="w-full md:w-[30vw] p-4">
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

    </DashboardLayout>
    </>
  )
}

export default Dashboard