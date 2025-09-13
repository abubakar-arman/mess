import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useMessData } from '../../hooks/useMessData';

const AddMeal = () => {
  const { user } = useAuth();
  const { currentMess, messMembers } = useMessData();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [defaultMeal, setDefaultMeal] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [memberMeals, setMemberMeals] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (messMembers.length > 0) {
      initializeMemberMeals();
    }
  }, [messMembers, selectedDate]);

  const initializeMemberMeals = async () => {
    try {
      // Fetch existing meals for the selected date
      const { data: existingMeals, error } = await supabase
        .from('meals')
        .select('*')
        .eq('mess_id', currentMess?.id)
        .eq('meal_date', selectedDate);

      if (error) throw error;

      const meals = {};
      messMembers.forEach(member => {
        const existingMeal = existingMeals?.find(meal => meal.user_id === member.user_id);
        meals[member.user_id] = existingMeal ? {
          breakfast: existingMeal.breakfast,
          lunch: existingMeal.lunch,
          dinner: existingMeal.dinner
        } : { ...defaultMeal };
      });

      setMemberMeals(meals);
    } catch (error) {
      console.error('Error fetching existing meals:', error);
    }
  };

  const handleMealChange = (memberId, mealType, value) => {
    setMemberMeals(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [mealType]: parseFloat(value) || 0
      }
    }));
  };

  const applyDefaultToAll = () => {
    const updatedMeals = {};
    messMembers.forEach(member => {
      updatedMeals[member.user_id] = { ...defaultMeal };
    });
    setMemberMeals(updatedMeals);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMess) return;

    try {
      setLoading(true);
      
      const mealRecords = Object.entries(memberMeals).map(([userId, meals]) => ({
        mess_id: currentMess.id,
        user_id: userId,
        meal_date: selectedDate,
        breakfast: meals.breakfast,
        lunch: meals.lunch,
        dinner: meals.dinner,
        created_by: user.id
      }));

      // Upsert meals (insert or update if exists)
      const { error } = await supabase
        .from('meals')
        .upsert(mealRecords, {
          onConflict: 'mess_id,user_id,meal_date'
        });

      if (error) throw error;

      alert('Meals updated successfully!');
    } catch (error) {
      alert('Error updating meals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTotalMeals = (meals) => {
    return (meals.breakfast + meals.lunch + meals.dinner).toFixed(2);
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">Add Meal</h1>
        
        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button 
            className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            For All Members
          </button>
          <button 
            className={`tab ${activeTab === 'single' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            For Single Member
          </button>
        </div>

        {/* Default Meal Card */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Current Default Meal</h3>
              <button 
                className="btn btn-sm btn-outline"
                onClick={applyDefaultToAll}
              >
                Apply to All
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Breakfast</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered input-sm"
                  value={defaultMeal.breakfast}
                  onChange={(e) => setDefaultMeal(prev => ({
                    ...prev,
                    breakfast: parseFloat(e.target.value) || 0
                  }))}
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Lunch</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered input-sm"
                  value={defaultMeal.lunch}
                  onChange={(e) => setDefaultMeal(prev => ({
                    ...prev,
                    lunch: parseFloat(e.target.value) || 0
                  }))}
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Dinner</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered input-sm"
                  value={defaultMeal.dinner}
                  onChange={(e) => setDefaultMeal(prev => ({
                    ...prev,
                    dinner: parseFloat(e.target.value) || 0
                  }))}
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date Picker */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Select Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered max-w-xs"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Member Meal List */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {messMembers.map((member) => (
              <div key={member.user_id} className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                        {member.profiles.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{member.profiles.name}</h3>
                      <p className="text-sm text-base-content/70">
                        Total: {memberMeals[member.user_id] ? getTotalMeals(memberMeals[member.user_id]) : '0.00'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Breakfast</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered input-sm"
                        value={memberMeals[member.user_id]?.breakfast || 0}
                        onChange={(e) => handleMealChange(member.user_id, 'breakfast', e.target.value)}
                        min="0"
                        step="0.5"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Lunch</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered input-sm"
                        value={memberMeals[member.user_id]?.lunch || 0}
                        onChange={(e) => handleMealChange(member.user_id, 'lunch', e.target.value)}
                        min="0"
                        step="0.5"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Dinner</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered input-sm"
                        value={memberMeals[member.user_id]?.dinner || 0}
                        onChange={(e) => handleMealChange(member.user_id, 'dinner', e.target.value)}
                        min="0"
                        step="0.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            Submit Meals
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMeal;