import { useState, useMemo } from 'react';
import { Task, Priority } from '../types/task';
import { generateMonthlyReport, getCompletionGrade } from '../utils/report';
import { formatMonthYear, formatDisplayDate, getMonthsList } from '../utils/date';
import { ClipboardList, CheckCircle, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area } from 'recharts';

interface MonthlyReportProps {
  tasks: Task[];
}

type FilterPriority = Priority | 'all';
type FilterCompletion = 'all' | 'incomplete' | 'completed';

export function MonthlyReport({ tasks }: MonthlyReportProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => formatMonthYear(new Date()));
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterCompletion, setFilterCompletion] = useState<FilterCompletion>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const months = useMemo(() => getMonthsList(), []);

  const report = useMemo(() => {
    return generateMonthlyReport(tasks, selectedMonth);
  }, [tasks, selectedMonth]);

  const availableTags = useMemo(() => {
    const monthTasks = tasks.filter(t => t.date.startsWith(selectedMonth));
    const tags = new Set<string>();
    monthTasks.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [tasks, selectedMonth]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.date.startsWith(selectedMonth));

    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    if (filterCompletion === 'incomplete') {
      filtered = filtered.filter(t => !t.completed);
    } else if (filterCompletion === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }

    if (selectedTag !== 'all') {
      filtered = filtered.filter(t => t.tags?.includes(selectedTag));
    }

    return filtered;
  }, [tasks, selectedMonth, filterPriority, filterCompletion, selectedTag]);

  const { grade, color } = getCompletionGrade(report.stats.completionPercentage);

  // Calculate current streak
  const currentStreak = useMemo(() => {
    const sortedDays = [...report.dailyBreakdown].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let streak = 0;
    for (const day of sortedDays) {
      if (day.completionPercentage === 100 && day.total > 0) {
        streak++;
      } else if (day.total > 0) {
        break;
      }
    }
    return streak;
  }, [report.dailyBreakdown]);

  const priorityColors = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-rose-100 text-rose-700'
  };

  if (report.stats.total === 0) {
    return (
      <div className="space-y-6">
        {/* Month Selector */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
          <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Select Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-64 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 bg-gray-50 transition-colors"
          >
            {months.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Empty State */}
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-indigo-300">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-gray-800 font-medium mb-1">No tasks for this month</p>
          <p className="text-gray-600 text-sm">Try selecting a different month</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
        <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Select Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full sm:w-64 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 bg-gray-50 transition-colors"
        >
          {months.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{report.stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{report.stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Incomplete</p>
          <p className="text-3xl font-bold text-rose-600 mt-1">{report.stats.incomplete}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Rate</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{report.stats.completionPercentage}%</p>
          <p className={`text-xs font-medium ${color}`}>{grade}</p>
        </div>
      </div>

      {/* Streak Display */}
      {currentStreak > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl shadow-lg border border-amber-200 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 animate-bounce">
              <span className="text-2xl">🔥</span>
            </div>
            <div>
              <p className="text-sm font-bold text-amber-700 uppercase tracking-wider">Current Streak</p>
              <p className="text-3xl font-bold text-amber-600">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</p>
              <p className="text-xs text-amber-600 mt-1">Keep completing all tasks daily!</p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Progress Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex justify-between text-sm mb-3">
          <span className="font-bold text-gray-800">Overall Progress</span>
          <span className="font-bold text-indigo-600">{report.stats.completionPercentage}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              report.stats.completionPercentage >= 90 ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
              report.stats.completionPercentage >= 70 ? 'bg-gradient-to-r from-indigo-400 to-purple-400' :
              report.stats.completionPercentage >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
              'bg-gradient-to-r from-rose-400 to-pink-400'
            }`}
            style={{ width: `${report.stats.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Priority Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          {(['high', 'medium', 'low'] as const).map(priority => {
            const count = filteredTasks.filter(t => t.priority === priority).length;
            const completed = filteredTasks.filter(t => t.priority === priority && t.completed).length;
            const percentage = count > 0 ? Math.round((completed / count) * 100) : 0;
            return (
              <div key={priority} className={`p-4 rounded-xl ${priorityColors[priority].replace('text-', 'bg-').split(' ')[0]}/30`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${priorityColors[priority].split(' ')[1]}`}>
                  {priority}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                <p className="text-xs text-gray-500">{completed} done ({percentage}%)</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar Chart */}
      {report.dailyBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Daily Completion</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={report.dailyBreakdown.map(d => ({ day: d.date.slice(8), done: d.completed, pending: d.incomplete }))} barSize={8}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 12, fontSize: 12, color: '#f9fafb' }}
                cursor={{ fill: 'rgba(99,102,241,0.05)' }}
              />
              <Bar dataKey="done" name="Completed" radius={[4, 4, 0, 0]} fill="#6366f1" />
              <Bar dataKey="pending" name="Pending" radius={[4, 4, 0, 0]}>
                {report.dailyBreakdown.map((_, i) => <Cell key={i} fill="#e5e7eb" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Completed</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" /> Pending</span>
          </div>
        </div>
      )}

      {/* Completion Rate Trend (Area Chart) */}
      {report.dailyBreakdown.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Completion Rate Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={report.dailyBreakdown.map(d => ({ day: d.date.slice(8), rate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0 }))}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 12, fontSize: 12, color: '#f9fafb' }}
                formatter={(v: number) => [`${v}%`, 'Completion']}
              />
              <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} fill="url(#rateGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Priority Pie Chart */}
      {filteredTasks.length > 0 && (() => {
        const pieData = [
          { name: 'High', value: filteredTasks.filter(t => t.priority === 'high').length, color: '#f43f5e' },
          { name: 'Medium', value: filteredTasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
          { name: 'Low', value: filteredTasks.filter(t => t.priority === 'low').length, color: '#10b981' },
          { name: 'None', value: filteredTasks.filter(t => !t.priority).length, color: '#6b7280' },
        ].filter(d => d.value > 0);
        if (pieData.length === 0) return null;
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 12, fontSize: 12, color: '#f9fafb' }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {/* Daily Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Daily Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Done</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {report.dailyBreakdown.map(day => (
                <tr key={day.date} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">{formatDisplayDate(day.date)}</td>
                  <td className="px-5 py-4 text-center text-sm text-gray-600">{day.total}</td>
                  <td className="px-5 py-4 text-center text-sm font-medium text-emerald-600">{day.completed}</td>
                  <td className="px-5 py-4 text-center text-sm font-medium text-rose-600">{day.incomplete}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      day.completionPercentage >= 90 ? 'bg-emerald-100 text-emerald-700' :
                      day.completionPercentage >= 70 ? 'bg-indigo-100 text-indigo-700' :
                      day.completionPercentage >= 50 ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {day.completionPercentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Filter Tasks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Status</label>
            <select
              value={filterCompletion}
              onChange={(e) => setFilterCompletion(e.target.value as FilterCompletion)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 bg-gray-50 transition-colors text-sm"
            >
              <option value="all">All Tasks</option>
              <option value="incomplete">Incomplete</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 bg-gray-50 transition-colors text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 bg-gray-50 transition-colors text-sm"
            >
              <option value="all">All Tags</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Task List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {filterCompletion === 'incomplete' ? 'Incomplete Tasks' :
             filterCompletion === 'completed' ? 'Completed Tasks' : 'All Tasks'}
          </h3>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
            {filteredTasks.length}
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No tasks match the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredTasks.map(task => (
              <div key={task.id} className={`p-5 transition-colors ${task.completed ? 'bg-gray-50/50' : 'hover:bg-gray-50/50'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${task.completed ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <p className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-4">
                      {formatDisplayDate(task.date)}
                    </p>
                    {task.notes && (
                      <p className="text-sm text-gray-500 mt-1 ml-4">{task.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {task.priority && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    )}
                    {task.tags?.map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
