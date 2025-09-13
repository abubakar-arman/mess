import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Utensils, 
  DollarSign, 
  ShoppingCart, 
  Wallet,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [messData, setMessData] = useState(null)
  const [personalData, setPersonalData] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch mess summary data
      const { data: mess } = await supabase
        .from('mess_summary')
        .select('*')
        .single()

      // Fetch personal data
      const { data: personal } = await supabase
        .from('user_summary')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Fetch all members
      const { data: membersData } = await supabase
        .from('profiles')
        .select('*')

      setMessData(mess)
      setPersonalData(personal)
      setMembers(membersData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
      <div className="flex gap-6">
        {/* Left Panel */}
        <div className="w-1/3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-primary">MessMate, {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (Running)</h2>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-base-content/60" />
                  <span>Mess Balance: <strong>{messData?.balance || '0.00'} tk</strong></span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-base-content/60" />
                  <span>Total Deposit: <strong>{messData?.total_deposit || '0.00'} tk</strong></span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-base-content/60" />
                  <span>Total Meal: <strong>{messData?.total_meals || '0.00'}</strong></span>
                </div>
                
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-base-content/60" />
                  <span>Total Meal Cost: <strong>{messData?.total_meal_cost || '0.00'} tk</strong></span>
                </div>
                
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-base-content/60" />
                  <span>Meal Rate: <strong>{messData?.meal_rate || '0.00'} tk</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-2/3 space-y-6">
          {/* Personal Info Cards */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">My Personal Info</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="card bg-blue-50 border border-blue-200">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-blue-600">{personalData?.total_meals || '0.00'}</h3>
                      <p className="text-sm text-blue-600/70">My Total Meal</p>
                    </div>
                    <Utensils className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card bg-green-50 border border-green-200">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-green-600">{personalData?.deposit || '0.00'} tk</h3>
                      <p className="text-sm text-green-600/70">My Deposit</p>
                    </div>
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card bg-red-50 border border-red-200">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-red-600">{personalData?.cost || '0.00'} tk</h3>
                      <p className="text-sm text-red-600/70">My Cost</p>
                    </div>
                    <ShoppingCart className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="card bg-yellow-50 border border-yellow-200">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-yellow-600">{personalData?.balance || '0.00'} tk</h3>
                      <p className="text-sm text-yellow-600/70">My Balance</p>
                    </div>
                    <Wallet className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-primary text-primary-content cursor-pointer hover:bg-primary/90 transition-colors">
              <div className="card-body p-4">
                <div className="flex items-center justify-center gap-3">
                  <Users className="w-6 h-6" />
                  <span className="font-medium">Membership</span>
                </div>
              </div>
            </div>
          </section>

          {/* Bazar Date Section */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">My Bazar Date</h2>
            <button className="btn btn-outline">বাজার ডেট সেট করুন</button>
          </section>

          {/* All Members Info */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">All Member Info</h2>
            <p className="text-sm text-base-content/60 mb-4">Total {members.length} Members</p>
            
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="card bg-base-100 shadow">
                  <div className="card-body p-4">
                    <h3 className="font-semibold text-primary mb-2">{member.name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p>Total Meal: <strong>0.00</strong></p>
                        <p>Meal Cost: <strong>0.00 tk</strong></p>
                        <p>Individual Cost: <strong>0.00 tk</strong></p>
                        <p>Balance: <strong>0.00 tk</strong></p>
                      </div>
                      <div>
                        <p>Total Deposit: <strong>0.00 tk</strong></p>
                        <p>Shared Cost: <strong>0.00 tk</strong></p>
                        <p>Total Cost: <strong>0.00 tk</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Dashboard