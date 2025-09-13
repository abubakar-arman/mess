import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useMessData } from '../../hooks/useMessData';

const AddDeposit = () => {
  const { user } = useAuth();
  const { currentMess, messMembers } = useMessData();
  const [formData, setFormData] = useState({
    user_id: '',
    amount: '',
    details: '',
    deposit_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMess || !formData.user_id || !formData.amount) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('deposits')
        .insert({
          mess_id: currentMess.id,
          user_id: formData.user_id,
          amount: parseFloat(formData.amount),
          details: formData.details,
          deposit_date: formData.deposit_date,
          created_by: user.id
        });

      if (error) throw error;

      alert('Deposit added successfully!');
      setFormData({
        user_id: '',
        amount: '',
        details: '',
        deposit_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      alert('Error adding deposit: ' + error.message);
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

  if (!currentMess) {
    return (
      <div className="p-6">
        <div className="alert alert-warning">
          <span>Please create or join a mess first.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">Add Member's Money</h1>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Select Member</span>
                </label>
                <select
                  name="user_id"
                  className="select select-bordered"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a member</option>
                  {messMembers.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.profiles.name} ({member.profiles.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Select Date</span>
                </label>
                <input
                  type="date"
                  name="deposit_date"
                  className="input input-bordered"
                  value={formData.deposit_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Deposit Amount</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="Enter amount"
                  className="input input-bordered"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Deposit Details (Optional)</span>
                </label>
                <textarea
                  name="details"
                  placeholder="Enter deposit details"
                  className="textarea textarea-bordered"
                  value={formData.details}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  Add Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDeposit;