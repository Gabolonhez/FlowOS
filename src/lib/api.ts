
import { createClient } from "@/lib/supabase/client";
import { Task, Version, Project, Doc, TaskStatus } from "@/types";

const supabase = createClient();

// Projects
export async function getProjects(): Promise<Project[]> {
    const { data, error } = await supabase.from("projects").select("*").order("name");
    if (error) throw error;
    return data;
}

export async function createProject(project: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase.from("projects").insert({
        name: project.name,
        prefix: project.prefix,
        color: project.color
    }).select().single();
    if (error) throw error;
    return data;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const { error } = await supabase.from("projects").update(updates).eq("id", id);
    if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
}

// Versions
export async function getVersions(): Promise<Version[]> {
    const { data, error } = await supabase.from("versions").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    return data.map(v => ({
        ...v,
        projectId: v.project_id,
        releaseDate: v.release_date
    }));
}

export async function createVersion(version: Omit<Version, "id">): Promise<Version> {
    const { data, error } = await supabase.from("versions").insert({
        project_id: version.projectId,
        name: version.name,
        status: version.status,
        release_date: version.releaseDate,
        notes: version.notes
    }).select().single();

    if (error) throw error;
    return { ...data, projectId: data.project_id, releaseDate: data.release_date };
}

export async function updateVersion(id: string, updates: Partial<Version>): Promise<void> {
    const dbUpdates: any = { ...updates };
    if (updates.projectId) dbUpdates.project_id = updates.projectId;
    if (updates.releaseDate) dbUpdates.release_date = updates.releaseDate;
    delete dbUpdates.projectId;
    delete dbUpdates.releaseDate;

    const { error } = await supabase.from("versions").update(dbUpdates).eq("id", id);
    if (error) throw error;
}

export async function deleteVersion(id: string): Promise<void> {
    const { error } = await supabase.from("versions").delete().eq("id", id);
    if (error) throw error;
}

// Tasks
export async function getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
        .from("tasks")
        .select(`
      *,
      assignee:profiles(*)
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(t => ({
        ...t,
        projectId: t.project_id,
        versionId: t.version_id,
        assignee: t.assignee
    }));
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) throw error;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const dbUpdates: any = { ...updates };
    if (updates.projectId) dbUpdates.project_id = updates.projectId;
    if (updates.versionId) dbUpdates.version_id = updates.versionId;
    if (updates.assigneeId) dbUpdates.assignee_id = updates.assigneeId;

    // Remove client-side fields
    delete dbUpdates.projectId;
    delete dbUpdates.versionId;
    delete dbUpdates.assigneeId;
    delete dbUpdates.assignee;

    const { error } = await supabase.from("tasks").update(dbUpdates).eq("id", id);
    if (error) throw error;
}


export async function deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
}


export async function createTask(task: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase.from("tasks").insert({
        project_id: task.projectId,
        version_id: task.versionId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        code: task.code || `TASK-${Math.floor(Math.random() * 10000)}`,
        assignee_id: task.assigneeId
    }).select().single();
    if (error) throw error;
    return data;
}

// Documents
export async function getDocs(): Promise<Doc[]> {
    const { data, error } = await supabase.from("documents").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return data.map(d => ({
        ...d,
        flowDiagramJson: d.flow_data,
        updatedAt: d.updated_at
    }));
}

export async function createDoc(doc: Partial<Doc>): Promise<Doc> {
    const { data, error } = await supabase.from("documents").insert({
        title: doc.title,
        type: doc.type,
        content: doc.content,
        flow_data: doc.flowDiagramJson
    }).select().single();
    if (error) throw error;
    return { ...data, flowDiagramJson: data.flow_data, updatedAt: data.updated_at };
}

export async function updateDoc(id: string, updates: Partial<Doc>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.flowDiagramJson !== undefined) dbUpdates.flow_data = updates.flowDiagramJson;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase.from("documents").update(dbUpdates).eq("id", id);
    if (error) throw error;
}

export async function deleteDoc(id: string): Promise<void> {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) throw error;
}

// Users
export async function getProfiles() {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) throw error;
    return data;
}

// Stats
export async function getDashboardStats() {
    const tasks = await getTasks();
    const versions = await getVersions();
    return { tasks, versions };
}
