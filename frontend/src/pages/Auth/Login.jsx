import React, { useContext, useState } from 'react'
import Input from '../../Components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import {useNavigate} from "react-router-dom"
import { UserContext } from '../../Context/userContext';
import SpinnerLoader from '../../Components/Loader/SpinnerLoader';
import { GoogleLogin } from '@react-oauth/google';

const Login = ({setCurrentPage, skipRedirect = false}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()

  const {updateUser} = useContext(UserContext)
 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if(!validateEmail(email)){
      setError("Please enter a valid email adderss..")
    }
    const pwdComplexity = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!pwdComplexity.test(password)) {
      setError("Password must include at least one letter and one number.");
      return;
    }
    setError("")

    setIsLoading(true);

    try{

      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password
      });

      const {token} = response.data;
      
      if(token){
        localStorage.setItem("token",token);
        updateUser(response.data)
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

  };

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
        <h3 className="text-2xl font-semibold text-black">Welcome back</h3>
        <p className="text-xs text-slate-700 mt-1 mb-4">
          Please enter your details to log in.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="You@example.com"
            type="text"
            autoComplete="email"
          />
          <Input 
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Min. 8 characters"
            type="password"
            autoComplete="current-password"
          />

          {error && <p className='text-red-500 text-xs'>{error}</p>}

          <button type='submit' className='btn-primary flex items-center justify-center gap-2' disabled={isLoading}>
            {isLoading ? (
              <>
                <SpinnerLoader />
                Logging in...
              </>
            ) : (
              'Login'
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

          <p className="text-[13px] text-slate-800">
            Don’t have an account?{" "}
            <button
              type="button"
              className='font-medium text-primary underline cursor-pointer'
              onClick={() => setCurrentPage("signup")}
            >
              Sign up
            </button>
          </p>
        </form>
    </div>
  )
}

export default Login