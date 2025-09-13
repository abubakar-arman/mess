import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, Mail, Shield, Calendar, Edit, Trash2 } from 'lucide-react'

const AllMembers = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          mess_members (
            role,
            joined_at
          )
        `)

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const { error } = await supabase
        .from('mess_members')
        .delete()
        .eq('user_id', memberId)

      if (error) throw error
      
      // Refresh the list
      fetchMembers()
    } catch (error) {
      console.error('Error removing member:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">All Members</h1>
      </div>

      <div className="grid gap-6">
        {members.map((member) => (
          <div key={member.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="avatar">
                  <div className="w-16 h-16 rounded-full bg-primary/10">
                    <img 
                      src={`https://i.pravatar.cc/150?u=${member.email}`} 
                      alt={member.name}
                      className="rounded-full"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-primary">
                    {member.name} {member.id === member.id && '(You)'}
                  </h3>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-base-content/60" />
                      <span>Email: {member.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-base-content/60" />
                      <span>Member Special Permissions</span>
                      <div className={`badge ${
                        member.mess_members?.[0]?.role === 'manager' 
                          ? 'badge-primary' 
                          : 'badge-ghost'
                      }`}>
                        {member.mess_members?.[0]?.role === 'manager' ? 'Manager' : 'No Permission'}
                      </div>
                      <button className="btn btn-ghost btn-xs">
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-base-content/60" />
                      <span>Bazar Dates</span>
                      <div className="flex items-center gap-2 flex-1">
                        <button className="btn btn-ghost btn-sm flex-1">
                          বাজার ডেট সেট করা হয় নি
                        </button>
                        <button className="btn btn-ghost btn-xs">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button className="btn btn-ghost btn-xs text-error">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-actions justify-start mt-4">
                    <button 
                      className="btn btn-error btn-sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove Member
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllMembers