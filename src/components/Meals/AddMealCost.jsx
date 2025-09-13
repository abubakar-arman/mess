import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useMessData } from '../../hooks/useMessData';

const AddMealCost = () => {
  const { user } = useAuth();
  const { currentMess, messMembers } = useMessData();
  const [formData, setFormData] = useState({
    cost_date: new Date().toISOString().split('T')[0],
    amount: '',
    details: '',
    shopper_id: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMess || !formData.amount || !formData.shopper_id) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('meal_costs')
        .insert({
          mess_id: currentMess.id,
          cost_date: formData.cost_date,
          amount: parseFloat(formData.amount),
          details: formData.details,
          shopper_id: formData.shopper_id,
          created_by: user.id
        });

      if (error) throw error;

      alert('Meal cost added successfully!');
      setFormData({
        cost_date: new Date().toISOString().split('T')[0],
        amount: '',
        details: '',
        shopper_id: ''
      });
    } catch (error) {
      alert('Error adding meal cost: ' + error.message);
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
        <h1 className="text-2xl font-bold text-primary mb-6">Add Meal Cost</h1>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Select Date</span>
                </label>
                <input
                  type="date"
                  name="cost_date"
                  className="input input-bordered"
                  value={formData.cost_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Meal Cost Amount</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="Enter meal cost amount"
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
                  <span className="label-text">Select Shopper</span>
                </label>
                <select
                  name="shopper_id"
                  className="select select-bordered"
                  value={formData.shopper_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a shopper</option>
                  {messMembers.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.profiles.name} ({member.profiles.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Meal Cost / Bazar Details (Optional)</span>
                </label>
                <textarea
                  name="details"
                  placeholder="Enter bazar details"
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
                  Add Meal Cost
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMealCost;