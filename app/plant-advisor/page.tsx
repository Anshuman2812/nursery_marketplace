'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Heart,
  ShoppingCart,
  Sun,
  ShieldAlert,
  Droplets,
  Home,
  Compass,
  MessageSquare,
  Send,
  Leaf,
  ChevronRight,
} from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { useCart } from '@/components/providers/cart-provider';
import { formatINR } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function PlantAdvisorPage() {
  const [mode, setMode] = useState<'quiz' | 'chat'>('quiz');

  // Quiz state
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{
    light?: string;
    experience?: string;
    pets?: boolean;
    watering?: string;
    space?: string;
  }>({});
  const [results, setResults] = useState<{ product: Product; matchScore: number; reason: string }[] | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        "Hello! 🌿 I am your GreenKart AI Plant Advisor. Describe your room, lifestyle, sunlight, or any plant goals, and I will recommend the perfect companion!",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const { addItem } = useCart();
  const { toast } = useToast();

  const handleSelectOption = (key: string, value: any) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Calculate matches
      calculateMatches(updated);
    }
  };

  const calculateMatches = (finalAnswers: typeof answers) => {
    const scored = MOCK_PRODUCTS.map((plant) => {
      let score = 70;
      let reasons: string[] = [];

      // Sunlight check
      if (finalAnswers.light === 'Low' && plant.sunlight.toLowerCase().includes('low')) {
        score += 15;
        reasons.push('Thrives in low light conditions');
      } else if (finalAnswers.light === 'High' && plant.sunlight.toLowerCase().includes('high')) {
        score += 15;
        reasons.push('Loves the bright sunny spots you have');
      } else if (plant.sunlight.toLowerCase().includes('medium')) {
        score += 10;
        reasons.push('Adapts easily to standard indoor light');
      }

      // Pet safe check
      if (finalAnswers.pets) {
        if (plant.pet_safe) {
          score += 15;
          reasons.push('100% pet-friendly & non-toxic');
        } else {
          score -= 30;
        }
      }

      // Experience check
      if (finalAnswers.experience === 'beginner' && plant.is_beginner_friendly) {
        score += 15;
        reasons.push('Ultra-forgiving for beginners');
      }

      // Watering match
      if (finalAnswers.watering === 'low' && plant.water.toLowerCase().includes('week')) {
        score += 10;
        reasons.push('Tolerates occasional forgotten waterings');
      }

      return {
        product: plant,
        matchScore: Math.min(99, Math.max(50, score)),
        reason: reasons[0] || 'A wonderful balanced green companion for your home.',
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    setResults(scored.slice(0, 4));
    setStep(5); // results step
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply =
        "That sounds like a lovely space! For indoor greenery, Snake Plants, Areca Palms, and Golden Pothos adapt well to most home humidity and lighting levels.";
      if (lower.includes('pet') || lower.includes('cat') || lower.includes('dog')) {
        reply =
          '🐾 Great news! If you have pets, check out our Spider Plant, Areca Palm, and Boston Fern. They are completely safe and non-toxic for cats and dogs!';
      } else if (lower.includes('dark') || lower.includes('bedroom') || lower.includes('corner') || lower.includes('low light')) {
        reply =
          '🌙 For low light rooms or bedrooms, the Sansevieria Snake Plant is our #1 pick. It produces oxygen at night and cleans air pollutants while only needing water once every 2-3 weeks!';
      } else if (lower.includes('beginner') || lower.includes('easy') || lower.includes('kill') || lower.includes('die')) {
        reply =
          '🌱 If you are worried about keeping plants alive, start with Golden Pothos or Snake Plant. They are virtually indestructible and rebound effortlessly even if you forget to water them!';
      } else if (lower.includes('balcony') || lower.includes('sun') || lower.includes('tulsi') || lower.includes('outdoor')) {
        reply =
          '☀️ For a sunny balcony or terrace, Krishna Tulsi, Jade Plant, and Adenium Desert Rose adore bright sunlight and thrive in Indian climate!';
      }
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setIsTyping(false);
    }, 600);
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <Header />

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* Hero banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white p-6 sm:p-10 shadow-soft mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              AI Plant Recommendation Engine
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-2 tracking-tight">
              Find Your Perfect Plant Match
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-xl">
              Answer 5 quick lifestyle questions or chat directly with our botanical AI to discover plants tailored to your lighting, space, and care routine.
            </p>

            {/* Toggle Modes */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setMode('quiz')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  mode === 'quiz'
                    ? 'bg-white text-emerald-800 shadow-md scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Guided Plant Finder
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  mode === 'chat'
                    ? 'bg-white text-emerald-800 shadow-md scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Ask AI Advisor Directly
              </button>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 text-9xl opacity-15 select-none pointer-events-none">
            🪴
          </div>
        </div>

        {/* QUIZ MODE */}
        {mode === 'quiz' && (
          <div className="bg-card rounded-3xl border border-border/60 p-6 sm:p-8 shadow-card">
            {step < 5 ? (
              <div>
                {/* Progress bar */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary">Question {step + 1} of 5</span>
                  <span className="text-xs text-muted-foreground">{((step + 1) / 5) * 100}% Complete</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-6">
                  <div
                    className="bg-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((step + 1) / 5) * 100}%` }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl font-bold mb-2">Where will you keep your new plant?</h2>
                      <p className="text-sm text-muted-foreground mb-6">Light is food for plants — select the natural lighting available:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          {
                            key: 'Low',
                            title: 'Low to Dim Light',
                            desc: 'Few windows, bedroom corners, bathroom',
                            emoji: '🌙',
                          },
                          {
                            key: 'Medium',
                            title: 'Medium / Indirect Sun',
                            desc: 'Bright room near windows without harsh ray',
                            emoji: '⛅',
                          },
                          {
                            key: 'High',
                            title: 'Direct Sunlight',
                            desc: 'Balcony, windowsill, terrace, lawn',
                            emoji: '☀️',
                          },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectOption('light', opt.key)}
                            className="flex flex-col items-start p-5 rounded-2xl border border-border/80 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                          >
                            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{opt.emoji}</span>
                            <span className="font-bold text-base mb-1">{opt.title}</span>
                            <span className="text-xs text-muted-foreground">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl font-bold mb-2">How would you describe your gardening experience?</h2>
                      <p className="text-sm text-muted-foreground mb-6">We will pick plants that match your schedule:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          {
                            key: 'beginner',
                            title: 'First-time Parent',
                            desc: 'Need plants that are nearly impossible to kill',
                            emoji: '🌱',
                          },
                          {
                            key: 'intermediate',
                            title: 'Casual Caretaker',
                            desc: 'Can water weekly and mist occasionally',
                            emoji: '🪴',
                          },
                          {
                            key: 'expert',
                            title: 'Green Thumb',
                            desc: 'Love pruning, repotting, and bonsai craft',
                            emoji: '🌳',
                          },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectOption('experience', opt.key)}
                            className="flex flex-col items-start p-5 rounded-2xl border border-border/80 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                          >
                            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{opt.emoji}</span>
                            <span className="font-bold text-base mb-1">{opt.title}</span>
                            <span className="text-xs text-muted-foreground">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl font-bold mb-2">Do you have curious pets at home?</h2>
                      <p className="text-sm text-muted-foreground mb-6">Certain plants can cause discomfort if ingested by cats or dogs:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          {
                            val: true,
                            title: 'Yes, I have pets 🐶🐱',
                            desc: 'Show ONLY 100% pet-safe, non-toxic varieties',
                            emoji: '🐾',
                          },
                          {
                            val: false,
                            title: 'No pets / High shelves',
                            desc: 'All indoor & flowering plants are welcome',
                            emoji: '🌿',
                          },
                        ].map((opt) => (
                          <button
                            key={String(opt.val)}
                            onClick={() => handleSelectOption('pets', opt.val)}
                            className="flex flex-col items-start p-5 rounded-2xl border border-border/80 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                          >
                            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{opt.emoji}</span>
                            <span className="font-bold text-base mb-1">{opt.title}</span>
                            <span className="text-xs text-muted-foreground">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl font-bold mb-2">What is your realistic watering style?</h2>
                      <p className="text-sm text-muted-foreground mb-6">Under-watering vs over-watering is the #1 reason plants struggle:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          {
                            key: 'low',
                            title: 'Occasional (2-3 weeks)',
                            desc: 'Often traveling or forgetful',
                            emoji: '🌵',
                          },
                          {
                            key: 'medium',
                            title: 'Once a week',
                            desc: 'Sunday morning watering ritual',
                            emoji: '💧',
                          },
                          {
                            key: 'high',
                            title: 'Frequent / Daily',
                            desc: 'Love misting and daily garden checks',
                            emoji: '🚿',
                          },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectOption('watering', opt.key)}
                            className="flex flex-col items-start p-5 rounded-2xl border border-border/80 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                          >
                            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{opt.emoji}</span>
                            <span className="font-bold text-base mb-1">{opt.title}</span>
                            <span className="text-xs text-muted-foreground">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div
                      key="step-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl font-bold mb-2">What is your main aesthetic goal?</h2>
                      <p className="text-sm text-muted-foreground mb-6">Choose the vibe you want to create:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          {
                            key: 'air',
                            title: 'Clean Pure Air',
                            desc: 'NASA certified toxins removers',
                            emoji: '🍃',
                          },
                          {
                            key: 'tropical',
                            title: 'Lush Urban Jungle',
                            desc: 'Dramatic big leaves & zen canopy',
                            emoji: '🌴',
                          },
                          {
                            key: 'vastu',
                            title: 'Positive Vibes & Vastu',
                            desc: 'Good luck, prosperity & blooming aroma',
                            emoji: '✨',
                          },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectOption('space', opt.key)}
                            className="flex flex-col items-start p-5 rounded-2xl border border-border/80 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                          >
                            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{opt.emoji}</span>
                            <span className="font-bold text-base mb-1">{opt.title}</span>
                            <span className="text-xs text-muted-foreground">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* RESULTS STEP */
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
                  <div>
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-yellow-500" />
                      Your Personalized Recommendations
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Based on your light, routine, and lifestyle preferences.
                    </p>
                  </div>
                  <button
                    onClick={resetQuiz}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-border/80 hover:bg-secondary transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results?.map(({ product, matchScore, reason }, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-card border border-border/80 rounded-2xl p-4 flex gap-4 hover:shadow-card transition-shadow"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-green-50 to-lime-100 flex items-center justify-center text-4xl sm:text-5xl shrink-0">
                        {product.image_emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            {matchScore}% Match
                          </span>
                          {product.pet_safe && (
                            <span className="bg-blue-100 text-blue-800 text-[11px] font-medium px-2 py-0.5 rounded-full">
                              Pet-Safe
                            </span>
                          )}
                        </div>

                        <Link href={`/product/${product.slug}`} className="font-bold text-base hover:text-primary transition-colors line-clamp-1">
                          {product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5 mb-2 line-clamp-2">
                          💡 {reason}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-base font-bold text-primary">{formatINR(product.price)}</span>
                          <button
                            onClick={() => {
                              addItem(product, 1, product.pot_sizes[0] || 'Medium');
                              toast({ title: 'Added to cart', description: product.name });
                            }}
                            className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 text-center bg-secondary/50 rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground mb-3">
                    Want to explore more options? Browse through our full catalogue of 100+ species.
                  </p>
                  <Link
                    href="/listing"
                    className="inline-flex items-center gap-2 bg-foreground text-background text-xs font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    View All Plants <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHAT MODE */}
        {mode === 'chat' && (
          <div className="bg-card rounded-3xl border border-border/60 shadow-card flex flex-col h-[540px] overflow-hidden">
            {/* Chat header */}
            <div className="p-4 border-b border-border/60 bg-secondary/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl text-primary-foreground">
                🌿
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Plant Care Specialist</h3>
                <p className="text-xs text-emerald-600 font-medium">● Online & Ready to Assist</p>
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary text-foreground rounded-bl-none border border-border/50'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl p-3 text-xs text-muted-foreground animate-pulse">
                    Botanical AI is thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Chat input */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-border/60 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask e.g. 'Best plant for a dark bedroom' or 'Plants safe for my kitten'..."
                className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-border/40"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
