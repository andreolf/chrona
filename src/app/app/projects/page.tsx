'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Project, Profile } from '@/lib/supabase/types';
import {
  createProject,
  updateProject,
  archiveProject,
  restoreProject,
  addProjectMember,
  removeProjectMember
} from '@/lib/actions/projects';
import { PageHeader } from '@/components/app/page-header';
import { EmptyState } from '@/components/app/empty-state';
import { TableSkeleton } from '@/components/app/loading-skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Archive,
  RotateCcw,
  Loader2,
  Users,
  UserPlus,
  X,
} from 'lucide-react';

interface ProjectMemberWithUser {
  id: string;
  project_id: string;
  user_id: string;
  hourly_rate: number | null;
  user: Profile;
}

export default function ProjectsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [archivingProject, setArchivingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Member management state
  const [managingProject, setManagingProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMemberWithUser[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null };

    setIsAdmin(profile?.role === 'admin');

    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('name');

    setProjects(data || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchProjectMembers = async (projectId: string) => {
    setLoadingMembers(true);
    const supabase = createClient();

    // Fetch project members
    const { data: members } = await supabase
      .from('project_members')
      .select('*, user:profiles(*)')
      .eq('project_id', projectId) as { data: ProjectMemberWithUser[] | null };

    // Fetch all freelancers for adding
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'freelancer')
      .eq('is_active', true);

    setProjectMembers(members || []);
    setAllUsers(users || []);
    setLoadingMembers(false);
  };

  const handleOpenMemberManagement = async (project: Project) => {
    setManagingProject(project);
    await fetchProjectMembers(project.id);
  };

  const handleAddMember = async (userId: string) => {
    if (!managingProject) return;

    const result = await addProjectMember(managingProject.id, userId);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    toast({
      title: 'Member added',
      description: 'Freelancer has been assigned to the project.',
    });

    await fetchProjectMembers(managingProject.id);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!managingProject) return;

    const result = await removeProjectMember(managingProject.id, userId);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    toast({
      title: 'Member removed',
      description: 'Freelancer has been removed from the project.',
    });

    await fetchProjectMembers(managingProject.id);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    setIsSaving(true);

    const result = editingProject
      ? await updateProject({ ...formData, id: editingProject.id })
      : await createProject(formData);

    setIsSaving(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    toast({
      title: editingProject ? 'Project updated' : 'Project created',
      description: editingProject
        ? 'The project has been updated.'
        : 'The project has been created.',
    });

    setShowForm(false);
    setEditingProject(null);
    setFormData({ name: '', description: '' });
    fetchData();
  };

  const handleArchive = async () => {
    if (!archivingProject) return;
    setIsSaving(true);

    const result = await archiveProject(archivingProject.id);
    setIsSaving(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    toast({
      title: 'Project archived',
      description: 'The project has been archived.',
    });
    setArchivingProject(null);
    fetchData();
  };

  const handleRestore = async (project: Project) => {
    const result = await restoreProject(project.id);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    toast({
      title: 'Project restored',
      description: 'The project has been restored.',
    });
    fetchData();
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || '' });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData({ name: '', description: '' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const activeProjects = projects.filter((p) => p.status === 'active');
  const archivedProjects = projects.filter((p) => p.status === 'archived');

  // Get users not already assigned to the project
  const availableUsers = allUsers.filter(
    (user) => !projectMembers.some((pm) => pm.user_id === user.id)
  );

  const ProjectsList = ({ items }: { items: Project[] }) => {
    if (items.length === 0) {
      return (
        <EmptyState
          icon={FolderKanban}
          title="No projects"
          description={isAdmin ? 'Create a project to get started' : 'No projects available'}
          action={
            isAdmin && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-violet-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )
          }
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((project) => (
          <Card
            key={project.id}
            className="bg-slate-800/30 border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
            onClick={() => {
              if (isAdmin) {
                handleOpenMemberManagement(project);
              } else {
                router.push(`/app/time?project=${project.id}`);
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FolderKanban className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-medium text-white truncate">
                      {project.name}
                    </h3>
                  </div>
                  {project.description && (
                    <p className="text-slate-400 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        project.status === 'active'
                          ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50'
                          : 'bg-slate-700/50 text-slate-400 border-slate-600'
                      }
                    >
                      {project.status}
                    </Badge>
                    <span className="text-xs text-indigo-400">
                      {isAdmin ? 'Click to manage team →' : 'Click to log time →'}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-slate-900 border-slate-800"
                    >
                      <DropdownMenuItem
                        onClick={() => handleOpenMemberManagement(project)}
                        className="text-slate-300 focus:bg-slate-800"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Manage Members
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openEditForm(project)}
                        className="text-slate-300 focus:bg-slate-800"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {project.status === 'active' ? (
                        <DropdownMenuItem
                          onClick={() => setArchivingProject(project)}
                          className="text-orange-400 focus:bg-orange-950/50"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleRestore(project)}
                          className="text-emerald-400 focus:bg-emerald-950/50"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restore
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description="Manage projects and track time against them"
        actions={
          isAdmin && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          )
        }
      />

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : (
        <Card className="bg-slate-900/50 border-slate-800 animate-fade-in">
          <CardContent className="pt-6">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-slate-800/50 border-slate-700">
                <TabsTrigger value="active" className="data-[state=active]:bg-slate-700">
                  Active ({activeProjects.length})
                </TabsTrigger>
                <TabsTrigger value="archived" className="data-[state=active]:bg-slate-700">
                  Archived ({archivedProjects.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="mt-6">
                <ProjectsList items={activeProjects} />
              </TabsContent>
              <TabsContent value="archived" className="mt-6">
                <ProjectsList items={archivedProjects} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Edit Project' : 'Create Project'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Project Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter project name"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Description <span className="text-slate-500">(optional)</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter project description"
                className="bg-slate-800/50 border-slate-700 text-white resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={closeForm}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name.trim() || isSaving}
              className="bg-gradient-to-r from-indigo-600 to-violet-600"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingProject ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Management Dialog */}
      <Dialog open={!!managingProject} onOpenChange={(open) => !open && setManagingProject(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Manage Members
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Assign freelancers to <span className="text-white font-medium">{managingProject?.name}</span>
            </DialogDescription>
          </DialogHeader>

          {loadingMembers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Members */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">
                  Assigned Members ({projectMembers.length})
                </h4>
                {projectMembers.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4 text-center">
                    No freelancers assigned yet
                  </p>
                ) : (
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {projectMembers.map((pm) => (
                        <div
                          key={pm.id}
                          className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-violet-600">
                              <AvatarFallback className="text-white text-xs font-medium bg-transparent">
                                {getInitials(pm.user?.full_name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">
                                {pm.user?.full_name}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {pm.user?.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(pm.user_id)}
                            className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-950/30"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Add Members */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">
                  Add Freelancers ({availableUsers.length} available)
                </h4>
                {availableUsers.length === 0 ? (
                  <div className="text-center py-4 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
                    <p className="text-slate-500 text-sm">No freelancers available</p>
                    <p className="text-slate-600 text-xs mt-1">
                      Freelancers need to sign up with the &quot;Freelancer&quot; role
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {availableUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 bg-slate-700">
                              <AvatarFallback className="text-slate-300 text-xs font-medium bg-transparent">
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-slate-200 text-sm font-medium">
                                {user.full_name}
                              </p>
                              <p className="text-slate-500 text-xs">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddMember(user.id)}
                            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <AlertDialog
        open={!!archivingProject}
        onOpenChange={(open) => !open && setArchivingProject(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Archive project?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This project will be hidden from time entry forms. You can restore it
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={isSaving}
              className="bg-orange-600 hover:bg-orange-500 text-white"
            >
              {isSaving ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
