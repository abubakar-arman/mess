import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        gender: data.gender || '',
        address: data.address || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile();
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="avatar mb-4">
            <div className="w-20 h-20 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          <h2 className="text-2xl font-bold">{profile?.name}</h2>
          <p className="text-base-content/70">View Your All Posts</p>
        </div>

        {/* Your Info Section */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Your Info</h3>
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input input-bordered"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Gender</span>
                  </label>
                  <select
                    name="gender"
                    className="select select-bordered"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Address</span>
                  </label>
                  <textarea
                    name="address"
                    className="textarea textarea-bordered"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-primary">📧</span>
                  <span>Email: {profile?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 text-primary">📱</span>
                  <span>Phone: {profile?.phone || 'Not Set Yet'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 text-primary">⚧</span>
                  <span>Gender: {profile?.gender || 'Not Set'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 text-primary">📍</span>
                  <span>Address: {profile?.address || 'Not Set'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Points & Membership Section */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">Coins & Membership</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-5 text-primary">📦</span>
                <span>Package: Free</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 text-primary">🪙</span>
                <span>Points: {profile?.points || 0}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 text-primary">⭐</span>
                <span>Earn Free Points (max 500 points)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
            <div className="space-y-2">
              <button className="btn btn-ghost justify-start w-full">
                <span className="w-5 text-primary">✏️</span>
                Change Basic Information
              </button>
              <button className="btn btn-ghost justify-start w-full">
                <span className="w-5 text-primary">📧</span>
                Change Email
              </button>
              <button className="btn btn-ghost justify-start w-full">
                <span className="w-5 text-primary">🔒</span>
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          className="btn btn-error w-full"
          onClick={signOut}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;