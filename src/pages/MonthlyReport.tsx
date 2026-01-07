import { useState, useMemo } from 'react';
import { Task, Priority } from '../types/task';
import { generateMonthlyReport, getCompletionGrade } from '../utils/report';
import { formatMonthYear, formatDisplayDate, getMonthsList } from '../utils/date';

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
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50">
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Select Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-64 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-colors"
          >
            {months.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Empty State */}
        <div className="text-center py-16 bg-white/40 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-1">No tasks for this month</p>
          <p className="text-gray-400 text-sm">Try selecting a different month</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50">
        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Select Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full sm:w-64 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-colors"
        >
          {months.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{report.stats.total}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{report.stats.completed}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Incomplete</p>
          <p className="text-3xl font-bold text-rose-600 mt-1">{report.stats.incomplete}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rate</p>
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
      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50">
        <div className="flex justify-between text-sm mb-3">
          <span className="font-bold text-gray-700">Overall Progress</span>
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
      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50">
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

      {/* Daily Breakdown */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
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
      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Filter Tasks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <select
              value={filterCompletion}
              onChange={(e) => setFilterCompletion(e.target.value as FilterCompletion)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-colors text-sm"
            >
              <option value="all">All Tasks</option>
              <option value="incomplete">Incomplete</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-colors text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-colors text-sm"
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
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
