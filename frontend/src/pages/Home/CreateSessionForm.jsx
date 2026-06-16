import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../../Components/Inputs/Input';
import SpinnerLoader from '../../Components/Loader/SpinnerLoader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const CreateSessionForm = ({ onClose }) => {
    const [formData,setFormData] = useState({
        role : "",
        experience : "",
        topicToFocus : "",
        description : "",
    });
    const [resumeFile, setResumeFile] = useState(null);

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const navigate = useNavigate()

    const handleChange = (key,value) => {
        setFormData((prevData) => ({
            ...prevData,
            [key] : value,
        }))
    }

    const handleCreateSession = async (e) => {
        e.preventDefault();
        const {role,experience,topicToFocus,description} = formData;

        if(!role || !experience || !topicToFocus){
            setError("Please fill all required fields")
            return;
        }

        if(parseInt(experience) < 0){
            setError("Experience cannot be negative")
            return;
        }

        setError("")
        setIsLoading(true)

        try{
            // First, generate questions using AI
            const formPayload = new FormData();
            formPayload.append('role', role);
            formPayload.append('experience', `${experience} years`);
            formPayload.append('topicToFocus', topicToFocus);
            formPayload.append('numberOFquestions', 10);
            if (resumeFile) {
                formPayload.append('resume', resumeFile);
            }

            const aiResponse = await axiosInstance.post(
                API_PATHS.AI.GENERATE_QUESTIONS,
                formPayload,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )

            if(!aiResponse.data || !Array.isArray(aiResponse.data)){
                throw new Error("Invalid AI response");
            }

            const generatedQuestions = aiResponse.data;

            // Then create session with generated questions
            const response = await axiosInstance.post(API_PATHS.SESSION.CREATE , {
                role,
                experience,
                topicToFocus,
                description,
                questions : generatedQuestions,
            });

            toast.success("Session created successfully!")
            
            if(onClose) onClose();
            
            // Navigate to the new session
            navigate(`/interview-prep/${response.data?.session?._id}`)

        }catch(error){
            console.error("Error creating session:", error);
            const errorMessage = error.response?.data?.message || "Failed to create session. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        }finally{
            setIsLoading(false)
        }
    }
  return (
    <div className='w-full flex flex-col justify-center'>
        <h3 className="text-lg font-semibold text-black">
            Start a New Interview Journey
        </h3>

        <p className="text-xs text-slate-700 mt-[5px] mb-3">
            Fill out a few quick details and unlock your personalized set of Interview questions!
        </p>

        <form onSubmit={handleCreateSession}>
            <Input 
                value={formData.role}
                onChange={({target}) => handleChange("role",target.value)}
                label="Target Role *"
                placeholder="(e.g., Frontend Developer, UI/UX Designer,etc.)"
                type={"text"}
            />
            <Input 
                value={formData.experience}
                onChange={({target}) => handleChange("experience",target.value)}
                label="Years of Experience *"
                placeholder="(e.g., 1, 4, 7)"
                type={"number"}
            />
            <Input 
                value={formData.topicToFocus}
                onChange={({target}) => handleChange("topicToFocus",target.value)}
                label="Topics to Focus On *"
                placeholder="(Comma-separated, e.g., React, Node.js, etc.)"
                type={"text"}
            />
            <Input 
                value={formData.description}
                onChange={({target}) => handleChange("description",target.value)}
                label="Description (Optional)"
                placeholder="(Any Specific goals or notes for this session)"
                type={"text"}
            />

            <div className="flex flex-col gap-1.5 mb-5 mt-2">
                <label className="text-[13px] text-slate-800">
                    Upload Resume (Optional, PDF only)
                </label>
                <div className="relative">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFFCEF] file:text-[#e99a4b] hover:file:bg-amber-50 cursor-pointer border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-[#e99a4b]"
                    />
                </div>
            </div>

            {error && <p className='text-red-500 text-xs mt-2'>{error}</p>}

            {isLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-xs text-blue-700 text-center">
                        ⏱️ This can take up to 1 minute. Please wait...
                    </p>
                </div>
            )}

            <button
                type='submit'
                className='btn-primary w-full mt-5'
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                        <SpinnerLoader />
                        Generating Questions...
                    </span>
                ) : 'Create Session'}
            </button>
        </form>
        
    </div>
  )
}

export default CreateSessionForm