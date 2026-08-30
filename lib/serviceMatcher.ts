/**
 * serviceMatcher.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Powers the "🤖 AI Service Finder" (see components/AIServiceFinder.tsx and
 * app/api/discover/route.ts) — the natural-language service discovery
 * feature described in the README:
 *
 *   "My bathroom tap is leaking."  →  Plumbing → Tap Repair
 *   "AC cooling nahi kar raha aur unusual sound aa rahi hai." → AC Service
 *
 * This is a fast, dependency-free, bilingual (English + Hindi/Hinglish)
 * keyword matcher that needs zero external API calls, so it always works.
 * `app/api/discover/route.ts` will automatically upgrade to a real LLM call
 * (Claude, via the Anthropic API) for better accuracy IF an ANTHROPIC_API_KEY
 * is configured — this file is always the offline fallback either way.
 */

import { CATEGORIES } from './data';

export type MatchResult = {
  categoryId: string;
  categoryLabel: string;
  categoryIcon: string;
  subName: string;
  subIcon: string;
  confidence: number; // 0–1, rough heuristic score
};

// Keyword → (categoryId, sub-service name) triggers. Keep phrases lowercase.
// A sub-service only needs ONE of its keywords to appear as a substring.
const TRIGGERS: { categoryId: string; sub: string; keywords: string[] }[] = [
  // ── Home Repair ──────────────────────────────────────────────────────
  { categoryId: 'home-repair', sub: 'Plumber', keywords: [
    'tap', 'leak', 'leaking', 'pipe', 'plumb', 'nal', 'नल', 'pani ka pipe', 'tuti', 'टोंटी',
    'bathroom water', 'toilet flush', 'washbasin', 'water dripping', 'drain block', 'nali block',
  ]},
  { categoryId: 'home-repair', sub: 'Electrician', keywords: [
    'electric', 'wiring', 'switch', 'fuse', 'short circuit', 'bijli', 'बिजली', 'current',
    'mcb', 'socket', 'light not working', 'fan not working', 'spark', 'tripping',
  ]},
  { categoryId: 'home-repair', sub: 'Carpenter', keywords: [
    'carpenter', 'wooden', 'furniture', 'door hinge', 'cupboard', 'almirah', 'बढ़ई', 'lakड़ी',
    'chair broken', 'table repair', 'wardrobe',
  ]},
  { categoryId: 'home-repair', sub: 'Painter', keywords: [
    'paint', 'painting', 'wall color', 'whitewash', 'pentar', 'पेंट', 'रंग', 'wall crack paint',
  ]},
  { categoryId: 'home-repair', sub: 'Mason / Tile Fixer', keywords: [
    'tile', 'mason', 'wall crack', 'cement', 'floor broken', 'raj mistri', 'राजमिस्त्री', 'seepage',
  ]},
  { categoryId: 'home-repair', sub: 'Welder', keywords: ['welding', 'gate repair', 'grill repair', 'metal weld'] },

  // ── Repair & Tech ────────────────────────────────────────────────────
  { categoryId: 'repair', sub: 'AC Service', keywords: [
    'ac not cooling', 'ac cooling nahi', 'ac repair', 'ac service', 'air conditioner', 'ac gas',
    'unusual sound', 'ac awaz', 'ac se pani', 'cooling nahi kar raha', 'एसी',
  ]},
  { categoryId: 'repair', sub: 'Mobile Repair', keywords: [
    'mobile screen', 'phone broken', 'mobile repair', 'phone not charging', 'screen crack', 'मोबाइल',
  ]},
  { categoryId: 'repair', sub: 'Laptop / PC Repair', keywords: [
    'laptop', 'computer not working', 'pc slow', 'laptop repair', 'cpu', 'blue screen', 'लैपटॉप',
  ]},
  { categoryId: 'repair', sub: 'Appliance Repair', keywords: [
    'fridge', 'refrigerator', 'washing machine', 'microwave not working', 'geyser', 'mixer grinder',
    'फ्रिज', 'वॉशिंग मशीन',
  ]},
  { categoryId: 'repair', sub: 'TV Repair', keywords: ['tv not working', 'television repair', 'tv screen', 'टीवी'] },
  { categoryId: 'repair', sub: 'CCTV / Security', keywords: ['cctv not working', 'camera install', 'security camera', 'सीसीटीवी'] },

  // ── Home Help ────────────────────────────────────────────────────────
  { categoryId: 'home-help', sub: 'House Cleaner', keywords: [
    'house cleaning', 'ghar saaf', 'safai', 'सफाई', 'deep clean', 'cleaner chahiye', 'jhadu pochha',
  ]},
  { categoryId: 'home-help', sub: 'Cook / Chef', keywords: ['cook chahiye', 'khana banane wala', 'रसोइया', 'chef needed', 'cooking help'] },
  { categoryId: 'home-help', sub: 'Nanny / Baby Care', keywords: ['baby care', 'nanny', 'babysitter', 'बच्चों की देखभाल'] },
  { categoryId: 'home-help', sub: 'Elder Caretaker', keywords: ['elderly care', 'old age caretaker', 'बुजुर्ग देखभाल', 'nursing at home'] },
  { categoryId: 'home-help', sub: 'Gardener', keywords: ['garden', 'plants', 'माली', 'lawn mowing'] },

  // ── Pick & Drop ──────────────────────────────────────────────────────
  { categoryId: 'pick-drop', sub: 'Grocery Run', keywords: ['grocery', 'sabzi mangwani', 'kirana', 'groceries chahiye'] },
  { categoryId: 'pick-drop', sub: 'Medicine Pickup', keywords: ['medicine pickup', 'dawai mangwani', 'pharmacy', 'दवाई'] },
  { categoryId: 'pick-drop', sub: 'Parcel Delivery', keywords: ['parcel', 'courier bhejna', 'package deliver', 'पार्सल'] },
  { categoryId: 'pick-drop', sub: 'Document Courier', keywords: ['document delivery', 'papers bhejne hai', 'दस्तावेज़'] },

  // ── IT Services ──────────────────────────────────────────────────────
  { categoryId: 'it-services', sub: 'Network Setup', keywords: ['wifi not working', 'router setup', 'internet slow', 'network issue'] },
  { categoryId: 'it-services', sub: 'Printer Repair', keywords: ['printer not working', 'printer repair'] },
  { categoryId: 'it-services', sub: 'Smart Home Setup', keywords: ['smart home', 'alexa setup', 'smart lights install'] },
  { categoryId: 'it-services', sub: 'Server / IT Support', keywords: ['server down', 'it support office', 'network admin'] },

  // ── Manpower Supply ──────────────────────────────────────────────────
  { categoryId: 'manpower', sub: 'Construction Labour', keywords: ['construction worker', 'mazdoor chahiye', 'majdoor', 'labour needed'] },
  { categoryId: 'manpower', sub: 'Loading / Shifting', keywords: ['shifting', 'ghar shift karna', 'house shifting', 'loading unloading', 'packers movers'] },
  { categoryId: 'manpower', sub: 'Event Staff', keywords: ['event staff', 'wedding staff', 'party helpers', 'shaadi ke liye staff'] },
  { categoryId: 'manpower', sub: 'Cleaning Team', keywords: ['office cleaning team', 'bulk cleaning', 'cleaning staff'] },

  // ── Shop & Office ────────────────────────────────────────────────────
  { categoryId: 'shop-office', sub: 'Cashier', keywords: ['cashier needed', 'billing staff'] },
  { categoryId: 'shop-office', sub: 'Sales Boy / Girl', keywords: ['sales boy', 'sales girl', 'shop salesperson'] },
  { categoryId: 'shop-office', sub: 'Receptionist', keywords: ['receptionist needed', 'front desk staff'] },
  { categoryId: 'shop-office', sub: 'Data Entry Operator', keywords: ['data entry', 'excel work needed', 'typing job'] },

  // ── Gig Jobs ─────────────────────────────────────────────────────────
  { categoryId: 'gig-jobs', sub: 'Part-Time Jobs', keywords: ['part time job', 'part time kaam', 'side income'] },
  { categoryId: 'gig-jobs', sub: 'Daily Wage Jobs', keywords: ['daily wage', 'din ka kaam', 'roz ka kaam'] },
  { categoryId: 'gig-jobs', sub: 'Freelance Task', keywords: ['freelance', 'one time task', 'gig work'] },
];

/**
 * Matches free-text user input (English, Hindi, or Hinglish) to the closest
 * UrbanServe service category + sub-service using keyword scoring.
 * Returns null when nothing scores meaningfully — callers should fall back
 * to showing the full category grid in that case.
 */
export function matchService(rawText: string): MatchResult | null {
  const text = rawText.toLowerCase().trim();
  if (!text) return null;

  let best: { categoryId: string; sub: string; score: number } | null = null;

  for (const trigger of TRIGGERS) {
    let score = 0;
    for (const kw of trigger.keywords) {
      if (text.includes(kw)) {
        // Longer / more specific keyword matches score higher than generic ones.
        score += kw.length >= 8 ? 2 : 1;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { categoryId: trigger.categoryId, sub: trigger.sub, score };
    }
  }

  if (!best) return null;

  const category = CATEGORIES.find(c => c.id === best!.categoryId);
  const subInfo = category?.subs.find((s: any) => s.name === best!.sub);
  if (!category || !subInfo) return null;

  return {
    categoryId: category.id,
    categoryLabel: category.label,
    categoryIcon: category.icon,
    subName: subInfo.name,
    subIcon: subInfo.icon,
    confidence: Math.min(0.95, 0.5 + best.score * 0.12),
  };
}
