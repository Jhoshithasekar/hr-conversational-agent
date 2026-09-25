import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import {
  AUTH_STATUS,
  getDefaultWorkspaceRoute,
  isPathAllowedForRole,
} from '../utils/workspaceRouting'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authStatus, user, login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 1. While auth state is initializing (checking saved token on mount),
  // do NOT render the login form prematurely or trigger false redirects.
  if (authStatus === AUTH_STATUS.INITIALIZING) {
    return (
      <div className="auth-page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-loading">Checking your session…</div>
      </div>
    )
  }

  // 2. If authenticated with a valid session, redirect to the authorized workspace.
  if (authStatus === AUTH_STATUS.AUTHENTICATED && user) {
    const defaultRoute = getDefaultWorkspaceRoute(user.role)
    const requestedFrom = location.state?.from
    const isAllowed =
      requestedFrom &&
      requestedFrom !== '/login' &&
      requestedFrom !== '/' &&
      isPathAllowedForRole(requestedFrom, user.role)
    const target = isAllowed ? requestedFrom : defaultRoute
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

    setSubmitting(true)
    setSubmitError('')

    try {
      const response = await login(formData.email.trim(), formData.password)
      const defaultRoute = getDefaultWorkspaceRoute(response?.role)
      const requestedFrom = location.state?.from
      const isAllowed =
        requestedFrom &&
        requestedFrom !== '/login' &&
        requestedFrom !== '/' &&
        isPathAllowedForRole(requestedFrom, response?.role)
      const nextPath = isAllowed ? requestedFrom : defaultRoute
      navigate(nextPath, { replace: true })
    } catch (error) {
      setSubmitError(error.message || 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
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

          <button className="primary-button auth-submit" disabled={submitting} type="submit">
            {submitting ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
