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

  // Get all unique tags from tasks in this month
  const availableTags = useMemo(() => {
    const monthTasks = tasks.filter(t => t.date.startsWith(selectedMonth));
    const tags = new Set<string>();
    monthTasks.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [tasks, selectedMonth]);

  // Apply filters to incomplete tasks
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

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  if (report.stats.total === 0) {
    return (
      <div className="space-y-6">
        {/* Month Selector */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Empty State */}
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500">No tasks found for this month.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {months.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900">{report.stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{report.stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Incomplete</p>
          <p className="text-2xl font-bold text-red-600">{report.stats.incomplete}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Completion Rate</p>
          <p className={`text-2xl font-bold ${color}`}>{report.stats.completionPercentage}%</p>
          <p className={`text-sm ${color}`}>{grade}</p>
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-medium">{report.stats.completionPercentage}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              report.stats.completionPercentage >= 90 ? 'bg-green-500' :
              report.stats.completionPercentage >= 70 ? 'bg-blue-500' :
              report.stats.completionPercentage >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${report.stats.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daily Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Completed</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Incomplete</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {report.dailyBreakdown.map(day => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDisplayDate(day.date)}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{day.total}</td>
                  <td className="px-4 py-3 text-center text-sm text-green-600">{day.completed}</td>
                  <td className="px-4 py-3 text-center text-sm text-red-600">{day.incomplete}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-medium ${
                      day.completionPercentage >= 90 ? 'text-green-600' :
                      day.completionPercentage >= 70 ? 'text-blue-600' :
                      day.completionPercentage >= 50 ? 'text-yellow-600' :
                      'text-red-600'
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
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Tasks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterCompletion}
              onChange={(e) => setFilterCompletion(e.target.value as FilterCompletion)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tasks</option>
              <option value="incomplete">Incomplete Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filterCompletion === 'incomplete' ? 'Incomplete Tasks' :
             filterCompletion === 'completed' ? 'Completed Tasks' : 'All Tasks'}
            <span className="text-gray-500 font-normal ml-2">({filteredTasks.length})</span>
          </h3>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tasks match the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map(task => (
              <div key={task.id} className={`p-4 ${task.completed ? 'bg-gray-50' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDisplayDate(task.date)}
                    </p>
                    {task.notes && (
                      <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {task.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    )}
                    {task.tags?.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.completed ? 'Done' : 'Pending'}
                    </span>
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
