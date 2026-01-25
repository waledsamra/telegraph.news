
import { createClient } from '@supabase/supabase-js';

/**
 * ⚠️ تصحيح هام:
 * الرابط السابق كان لمشروع مختلف عن المفتاح.
 * تم تحديث الرابط ليتوافق مع معرف المشروع (rvbgijteyxzhwbyfdmbjc) المستخرج من المفتاح الخاص بك.
 */

const supabaseUrl = 'https://rvbgijteyxzhwbyfdmbjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmdpanRleXpod2J5ZmRtYmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMjg0NDAsImV4cCI6MjA4NDkwNDQ0MH0.QoO6Y9YYF2RkpewBSNMHCLTAIkETH9HeOV-7mMgUyR8';

export const supabase = createClient(supabaseUrl, supabaseKey);
