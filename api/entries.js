import express from 'express';
import { authMiddleware } from './middleware.js';
import { supabase } from './supabase.js';
import { calculateFertilityStatus } from './fertility.js';

const router = express.Router();

// Get all entries for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: entries, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', req.userId)
      .order('entry_date', { ascending: false });
    
    if (error) throw error;
    
    res.json(entries);
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Get single entry
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { data: entry, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();
    
    if (error || !entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Create entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      entry_date,
      basal_temp,
      mucus_type,
      mucus_quantity,
      cervix_position,
      cervix_firmness,
      cervix_openness,
      sleep_hours,
      alcohol_consumed,
      illness_notes,
      menstruation_flow,
      sexual_activity,
      notes
    } = req.body;
    
    let { data: cycle } = await supabase
      .from('cycles')
      .select('id')
      .eq('user_id', req.userId)
      .eq('is_current', true)
      .single();
    
    if (!cycle) {
      const { data: newCycle, error: cycleError } = await supabase
        .from('cycles')
        .insert([{
          user_id: req.userId,
          start_date: entry_date,
          is_current: true
        }])
        .select()
        .single();
      
      if (cycleError) throw cycleError;
      cycle = newCycle;
    }
    
    const fertilityStatus = calculateFertilityStatus({
      basal_temp,
      mucus_type,
      mucus_quantity
    });
    
    const { data: entry, error } = await supabase
      .from('daily_entries')
      .insert([{
        user_id: req.userId,
        cycle_id: cycle.id,
        entry_date,
        basal_temp,
        mucus_type,
        mucus_quantity,
        cervix_position,
        cervix_firmness,
        cervix_openness,
        sleep_hours,
        alcohol_consumed,
        illness_notes,
        menstruation_flow,
        sexual_activity,
        notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    await supabase
      .from('fertility_status')
      .insert([{
        entry_id: entry.id,
        calculated_status: fertilityStatus.status,
        confidence_score: fertilityStatus.confidence
      }]);
    
    res.status(201).json({ ...entry, fertility_status: fertilityStatus });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// Update entry
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    
    const { data: entry, error } = await supabase
      .from('daily_entries')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();
    
    if (error || !entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    const fertilityStatus = calculateFertilityStatus({
      basal_temp: entry.basal_temp,
      mucus_type: entry.mucus_type,
      mucus_quantity: entry.mucus_quantity
    });
    
    await supabase
      .from('fertility_status')
      .update({
        calculated_status: fertilityStatus.status,
        confidence_score: fertilityStatus.confidence
      })
      .eq('entry_id', entry.id);
    
    res.json({ ...entry, fertility_status: fertilityStatus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Delete entry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from('daily_entries')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);
    
    if (error) throw error;
    
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// Get fertility analysis
router.get('/analysis/fertility', authMiddleware, async (req, res) => {
  try {
    const { data: entries, error } = await supabase
      .from('daily_entries')
      .select('*, fertility_status(*)')
      .eq('user_id', req.userId)
      .order('entry_date', { ascending: false })
      .limit(30);
    
    if (error) throw error;
    
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(e => e.entry_date === today);
    
    res.json({
      current_status: todayEntry?.fertility_status?.[0]?.calculated_status || 'unknown',
      recent_entries: entries
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze fertility' });
  }
});

export default router;
