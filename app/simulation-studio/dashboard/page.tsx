'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  FolderOpen, 
  Copy, 
  Trash2, 
  Edit3,
  Play,
  Calendar,
  ChevronLeft,
  Settings,
  Download,
  Upload,
  Search,
  Grid3x3,
  List,
  ArrowLeft
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  lastModified: number;
  created: number;
  version: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Auth guard
  useEffect(() => {
    const session = localStorage.getItem('sim_studio_session');
    if (!session) {
      router.push('/simulation-studio');
      return;
    }

    try {
      const data = JSON.parse(session);
      if (data.expires <= Date.now()) {
        localStorage.removeItem('sim_studio_session');
        router.push('/simulation-studio');
        return;
      }
    } catch {
      localStorage.removeItem('sim_studio_session');
      router.push('/simulation-studio');
      return;
    }
  }, [router]);

  // Load projects
  useEffect(() => {
    const stored = localStorage.getItem('sim_studio_projects');
    if (stored) {
      try {
        const parsedProjects = JSON.parse(stored);
        setProjects(parsedProjects);
      } catch {
        setProjects([]);
      }
    }
  }, []);

  // Save projects to localStorage
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('sim_studio_projects', JSON.stringify(updatedProjects));
  };

  const createProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newProjectName.trim(),
      description: 'New simulation project',
      lastModified: Date.now(),
      created: Date.now(),
      version: '1.0.0',
    };

    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    setNewProjectName('');
    setIsCreating(false);

    // Open the new project
    router.push(`/simulation-studio/editor?id=${newProject.id}`);
  };

  const duplicateProject = (project: Project) => {
    const duplicated: Project = {
      ...project,
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${project.name} (Copy)`,
      created: Date.now(),
      lastModified: Date.now(),
    };

    const updatedProjects = [...projects, duplicated];
    saveProjects(updatedProjects);
  };

  const deleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      saveProjects(updatedProjects);
      
      // Also remove project data from localStorage
      localStorage.removeItem(`sim_project_${projectId}`);
    }
  };

  const renameProject = (projectId: string) => {
    if (!editingName.trim()) return;

    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, name: editingName.trim(), lastModified: Date.now() }
        : p
    );

    saveProjects(updatedProjects);
    setEditingProject(null);
    setEditingName('');
  };

  const startRename = (project: Project) => {
    setEditingProject(project.id);
    setEditingName(project.name);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedProjects = filteredProjects.sort((a, b) => b.lastModified - a.lastModified);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-teal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-gold/8 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 bg-navy/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  href="/simulation-studio"
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm">Back to Login</span>
                </Link>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <h1 className="font-orbitron text-xl font-bold text-white">
                    <span className="text-gradient-teal">Simulation</span>{' '}
                    <span className="text-gradient-gold">Studio</span>
                  </h1>
                  <p className="text-sm text-gray-400">Project Dashboard</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-navy/60 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/50 transition-all"
                  />
                </div>

                {/* View Mode */}
                <div className="flex items-center bg-navy/60 border border-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-teal text-navy' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid3x3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-teal text-navy' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* New Project */}
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 py-2 bg-gradient-to-r from-teal to-teal-light text-navy font-bold rounded-lg hover:shadow-glow-teal transition-all duration-300 flex items-center gap-2"
                >
                  <Plus size={16} />
                  New Project
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal/20 rounded-lg flex items-center justify-center">
                  <FolderOpen size={24} className="text-teal" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white font-orbitron">{projects.length}</p>
                  <p className="text-sm text-gray-400">Total Projects</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center">
                  <Calendar size={24} className="text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white font-orbitron">
                    {projects.filter(p => p.lastModified > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
                  </p>
                  <p className="text-sm text-gray-400">Modified This Week</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
                  <Play size={24} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white font-orbitron">
                    {projects.filter(p => p.created > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
                  </p>
                  <p className="text-sm text-gray-400">Created This Month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid/List */}
          {sortedProjects.length === 0 ? (
            <div className="glass-card p-12 border border-white/10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-teal/20 rounded-lg flex items-center justify-center">
                <FolderOpen size={32} className="text-teal" />
              </div>
              <h2 className="font-orbitron text-lg font-bold text-white mb-2">No Projects Yet</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Create your first simulation project to get started with MetaMech Simulation Studio.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 bg-gradient-to-r from-teal to-teal-light text-navy font-bold rounded-lg hover:shadow-glow-teal transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' :
              'space-y-4'
            }>
              {sortedProjects.map(project => (
                <div
                  key={project.id}
                  className={`glass-card border border-white/10 transition-all duration-300 hover:border-teal/50 hover:shadow-glow-teal/30 group ${
                    viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center gap-4'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* Thumbnail */}
                      <div className="w-full h-32 bg-navy/60 rounded-lg mb-4 flex items-center justify-center border border-white/10">
                        <FolderOpen size={32} className="text-gray-500" />
                      </div>

                      {/* Project Info */}
                      <div className="flex-1">
                        {editingProject === project.id ? (
                          <div className="mb-3">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') renameProject(project.id);
                                if (e.key === 'Escape') {
                                  setEditingProject(null);
                                  setEditingName('');
                                }
                              }}
                              onBlur={() => renameProject(project.id)}
                              autoFocus
                              className="w-full px-2 py-1 bg-navy/60 border border-teal rounded text-white text-sm"
                            />
                          </div>
                        ) : (
                          <h3 className="font-semibold text-white mb-1 group-hover:text-teal transition-colors">
                            {project.name}
                          </h3>
                        )}
                        
                        <p className="text-xs text-gray-400 mb-3">{project.description}</p>
                        <p className="text-xs text-gray-500">
                          Modified {formatDate(project.lastModified)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/simulation-studio/editor?id=${project.id}`)}
                          className="p-2 bg-teal/20 hover:bg-teal/30 text-teal rounded-lg transition-colors"
                          title="Open Project"
                        >
                          <FolderOpen size={14} />
                        </button>
                        <button
                          onClick={() => startRename(project)}
                          className="p-2 bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 rounded-lg transition-colors"
                          title="Rename"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => duplicateProject(project)}
                          className="p-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="p-2 bg-red-400/20 hover:bg-red-400/30 text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List view */}
                      <div className="w-12 h-12 bg-navy/60 rounded-lg flex items-center justify-center border border-white/10">
                        <FolderOpen size={20} className="text-gray-500" />
                      </div>
                      
                      <div className="flex-1">
                        {editingProject === project.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') renameProject(project.id);
                              if (e.key === 'Escape') {
                                setEditingProject(null);
                                setEditingName('');
                              }
                            }}
                            onBlur={() => renameProject(project.id)}
                            autoFocus
                            className="w-full px-2 py-1 bg-navy/60 border border-teal rounded text-white text-sm"
                          />
                        ) : (
                          <h3 className="font-semibold text-white group-hover:text-teal transition-colors">
                            {project.name}
                          </h3>
                        )}
                        <p className="text-sm text-gray-400">{project.description}</p>
                        <p className="text-xs text-gray-500">Modified {formatDate(project.lastModified)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/simulation-studio/editor?id=${project.id}`)}
                          className="px-4 py-2 bg-teal/20 hover:bg-teal/30 text-teal rounded-lg transition-colors text-sm font-medium"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => startRename(project)}
                          className="p-2 bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 rounded-lg transition-colors"
                          title="Rename"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => duplicateProject(project)}
                          className="p-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="p-2 bg-red-400/20 hover:bg-red-400/30 text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 border border-white/10 max-w-md w-full">
            <h2 className="font-orbitron text-xl font-bold text-white mb-6">Create New Project</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createProject();
                    if (e.key === 'Escape') {
                      setIsCreating(false);
                      setNewProjectName('');
                    }
                  }}
                  placeholder="Enter project name..."
                  autoFocus
                  className="w-full px-3 py-2 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/50 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createProject}
                disabled={!newProjectName.trim()}
                className="flex-1 py-2 bg-gradient-to-r from-teal to-teal-light text-navy font-bold rounded-lg hover:shadow-glow-teal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewProjectName('');
                }}
                className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}