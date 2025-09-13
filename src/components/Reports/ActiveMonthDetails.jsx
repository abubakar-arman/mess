import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useMessData } from '../../hooks/useMessData';
import { format } from 'date-fns';

const ActiveMonthDetails = () => {
  const { currentMess, messMembers } = useMessData();
  const [monthData, setMonthData] = useState({
    meals: [],
    deposits: [],
    mealCosts: [],
    summary: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );

  useEffect(() => {
    if (currentMess) {
      fetchMonthData();
    }
  }, [currentMess, selectedMonth]);

  const fetchMonthData = async () => {
    try {
      setLoading(true);
      const startDate = `${selectedMonth}-01`;
      const endDate = `${selectedMonth}-31`;

      // Fetch meals for the month
      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select(`
          *,
          profiles (name, email)
        `)
        .eq('mess_id', currentMess.id)
        .gte('meal_date', startDate)
        .lte('meal_date', endDate)
        .order('meal_date', { ascending: true });

      if (mealsError) throw mealsError;

      // Fetch deposits for the month
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select(`
          *,
          profiles (name, email)
        `)
        .eq('mess_id', currentMess.id)
        .gte('deposit_date', startDate)
        .lte('deposit_date', endDate)
        .order('deposit_date', { ascending: true });

      if (depositsError) throw depositsError;

      // Fetch meal costs for the month
      const { data: mealCosts, error: costsError } = await supabase
        .from('meal_costs')
        .select(`
          *,
          profiles (name, email)
        `)
        .eq('mess_id', currentMess.id)
        .gte('cost_date', startDate)
        .lte('cost_date', endDate)
        .order('cost_date', { ascending: true });

      if (costsError) throw costsError;

      // Calculate summary
      const summary = calculateSummary(meals, deposits, mealCosts);

      setMonthData({
        meals: meals || [],
        deposits: deposits || [],
        mealCosts: mealCosts || [],
        summary
      });
    } catch (error) {
      console.error('Error fetching month data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (meals, deposits, mealCosts) => {
    const totalDeposits = deposits.reduce((sum, deposit) => sum + parseFloat(deposit.amount), 0);
    const totalMealCosts = mealCosts.reduce((sum, cost) => sum + parseFloat(cost.amount), 0);
    
    // Calculate total meals per member
    const memberMeals = {};
    meals.forEach(meal => {
      if (!memberMeals[meal.user_id]) {
        memberMeals[meal.user_id] = {
          name: meal.profiles.name,
          email: meal.profiles.email,
          totalMeals: 0,
          totalDeposits: 0
        };
      }
      memberMeals[meal.user_id].totalMeals += 
        parseFloat(meal.breakfast) + parseFloat(meal.lunch) + parseFloat(meal.dinner);
    });

    // Add deposits to member data
    deposits.forEach(deposit => {
      if (memberMeals[deposit.user_id]) {
        memberMeals[deposit.user_id].totalDeposits += parseFloat(deposit.amount);
      }
    });

    const totalMeals = Object.values(memberMeals).reduce((sum, member) => sum + member.totalMeals, 0);
    const mealRate = totalMeals > 0 ? totalMealCosts / totalMeals : 0;

    // Calculate individual costs and balances
    Object.keys(memberMeals).forEach(userId => {
      const member = memberMeals[userId];
      member.mealCost = member.totalMeals * mealRate;
      member.balance = member.totalDeposits - member.mealCost;
    });

    return {
      totalDeposits,
      totalMealCosts,
      totalMeals,
      mealRate,
      messBalance: totalDeposits - totalMealCosts,
      memberDetails: memberMeals
    };
  };

  const downloadPDF = () => {
    // This would implement PDF generation
    alert('PDF download feature will be implemented');
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

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Active Month Details</h1>
          <button 
            className="btn btn-primary"
            onClick={downloadPDF}
          >
            Download PDF
          </button>
        </div>

        {/* Month Selector */}
        <div className="form-control w-full max-w-xs mb-6">
          <label className="label">
            <span className="label-text">Select Month</span>
          </label>
          <input
            type="month"
            className="input input-bordered"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-title">Mess Balance</div>
            <div className="stat-value text-primary">৳{monthData.summary.messBalance?.toFixed(2)}</div>
          </div>
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-title">Total Deposits</div>
            <div className="stat-value text-success">৳{monthData.summary.totalDeposits?.toFixed(2)}</div>
          </div>
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-title">Total Meal Cost</div>
            <div className="stat-value text-error">৳{monthData.summary.totalMealCosts?.toFixed(2)}</div>
          </div>
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-title">Meal Rate</div>
            <div className="stat-value text-info">৳{monthData.summary.mealRate?.toFixed(2)}</div>
          </div>
        </div>

        {/* Member Details Table */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Member Details</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Total Meals</th>
                    <th>Deposits</th>
                    <th>Meal Cost</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(monthData.summary.memberDetails || {}).map((member, index) => (
                    <tr key={index}>
                      <td>
                        <div>
                          <div className="font-bold">{member.name}</div>
                          <div className="text-sm opacity-50">{member.email}</div>
                        </div>
                      </td>
                      <td>{member.totalMeals.toFixed(2)}</td>
                      <td className="text-success">৳{member.totalDeposits.toFixed(2)}</td>
                      <td className="text-error">৳{member.mealCost.toFixed(2)}</td>
                      <td className={member.balance >= 0 ? 'text-success' : 'text-error'}>
                        ৳{member.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Daily Meal Records */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Daily Meal Records</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Member</th>
                    <th>Breakfast</th>
                    <th>Lunch</th>
                    <th>Dinner</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {monthData.meals.map((meal) => (
                    <tr key={meal.id}>
                      <td>{format(new Date(meal.meal_date), 'MMM dd')}</td>
                      <td>{meal.profiles.name}</td>
                      <td>{meal.breakfast}</td>
                      <td>{meal.lunch}</td>
                      <td>{meal.dinner}</td>
                      <td className="font-bold">
                        {(parseFloat(meal.breakfast) + parseFloat(meal.lunch) + parseFloat(meal.dinner)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Meal Costs */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Meal Costs</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Shopper</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {monthData.mealCosts.map((cost) => (
                    <tr key={cost.id}>
                      <td>{format(new Date(cost.cost_date), 'MMM dd')}</td>
                      <td className="text-error">৳{parseFloat(cost.amount).toFixed(2)}</td>
                      <td>{cost.profiles.name}</td>
                      <td>{cost.details || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveMonthDetails;