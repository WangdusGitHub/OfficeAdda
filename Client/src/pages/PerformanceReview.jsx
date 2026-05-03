import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Plus, 
  Calendar,
  ChevronRight,
  Target,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AddReviewModal from '../components/AddReviewModal';

const PerformanceReview = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const endpoint = (user.role === 'admin' || user.role === 'manager') ? '/performance' : '/performance/my';
      const { data } = await axios.get(endpoint);
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (rating >= 3.5) return 'text-blue-500 bg-blue-50 border-blue-100';
    if (rating >= 2.5) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-rose-500 bg-rose-50 border-rose-100';
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance & Growth</h1>
          <p className="page-subtitle">Review feedback, track goals, and measure progress.</p>
        </div>
        {(user.role === 'admin' || user.role === 'manager') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            New Performance Review
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="stat-card flex-row items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Avg. Rating</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">4.8 / 5.0</h3>
          </div>
        </div>
        <div className="stat-card flex-row items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Growth Trend</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">+12% <span className="text-xs font-normal text-slate-400 ml-1">Yearly</span></h3>
          </div>
        </div>
        <div className="stat-card flex-row items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Goals Met</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">85% <span className="text-xs font-normal text-slate-400 ml-1">Current Qtr</span></h3>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="w-6 h-6 text-primary-600" /> Recent Reviews
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((review) => (
            <motion.div 
              key={review._id}
              whileHover={{ y: -2 }}
              className="card p-5 flex flex-col md:flex-row gap-5 items-start md:items-center group transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-semibold text-sm uppercase shrink-0">
                  {review.employee?.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    {review.employee?.name || 'Your Review'}
                    <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Q{Math.floor(new Date(review.reviewDate).getMonth() / 3) + 1} Review</span>
                  </h4>
                  <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    By {review.reviewer?.name} • {new Date(review.reviewDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-slate-500 dark:text-slate-400 text-sm italic line-clamp-2">
                  "{review.feedback || 'No specific feedback provided.'}"
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto pt-4 md:pt-0">
                <div className={`badge px-3 py-1.5 border text-sm flex items-center gap-1.5 ${getRatingColor(review.rating)}`}>
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {review.rating.toFixed(1)}
                </div>
                <button className="btn-icon">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {reviews.length === 0 && !loading && (
          <div className="py-20 text-center card border-dashed">
            <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Reviews Found</h3>
            <p className="text-xs text-slate-400 mt-1">Performance evaluations will appear here once processed.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddReviewModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchReviews} 
        />
      )}
    </div>
  );
};

export default PerformanceReview;
