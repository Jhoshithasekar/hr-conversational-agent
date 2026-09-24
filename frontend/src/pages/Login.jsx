import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    const target = location.state?.from || '/employee'
    return <Navigate replace to={target} />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
    setSubmitError('')
  }

  const validate = () => {
    const nextErrors = {}

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.'
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    setSubmitError('')

    try {
      await login(formData.email.trim(), formData.password)
      const nextPath = location.state?.from || '/employee'
      navigate(nextPath, { replace: true })
    } catch (error) {
      setSubmitError(error.message || 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-shell">
      <div className="auth-card">
        <div className="auth-branding">
          <div className="auth-brand-mark">HR</div>
          <div className="auth-brand-copy">
            <p className="auth-brand-name">PeopleDesk</p>
            <p className="auth-brand-caption">Employee self-service portal</p>
          </div>
        </div>

        <div className="auth-header-block">
          <p className="eyebrow auth-eyebrow">Welcome back</p>
          <h1>Sign in to your workspace</h1>
          <p>Use your employee email and password to access the HR portal.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field" htmlFor="email">
            <span>Email</span>
            <div className={`auth-input-wrap ${errors.email ? 'has-error' : ''}`}>
              <Mail aria-hidden="true" size={17} />
              <input
                id="email"
                name="email"
                onChange={handleChange}
                placeholder="neha.sharma@example.com"
                type="email"
                value={formData.email}
              />
            </div>
            {errors.email ? <small className="field-error">{errors.email}</small> : null}
          </label>

          <label className="auth-field" htmlFor="password">
            <span>Password</span>
            <div className={`auth-input-wrap ${errors.password ? 'has-error' : ''}`}>
              <LockKeyhole aria-hidden="true" size={17} />
              <input
                id="password"
                name="password"
                onChange={handleChange}
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                type="button"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password ? <small className="field-error">{errors.password}</small> : null}
          </label>

          {submitError ? <div className="form-alert form-alert-error">{submitError}</div> : null}

          <button className="primary-button auth-submit" disabled={loading} type="submit">
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
