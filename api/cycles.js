import express from 'express';
import { authMiddleware } from './middleware.js';
import { supabase } from './supabase.js';

const router = express.Router();

// Get cycle summary for dashboard
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    // Get current cycle
    const { data: cycle, error: cycleError } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', req.userId)
      .eq('is_current', true)
      .single();
    
    if (cycleError && cycleError.code !== 'PGRST116') throw cycleError;
    
    // Get entries for this cycle
    const { data: entries, error: entriesError } = await supabase
      .from('daily_entries')
      .select('*, fertility_status(*)')
      .eq('user_id', req.userId)
      .order('entry_date', { ascending: false })
      .limit(30);
    
    if (entriesError) throw entriesError;
    
    // Calculate cycle day
    const cycleStart = cycle ? new Date(cycle.start_date) : new Date();
    const today = new Date();
    const currentCycleDay = Math.floor((today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Determine fertility status from latest entry
    let fertilityStatus = 'uncertain';
    const latestEntry = entries?.[0];
    
    if (latestEntry?.fertility_status?.[0]?.calculated_status) {
      fertilityStatus = latestEntry.fertility_status[0].calculated_status;
    } else if (latestEntry?.mucus_type) {
      if (latestEntry.mucus_type === 'egg_white' || latestEntry.mucus_type === 'watery') {
        fertilityStatus = 'fertile';
      } else if (latestEntry.mucus_type === 'dry' || latestEntry.mucus_type === 'sticky') {
        fertilityStatus = 'infertile';
      }
    }
    
    // Estimate ovulation (day 14 typically) and next period (day 28)
    const estimatedOvulation = new Date(cycleStart);
    estimatedOvulation.setDate(estimatedOvulation.getDate() + 13);
    
    const nextPeriod = new Date(cycleStart);
    nextPeriod.setDate(nextPeriod.getDate() + 27);
    
    res.json({
      currentCycleDay: Math.max(1, currentCycleDay),
      estimatedOvulation: estimatedOvulation.toISOString().split('T')[0],
      nextPeriod: nextPeriod.toISOString().split('T')[0],
      fertilityStatus,
      entriesCount: entries?.length || 0,
    });
  } catch (error) {
    console.error('Get cycle summary error:', error);
    res.status(500).json({ error: 'Failed to fetch cycle summary' });
  }
});

// Get calendar data
router.get('/calendar', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const { data: entries, error } = await supabase
      .from('daily_entries')
      .select('*, fertility_status(*)')
      .eq('user_id', req.userId)
      .order('entry_date', { ascending: true });
    
    if (error) throw error;
    
    res.json(entries || []);
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
});

export default router;
