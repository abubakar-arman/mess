import { useState } from 'react';
import { useMessData } from '../../hooks/useMessData';

const CreateJoinMess = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [messName, setMessName] = useState('');
  const [messCode, setMessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { createMess, joinMess } = useMessData();

  const handleCreateMess = async (e) => {
    e.preventDefault();
    if (!messName.trim()) return;

    try {
      setLoading(true);
      const mess = await createMess(messName);
      alert(`Mess created successfully! Code: ${mess.code}`);
      setMessName('');
    } catch (error) {
      alert('Error creating mess: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMess = async (e) => {
    e.preventDefault();
    if (!messCode.trim()) return;

    try {
      setLoading(true);
      await joinMess(messCode.toUpperCase());
      alert('Successfully joined mess!');
      setMessCode('');
    } catch (error) {
      alert('Error joining mess: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-6">MessMate</h2>
          
          <div className="tabs tabs-boxed mb-6">
            <button 
              className={`tab ${activeTab === 'create' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              Create Mess
            </button>
            <button 
              className={`tab ${activeTab === 'join' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('join')}
            >
              Join Mess
            </button>
          </div>

          {activeTab === 'create' ? (
            <form onSubmit={handleCreateMess} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Mess Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter mess name"
                  className="input input-bordered"
                  value={messName}
                  onChange={(e) => setMessName(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                Create Mess
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinMess} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Mess Code</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter mess code"
                  className="input input-bordered"
                  value={messCode}
                  onChange={(e) => setMessCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <button 
                type="submit" 
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                Join Mess
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateJoinMess;