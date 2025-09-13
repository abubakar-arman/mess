import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useMessData = () => {
  const { user } = useAuth();
  const [currentMess, setCurrentMess] = useState(null);
  const [messMembers, setMessMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCurrentMess();
    }
  }, [user]);

  const fetchCurrentMess = async () => {
    try {
      setLoading(true);
      
      // Get user's current mess
      const { data: memberData, error: memberError } = await supabase
        .from('mess_members')
        .select(`
          *,
          messes (*)
        `)
        .eq('user_id', user.id)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (memberData) {
        setCurrentMess(memberData.messes);
        await fetchMessMembers(memberData.mess_id);
      }
    } catch (error) {
      console.error('Error fetching mess data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessMembers = async (messId) => {
    try {
      const { data, error } = await supabase
        .from('mess_members')
        .select(`
          *,
          profiles (*)
        `)
        .eq('mess_id', messId);

      if (error) throw error;
      setMessMembers(data || []);
    } catch (error) {
      console.error('Error fetching mess members:', error);
    }
  };

  const createMess = async (messName) => {
    try {
      const messCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: messData, error: messError } = await supabase
        .from('messes')
        .insert({
          name: messName,
          code: messCode,
          created_by: user.id
        })
        .select()
        .single();

      if (messError) throw messError;

      // Add creator as manager
      const { error: memberError } = await supabase
        .from('mess_members')
        .insert({
          mess_id: messData.id,
          user_id: user.id,
          role: 'manager'
        });

      if (memberError) throw memberError;

      await fetchCurrentMess();
      return messData;
    } catch (error) {
      console.error('Error creating mess:', error);
      throw error;
    }
  };

  const joinMess = async (messCode) => {
    try {
      // Find mess by code
      const { data: messData, error: messError } = await supabase
        .from('messes')
        .select('*')
        .eq('code', messCode)
        .single();

      if (messError) throw messError;

      // Add user as member
      const { error: memberError } = await supabase
        .from('mess_members')
        .insert({
          mess_id: messData.id,
          user_id: user.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      await fetchCurrentMess();
      return messData;
    } catch (error) {
      console.error('Error joining mess:', error);
      throw error;
    }
  };

  return {
    currentMess,
    messMembers,
    loading,
    createMess,
    joinMess,
    refetch: fetchCurrentMess
  };
};