import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { loginUser } from '../authslice';
import { useEffect, useState } from 'react';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(
        loginUser({
          emailId: data.email,
          password: data.password,
        })
      ).unwrap();

      if (res.token) {
        localStorage.setItem("token", res.token);
      }

      navigate('/');
    } catch (err) {
      // Error handled by Redux
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#1e2330]">
      <div className="w-[520px] flex flex-col items-center">

        <h1 className="text-5xl font-bold mb-24 text-center">
          <span className="text-purple-400">CodeShinzo</span>
          <span className="text-white"> – Where logic meets code.</span>
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-y-7"
        >

          {/* Email */}
          <div className="flex flex-col gap-y-2">
            <label className="text-gray-300 text-base">Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              className={`w-full px-5 py-4 text-base rounded-md bg-[#2a3042] border text-white placeholder-gray-500 outline-none focus:border-purple-500 transition
                ${errors.email ? 'border-red-500' : 'border-[#3d4663]'}`}
              {...register("email")}
            />
            {errors.email && (
              <span className="text-red-400 text-xs">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-y-2">
            <label className="text-gray-300 text-base">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                className={`w-full px-5 py-4 pr-12 text-base rounded-md bg-[#2a3042] border text-white placeholder-gray-500 outline-none focus:border-purple-500 transition
                  ${errors.password ? 'border-red-500' : 'border-[#3d4663]'}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-purple-400"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-400 text-xs">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          )}

          {/* Button */}
          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-48 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          {/* Signup */}
          <div className="flex justify-center items-center gap-2 mt-1">
            <span className="text-gray-400 text-sm">
              Don't have an account?
            </span>
            <NavLink
              to="/signup"
              className="text-purple-400 hover:text-purple-300 text-sm font-semibold"
            >
              Sign Up
            </NavLink>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Login;