import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { UserPlus, Mail, User } from 'lucide-react'

const AddMember = () => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', formData.email)
        .single()

      if (existingUser) {
        // Add existing user to mess
        const { error: addError } = await supabase
          .from('mess_members')
          .insert({
            user_id: existingUser.id,
            role: formData.role,
            joined_at: new Date().toISOString()
          })

        if (addError) throw addError
        setSuccess('Member added to mess successfully!')
      } else {
        // Send invitation
        const { error: inviteError } = await supabase
          .from('mess_invitations')
          .insert({
            email: formData.email,
            role: formData.role,
            invited_at: new Date().toISOString(),
            status: 'pending'
          })

        if (inviteError) throw inviteError
        setSuccess('Invitation sent successfully!')
      }

      setFormData({ email: '', role: 'member' })
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">Add Mess Member</h1>
            </div>

            {/* Success Alert */}
            {success && (
              <div className="alert alert-success mb-4">
                <span>{success}</span>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter member's email address"
                  className="input input-bordered w-full"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <label className="label">
                  <span className="label-text-alt">We'll send an invitation if they don't have an account</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Member Role
                  </span>
                </label>
                <select
                  name="role"
                  className="select select-bordered w-full"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                </select>
                <label className="label">
                  <span className="label-text-alt">Managers can add meals, costs, and manage the mess</span>
                </label>
              </div>

              <div className="card-actions justify-end">
                <button
                  type="submit"
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Adding Member...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddMember