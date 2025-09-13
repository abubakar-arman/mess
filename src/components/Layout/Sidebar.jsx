import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  UserPlus, 
  PiggyBank, 
  Utensils, 
  Receipt, 
  Calendar, 
  Users, 
  Settings 
} from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/add-member', icon: UserPlus, label: 'Add Member' },
    { path: '/add-deposit', icon: PiggyBank, label: 'Add Deposit' },
    { path: '/add-meal', icon: Utensils, label: 'Add Meal' },
    { path: '/add-cost', icon: Receipt, label: 'Add Cost' },
    { path: '/active-month', icon: Calendar, label: 'Active Month Details' },
    { path: '/all-members', icon: Users, label: 'All Members' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="w-64 bg-base-100 border-r border-base-300 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <span className="ml-2 text-xl font-bold text-primary">MessMate</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-base-content/70 hover:bg-base-200 hover:text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-base-300">
        <Link to="/profile" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-base-200">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-primary">
              <img src="https://i.pravatar.cc/150?img=12" alt="User" className="rounded-full" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Manager</p>
            <p className="text-xs text-base-content/60">G</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Sidebar