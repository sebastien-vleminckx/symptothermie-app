import express from 'express';
import { authMiddleware } from './middleware.js';
import { supabase } from './supabase.js';

const router = express.Router();

// Get all cycles for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: cycles, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', req.userId)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    
    res.json(cycles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cycles' });
  }
});

// Get current cycle
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const { data: cycle, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', req.userId)
      .eq('is_current', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    res.json(cycle || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current cycle' });
  }
});

// Create new cycle
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { start_date } = req.body;
    
    await supabase
      .from('cycles')
      .update({ is_current: false })
      .eq('user_id', req.userId)
      .eq('is_current', true);
    
    const { data: cycle, error } = await supabase
      .from('cycles')
      .insert([{
        user_id: req.userId,
        start_date: start_date || new Date().toISOString().split('T')[0],
        is_current: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(cycle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cycle' });
  }
});

export default router;
