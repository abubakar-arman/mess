import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Grid3X3, 
  Home, 
  HelpCircle, 
  Bell, 
  User,
  LogOut 
} from 'lucide-react'

const TopNavbar = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-6">
      {/* Left side icons */}
      <div className="flex items-center space-x-4">
        <button className="btn btn-ghost btn-sm">
          <Grid3X3 className="w-5 h-5" />
        </button>
        <Link to="/dashboard" className="btn btn-ghost btn-sm">
          <Home className="w-5 h-5" />
        </Link>
        <button className="btn btn-ghost btn-sm">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="btn btn-ghost btn-sm">
          <Bell className="w-5 h-5" />
        </button>
        <button className="btn btn-ghost btn-sm">
          <User className="w-5 h-5" />
        </button>
      </div>

      {/* Right side user profile */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium">{user?.user_metadata?.name || 'User'}</span>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="avatar">
            <div className="w-8 h-8 rounded-full">
              <img src="https://i.pravatar.cc/150?img=17" alt="User Avatar" />
            </div>
          </div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <Link to="/profile">
                <User className="w-4 h-4" />
                Profile
              </Link>
            </li>
            <li>
              <button onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TopNavbar