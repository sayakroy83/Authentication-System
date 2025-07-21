import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'


function Login() {
  const navigate = useNavigate()
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    try {
      axios.defaults.withCredentials = true

      if (state === 'Sign Up') {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          email,
          password,
        })

        if (data.success) {
          setIsLoggedin(true)
          await getUserData()
          navigate('/')
          toast.success('Account created successfully!')
          setName('')
          setEmail('')
          setPassword('')
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
        })

        if (data.success) {
          setIsLoggedin(true)
          await getUserData()
          navigate('/')
          toast.success('Logged in successfully!')
          setEmail('')
          setPassword('')
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400 relative'>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt='Logo'
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      <div className='bg-slate-900 p-10 rounded-xl shadow-lg w-full max-w-md text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-2'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </h2>
        <p className='text-center mb-6'>
          {state === 'Sign Up' ? 'Create your account' : 'Login to your account'}
        </p>

        <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
          {state === 'Sign Up' && (
            <div className='flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} alt='Person Icon' />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className='bg-transparent outline-none text-white w-full'
                type='text'
                placeholder='Full Name'
                required
              />
            </div>
          )}

          <div className='flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt='Mail Icon' />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='bg-transparent outline-none text-white w-full'
              type='email'
              placeholder='Email ID'
              required
            />
          </div>

          <div className='flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt='Lock Icon' />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='bg-transparent outline-none text-white w-full'
              type='password'
              placeholder='Password'
              required
            />
          </div>

          <p
            onClick={() => navigate('/reset-password')}
            className='text-indigo-400 text-xs text-right cursor-pointer hover:underline'
          >
            Forgot Password?
          </p>

          <button
            type='submit'
            className='w-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium py-2 hover:opacity-90 transition'
          >
            {state}
          </button>
        </form>

        <p className='text-gray-400 text-center text-xs mt-6'>
          {state === 'Sign Up'
            ? 'Already have an account? '
            : "Don't have an account? "}
          <span
            className='text-blue-400 cursor-pointer underline'
            onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}
          >
            {state === 'Sign Up' ? 'Login here' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
