import React, { useState, useContext } from 'react'
import {useNavigate} from "react-router-dom"
import Input from '../../Components/Inputs/Input'
import ProfilePhotoSelector from '../../Components/Inputs/ProfilePhotoSelector'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../Context/userContext'
import { uploadImage } from '../../utils/uploadImage'
import SpinnerLoader from '../../Components/Loader/SpinnerLoader';
import { GoogleLogin } from '@react-oauth/google';

const Signup = ({ setCurrentPage, skipRedirect = false }) => {

  const [profilePic, setProfilePic] = useState(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    // validations
    if (!fullName || fullName.trim().length < 3) {
      setError("Please enter your full name (at least 3 characters).");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // basic password complexity: at least one letter and one number
    const pwdComplexity = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!pwdComplexity.test(password)) {
      setError("Password must include at least one letter and one number.");
      return;
    }

    // TODO: integrate API, then navigate or close modal
    // navigate('/dashboard');

    setIsLoading(true);

    try{
      let profileImageUrl = "";

      // Upload profile image if selected
      if (profilePic) {
        profileImageUrl = await uploadImage(profilePic);
      }

      // Register user
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        if (!skipRedirect) {
          navigate("/dashboard");
        }
      }

    }
    catch(error){
      if(error.response && error.response.data.message){
        setError(error.response.data.message);
      }else{
        setError("Something went wrong. Please try again.")
      }
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(API_PATHS.AUTH.GOOGLE_LOGIN, {
        token: credentialResponse.credential
      });
      const {token} = response.data;
      if(token){
        localStorage.setItem("token",token);
        updateUser(response.data)
        if (!skipRedirect) {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if(error.response && error.response.data.message){
        setError(error.response.data.message);
      } else {
        setError("Google Login failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className='w-full max-w-md mx-auto p-6 md:p-7 flex flex-col'>
      <h3 className="text-2xl font-semibold text-black">Create an account</h3>
      <p className="text-xs text-slate-700 mt-1 mb-4">
        Please enter your details to sign up.
      </p>


      <form onSubmit={handleSignUp}>

        <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

        <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
        <Input 
          value = {fullName}
          onChange={({target}) => setFullName(target.value)}
          label={"Full Name"}
          placeholder={"Chintan Kasundra"}
          type={"text"}
        />
        <Input 
          value = {email}
          onChange={({target}) => setEmail(target.value)}
          label={"Email Address"}
          placeholder={"chintan@gmail.com"}
          type={"text"}
          autoComplete="email"
        />
        <Input 
          value = {password}
          onChange={({target}) => setPassword(target.value)}
          label={"Password"}
          placeholder={"Min. 8 Characters.."}
          type={"password"}
          autoComplete="new-password"
        />

      </div>

      {error && <p className='text-red-500 text-xs' >{error}</p>}

      <button type='submit' className='btn-primary mt-5 flex items-center justify-center gap-2' disabled={isLoading}>
        {isLoading ? (
          <>
            <SpinnerLoader />
            Signing up...
          </>
        ) : (
          'SIGN UP'
        )}
      </button>

      <div className="flex items-center justify-center mt-4 mb-4">
        <span className="text-sm text-gray-500">OR</span>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            setError("Google Login failed.");
          }}
        />
      </div>

      </form>


      <p className="text-[13px] text-slate-800 mt-4">
        Already have an account?{" "}
        <button
          type="button"
          className='font-medium text-primary underline cursor-pointer'
          onClick={() => setCurrentPage && setCurrentPage("login")}
        >
          Log in
        </button>
      </p>
    </div>
  )
}

export default Signup
